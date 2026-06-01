import { Product, SystemSettings, Category, Coupon } from './types';

export const DEFAULT_SETTINGS: SystemSettings = {
  id: 'main',
  paymentNumbers: {
    bKash: '01989475141',
    Nagad: '01989475141',
    Rocket: '01989475141'
  },
  whatsappNumber: '8801989475141',
  facebookPixelId: '1234567890',
  messengerChatUrl: 'https://m.me/Vibebazar01',
  updatedAt: new Date().toISOString()
};

export const SEED_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Products', createdAt: new Date().toISOString() },
  { id: 'mens-fashion', name: "Men's Fashion", createdAt: new Date().toISOString() },
  { id: 'womens-fashion', name: "Women's Fashion", createdAt: new Date().toISOString() },
  { id: 'accessories', name: 'Accessories', createdAt: new Date().toISOString() },
  { id: 'electronics', name: 'Electronics', createdAt: new Date().toISOString() },
  { id: 'new-arrivals', name: 'New Arrivals', createdAt: new Date().toISOString() }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'vib-001',
    name: "Classic Over-Sized Black Hood",
    category: 'mens-fashion',
    price: 1250,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description: "Upgrade your winter style with Vibebazar's signature premium heavyweight black drop-shoulder hoodie. Crafted from 100% organic cotton fleece (380 GSM). Breathable, incredibly soft, and boasts the ultimate streetwear silhouette for the modern Gen-Z.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vib-002',
    name: "Aura Premium Cotton Panjabi",
    category: 'mens-fashion',
    price: 2450,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description: "Celebrate Eid or any special occasion with our Aura collection premium cotton Panjabi. Features minimalist modern chest embroidery, hidden side pockets, and slim-fit comfortable stitching.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vib-003',
    name: "Cyberpunk Glow Sunset Aviators",
    category: 'accessories',
    price: 680,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'dhaka',
    isFeatured: true,
    description: "Shade your eyes in absolute retro-cyber fashion. These orange-fused polarized aviators are sturdy, offer UV400 protection, and complete any high-street bold outfit.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vib-004',
    name: "Luxe Linen Linen Kurti",
    category: 'womens-fashion',
    price: 1850,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description: "Breathe easy in our pure linen summer long Kurti. Features detailed pastel floral handloom patterns and a loose comfortable fit. Perfect for casual office days or hanging out.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vib-005',
    name: "SoundPods Pro Noise Cancelling Earbuds",
    category: 'electronics',
    price: 3200,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: false,
    codAllowedAreas: 'none',
    isFeatured: true,
    description: "Lossless rich acoustic response, 32dB active noise cancellation, smart touch controls, and a gorgeous matte-slate indicator case. Complete with 32 hours of premium standby playback.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vib-006',
    name: "Classic Minimalist Chrono Mesh Watch",
    category: 'new-arrivals',
    price: 3800,
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description: "Premium black anodized stainless steel watch featuring a charcoal textured dial, mesh strap, and standard waterproof chassis. The ultimate timeless daily companion.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_COUPONS: Coupon[] = [
  {
    code: 'VIBE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    code: 'EIDMUBARAK',
    discountType: 'flat',
    discountValue: 200,
    minOrderAmount: 2000,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
