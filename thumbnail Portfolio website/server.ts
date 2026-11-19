import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db, isDbConfigured, reinitializeDb, dbManager } from "./src/db/index.ts";
import { thumbnails as thumbnailsTable, videos as videosTable, inquiries as inquiriesTable, visitors as visitorsTable, reviews as reviewsTable, branding as brandingTable } from "./src/db/schema.ts";
import { eq, desc, sql } from "drizzle-orm";
import pkg from 'pg';
import { WebSocketServer } from "ws";

let broadcast: (type: string, payload?: any) => void = () => {};

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase body size limits to support direct Base64 uploaded images (e.g. Canva built PNGs)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- White-Label DB Setup Endpoints ---
app.get("/api/db-setup/status", (req, res) => {
  const configured = isDbConfigured();
  let dbInstanceId = "";
  if (configured) {
    try {
      const config = dbManager.getDbConfig();
      dbInstanceId = crypto.createHash("sha256")
        .update(`${config.host}:${config.database}`)
        .digest("hex");
    } catch (e) {
      console.error("Error generating dbInstanceId:", e);
    }
  }
  res.json({
    configured,
    dbInstanceId,
    recovering: dbManager.isRecovering(),
    recoveryFailed: dbManager.hasRecoveryFailed()
  });
});

app.post("/api/db-setup/configure", async (req, res) => {
  try {
    const { host, port, user, password, database, ssl } = req.body;
    if (!host || !user || !password || !database) {
      return res.status(400).json({ error: "All fields except port and SSL are required." });
    }

    const portNum = port ? parseInt(port, 10) : 5432;

    // Test the database connection first
    const testPool = new pkg.Pool({
      host,
      port: portNum,
      user,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 10000,
    });

    try {
      const client = await testPool.connect();
      
      // Auto-create tables for the buyer in their new database if permitted
      console.log("Setup: Connection test successful. Initializing database tables...");
      
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            uid TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS thumbnails (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT NOT NULL,
            ctr TEXT DEFAULT '10.0%',
            views TEXT DEFAULT '0',
            channel TEXT DEFAULT 'New Channel',
            video_url TEXT DEFAULT 'https://youtube.com',
            is_custom BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            description TEXT
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS videos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            video_url TEXT NOT NULL,
            duration TEXT DEFAULT '0:60',
            description TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS inquiries (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            whatsapp TEXT,
            channel_name TEXT,
            category TEXT,
            package_type TEXT,
            details TEXT,
            status TEXT NOT NULL DEFAULT 'new',
            live_info TEXT DEFAULT 'Your designer is reviewing your brief.',
            created_at TEXT
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS visitors (
            id TEXT PRIMARY KEY,
            ip TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            channel_name TEXT,
            rating INTEGER NOT NULL DEFAULT 5,
            review TEXT NOT NULL,
            ctr_boost TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS branding (
            id TEXT PRIMARY KEY,
            website_name TEXT NOT NULL DEFAULT 'RohanThumbnails.com',
            website_logo TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
            browser_tab_title TEXT NOT NULL DEFAULT 'RohanThumbnails - Double Your YouTube CTR',
            browser_favicon TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80',
            hero_heading TEXT NOT NULL DEFAULT 'Thumbnails That Get Clicked.',
            hero_subtitle TEXT NOT NULL DEFAULT 'High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.',
            footer_copyright TEXT NOT NULL DEFAULT 'RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.',
            company_name TEXT NOT NULL DEFAULT 'RohanThumbnails',
            brand_color TEXT NOT NULL DEFAULT '#06b6d4',
            secondary_color TEXT NOT NULL DEFAULT '#9333ea',
            contact_email TEXT NOT NULL DEFAULT 'contact@rohanthumbnails.com',
            whatsapp_number TEXT NOT NULL DEFAULT '919041489449',
            support_email TEXT NOT NULL DEFAULT 'support@rohanthumbnails.com',
            address TEXT NOT NULL DEFAULT 'Mumbai, India',
            business_description TEXT NOT NULL DEFAULT 'Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.',
            admin_password_hash TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      } catch (ddlErr: any) {
        console.warn("Notice: Table creation skipped or not permitted for this db user (tables may already exist or user lacks DDL privileges):", ddlErr?.message || ddlErr);
      }

      client.release();
      await testPool.end();
    } catch (connErr: any) {
      await testPool.end();
      console.error("Setup connection failed:", connErr);
      return res.status(400).json({ error: `Connection failed: ${connErr.message || connErr}` });
    }

    // Save configuration securely (encrypting password) and re-initialize connection pool
    const saved = await dbManager.saveConfig({
      host,
      port: portNum,
      user,
      password,
      database,
      ssl: !!ssl
    });

    if (!saved) {
      return res.status(500).json({ error: "Failed to initialize and test the saved database configuration." });
    }

    // Seed default portfolio items if they are empty
    try {
      const existingThumbnails = await db.select().from(thumbnailsTable).limit(1);
      if (existingThumbnails.length === 0) {
        console.log("Setup: Seeding default portfolio thumbnails...");
        const defaultThumbnails = [
          {
            id: 't1',
            title: "Cyberpunk 2077 - Unlocking the Secret Ending",
            category: "gaming",
            imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop",
            ctr: "14.2%",
            views: "1.2M",
            channel: "CyberGamer",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "High contrast neon green highlights with a focal character subject designed for ultimate gaming click-through-rate."
          },
          {
            id: 't2',
            title: "The 2026 Housing Market Crash is Starting",
            category: "business",
            imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=640&auto=format&fit=crop",
            ctr: "11.8%",
            views: "420K",
            channel: "FinMarket",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Dark luxury styling with vibrant red trend lines and a clean corporate title designed to maximize intrigue and authority."
          },
          {
            id: 't3',
            title: "My New $10,000 Desk Setup Tour",
            category: "tech",
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=640&auto=format&fit=crop",
            ctr: "12.5%",
            views: "850K",
            channel: "TechUnboxed",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Sleek, high-definition minimalist perspective composition emphasizing clean lighting and professional studio gear."
          },
          {
            id: 't4',
            title: "I Traveled to the Most Remote Island in the World",
            category: "vlog",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=640&auto=format&fit=crop",
            ctr: "13.1%",
            views: "2.1M",
            channel: "IslandVlog",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Immersive landscape with warm color-graded tropical tones and a curiosity-inducing central perspective overlay."
          },
          {
            id: 't5',
            title: "How Nuclear Fusion Will Change Energy Forever",
            category: "education",
            imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=640&auto=format&fit=crop",
            ctr: "10.4%",
            views: "600K",
            channel: "PulseScience",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Vibrant abstract quantum matrix design illustrating molecular bonds with professional monospaced text badges."
          },
          {
            id: 't6',
            title: "The Millionaire Blueprint in Your 20s",
            category: "business",
            imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=640&auto=format&fit=crop",
            ctr: "15.0%",
            views: "1.5M",
            channel: "AlphaMind",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Atmospheric workspace layout using premium black-and-gold accents to invoke high professional credibility."
          }
        ];
        await db.insert(thumbnailsTable).values(defaultThumbnails);
        console.log("Setup: Seeded default portfolio thumbnails successfully.");
      }
    } catch (err) {
      console.error("Setup: Seeding default thumbnails failed:", err);
    }

    // Seed default inquiries into the new database
    try {
      const existingInquiries = await db.select().from(inquiriesTable).limit(1);
      if (existingInquiries.length === 0) {
        const seedInquiries = [
          {
            id: 'seed_inq_1',
            name: 'GamerPro YT',
            email: 'contact@gamerpro.com',
            whatsapp: '919876543210',
            channelName: 'GamerPro',
            category: 'gaming',
            packageType: 'Starter Booster Pack',
            details: 'Looking for an ultra-aggressive high-CTR gaming thumbnail for my Cyberpunk 2077 playthrough video. Need neon text and character focus.',
            status: 'completed' as const,
            createdAt: 'Jul 10, 2026, 02:45 PM'
          },
          {
            id: 'seed_inq_2',
            name: 'Sarah Chen',
            email: 'sarah@gearunboxed.com',
            whatsapp: '919876543211',
            channelName: 'GearUnboxed',
            category: 'tech',
            packageType: 'Weekly Creator Pack',
            details: 'Need 12 custom thumbnails for our next smart VR glasses series. Sleek, high-contrast, modern layout with real device highlights.',
            status: 'completed' as const,
            createdAt: 'Jul 12, 2026, 11:15 AM'
          },
          {
            id: 'seed_inq_3',
            name: 'WealthMind Creator',
            email: 'info@wealthmind.com',
            whatsapp: '919876543212',
            channelName: 'WealthMind',
            category: 'business',
            packageType: 'Custom Special Order',
            details: 'Requesting a business/finance thumbnail. "The Real Reason the Financial System is Changing This Year". Use elegant styling, high-contrast charts, and clear typography.',
            status: 'new' as const,
            createdAt: 'Jul 16, 2026, 06:20 PM'
          },
          {
            id: 'seed_inq_4',
            name: 'Science Pulse Team',
            email: 'hello@sciencepulse.org',
            whatsapp: '919876543213',
            channelName: 'Science Pulse',
            category: 'education',
            packageType: 'Starter Booster Pack',
            details: 'Edutainment thumbnail for a nuclear fusion video. Dynamic graphic showing molecules joining, clean mono-spaced accent tags.',
            status: 'contacted' as const,
            createdAt: 'Jul 17, 2026, 08:30 AM'
          }
        ];
        await db.insert(inquiriesTable).values(seedInquiries);
        console.log("Seeded database with default inquiries successfully.");
      }
    } catch (seedErr) {
      console.error("Seeding new database failed:", seedErr);
    }

    // Ensure white-label branding table and columns are fully initialized on the new database setup
    try {
      await ensureBrandingTable();
    } catch (tblErr) {
      console.error("Setup: Failed to initialize branding table:", tblErr);
    }

    res.json({ success: true, message: "Database configured and initialized successfully!" });
  } catch (error: any) {
    console.error("Error configuring database:", error);
    res.status(500).json({ error: error.message || "Failed to configure database." });
  }
});

// Secure Backend Admin Login Gate
app.post("/api/admin/login", async (req, res) => {
  try {
    const { password } = req.body;
    let isValid = false;

    if (isDbConfigured()) {
      await ensureBrandingTable();
      let storedHash = await getAdminPasswordHashSafe();
      
      // If no settings exist yet, or the hash is missing, attempt to seed the default/current password hash
      if (!storedHash) {
        const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
        const initialHash = hashPassword(defaultPass);
        
        let rowExists = false;
        try {
          const check = await db.select({ id: brandingTable.id }).from(brandingTable).where(eq(brandingTable.id, "main")).limit(1);
          rowExists = check.length > 0;
        } catch (e) {}

        if (!rowExists) {
          try {
            await db.insert(brandingTable).values({
              id: "main",
              adminPasswordHash: initialHash
            });
          } catch (e) {}
        } else {
          await setAdminPasswordHashSafe(initialHash);
        }
        
        // Re-fetch
        storedHash = await getAdminPasswordHashSafe() || initialHash;
      }

      isValid = verifyPassword(password, storedHash);
    } else {
      const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
      isValid = (password === defaultPass);
    }

    if (isValid) {
      let dbInstanceId = "";
      if (isDbConfigured()) {
        const config = dbManager.getDbConfig();
        dbInstanceId = crypto.createHash("sha256")
          .update(`${config.host}:${config.database}`)
          .digest("hex");
      }
      res.json({ success: true, dbInstanceId });
    } else {
      res.status(401).json({ error: "Incorrect admin password. Access denied." });
    }
  } catch (err: any) {
    console.error("Error during admin login verification:", err);
    res.status(500).json({ error: "Internal server authentication failure." });
  }
});

// Secure Password Change Endpoint
app.post("/api/admin/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }
    
    let isAuthorized = false;
    if (isDbConfigured()) {
      await ensureBrandingTable();
      const storedHash = await getAdminPasswordHashSafe();
      if (storedHash) {
        isAuthorized = verifyPassword(currentPassword, storedHash);
      } else {
        const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
        isAuthorized = (currentPassword === defaultPass);
      }
    } else {
      const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
      isAuthorized = (currentPassword === defaultPass);
    }
    
    if (!isAuthorized) {
      return res.status(401).json({ error: "Incorrect current password." });
    }
    
    // Hash the new password
    const newHash = hashPassword(newPassword);
    
    if (isDbConfigured()) {
      const success = await setAdminPasswordHashSafe(newHash);
      if (success) {
        res.json({ success: true, message: "Password updated successfully!" });
      } else {
        res.status(400).json({ error: "Failed to update password in database. Please check database permissions." });
      }
    } else {
      res.status(400).json({ error: "Database not configured yet. Set up database first." });
    }
  } catch (err: any) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to update password." });
  }
});

// API Endpoints
// --- Thumbnails ---
app.get("/api/thumbnails", async (req, res) => {
  try {
    const data = await db.select().from(thumbnailsTable).orderBy(desc(thumbnailsTable.createdAt));
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching thumbnails:", error);
    res.status(500).json({ error: "Failed to fetch thumbnails from database." });
  }
});

app.get("/api/thumbnails/:id/image", async (req, res) => {
  try {
    const { id } = req.params;
    let imageUrl = "";

    if (isDbConfigured()) {
      try {
        const rows = await db.select().from(thumbnailsTable).where(eq(thumbnailsTable.id, id)).limit(1);
        if (rows.length > 0) {
          imageUrl = rows[0].imageUrl;
        }
      } catch (err) {
        console.error("Error querying thumbnail image from DB:", err);
      }
    }

    if (!imageUrl) {
      return res.status(404).send("Thumbnail image not found");
    }

    // Handle base64 image data URIs cleanly
    if (imageUrl.startsWith("data:")) {
      const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const imgBuffer = Buffer.from(matches[2], "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(imgBuffer);
      }
    }

    // Handle direct URL or relative path
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return res.redirect(imageUrl);
    } else {
      const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
      return res.redirect(cleanPath);
    }
  } catch (error: any) {
    console.error("Error serving thumbnail image:", error);
    res.status(500).send("Failed to serve thumbnail image.");
  }
});

app.post("/api/thumbnails", async (req, res) => {
  try {
    const { title, category, imageUrl, description } = req.body;
    if (!title || !category || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newId = "custom_" + Date.now();
    const [inserted] = await db.insert(thumbnailsTable).values({
      id: newId,
      title,
      category,
      imageUrl,
      description: description || "",
      isCustom: true,
    }).returning();
    broadcast("THUMBNAILS_UPDATED", inserted);
    res.status(201).json(inserted);
  } catch (error: any) {
    console.error("Error inserting thumbnail:", error);
    res.status(500).json({ error: "Failed to save thumbnail to database." });
  }
});

app.delete("/api/thumbnails/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(thumbnailsTable).where(eq(thumbnailsTable.id, id));
    broadcast("THUMBNAILS_UPDATED", { id, deleted: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting thumbnail:", error);
    res.status(500).json({ error: "Failed to delete thumbnail from database." });
  }
});

// --- Videos (Up to 1 minute Reels / Clips) ---
app.get("/api/videos", async (req, res) => {
  try {
    const data = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    if (error?.message?.includes("relation \"videos\" does not exist")) {
      try {
        // Attempt on-the-fly table creation
        const pool = (dbManager as any).pool;
        if (pool) {
          const client = await pool.connect();
          await client.query(`
            CREATE TABLE IF NOT EXISTS videos (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              video_url TEXT NOT NULL,
              duration TEXT DEFAULT '0:60',
              description TEXT,
              created_at TIMESTAMP DEFAULT NOW()
            );
          `);
          client.release();
          const retryData = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
          return res.json(retryData);
        }
      } catch (createErr) {
        console.error("Failed to auto-create videos table:", createErr);
      }
      return res.json([]);
    }
    res.status(500).json({ error: "Failed to fetch videos from database." });
  }
});

app.get("/api/videos/:id/stream", async (req, res) => {
  try {
    const { id } = req.params;
    let videoUrl = "";

    const rows = await db.select().from(videosTable).where(eq(videosTable.id, id)).limit(1);
    if (rows.length > 0) {
      videoUrl = rows[0].videoUrl;
    }

    if (!videoUrl) {
      return res.status(404).send("Video not found");
    }

    if (videoUrl.startsWith("data:")) {
      const matches = videoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const videoBuffer = Buffer.from(matches[2], "base64");
        const range = req.headers.range;
        const fileSize = videoBuffer.length;

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;
          const file = videoBuffer.subarray(start, end + 1);
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          });
          return res.end(file);
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=31536000, immutable',
          });
          return res.end(videoBuffer);
        }
      }
    }

    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) {
      return res.redirect(videoUrl);
    } else {
      const cleanPath = videoUrl.startsWith("/") ? videoUrl : `/${videoUrl}`;
      return res.redirect(cleanPath);
    }
  } catch (error: any) {
    console.error("Error streaming video:", error);
    res.status(500).send("Failed to stream video.");
  }
});

app.post("/api/videos", async (req, res) => {
  try {
    const { title, videoUrl, duration, description } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ error: "Missing required video title or URL" });
    }
    const newId = "vid_" + Date.now();
    let inserted;
    try {
      const [resIns] = await db.insert(videosTable).values({
        id: newId,
        title,
        videoUrl,
        duration: duration || "0:60",
        description: description || "",
      }).returning();
      inserted = resIns;
    } catch (err: any) {
      if (err?.message?.includes("relation \"videos\" does not exist")) {
        const pool = (dbManager as any).pool;
        if (pool) {
          const client = await pool.connect();
          await client.query(`
            CREATE TABLE IF NOT EXISTS videos (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              video_url TEXT NOT NULL,
              duration TEXT DEFAULT '0:60',
              description TEXT,
              created_at TIMESTAMP DEFAULT NOW()
            );
          `);
          client.release();
          const [resIns] = await db.insert(videosTable).values({
            id: newId,
            title,
            videoUrl,
            duration: duration || "0:60",
            description: description || "",
          }).returning();
          inserted = resIns;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }
    broadcast("VIDEOS_UPDATED", inserted);
    res.status(201).json(inserted);
  } catch (error: any) {
    console.error("Error inserting video:", error);
    res.status(500).json({ error: "Failed to save video to database." });
  }
});

app.delete("/api/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(videosTable).where(eq(videosTable.id, id));
    broadcast("VIDEOS_UPDATED", { id, deleted: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video from database." });
  }
});

// --- Inquiries ---
app.get("/api/inquiries/track", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Search query is required" });
    }
    const trimmed = query.trim().toLowerCase();
    const all = await db.select().from(inquiriesTable);
    const matched = all.filter(
      (inq) =>
        inq.id.toLowerCase() === trimmed ||
        inq.email.toLowerCase() === trimmed
    );
    if (matched.length === 0) {
      return res.status(404).json({ error: "No orders found. Please check your spelling or Order ID." });
    }
    const publicData = matched.map((inq) => ({
      id: inq.id,
      name: inq.name,
      channelName: inq.channelName,
      packageType: inq.packageType,
      status: inq.status,
      liveInfo: inq.liveInfo,
      createdAt: inq.createdAt,
    }));
    res.json(publicData);
  } catch (error: any) {
    console.error("Error tracking inquiry:", error);
    res.status(500).json({ error: "Failed to search order status." });
  }
});

app.get("/api/inquiries", async (req, res) => {
  try {
    const data = await db.select().from(inquiriesTable);
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries from database." });
  }
});

app.post("/api/inquiries", async (req, res) => {
  try {
    const { name, email, whatsapp, channelName, category, packageType, details } = req.body;
    if (!name || !email || !channelName || !category || !packageType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const newId = "inq_" + Date.now();
    const [inserted] = await db.insert(inquiriesTable).values({
      id: newId,
      name,
      email,
      whatsapp,
      channelName,
      category,
      packageType,
      details: details || "",
      status: "new",
      createdAt: formattedDate,
    }).returning();
    broadcast("INQUIRIES_UPDATED", { action: "created", id: inserted.id, name: inserted.name, packageType: inserted.packageType });
    res.status(201).json(inserted);
  } catch (error: any) {
    console.error("Error inserting inquiry:", error);
    res.status(500).json({ error: "Failed to save inquiry to database." });
  }
});

app.patch("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, liveInfo } = req.body;
    
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (liveInfo !== undefined) updateData.liveInfo = liveInfo;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Missing fields to update (status or liveInfo)" });
    }

    await db.update(inquiriesTable).set(updateData).where(eq(inquiriesTable.id, id));
    broadcast("INQUIRIES_UPDATED", { action: "updated", id, status, liveInfo });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({ error: "Failed to update inquiry in database." });
  }
});

app.delete("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
    broadcast("INQUIRIES_UPDATED", { action: "deleted", id });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({ error: "Failed to delete inquiry from database." });
  }
});

// --- Analytics Visitor Counter ---
app.post("/api/analytics/hit", async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) {
      return res.status(400).json({ error: "visitorId is required" });
    }

    // Check if this visitor is already registered
    const existing = await db.select().from(visitorsTable).where(eq(visitorsTable.id, visitorId)).limit(1);
    
    let isNewVisitor = false;
    if (existing.length === 0) {
      isNewVisitor = true;
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";
      const userAgent = req.headers["user-agent"] || "";
      await db.insert(visitorsTable).values({
        id: visitorId,
        ip: ip.substring(0, 255),
        userAgent: userAgent.substring(0, 500),
      });
    }

    // Get the total unique count
    const allVisitors = await db.select().from(visitorsTable);
    if (isNewVisitor) {
      broadcast("VISITORS_UPDATED", { totalVisitors: allVisitors.length });
    }
    res.json({
      totalVisitors: allVisitors.length,
    });
  } catch (error: any) {
    console.error("Error logging visitor hit:", error);
    res.status(500).json({ error: "Failed to record analytics hit" });
  }
});

// --- Client Reviews ---
app.get("/api/reviews", async (req, res) => {
  try {
    const data = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch client reviews." });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { name, channelName, rating, review, ctrBoost } = req.body;
    if (!name || !review) {
      return res.status(400).json({ error: "Name and Review are required" });
    }
    const validatedRating = typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : 5;
    
    const [inserted] = await db.insert(reviewsTable).values({
      name,
      channelName: channelName || "",
      rating: validatedRating,
      review,
      ctrBoost: ctrBoost || "",
    }).returning();

    broadcast("REVIEWS_UPDATED", inserted);
    res.status(201).json(inserted);
  } catch (error: any) {
    console.error("Error adding review:", error);
    res.status(500).json({ error: "Failed to submit review." });
  }
});

// Helper to hash and verify admin passwords
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue || !storedValue.includes(":")) {
    return false;
  }
  const [salt, hash] = storedValue.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return testHash === hash;
}

// Helper to fetch admin password hash safely without selecting all columns
async function getAdminPasswordHashSafe(): Promise<string | null> {
  if (!isDbConfigured()) return null;
  try {
    const settings = await db.select({
      adminPasswordHash: brandingTable.adminPasswordHash,
    }).from(brandingTable).where(eq(brandingTable.id, "main")).limit(1);
    
    return settings[0]?.adminPasswordHash || null;
  } catch (err: any) {
    return null;
  }
}

// Helper to set admin password hash safely
async function setAdminPasswordHashSafe(newHash: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  try {
    try {
      await db.insert(brandingTable).values({
        id: "main",
        adminPasswordHash: newHash,
      }).onConflictDoUpdate({
        target: brandingTable.id,
        set: { adminPasswordHash: newHash }
      });
      return true;
    } catch (insertErr) {
      await db.update(brandingTable).set({ adminPasswordHash: newHash }).where(eq(brandingTable.id, "main"));
      return true;
    }
  } catch (err: any) {
    return false;
  }
}

const DEFAULT_BRANDING_SETTINGS = {
  id: "main",
  websiteName: "RohanThumbnails.com",
  websiteLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
  browserTabTitle: "RohanThumbnails - Double Your YouTube CTR",
  browserFavicon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80",
  heroHeading: "Thumbnails That Get Clicked.",
  heroSubtitle: "High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.",
  footerCopyright: "RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.",
  companyName: "RohanThumbnails",
  brandColor: "#06b6d4",
  secondaryColor: "#9333ea",
  contactEmail: "contact@rohanthumbnails.com",
  whatsappNumber: "919041489449",
  supportEmail: "support@rohanthumbnails.com",
  address: "Mumbai, India",
  businessDescription: "Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.",
  pkg1Name: "Starter Booster Pack",
  pkg1Price: "₹49",
  pkg1OriginalPrice: "₹99",
  pkg1Tag: "Limited Offer",
  pkg1Description: "Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).",
  pkg1Features: "1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available"
};

let isBrandingTableEnsured = false;

// Helper to dynamically guarantee branding table and columns exist in Neon or any other database
async function ensureBrandingTable() {
  if (!isDbConfigured() || isBrandingTableEnsured) return;
  isBrandingTableEnsured = true;
  try {
    // 1. Create table IF NOT EXISTS
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS branding (
          id TEXT PRIMARY KEY,
          website_name TEXT NOT NULL DEFAULT 'RohanThumbnails.com',
          website_logo TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
          browser_tab_title TEXT NOT NULL DEFAULT 'RohanThumbnails - Double Your YouTube CTR',
          browser_favicon TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80',
          hero_heading TEXT NOT NULL DEFAULT 'Thumbnails That Get Clicked.',
          hero_subtitle TEXT NOT NULL DEFAULT 'High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.',
          footer_copyright TEXT NOT NULL DEFAULT 'RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.',
          company_name TEXT NOT NULL DEFAULT 'RohanThumbnails',
          brand_color TEXT NOT NULL DEFAULT '#06b6d4',
          secondary_color TEXT NOT NULL DEFAULT '#9333ea',
          contact_email TEXT NOT NULL DEFAULT 'contact@rohanthumbnails.com',
          whatsapp_number TEXT NOT NULL DEFAULT '919041489449',
          support_email TEXT NOT NULL DEFAULT 'support@rohanthumbnails.com',
          address TEXT NOT NULL DEFAULT 'Mumbai, India',
          business_description TEXT NOT NULL DEFAULT 'Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.',
          pkg1_name TEXT NOT NULL DEFAULT 'Starter Booster Pack',
          pkg1_price TEXT NOT NULL DEFAULT '₹49',
          pkg1_original_price TEXT DEFAULT '₹99',
          pkg1_tag TEXT DEFAULT 'Limited Offer',
          pkg1_description TEXT DEFAULT 'Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time.',
          pkg1_features TEXT DEFAULT '1 Custom High-CTR Thumbnail',
          admin_password_hash TEXT,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
    } catch (createTableErr: any) {
      // Bypassed if schema already exists or is managed externally
    }

    // 2. Safely add any missing columns if needed using individual template queries
    const alterQueries = [
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS website_name TEXT NOT NULL DEFAULT 'RohanThumbnails.com'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS website_logo TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS browser_tab_title TEXT NOT NULL DEFAULT 'RohanThumbnails - Double Your YouTube CTR'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS browser_favicon TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS hero_heading TEXT NOT NULL DEFAULT 'Thumbnails That Get Clicked.'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS hero_subtitle TEXT NOT NULL DEFAULT 'High-converting custom thumbnails.'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS footer_copyright TEXT NOT NULL DEFAULT 'RohanThumbnails.com. All rights reserved.'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'RohanThumbnails'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS brand_color TEXT NOT NULL DEFAULT '#06b6d4'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS secondary_color TEXT NOT NULL DEFAULT '#9333ea'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT 'contact@rohanthumbnails.com'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '919041489449'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS support_email TEXT NOT NULL DEFAULT 'support@rohanthumbnails.com'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT 'Mumbai, India'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS business_description TEXT NOT NULL DEFAULT 'Premium thumbnail design studio.'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS pkg1_name TEXT NOT NULL DEFAULT 'Starter Booster Pack'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS pkg1_price TEXT NOT NULL DEFAULT '₹49'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS pkg1_original_price TEXT DEFAULT '₹99'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS pkg1_tag TEXT DEFAULT 'Limited Offer'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS pkg1_description TEXT DEFAULT 'Special discounted offer!'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS pkg1_features TEXT DEFAULT '1 Custom High-CTR Thumbnail'`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS admin_password_hash TEXT`,
      sql`ALTER TABLE branding ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`
    ];

    for (const query of alterQueries) {
      try {
        await db.execute(query);
      } catch (alterErr: any) {
        // Silently skip if column already exists or restricted
      }
    }

    // 3. Detect and migrate the existing admin password into the database securely
    try {
      const storedHash = await getAdminPasswordHashSafe();
      if (!storedHash) {
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || '4260091';
        const initialHash = hashPassword(defaultAdminPassword);
        await setAdminPasswordHashSafe(initialHash);
      }
    } catch (migErr) {
      // Silently skip
    }
  } catch (err) {
    // Silently skip
  }
}

// --- White-Label Branding Settings ---
app.get("/api/branding", async (req, res) => {
  try {
    if (!isDbConfigured()) {
      return res.status(200).json(DEFAULT_BRANDING_SETTINGS);
    }

    // Dynamic schema validation & auto-creation
    await ensureBrandingTable();

    let fetchedData: any = null;
    try {
      const rows = await db.select().from(brandingTable).where(eq(brandingTable.id, "main")).limit(1);
      if (rows && rows.length > 0) {
        fetchedData = rows[0];
      }
    } catch (dbErr: any) {
      // Safe select fallback if any column is missing in DB schema
      try {
        const rows = await db.select({
          id: brandingTable.id,
          websiteName: brandingTable.websiteName,
          websiteLogo: brandingTable.websiteLogo,
          browserTabTitle: brandingTable.browserTabTitle,
          browserFavicon: brandingTable.browserFavicon,
          heroHeading: brandingTable.heroHeading,
          heroSubtitle: brandingTable.heroSubtitle,
          footerCopyright: brandingTable.footerCopyright,
          companyName: brandingTable.companyName,
          brandColor: brandingTable.brandColor,
          secondaryColor: brandingTable.secondaryColor,
          contactEmail: brandingTable.contactEmail,
          whatsappNumber: brandingTable.whatsappNumber,
          supportEmail: brandingTable.supportEmail,
          address: brandingTable.address,
          businessDescription: brandingTable.businessDescription,
        }).from(brandingTable).where(eq(brandingTable.id, "main")).limit(1);
        if (rows && rows.length > 0) {
          fetchedData = rows[0];
        }
      } catch (safeSelectErr: any) {
        // Fall back to default
      }
    }

    const cleanSettings = { ...DEFAULT_BRANDING_SETTINGS, ...fetchedData };
    delete cleanSettings.adminPasswordHash;
    res.json(cleanSettings);
  } catch (error: any) {
    res.json(DEFAULT_BRANDING_SETTINGS);
  }
});

app.put("/api/branding", async (req, res) => {
  try {
    const password = req.headers["x-admin-password"] as string;
    let isAuthorized = false;

    if (isDbConfigured()) {
      await ensureBrandingTable();
      let storedHash = await getAdminPasswordHashSafe();
      
      if (!storedHash) {
        const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
        const initialHash = hashPassword(defaultPass);
        await setAdminPasswordHashSafe(initialHash);
        storedHash = await getAdminPasswordHashSafe() || initialHash;
      }

      if (storedHash) {
        isAuthorized = verifyPassword(password, storedHash);
      } else {
        const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
        isAuthorized = (password === defaultPass);
      }
    } else {
      const defaultPass = process.env.ADMIN_PASSWORD || '4260091';
      isAuthorized = (password === defaultPass);
    }

    if (!isAuthorized) {
      return res.status(401).json({ error: "Unauthorized. Correct Admin password is required to save branding." });
    }

    if (!isDbConfigured()) {
      return res.status(400).json({ error: "Database not configured yet. Set up database first." });
    }

    await ensureBrandingTable();

    const {
      websiteName,
      websiteLogo,
      browserTabTitle,
      browserFavicon,
      heroHeading,
      heroSubtitle,
      footerCopyright,
      companyName,
      brandColor,
      secondaryColor,
      contactEmail,
      whatsappNumber,
      supportEmail,
      address,
      businessDescription,
      pkg1Name,
      pkg1Price,
      pkg1OriginalPrice,
      pkg1Tag,
      pkg1Description,
      pkg1Features
    } = req.body;

    const valuesToSave = {
      websiteName: websiteName || 'RohanThumbnails.com',
      websiteLogo: websiteLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
      browserTabTitle: browserTabTitle || 'RohanThumbnails - Double Your YouTube CTR',
      browserFavicon: browserFavicon || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80',
      heroHeading: heroHeading || 'Thumbnails That Get Clicked.',
      heroSubtitle: heroSubtitle || 'High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.',
      footerCopyright: footerCopyright || 'RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.',
      companyName: companyName || 'RohanThumbnails',
      brandColor: brandColor || '#06b6d4',
      secondaryColor: secondaryColor || '#9333ea',
      contactEmail: contactEmail || 'contact@rohanthumbnails.com',
      whatsappNumber: whatsappNumber || '919041489449',
      supportEmail: supportEmail || 'support@rohanthumbnails.com',
      address: address || 'Mumbai, India',
      businessDescription: businessDescription || 'Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.',
      pkg1Name: pkg1Name || 'Starter Booster Pack',
      pkg1Price: pkg1Price || '₹49',
      pkg1OriginalPrice: pkg1OriginalPrice !== undefined ? pkg1OriginalPrice : '₹99',
      pkg1Tag: pkg1Tag !== undefined ? pkg1Tag : 'Limited Offer',
      pkg1Description: pkg1Description || 'Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).',
      pkg1Features: pkg1Features || '1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available',
      updatedAt: new Date(),
    };

    try {
      await db.update(brandingTable).set(valuesToSave).where(eq(brandingTable.id, "main"));
    } catch (updateErr) {
      try {
        const { pkg1Name, pkg1Price, pkg1OriginalPrice, pkg1Tag, pkg1Description, pkg1Features, ...baseValues } = valuesToSave;
        await db.update(brandingTable).set(baseValues).where(eq(brandingTable.id, "main"));
      } catch (baseErr) {
        // Fallback
      }
    }

    const updatedSettings = { ...DEFAULT_BRANDING_SETTINGS, ...valuesToSave };
    broadcast("BRANDING_UPDATED", updatedSettings);
    res.json(updatedSettings);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update branding settings." });
  }
});

// Start dev or production server with Vite middleware integration
async function startServer() {
  if (isDbConfigured()) {
    console.log("Startup: Database is configured. Initializing Connection Manager pool...");
    await reinitializeDb();

    // Ensure branding table exists and has all correct columns
    try {
      console.log("Startup: Ensuring branding table is fully initialized...");
      await ensureBrandingTable();
      console.log("Startup: Branding table verification completed.");
    } catch (tableErr) {
      console.error("Startup: Failed to verify/create branding table on startup:", tableErr);
    }

    // Seed default thumbnails only if the thumbnails database is completely empty
    try {
      const existingThumbnails = await db.select().from(thumbnailsTable).limit(1);
      if (existingThumbnails.length === 0) {
        console.log("Startup: Database portfolio thumbnails table is empty. Seeding defaults...");
        const defaultThumbnails = [
          {
            id: 't1',
            title: "Cyberpunk 2077 - Unlocking the Secret Ending",
            category: "gaming",
            imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop",
            ctr: "14.2%",
            views: "1.2M",
            channel: "CyberGamer",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "High contrast neon green highlights with a focal character subject designed for ultimate gaming click-through-rate."
          },
          {
            id: 't2',
            title: "The 2026 Housing Market Crash is Starting",
            category: "business",
            imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=640&auto=format&fit=crop",
            ctr: "11.8%",
            views: "420K",
            channel: "FinMarket",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Dark luxury styling with vibrant red trend lines and a clean corporate title designed to maximize intrigue and authority."
          },
          {
            id: 't3',
            title: "My New $10,000 Desk Setup Tour",
            category: "tech",
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=640&auto=format&fit=crop",
            ctr: "12.5%",
            views: "850K",
            channel: "TechUnboxed",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Sleek, high-definition minimalist perspective composition emphasizing clean lighting and professional studio gear."
          },
          {
            id: 't4',
            title: "I Traveled to the Most Remote Island in the World",
            category: "vlog",
            imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=640&auto=format&fit=crop",
            ctr: "13.1%",
            views: "2.1M",
            channel: "IslandVlog",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Immersive landscape with warm color-graded tropical tones and a curiosity-inducing central perspective overlay."
          },
          {
            id: 't5',
            title: "How Nuclear Fusion Will Change Energy Forever",
            category: "education",
            imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=640&auto=format&fit=crop",
            ctr: "10.4%",
            views: "600K",
            channel: "PulseScience",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Vibrant abstract quantum matrix design illustrating molecular bonds with professional monospaced text badges."
          },
          {
            id: 't6',
            title: "The Millionaire Blueprint in Your 20s",
            category: "business",
            imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=640&auto=format&fit=crop",
            ctr: "15.0%",
            views: "1.5M",
            channel: "AlphaMind",
            videoUrl: "https://youtube.com",
            isCustom: false,
            description: "Atmospheric workspace layout using premium black-and-gold accents to invoke high professional credibility."
          }
        ];
        await db.insert(thumbnailsTable).values(defaultThumbnails);
        console.log("Startup: Seeded default portfolio thumbnails successfully.");
      }
    } catch (error) {
      console.error("Startup: Error checking or seeding portfolio thumbnails:", error);
    }

    try {
      const existingInquiries = await db.select().from(inquiriesTable).limit(1);
      if (existingInquiries.length === 0) {
        console.log("Database inquiries table is empty. Seeding seed inquiries...");
        const seedInquiries = [
          {
            id: 'seed_inq_1',
            name: 'GamerPro YT',
            email: 'contact@gamerpro.com',
            whatsapp: '919876543210',
            channelName: 'GamerPro',
            category: 'gaming',
            packageType: 'Starter Booster Pack',
            details: 'Looking for an ultra-aggressive high-CTR gaming thumbnail for my Cyberpunk 2077 playthrough video. Need neon text and character focus.',
            status: 'completed' as const,
            createdAt: 'Jul 10, 2026, 02:45 PM'
          },
          {
            id: 'seed_inq_2',
            name: 'Sarah Chen',
            email: 'sarah@gearunboxed.com',
            whatsapp: '919876543211',
            channelName: 'GearUnboxed',
            category: 'tech',
            packageType: 'Weekly Creator Pack',
            details: 'Need 12 custom thumbnails for our next smart VR glasses series. Sleek, high-contrast, modern layout with real device highlights.',
            status: 'completed' as const,
            createdAt: 'Jul 12, 2026, 11:15 AM'
          },
          {
            id: 'seed_inq_3',
            name: 'WealthMind Creator',
            email: 'info@wealthmind.com',
            whatsapp: '919876543212',
            channelName: 'WealthMind',
            category: 'business',
            packageType: 'Custom Special Order',
            details: 'Requesting a business/finance thumbnail. "The Real Reason the Financial System is Changing This Year". Use elegant styling, high-contrast charts, and clear typography.',
            status: 'new' as const,
            createdAt: 'Jul 16, 2026, 06:20 PM'
          },
          {
            id: 'seed_inq_4',
            name: 'Science Pulse Team',
            email: 'hello@sciencepulse.org',
            whatsapp: '919876543213',
            channelName: 'Science Pulse',
            category: 'education',
            packageType: 'Starter Booster Pack',
            details: 'Edutainment thumbnail for a nuclear fusion video. Dynamic graphic showing molecules joining, clean mono-spaced accent tags.',
            status: 'contacted' as const,
            createdAt: 'Jul 17, 2026, 08:30 AM'
          }
        ];
        await db.insert(inquiriesTable).values(seedInquiries);
        console.log("Successfully seeded inquiries into database!");
      }
    } catch (error) {
      console.error("Error checking or seeding database inquiries:", error);
    }

    try {
      await ensureBrandingTable();
      let existingBranding: any[] = [];
      try {
        existingBranding = await db.select().from(brandingTable).where(eq(brandingTable.id, "main")).limit(1);
      } catch (selectErr) {
        try {
          existingBranding = await db.select({ id: brandingTable.id }).from(brandingTable).where(eq(brandingTable.id, "main")).limit(1);
        } catch (safeErr) {
          existingBranding = [];
        }
      }
      if (existingBranding.length === 0) {
        console.log("Database branding table is empty. Seeding default white-label settings...");
        await db.insert(brandingTable).values({
          id: "main",
          websiteName: "RohanThumbnails.com",
          websiteLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80",
          browserTabTitle: "RohanThumbnails - Double Your YouTube CTR",
          browserFavicon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80",
          heroHeading: "Thumbnails That Get Clicked.",
          heroSubtitle: "High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.",
          footerCopyright: "RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.",
          companyName: "RohanThumbnails",
          brandColor: "#06b6d4",
          secondaryColor: "#9333ea",
          contactEmail: "contact@rohanthumbnails.com",
          whatsappNumber: "919041489449",
          supportEmail: "support@rohanthumbnails.com",
          address: "Mumbai, India",
          businessDescription: "Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators."
        });
        console.log("Successfully seeded default branding settings!");
      }
    } catch (error) {
      console.warn("Notice: Skipped or safely handled startup database branding check:", error);
    }
  } else {
    console.log("Database is not configured yet. Skipping startup seed and table cleanup. Buyer can configure via /database-setup");
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Production Real-time WebSocket Server Setup
  const wss = new WebSocketServer({ server });
  
  wss.on("connection", (ws: any) => {
    ws.isAlive = true;
    console.log(`[WebSocket] Client connection established. Total clients: ${wss.clients.size}`);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      console.log(`[WebSocket] Client connection closed. Total clients: ${wss.clients.size}`);
    });

    ws.on("error", (err: any) => {
      console.warn("[WebSocket] Client connection error:", err);
    });
  });

  // Prevent connection timeouts behind load balancers/proxies
  const keepAliveInterval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 25000);

  wss.on("close", () => {
    clearInterval(keepAliveInterval);
  });

  // Assign global broadcast function
  broadcast = (type: string, payload: any = {}) => {
    const payloadStr = JSON.stringify({ type, payload });
    console.log(`[WebSocket] Broadcasting event "${type}" to ${wss.clients.size} clients.`);
    wss.clients.forEach((ws: any) => {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(payloadStr);
        } catch (err) {
          console.error("[WebSocket] Failed to send to client:", err);
        }
      }
    });
  };
}

startServer();
