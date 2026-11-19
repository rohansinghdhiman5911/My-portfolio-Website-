import { pgTable, text, boolean, timestamp, serial, integer } from 'drizzle-orm/pg-core';

// Define the 'users' table for Firebase Authentication users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'thumbnails' table
export const thumbnails = pgTable('thumbnails', {
  id: text('id').primaryKey(), // supports 't1', 't2', and 'custom_1234'
  title: text('title').notNull(),
  category: text('category').notNull(),
  imageUrl: text('image_url').notNull(),
  ctr: text('ctr').default('10.0%'),
  views: text('views').default('0'),
  channel: text('channel').default('New Channel'),
  videoUrl: text('video_url').default('https://youtube.com'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  description: text('description'),
});

// Define the 'videos' table for up to 1-minute author videos
export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  videoUrl: text('video_url').notNull(),
  duration: text('duration').default('0:60'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'inquiries' table
export const inquiries = pgTable('inquiries', {
  id: text('id').primaryKey(), // supports 'seed_inq_1', 'inq_1234'
  name: text('name').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp'),
  channelName: text('channel_name'),
  category: text('category'),
  packageType: text('package_type'),
  details: text('details'),
  status: text('status').notNull().default('new'), // 'new' | 'contacted' | 'completed'
  liveInfo: text('live_info').default('Your designer is reviewing your brief.'),
  createdAt: text('created_at'), // formatted date string
});

// Define the 'visitors' table to track unique real-person website visits
export const visitors = pgTable('visitors', {
  id: text('id').primaryKey(), // Unique persistent browser ID (localStorage based)
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'reviews' table for real client feedback
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  channelName: text('channel_name'),
  rating: integer('rating').notNull().default(5),
  review: text('review').notNull(),
  ctrBoost: text('ctr_boost'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'branding' table for white-label settings
export const branding = pgTable('branding', {
  id: text('id').primaryKey(), // 'main'
  websiteName: text('website_name').notNull().default('RohanThumbnails.com'),
  websiteLogo: text('website_logo').notNull().default('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80'), // custom uploaded logo URL
  browserTabTitle: text('browser_tab_title').notNull().default('RohanThumbnails - Double Your YouTube CTR'),
  browserFavicon: text('browser_favicon').notNull().default('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&h=32&q=80'),
  heroHeading: text('hero_heading').notNull().default('Thumbnails That Get Clicked.'),
  heroSubtitle: text('hero_subtitle').notNull().default('High-converting custom thumbnails. We combine audience psychology, bold contrast framing, and pixel-perfect clarity to double your click-through rates.'),
  footerCopyright: text('footer_copyright').notNull().default('RohanThumbnails.com. All rights reserved. Not affiliated with YouTube.'),
  companyName: text('company_name').notNull().default('RohanThumbnails'),
  brandColor: text('brand_color').notNull().default('#06b6d4'), // primary accent: cyan-500
  secondaryColor: text('secondary_color').notNull().default('#9333ea'), // secondary accent: purple-600
  contactEmail: text('contact_email').notNull().default('contact@rohanthumbnails.com'),
  whatsappNumber: text('whatsapp_number').notNull().default('919041489449'),
  supportEmail: text('support_email').notNull().default('support@rohanthumbnails.com'),
  address: text('address').notNull().default('Mumbai, India'),
  businessDescription: text('business_description').notNull().default('Premium thumbnail design studio focused on maximizing YouTube CTR for professional creators.'),
  pkg1Name: text('pkg1_name').notNull().default('Starter Booster Pack'),
  pkg1Price: text('pkg1_price').notNull().default('₹49'),
  pkg1OriginalPrice: text('pkg1_original_price').default('₹99'),
  pkg1Tag: text('pkg1_tag').default('Limited Offer'),
  pkg1Description: text('pkg1_description').default('Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).'),
  pkg1Features: text('pkg1_features').default('1 Custom High-CTR Thumbnail\nUltra High Resolution (1080p)\n24-Hour Delivery Time\nOrder anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)\nEmergency Delivery of Thumbnail Available'),
  adminPasswordHash: text('admin_password_hash'),
  updatedAt: timestamp('updated_at').defaultNow(),
});


