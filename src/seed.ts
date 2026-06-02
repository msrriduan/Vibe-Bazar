import { Admin, Category, Coupon, Product, SystemSettings } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the current UTC instant as an ISO 8601 string. */
const now = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// Settings — singleton document at /settings/main
// ---------------------------------------------------------------------------

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
  updatedAt: now()
};

// ---------------------------------------------------------------------------
// Admin — initial whitelisted administrator
// ---------------------------------------------------------------------------

export const SEED_ADMINS: Admin[] = [
  {
    email: 'motiur3271@gmail.com',
    createdAt: now()
  }
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const SEED_CATEGORIES: Category[] = [
  { id: 'all',           name: 'All Products',    createdAt: now() },
  { id: 'mens-fashion',  name: "Men's Fashion",   createdAt: now() },
  { id: 'womens-fashion',name: "Women's Fashion", createdAt: now() },
  { id: 'accessories',   name: 'Accessories',     createdAt: now() },
  { id: 'electronics',   name: 'Electronics',     createdAt: now() },
  { id: 'new-arrivals',  name: 'New Arrivals',    createdAt: now() }
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const SEED_PRODUCTS: Product[] = [
  // ── Signature Drop Product ────────────────────────────────────────────────
  {
    id: 'vib-001',
    name: 'Classic Over-Sized Black Hood',
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
    description:
      "Upgrade your winter style with Vibebazar's signature premium heavyweight black drop-shoulder hoodie. " +
      'Crafted from 100% organic cotton fleece (380 GSM). Breathable, incredibly soft, and boasts the ' +
      'ultimate streetwear silhouette for the modern Gen-Z.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-002',
    name: 'Aura Premium Cotton Panjabi',
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
    description:
      'Celebrate Eid or any special occasion with our Aura collection premium cotton Panjabi. ' +
      'Features minimalist modern chest embroidery, hidden side pockets, and slim-fit comfortable stitching.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-007',
    name: 'Anime Print Graphic Drop-Shoulder Tee',
    category: 'mens-fashion',
    price: 850,
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description:
      'Bold manga/anime back print on 100% premium 240 GSM organic combed cotton. ' +
      'Breathable streetwear fit with soft-ribbed crew neckline. Double-stitched seams designed for daily wear.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-008',
    name: 'Dhaka Retro Noir Cargo Pants',
    category: 'mens-fashion',
    price: 1550,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description:
      'Rugged yet stylish utility streetwear cargo pants with adjustable ankle velcro-straps. ' +
      'Built from resilient cotton ripstop blend with multi-pocket setup. Perfect match for oversized chunky kicks.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-004',
    name: 'Luxe Linen Kurti',
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
    description:
      'Breathe easy in our pure linen summer long Kurti. Features detailed pastel floral handloom patterns ' +
      'and a loose comfortable fit. Perfect for casual office days or hanging out.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-009',
    name: 'Akiara Pleated High-Waist Trousers',
    category: 'womens-fashion',
    price: 1250,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description:
      'Sophisticated pleated high-waist aesthetic trousers tailored for an elegant drape. ' +
      'Lightweight crease-resistant crepe fabric with hidden zipper and back elastic band.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-010',
    name: 'Ethereal Pastel Cropped Cardigan',
    category: 'womens-fashion',
    price: 1150,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description:
      'Beautiful pastel lavender soft-knit cardigan with detailed faux-tortoise buttons. ' +
      'Cropped boxy vintage model perfect for styling as a top or layered outerwear.',
    createdAt: now(),
    updatedAt: now()
  },

  // ── Signature Accessories Drop ────────────────────────────────────────────
  {
    id: 'vib-003',
    name: 'Cyberpunk Glow Sunset Aviators',
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
    description:
      'Shade your eyes in absolute retro-cyber fashion. These orange-fused polarized aviators are sturdy, ' +
      'offer UV400 protection, and complete any high-street bold outfit.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-011',
    name: 'Vibe-Check Retro Beanie',
    category: 'accessories',
    price: 420,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description:
      'Classic rib-knit fold-over acrylic beanie featuring the subtle sewn Vibebazar brand accent. ' +
      'Stretchy, incredibly warm, and complements oversized sweaters and jackets perfectly.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-012',
    name: 'Urban Nomad Canvas Tote Bag',
    category: 'accessories',
    price: 480,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description:
      'Heavy-duty 16oz cotton canvas tote featuring high-contrast vintage typography. ' +
      'Fits an entire 15-inch laptop, notebooks, and daily supplies. Built for university commutes.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-013',
    name: 'Sleek Silver Cuban Link Chain (2-Pack)',
    category: 'accessories',
    price: 550,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description:
      'Premium hypoallergenic 316L stainless steel layered Cuban link chain set (18 inch and 20 inch). ' +
      'Robust secure lobster claws. Water, sweat, and tarnish-resistant for seamless daily wear.',
    createdAt: now(),
    updatedAt: now()
  },

  // ── Electronics ────────────────────────────────────────────────────────────
  {
    id: 'vib-005',
    name: 'SoundPods Pro Noise Cancelling Earbuds',
    category: 'electronics',
    price: 3200,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: false,
    codAllowedAreas: 'none',
    isFeatured: true,
    description:
      'Lossless rich acoustic response, 32dB active noise cancellation, smart touch controls, ' +
      'and a gorgeous matte-slate indicator case. Complete with 32 hours of premium standby playback.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-014',
    name: 'CyberGlow Mechanical Keyboard (65% Custom)',
    category: 'electronics',
    price: 4800,
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'dhaka',
    isFeatured: true,
    description:
      'Hot-swappable 65% custom mechanical keyboard optimized for typists and gamers. ' +
      'Pre-lubed linear switches, premium sound-dampening foam, custom keycaps, and dynamic RGB backlighting.',
    createdAt: now(),
    updatedAt: now()
  },

  {
    id: 'vib-015',
    name: 'RGB Ambient Neon Desk Strip',
    category: 'electronics',
    price: 950,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: false,
    description:
      'Smart room decor LED neon strip with responsive music-sync controllers. ' +
      'App and Bluetooth remote control, 16 million colors, dynamic segments for the ultimate Gen-Z desk setup.',
    createdAt: now(),
    updatedAt: now()
  },

  // ── New Arrivals ────────────────────────────────────────────────────────────
  {
    id: 'vib-006',
    name: 'Classic Minimalist Chrono Mesh Watch',
    category: 'new-arrivals',
    price: 3800,
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    ],
    isCODEnabled: true,
    codAllowedAreas: 'all',
    isFeatured: true,
    description:
      'Premium black anodized stainless steel watch featuring a charcoal textured dial, mesh strap, ' +
      'and standard waterproof chassis. The ultimate timeless daily companion.',
    createdAt: now(),
    updatedAt: now()
  }
];

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const SEED_COUPONS: Coupon[] = [
  {
    // Default 10% promo code — minimum order 1 000 BDT
    code: 'VIBE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    isActive: true,
    createdAt: now()
  },
  {
    // Seasonal flat-discount voucher — minimum order 2 000 BDT
    code: 'EIDMUBARAK',
    discountType: 'flat',
    discountValue: 200,
    minOrderAmount: 2000,
    isActive: true,
    createdAt: now()
  }
];
