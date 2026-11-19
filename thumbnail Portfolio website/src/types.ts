export type Category = 'gaming' | 'business' | 'tech' | 'vlog' | 'education';

export interface Thumbnail {
  id: string;
  title: string;
  category: Category;
  imageUrl: string;
  ctr?: string;
  views?: string;
  channel?: string;
  videoUrl?: string;
  isCustom?: boolean;
  description?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
  createdAt?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  channelName: string;
  category: string;
  packageType: string;
  details: string;
  status: 'new' | 'contacted' | 'completed';
  liveInfo?: string;
  createdAt: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  isPopular: boolean;
  tag?: string;
}

export interface Review {
  id: number;
  name: string;
  channelName?: string;
  rating: number;
  review: string;
  ctrBoost?: string;
  createdAt?: string;
}

export interface Branding {
  id: string;
  websiteName: string;
  websiteLogo: string;
  browserTabTitle: string;
  browserFavicon: string;
  heroHeading: string;
  heroSubtitle: string;
  footerCopyright: string;
  companyName: string;
  brandColor: string;
  secondaryColor: string;
  contactEmail: string;
  whatsappNumber: string;
  supportEmail: string;
  address: string;
  businessDescription: string;
  pkg1Name?: string;
  pkg1Price?: string;
  pkg1OriginalPrice?: string;
  pkg1Tag?: string;
  pkg1Description?: string;
  pkg1Features?: string;
  adminPasswordHash?: string;
  updatedAt?: string | Date;
}


