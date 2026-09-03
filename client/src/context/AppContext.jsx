import { createContext, useEffect, useMemo, useState } from 'react';

const API_BASE = `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000`}/api`;

const sampleProducts = [
  {
    _id: 'demo-1',
    name: 'Organic Avocado Pack',
    description: 'Freshly harvested avocados packed for clean, vibrant living.',
    price: 18,
    offerPrice: 14,
    image: ['https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80'],
    category: 'Produce',
    inStock: true,
  },
  {
    _id: 'demo-2',
    name: 'Green Tea Wellness Box',
    description: 'A calming blend of organic teas for mindful evenings.',
    price: 26,
    offerPrice: 21,
    image: ['https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80'],
    category: 'Wellness',
    inStock: true,
  },
  {
    _id: 'demo-3',
    name: 'Eco Water Bottle',
    description: 'Sleek stainless steel bottle designed for everyday hydration.',
    price: 29,
    offerPrice: 24,
    image: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'],
    category: 'Lifestyle',
    inStock: true,
  },
  {
    _id: 'demo-4',
    name: 'Plant Starter Kit',
    description: 'Everything you need to grow a greener, healthier home.',
    price: 34,
    offerPrice: 28,
    image: ['https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80'],
    category: 'Home',
    inStock: true,
  },
];

const getStoredCart = () => {
  try {
    const saved = localStorage.getItem('greencart_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('greencart_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const persistLocalUser = (userData) => {
  localStorage.setItem('greencart_user', JSON.stringify(userData));
};

const getDemoUsers = () => {
  try {
    const saved = localStorage.getItem('greencart_demo_users');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveDemoUsers = (users) => {
  localStorage.setItem('greencart_demo_users', JSON.stringify(users));
};

const createDemoSession = (payload) => {
  const userData = {
    name: payload.name || payload.email?.split('@')[0] || 'Demo Shopper',
    email: payload.email,
  };

  persistLocalUser(userData);
  return { success: true, user: userData, demo: true };
};

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [products, setProducts] = useState(sampleProducts);
  const [user, setUser] = useState(getStoredUser());
  const [cart, setCart] = useState(getStoredCart());
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('greencart_cart', JSON.stringify(cart));
  }, [cart]);

  const syncCartToBackend = async (nextCart) => {
    if (!user) return;

    try {
      await fetch(`${API_BASE}/cart/update`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: nextCart }),
      });
    } catch (error) {
      console.error('Cart sync failed:', error);
    }
  };

  const setCartItems = async (nextCart) => {
    setCart(nextCart);
    if (user) {
      await syncCartToBackend(nextCart);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/product/list`, { credentials: 'include' });
      const data = await response.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/user/is-Auth`, { credentials: 'include' });
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        persistLocalUser(data.user);
      }
    } catch (error) {
      const savedUser = getStoredUser();
      if (savedUser) {
        setUser(savedUser);
      }
      console.error('User session check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE}/cart`, { credentials: 'include' });
      const data = await response.json();
      if (data.success && Array.isArray(data.cartItems)) {
        setCart(data.cartItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    const existingItem = cart.find((item) => item.product === product._id || item.product === product.id);
    const nextCart = existingItem
      ? cart.map((item) =>
          item.product === product._id || item.product === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...cart, { product: product._id || product.id, quantity }];

    await setCartItems(nextCart);
    return nextCart;
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      const nextCart = cart.filter((item) => item.product !== productId);
      await setCartItems(nextCart);
      return;
    }

    const nextCart = cart.map((item) =>
      item.product === productId ? { ...item, quantity } : item
    );
    await setCartItems(nextCart);
  };

  const removeFromCart = async (productId) => {
    const nextCart = cart.filter((item) => item.product !== productId);
    await setCartItems(nextCart);
  };

  const clearCart = async () => {
    await setCartItems([]);
  };

  const loginUser = async (payload) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        persistLocalUser(data.user);
        return { success: true, user: data.user };
      }

      const demoUsers = getDemoUsers();
      const foundDemoUser = demoUsers.find(
        (entry) => entry.email === payload.email && entry.password === payload.password
      );

      if (foundDemoUser) {
        const readyUser = { name: foundDemoUser.name, email: foundDemoUser.email };
        setUser(readyUser);
        persistLocalUser(readyUser);
        return { success: true, user: readyUser, demo: true };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      const demoUsers = getDemoUsers();
      const foundDemoUser = demoUsers.find(
        (entry) => entry.email === payload.email && entry.password === payload.password
      );

      if (foundDemoUser) {
        const readyUser = { name: foundDemoUser.name, email: foundDemoUser.email };
        setUser(readyUser);
        persistLocalUser(readyUser);
        return { success: true, user: readyUser, demo: true };
      }

      return { success: false, message: 'Unable to reach the server right now. Demo mode is available for local preview.' };
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (payload) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        persistLocalUser(data.user);
        return { success: true, user: data.user };
      }

      const demoUsers = getDemoUsers();
      const emailExists = demoUsers.some((entry) => entry.email === payload.email);
      if (!emailExists) {
        demoUsers.push({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });
        saveDemoUsers(demoUsers);
      }

      const readyUser = { name: payload.name, email: payload.email };
      setUser(readyUser);
      persistLocalUser(readyUser);
      return { success: true, user: readyUser, demo: true };
    } catch (error) {
      const demoUsers = getDemoUsers();
      const emailExists = demoUsers.some((entry) => entry.email === payload.email);
      if (!emailExists) {
        demoUsers.push({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });
        saveDemoUsers(demoUsers);
      }

      const readyUser = { name: payload.name, email: payload.email };
      setUser(readyUser);
      persistLocalUser(readyUser);
      return { success: true, user: readyUser, demo: true };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await fetch(`${API_BASE}/user/logout`, { credentials: 'include' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setCart([]);
      localStorage.removeItem('greencart_cart');
      localStorage.removeItem('greencart_user');
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/product/id/${id}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success && data.product) {
        return data.product;
      }
    } catch (error) {
      console.error('Failed to fetch product by id:', error);
    }

    return products.find((product) => product._id === id) || sampleProducts[0];
  };

  const placeOrder = async (address) => {
    if (!user) {
      return { success: false, message: 'Please log in before placing an order.' };
    }

    if (!cart.length) {
      return { success: false, message: 'Your cart is empty.' };
    }

    const items = cart.map((item) => {
      const product = products.find((entry) => entry._id === item.product);
      return {
        product: item.product,
        quantity: item.quantity,
        price: product?.offerPrice || product?.price || 0,
      };
    });

    try {
      const response = await fetch(`${API_BASE}/order/cod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items, address }),
      });
      const data = await response.json();
      if (data.success) {
        setCart([]);
        return { success: true, order: data.order };
      }
      return { success: false, message: data.message || 'Order could not be placed.' };
    } catch (error) {
      return { success: false, message: 'Unable to place your order right now.' };
    }
  };

  const value = useMemo(
    () => ({
      user,
      products,
      cart,
      loading,
      authLoading,
      fetchProducts,
      loginUser,
      registerUser,
      logoutUser,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getProductById,
      placeOrder,
      setCart,
    }),
    [user, products, cart, loading, authLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
