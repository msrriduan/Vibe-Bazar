import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  onSnapshot, 
  query, 
  where,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, logoutUser, loginWithGoogle } from '../firebase';
import { Product, Category, CartItem, Order, Coupon, SystemSettings, OrderItem } from '../types';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_COUPONS, DEFAULT_SETTINGS } from '../seed';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  coupons: Coupon[];
  settings: SystemSettings;
  orders: Order[]; // Fetched for admins only
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Cart Actions
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeAppliedCoupon: () => void;
  
  // Checkout & Ordering
  isPlacingOrder: boolean;
  placeNewOrder: (custDetails: { 
    name: string; 
    phone: string; 
    address: string; 
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD'; 
    transactionId?: string;
    deliveryFee?: number;
    overrideItems?: CartItem[];
  }) => Promise<Order>;
  
  // Admin Operations
  addProduct: (product: Omit<Product, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteExistingProduct: (productId: string) => Promise<void>;
  addCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  updateStoreSettings: (settings: SystemSettings) => Promise<void>;
  
  // Seeding
  seedDatabase: () => Promise<void>;
  
  // Auth actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  
  // Cart state - persistent via localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('vibe_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('vibe_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return 'dark'; // Cool Gen Z dark mode by default
  });

  useEffect(() => {
    localStorage.setItem('vibe_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vibe_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Pre-boot Firestore connectivity validation as demanded by SKILL.md
  useEffect(() => {
    async function validateFirebaseConnection() {
      try {
        await getDocFromServer(doc(db, 'settings', 'connection_test'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.error("Vibebazar Firestore App Sandbox appears offline or config has issues.");
        }
      }
    }
    validateFirebaseConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Enforce the bootstrapped email or do dynamic Admin check
        const ADMIN_EMAILS = ['motiur3271@gmail.com', 'msrriduan@gmail.com'];
        const isEmailAdmin = currentUser.email ? ADMIN_EMAILS.includes(currentUser.email) : false;
        let databaseAdminCheck = false;
        
        try {
          const adminDocRef = doc(db, 'admins', currentUser.email || '');
          const adminDoc = await getDoc(adminDocRef);
          if (adminDoc.exists()) {
            databaseAdminCheck = true;
          }
        } catch (e) {
          console.warn("Auth admin lookup failed, falling back to bootstrap logic", e);
        }
        
        setIsAdmin(isEmailAdmin || databaseAdminCheck);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Real-time listener for public collections (Active once Firebase is set up)
  useEffect(() => {
    const pathProducts = 'products';
    const unsubProducts = onSnapshot(collection(db, pathProducts), (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data() } as Product);
      });
      // Sort featured first, then by date reversed
      items.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setProducts(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathProducts);
    });

    const pathCategories = 'categories';
    const unsubCategories = onSnapshot(collection(db, pathCategories), (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Category);
      });
      setCategories(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathCategories);
    });

    const pathCoupons = 'coupons';
    const unsubCoupons = onSnapshot(collection(db, pathCoupons), (snapshot) => {
      const items: Coupon[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Coupon);
      });
      setCoupons(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathCoupons);
    });

    const pathSettings = 'settings';
    const unsubSettings = onSnapshot(doc(db, pathSettings, 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SystemSettings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${pathSettings}/main`);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubCoupons();
      unsubSettings();
    };
  }, []);

  // Admin and Real-time listener for customer reviews and system-wide Orders!
  // This listener attaches only if user is an authorized Admin.
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      return;
    }
    const pathOrders = 'orders';
    const unsubOrders = onSnapshot(collection(db, pathOrders), (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Order);
      });
      // Sort pending first, then by date reversed
      items.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      setOrders(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, pathOrders);
    });

    return () => {
      unsubOrders();
    };
  }, [isAdmin]);

  // Seeding mechanism triggerable by Admin or auto-seeded if blank
  const seedDatabase = async () => {
    try {
      // Seed Settings
      await setDoc(doc(db, 'settings', 'main'), DEFAULT_SETTINGS, { merge: true });
      
      // Seed Categories
      for (const cat of SEED_CATEGORIES) {
        const docRef = doc(db, 'categories', cat.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          await setDoc(docRef, {
            ...cat,
            createdAt: existingData.createdAt || cat.createdAt
          });
        } else {
          await setDoc(docRef, cat);
        }
      }
      
      // Seed Products
      for (const prod of SEED_PRODUCTS) {
        const docRef = doc(db, 'products', prod.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          await setDoc(docRef, {
            ...prod,
            createdAt: existingData.createdAt || prod.createdAt,
            updatedAt: new Date().toISOString()
          });
        } else {
          await setDoc(docRef, prod);
        }
      }
      
      // Seed Coupons
      for (const coup of SEED_COUPONS) {
        const docRef = doc(db, 'coupons', coup.code);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const existingData = docSnap.data();
          await setDoc(docRef, {
            ...coup,
            createdAt: existingData.createdAt || coup.createdAt
          });
        } else {
          await setDoc(docRef, coup);
        }
      }

      // Seed Bootstrap Admins
      const adminEmails = ['motiur3271@gmail.com', 'msrriduan@gmail.com'];
      for (const email of adminEmails) {
        const adminRef = doc(db, 'admins', email);
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          await setDoc(adminRef, {
            email: email,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      console.log('Database Seeding Completed Successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seeding');
    }
  };

  // Cart operations
  const addToCart = (product: Product, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + qty, product.stock);
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    const limits = products.find(p => p.id === productId)?.stock || 10;
    const finalQty = Math.max(1, Math.min(qty, limits));
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: finalQty } : item));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string) => {
    const normCode = code.toUpperCase().trim();
    const found = coupons.find(c => c.code === normCode && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or inactive promo code.' };
    }
    
    // Calculate subtotal
    const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    if (subtotal < found.minOrderAmount) {
      return { success: false, message: `Minimum cart value of BDT ${found.minOrderAmount} required.` };
    }
    
    setAppliedCoupon(found);
    return { success: true, message: `Promo code ${found.code} applied successfully!` };
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
  };

  // Place order
  const placeNewOrder = async (custDetails: { 
    name: string; 
    phone: string; 
    address: string; 
    paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD'; 
    transactionId?: string;
    deliveryFee?: number;
    overrideItems?: CartItem[];
  }) => {
    setIsPlacingOrder(true);
    const orderId = `VIBE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    
    const activeItems = custDetails.overrideItems || cart;
    const subtotal = activeItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = Math.round(subtotal * (appliedCoupon.discountValue / 100));
      } else {
        discount = appliedCoupon.discountValue;
      }
    }
    
    const delivery = custDetails.deliveryFee || 0;
    const grandTotal = Math.max(0, subtotal - discount) + delivery;
    
    const orderItems: OrderItem[] = activeItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    const orderPayload: Order = {
      id: orderId,
      customerName: custDetails.name,
      customerPhone: custDetails.phone,
      customerAddress: custDetails.address,
      items: orderItems,
      paymentMethod: custDetails.paymentMethod,
      paymentStatus: 'Pending',
      status: 'pending',
      totalAmount: grandTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (custDetails.transactionId) {
      orderPayload.transactionId = custDetails.transactionId;
    }

    if (appliedCoupon) {
      orderPayload.discountCode = appliedCoupon.code;
      orderPayload.discountAmount = discount;
    }

    try {
      // 1. Save order to Firestore
      await setDoc(doc(db, 'orders', orderId), orderPayload);
      
      // 2. Adjust stock in Firestore for each item in batch/sequentially
      for (const item of activeItems) {
        const itemRef = doc(db, 'products', item.product.id);
        const nextStock = Math.max(0, item.product.stock - item.quantity);
        await updateDoc(itemRef, { stock: nextStock });
      }

      // Clear local states
      clearCart();
      setIsPlacingOrder(false);
      return orderPayload;
    } catch (e) {
      setIsPlacingOrder(false);
      handleFirestoreError(e, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  // Admin Actions
  const addProduct = async (product: Omit<Product, 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const deleteExistingProduct = async (productId: string) => {
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `products/${productId}`);
    }
  };

  const addCategory = async (id: string, name: string) => {
    try {
      const docRef = doc(db, 'categories', id);
      await setDoc(docRef, {
        id,
        name,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const docRef = doc(db, 'categories', id);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `categories/${id}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      const updates: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      if (paymentStatus) {
        updates.paymentStatus = paymentStatus;
      }
      await updateDoc(docRef, updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const addCoupon = async (coupon: Coupon) => {
    try {
      const docRef = doc(db, 'coupons', coupon.code);
      await setDoc(docRef, {
        ...coupon,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `coupons/${coupon.code}`);
    }
  };

  const deleteCoupon = async (code: string) => {
    try {
      const docRef = doc(db, 'coupons', code);
      await deleteDoc(docRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `coupons/${code}`);
    }
  };

  const updateStoreSettings = async (nextSettings: SystemSettings) => {
    try {
      const docRef = doc(db, 'settings', 'main');
      await setDoc(docRef, {
        ...nextSettings,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'settings/main');
    }
  };

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
  };

  return (
    <ShopContext.Provider value={{
      products,
      categories,
      coupons,
      settings,
      orders,
      user,
      isAdmin,
      authLoading,
      cart,
      appliedCoupon,
      theme,
      toggleTheme,
      
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      applyCouponCode,
      removeAppliedCoupon,
      
      isPlacingOrder,
      placeNewOrder,
      
      addProduct,
      updateProduct,
      deleteExistingProduct,
      addCategory,
      deleteCategory,
      updateOrderStatus,
      addCoupon,
      deleteCoupon,
      updateStoreSettings,
      
      seedDatabase,
      login,
      logout
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
