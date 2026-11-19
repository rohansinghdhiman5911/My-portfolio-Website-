import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const configPath = path.join(process.cwd(), 'db-config.json');
const SECRET_KEY_PATH = path.join(process.cwd(), '.db-secret.key');

// Get/generate unique secret key for symmetric encryption
function getEncryptionKey(): Buffer {
  if (fs.existsSync(SECRET_KEY_PATH)) {
    try {
      const keyHex = fs.readFileSync(SECRET_KEY_PATH, 'utf8').trim();
      if (keyHex.length === 64) {
        return Buffer.from(keyHex, 'hex');
      }
    } catch (e) {
      console.error('Error reading secret key:', e);
    }
  }
  
  if (process.env.DB_ENCRYPTION_KEY && process.env.DB_ENCRYPTION_KEY.length >= 32) {
    return crypto.createHash('sha256').update(process.env.DB_ENCRYPTION_KEY).digest();
  }

  // Fallback: Generate a random 32-byte key
  const newKey = crypto.randomBytes(32);
  try {
    fs.writeFileSync(SECRET_KEY_PATH, newKey.toString('hex'), 'utf8');
  } catch (e) {
    console.error('Error saving secret key:', e);
  }
  return newKey;
}

const ALGORITHM = 'aes-256-cbc';

// Encrypt plain text passwords before storing them in local JSON files
export function encrypt(text: string): string {
  if (!text) return '';
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `enc:${iv.toString('hex')}:${encrypted}`;
  } catch (e) {
    console.error('Encryption failed:', e);
    return text;
  }
}

// Decrypt stored database passwords securely on backend load
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    if (!encryptedText.startsWith('enc:')) {
      return encryptedText; // already plain text
    }
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    if (parts.length < 3) return encryptedText;
    const ivHex = parts[1];
    const dataHex = parts[2];
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(dataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('Decryption failed:', e);
    return encryptedText;
  }
}

class DatabaseConnectionManager {
  private pool: pkg.Pool | null = null;
  private drizzleInstance: any = null;
  private isReconnecting = false;
  private isConnecting = false;
  private isConfiguredAndHealthy = false;
  private recoveryFailed = false;

  constructor() {
    this.initialize();
  }

  private async ensureTablesExist(client: any) {
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
    } catch (e: any) {
      console.warn('Notice: skipping table creation check (insufficient DDL permissions or tables pre-managed):', e?.message || e);
    }
  }

  // Get active db config
  getDbConfig() {
    let host = '';
    let user = '';
    let password = '';
    let database = '';
    let port = 5432;
    let ssl = false;

    // 1. Try local JSON first
    if (fs.existsSync(configPath)) {
      try {
        const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        host = localConfig.SQL_HOST || '';
        user = localConfig.SQL_USER || '';
        password = decrypt(localConfig.SQL_PASSWORD || '');
        database = localConfig.SQL_DB_NAME || '';
        port = localConfig.SQL_PORT ? parseInt(localConfig.SQL_PORT, 10) : 5432;
        ssl = localConfig.SQL_SSL === true;
      } catch (e) {
        console.error('Error reading local db-config.json:', e);
      }
    }

    // 2. Fallback to process.env
    if (!host) {
      host = process.env.SQL_HOST || '';
      user = process.env.SQL_USER || '';
      password = process.env.SQL_PASSWORD || '';
      database = process.env.SQL_DB_NAME || '';
      port = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432;
      ssl = process.env.SQL_SSL === 'true';
    }

    return { host, user, password, database, port, ssl };
  }

  isConfigured() {
    const config = this.getDbConfig();
    return !!(config.host && config.user && config.password && config.database);
  }

  isHealthy() {
    return this.isConfiguredAndHealthy;
  }

  isRecovering() {
    return this.isReconnecting;
  }

  hasRecoveryFailed() {
    return this.recoveryFailed;
  }

  // Save config to file securely (encrypting the password)
  async saveConfig(config: any): Promise<boolean> {
    try {
      const localConfig = {
        SQL_HOST: config.host,
        SQL_PORT: config.port,
        SQL_USER: config.user,
        SQL_PASSWORD: encrypt(config.password),
        SQL_DB_NAME: config.database,
        SQL_SSL: !!config.ssl,
      };
      fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2), 'utf8');
      this.recoveryFailed = false; // Reset failure flag on new config save
      console.log('Database Connection Manager: Saved secure database configuration.');
      return await this.initialize();
    } catch (err) {
      console.error('Database Connection Manager: Failed to save config:', err);
      return false;
    }
  }

  // Initialize pool and connection
  async initialize(): Promise<boolean> {
    if (this.isConnecting) return this.isConfiguredAndHealthy;
    this.isConnecting = true;

    const config = this.getDbConfig();
    if (!config.host || !config.user || !config.password || !config.database) {
      console.log('Database Connection Manager: No configuration found.');
      this.isConnecting = false;
      this.isConfiguredAndHealthy = false;
      return false;
    }

    try {
      console.log(`Database Connection Manager: Establishing pool connection to database "${config.database}" on host "${config.host}"...`);
      
      const oldPool = this.pool;
      
      this.pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000,
      });

      this.pool.on('error', (err) => {
        console.error('Database Connection Manager: Idle pool client error detected:', err);
        this.handleConnectionFailure();
      });

      // Test active connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      await this.ensureTablesExist(client);
      client.release();

      if (oldPool) {
        oldPool.end().catch(() => {});
      }

      this.drizzleInstance = drizzle(this.pool, { schema });
      this.isConfiguredAndHealthy = true;
      this.isConnecting = false;
      this.recoveryFailed = false;
      console.log('Database Connection Manager: Connection verified! Pool is fully active.');
      return true;
    } catch (err: any) {
      console.error('Database Connection Manager: Startup connection test failed:', err.message || err);
      this.isConnecting = false;
      this.isConfiguredAndHealthy = false;
      
      // Trigger automatic recovery system
      this.triggerAutoRecovery();
      return false;
    }
  }

  // Triggered when any pool error occurs or query fails
  public handleConnectionFailure() {
    if (this.isConfiguredAndHealthy) {
      this.isConfiguredAndHealthy = false;
      this.triggerAutoRecovery();
    }
  }

  // Automatic Recovery System with Exponential Backoff
  private async triggerAutoRecovery() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    console.warn('Database Connection Manager: Database connection has been lost. Initializing Auto Recovery System...');

    const maxAttempts = 5;
    let delay = 1000; // start with 1 second

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Database Connection Manager: Auto-recovery retry attempt ${attempt}/${maxAttempts} in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      const success = await this.retryConnection();
      if (success) {
        console.log(`Database Connection Manager: Connection successfully recovered on attempt ${attempt}! Rebuilt pool.`);
        this.isReconnecting = false;
        this.recoveryFailed = false;
        return;
      }

      delay *= 2; // exponential backoff (1s, 2s, 4s, 8s, 16s)
    }

    console.error('Database Connection Manager: Auto Recovery System failed after all 5 attempts. Setup Wizard will appear as fallback.');
    this.isReconnecting = false;
    this.recoveryFailed = true;
  }

  private async retryConnection(): Promise<boolean> {
    const config = this.getDbConfig();
    if (!config.host || !config.user || !config.password || !config.database) {
      return false;
    }

    try {
      const testPool = new Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 5000,
      });

      const client = await testPool.connect();
      await client.query('SELECT 1');
      await this.ensureTablesExist(client);
      client.release();
      await testPool.end();

      // Test was successful! Rebuild active pool
      const oldPool = this.pool;
      
      this.pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 10000,
        max: 20,
        idleTimeoutMillis: 30000,
      });

      this.pool.on('error', (err) => {
        console.error('Database Connection Manager: Idle pool client error during recovery:', err);
        this.handleConnectionFailure();
      });

      if (oldPool) {
        oldPool.end().catch(() => {});
      }

      this.drizzleInstance = drizzle(this.pool, { schema });
      this.isConfiguredAndHealthy = true;
      return true;
    } catch (err) {
      return false;
    }
  }

  // Get current drizzle instance
  getDrizzle() {
    if (!this.drizzleInstance) {
      if (!this.pool) {
        const config = this.getDbConfig();
        this.pool = new Pool({
          host: config.host || undefined,
          port: config.port || undefined,
          user: config.user || undefined,
          password: config.password || undefined,
          database: config.database || undefined,
          ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        });
      }
      this.drizzleInstance = drizzle(this.pool, { schema });
    }
    return this.drizzleInstance;
  }
}

export const dbManager = new DatabaseConnectionManager();

// Single point of entry database proxy
export const db = new Proxy({} as any, {
  get(target, prop) {
    try {
      const d = dbManager.getDrizzle();
      return d[prop];
    } catch (err) {
      console.error("Database Proxy Access Error:", err);
      dbManager.handleConnectionFailure();
      throw err;
    }
  }
});

export const isDbConfigured = () => {
  return dbManager.isConfigured();
};

export const reinitializeDb = () => {
  return dbManager.initialize();
};
