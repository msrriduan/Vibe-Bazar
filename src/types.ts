export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  isCODEnabled: boolean;
  codAllowedAreas: string; // 'all' | 'dhaka' | others
  isFeatured?: boolean;
  createdAt: any; // Firestore Timestamp or ISO string
  updatedAt: any;
}

export interface Category {
  id: string;
  name: string;
  createdAt: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD';
  paymentStatus: 'Pending' | 'Confirmed';
  transactionId?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
  createdAt: any;
  updatedAt: any;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  createdAt: any;
}

export interface SystemSettings {
  id: string;
  paymentNumbers: {
    bKash: string;
    Nagad: string;
    Rocket?: string;
  };
  whatsappNumber: string;
  facebookPixelId?: string;
  messengerChatUrl?: string;
  updatedAt: any;
}
