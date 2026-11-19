import { Thumbnail, PricingTier } from './types';

export const INITIAL_THUMBNAILS: Thumbnail[] = [];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'tier1',
    name: 'Starter Booster Pack',
    price: '₹49',
    originalPrice: '₹99',
    description: 'Special discounted offer! Prices start from ₹49. Final price depends on design complexity and delivery time. You can order at any time, but normal working hours are 4:00 PM to 10:00 PM (Evening to Night).',
    features: [
      '1 Custom High-CTR Thumbnail',
      'Ultra High Resolution (1080p)',
      '24-Hour Delivery Time',
      'Order anytime (Normal Hours: 4:00 PM - 10:00 PM Evening to Night)',
      'Emergency Delivery of Thumbnail Available'
    ],
    isPopular: true,
    tag: 'Limited Offer'
  }
];

