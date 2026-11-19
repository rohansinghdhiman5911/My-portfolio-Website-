# RohanThumbnail White-Label Thumbnail Business Platform
## Professional Installation & Setup Guide

This is a professional full-stack Web Application built using React (Vite) on the frontend and Node.js (Express) on the backend, utilizing Drizzle ORM with PostgreSQL. 

It features an automated, interactive **Database Setup Wizard** on first-time launch so that buyers can configure their own independent PostgreSQL database seamlessly without touching any configuration code.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed on your system:
1. **Node.js** (v18.0.0 or higher is highly recommended)
2. **npm** (comes bundled with Node.js)
3. **PostgreSQL Database** (either locally installed or hosted in the cloud like Supabase, Aiven, AWS RDS, Neon, or Google Cloud SQL)

---

## 🚀 Quick Start (Local Installation)

Follow these simple steps to run the platform on your own computer:

### Step 1: Extract the Project ZIP
Extract the downloaded ZIP package into a folder on your computer.

### Step 2: Install Dependencies
Open your terminal/command prompt, navigate to the extracted directory, and run:
```bash
npm install
```
*This will install all front-end and back-end dependencies specified in `package.json`.*

### Step 3: Run the Application in Development Mode
Once dependencies are installed, start the server and development environment by running:
```bash
npm run dev
```
By default, the server will start running on **http://localhost:3000** (or another port if specified in your environment configuration).

### Step 4: Complete the Interactive Database Setup Wizard
1. Open your web browser and go to **http://localhost:3000**.
2. Because the application detects that no database is configured yet, it will automatically show the elegant **Database Setup Wizard**.
3. Input your PostgreSQL database details:
   - **Host:** Your database host address (e.g., `127.0.0.1` or your cloud connection string).
   - **Port:** Default is `5432`.
   - **Database Name:** The name of your database.
   - **Username:** Your PostgreSQL username.
   - **Password:** Your PostgreSQL password.
   - **SSL:** Turn this on if you are using a cloud database (like Neon or Supabase) which requires secure connections.
4. Click **Test & Initialize Database ⚡**.
5. The wizard will test your connection, automatically build the required database tables (`users`, `thumbnails`, `inquiries`, `visitors`, `reviews`), seed default inquiries so you don't start with empty tracking records, save a local configuration file (`db-config.json`), and automatically boot the app live!

---

## 📦 Production Deployment

To run this platform in a live production environment (VPS, Heroku, Render, AWS, Cloud Run, etc.):

### Step 1: Build the Application
Compile the React frontend and build the self-contained backend bundle:
```bash
npm run build
```
This produces static client-side files inside `dist/` and a compiled backend server entry point inside `dist/server.cjs`.

### Step 2: Configure Environment Variables (Optional but recommended)
Instead of using the Setup Wizard, you can inject your production database credentials directly into the environment. Create a `.env` file in the root directory (using `.env.example` as a template):

```env
SQL_HOST=your-production-db-host
SQL_PORT=5432
SQL_USER=your-database-user
SQL_PASSWORD=your-database-password
SQL_DB_NAME=your-database-name
SQL_SSL=true
PORT=3000
```
*If these variables are present in the environment on startup, the application will skip the Setup Wizard and load directly.*

### Step 3: Start the Production Server
Start the pre-built, high-performance production server using:
```bash
npm run start
```

---

## 📁 Key File Structure Guide

- **`server.ts`**: The core Express API backend server handling inquiries, thumbnails, visitor counters, client reviews, and hosting static assets.
- **`src/db/schema.ts`**: Defines the clean PostgreSQL table structures using Drizzle ORM.
- **`src/db/index.ts`**: Automatically detects database configuration, handles proxy connections, and manages dynamic database pool re-initialization.
- **`src/components/DatabaseSetup.tsx`**: The premium frontend wizard interface where buyers set up their independent databases.
- **`src/components/DeliveryTracker.tsx`**: Live real-time order delivery steps tracking with user-controlled manual dismissal (❌ option).
- **`src/components/AdminPanel.tsx`**: Secure dashboard to manage thumbnail portfolio, change status, update tracking notes, and view analytics.

---

## 🔒 Security Information
- Database passwords and database details are stored locally inside `db-config.json` (created automatically by the wizard) or loaded directly from environment variables. They are **never** exposed to the visitor's browser.
- All database operations are proxied via server-side API endpoints (`/api/*`) for maximum protection.

---
*Thank you for purchasing RohanThumbnail. For modifications, please refer to the `LICENSE.txt` file included in this package.*
