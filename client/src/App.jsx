import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppContext } from './context/AppContext.jsx';
import Footer from './components/Footer.jsx';
import Navbar from './components/Navbar.jsx';
import ProductCard from './components/ProductCard.jsx';
import useScrollParallax from './hooks/useScrollParallax.js';
import './App.css';

const API_BASE = `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000`}/api`;

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const heroSlides = [
  {
    title: 'Elevate your daily ritual.',
    subtitle: 'Thoughtful essentials for calmer mornings and greener living.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    badge: 'Fresh harvest',
  },
  {
    title: 'Wellness from the inside out.',
    subtitle: 'Curated organic blends and self-care rituals designed for everyday balance.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    badge: 'Wellness edit',
  },
  {
    title: 'Design for a cleaner home.',
    subtitle: 'Sustainable home essentials made to feel beautiful and practical.',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    badge: 'Eco living',
  },
];

const categories = [
  { name: 'Organic Food', icon: '🌿' },
  { name: 'Wellness', icon: '🍵' },
  { name: 'Home Goods', icon: '🏡' },
  { name: 'Eco Living', icon: '♻️' },
];

const features = [
  'Only ethically sourced essentials',
  'Fast eco-conscious delivery',
  'Clean ingredients and trusted quality',
  'Designed for a refined lifestyle',
];

const testimonials = [
  {
    name: 'Aisha R.',
    role: 'Wellness founder',
    quote: 'GreenCart feels elevated and intentional. It makes healthy living feel luxurious without the waste.',
  },
  {
    name: 'Daniel K.',
    role: 'Home stylist',
    quote: 'Every product feels premium and useful. It’s rare to find a storefront this beautiful and genuinely practical.',
  },
  {
    name: 'Sana T.',
    role: 'Plant parent',
    quote: 'The quality and presentation are exceptional. It feels like a boutique brand built around real values.',
  },
];

function App() {
  const location = useLocation();
  const { user, authLoading, logoutUser } = useContext(AppContext);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  if (authLoading) {
    return <div className="loading-shell">Loading GreenCart...</div>;
  }

  return (
    <div className={`app-shell ${darkMode ? 'theme-dark' : ''}`}>
      <Navbar user={user} onLogout={logoutUser} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/dashboard" element={<SellerPage />} />
          <Route path="/seller" element={<SellerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function HomePage() {
  const { products } = useContext(AppContext);
  const featured = products.slice(0, 4);

  return (
    <>
      <HeroSlider />

      <section className="container section-block">
        <div className="section-header">
          <div>
            <span className="eyebrow">Green essentials</span>
            <h2>Thoughtful goods for your everyday rhythm</h2>
          </div>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature}>
              <div className="feature-icon">✓</div>
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-header">
          <div>
            <span className="eyebrow">Popular categories</span>
            <h2>Curated for a slower, brighter life</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.name} className="category-card">
              <span>{category.icon}</span>
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-header">
          <div>
            <span className="eyebrow">Featured picks</span>
            <h2>Best sellers you’ll love</h2>
          </div>
          <Link to="/shop" className="inline-link">View all</Link>
        </div>

        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="container showcase-panel">
        <div className="showcase-copy">
          <span className="eyebrow">Why GreenCart</span>
          <h3>Beautiful products without the waste.</h3>
          <p>We combine intentional sourcing, premium design, and everyday usefulness so your home and routine feel lighter.</p>
        </div>
        <div className="stats-row">
          <div>
            <strong>100%</strong>
            <span>Responsible sourcing</span>
          </div>
          <div>
            <strong>48h</strong>
            <span>Fast delivery</span>
          </div>
          <div>
            <strong>4.9/5</strong>
            <span>Customer rating</span>
          </div>
        </div>
      </section>

      <section className="container section-block testimonials-block">
        <div className="section-header">
          <div>
            <span className="eyebrow">What people say</span>
            <h2>Customers love the feeling</h2>
          </div>
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <div className="testimonial-card" key={item.name}>
              <div className="stars">★★★★★</div>
              <p>“{item.quote}”</p>
              <div className="testimonial-person">
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function HeroSlider() {
  const scrollOffset = useScrollParallax();

  const currentSlide = heroSlides[0];

  return (
    <section className="hero-section">
      <div className="container hero-layout" style={{ '--hero-scroll': `${scrollOffset}px`, backgroundImage: `linear-gradient(105deg, rgba(8, 35, 25, 0.78), rgba(8, 35, 25, 0.12)), url(${currentSlide.image})` }}>
        <div className="hero-copy">
          <span className="eyebrow hero-badge">{currentSlide.badge}</span>
          <h1>{currentSlide.title}</h1>
          <p>{currentSlide.subtitle}</p>
          <div className="hero-actions">
            <Link to="/shop" className="primary-button">Shop now</Link>
            <Link to="/dashboard" className="secondary-button light-button">Open dashboard</Link>
          </div>
          <div className="impact-row">
            <div>
              <strong>12k+</strong>
              <span>happy shoppers</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>customer love</span>
            </div>
            <div>
              <strong>4.9/5</strong>
              <span>average rating</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function ShopPage() {
  const { products } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="container section-block page-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Shop collection</span>
          <h2>Curated for everyday green living</h2>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          value={search}
          placeholder="Search products"
          onChange={(event) => setSearch(event.target.value)}
        />

        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
          <option value="All">All</option>
          {['Produce', 'Wellness', 'Lifestyle', 'Home'].map((category) => (
            <option value={category} key={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {!filteredProducts.length && (
        <div className="empty-state">No products match your search yet.</div>
      )}
    </div>
  );
}

function ProductDetailsPage() {
  const { id } = useParams();
  const { getProductById, addToCart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      const productData = await getProductById(id);
      setProduct(productData);
      setSelectedImage(productData.image?.[0] || '');
    };

    loadProduct();
  }, [id, getProductById]);

  if (!product) {
    return <div className="loading-shell">Loading product...</div>;
  }

  return (
    <div className="container section-block">
      <div className="product-detail">
        <div className="detail-gallery">
          <div className="detail-image-wrap main-image-wrap">
            <img src={selectedImage || product.image?.[0]} alt={product.name} />
          </div>
          <div className="thumb-row">
            {(product.image || []).map((image, index) => (
              <button key={`${image}-${index}`} className={`thumb ${selectedImage === image ? 'active' : ''}`} onClick={() => setSelectedImage(image)}>
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h2>{product.name}</h2>
          <div className="price-row">
            <strong>{currency(product.offerPrice || product.price)}</strong>
            {product.offerPrice && <span>{currency(product.price)}</span>}
          </div>

          <p>{product.description}</p>

          <div className="quantity-picker">
            <button onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((current) => current + 1)}>+</button>
          </div>

          <div className="detail-actions">
            <button className="primary-button" onClick={() => addToCart(product, quantity)}>Add to cart</button>
            <Link to="/shop" className="secondary-button">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const { cart, products, updateQuantity, removeFromCart } = useContext(AppContext);

  const items = useMemo(() => {
    return cart
      .map((item) => {
        const product = products.find((entry) => entry._id === item.product);
        if (!product) return null;
        return { ...item, product };
      })
      .filter(Boolean);
  }, [cart, products]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.offerPrice || item.product.price) * item.quantity, 0);

  if (!items.length) {
    return (
      <div className="container section-block">
        <div className="empty-state large-empty">
          <h3>Your cart is empty</h3>
          <Link to="/shop" className="primary-button">Explore products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-block page-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Your bag</span>
          <h2>Ready for checkout</h2>
        </div>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product._id} className="cart-item">
              <img src={item.product.image?.[0]} alt={item.product.name} />
              <div className="cart-item-details">
                <h3>{item.product.name}</h3>
                <p>{item.product.category}</p>
                <strong>{currency(item.product.offerPrice || item.product.price)}</strong>
              </div>

              <div className="mini-quantity">
                <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
              </div>

              <button className="text-button" onClick={() => removeFromCart(item.product._id)}>Remove</button>
            </div>
          ))}
        </div>

        <aside className="checkout-summary">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><strong>{currency(subtotal)}</strong></div>
          <div className="summary-row"><span>Shipping</span><strong>Free</strong></div>
          <div className="summary-row total"><span>Total</span><strong>{currency(subtotal)}</strong></div>
          <Link to="/checkout" className="primary-button full-button">Proceed to checkout</Link>
        </aside>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, placeOrder } = useContext(AppContext);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phoneNumber: '',
  });
  const [message, setMessage] = useState('');

  if (!user) {
    return (
      <div className="container section-block">
        <div className="empty-state large-empty">
          <h3>Please login to complete your order</h3>
          <Link to="/login" className="primary-button">Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await placeOrder(address);
    if (result.success) {
      setMessage('Order placed successfully.');
      navigate('/orders');
      return;
    }
    setMessage(result.message || 'Unable to place order.');
  };

  return (
    <div className="container section-block page-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h2>Delivery details</h2>
        </div>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input placeholder="First name" value={address.firstName} onChange={(event) => setAddress({ ...address, firstName: event.target.value })} required />
          <input placeholder="Last name" value={address.lastName} onChange={(event) => setAddress({ ...address, lastName: event.target.value })} required />
          <input type="email" placeholder="Email" value={address.email} onChange={(event) => setAddress({ ...address, email: event.target.value })} required />
          <input placeholder="Phone number" value={address.phoneNumber} onChange={(event) => setAddress({ ...address, phoneNumber: event.target.value })} required />
          <input placeholder="City" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required />
          <input placeholder="State" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} required />
          <input placeholder="Postal code" value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} required />
          <input placeholder="Country" value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} required />
        </div>

        {message && <p className="form-message">{message}</p>}
        <button className="primary-button" type="submit">Place order</button>
      </form>
    </div>
  );
}

function OrdersPage() {
  const { user } = useContext(AppContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([
          {
            _id: 'demo-order-1',
            amount: 124.99,
            status: 'Order Placed',
            createdAt: new Date().toISOString(),
            items: [{ product: { name: 'Organic Avocado Pack' } }],
          },
        ]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/order/user`, { credentials: 'include' });
        const data = await response.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Order fetch failed:', error);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="container section-block page-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">My orders</span>
          <h2>Track your recent purchases</h2>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span>Order #{String(order._id).slice(-6)}</span>
              <strong>{order.status || 'Order Placed'}</strong>
            </div>
            <p>{order.items?.length || 0} item(s)</p>
            <div className="order-meta">
              <span>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
              <strong>{currency(order.amount || 0)}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthPage({ mode }) {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = mode === 'login' ? await loginUser(formData) : await registerUser(formData);
    if (result.success) {
      navigate('/');
      return;
    }
    setMessage(result.message || 'Something went wrong.');
  };

  return (
    <div className="container auth-container">
      <div className="auth-card">
        <span className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Create account'}</span>
          <h2>{mode === 'login' ? 'Login to GreenCart' : 'Create your account'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Full name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            required
          />

          {message && <p className="form-message">{message}</p>}

          <button className="primary-button full-button" type="submit">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="switch-link">
          {mode === 'login' ? 'New here?' : 'Already a member?'}{' '}
          <Link to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create account' : 'Login'}</Link>
        </p>
      </div>
    </div>
  );
}

function SellerPage() {
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerAuthMode, setSellerAuthMode] = useState('login');
  const [sellerLogged, setSellerLogged] = useState(false);
  const [sellerMessage, setSellerMessage] = useState('');
  const [sellerOrders, setSellerOrders] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    category: 'Organic Food',
    inStock: true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadSellerOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/order/seller`, { credentials: 'include' });
      const data = await response.json();
      if (data.success && Array.isArray(data.orders)) {
        setSellerOrders(data.orders);
      }
    } catch (error) {
      console.error('Seller orders fetch failed:', error);
    }
  };

  const handleSellerAuth = async (event) => {
    event.preventDefault();

    const endpoint = sellerAuthMode === 'register' ? `${API_BASE}/seller/register` : `${API_BASE}/seller/login`;
    const payload = sellerAuthMode === 'register'
      ? { name: sellerName, email: sellerEmail, password: sellerPassword }
      : { email: sellerEmail, password: sellerPassword };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setSellerLogged(true);
        setSellerMessage(sellerAuthMode === 'register' ? 'Seller registered successfully.' : 'Seller access granted.');
        await loadSellerOrders();
        return;
      }

      setSellerMessage(data.message || 'Invalid seller credentials');
    } catch (error) {
      setSellerLogged(false);
      setSellerMessage('Seller server is unavailable. Start the backend and try again.');
      console.error('Seller auth failed:', error);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await fetch(`${API_BASE}/order/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      await loadSellerOrders();
    } catch (error) {
      console.error('Order status update failed:', error);
    }
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append(
        'productData',
        JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          offerPrice: Number(productForm.offerPrice || productForm.price),
        })
      );

      imageFiles.forEach((file) => formData.append('images', file));

      const response = await fetch(`${API_BASE}/product/add`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSellerMessage('Product added successfully.');
        setProductForm({
          name: '',
          description: '',
          price: '',
          offerPrice: '',
          category: 'Organic Food',
          inStock: true,
        });
        setImageFiles([]);
      } else {
        if (response.status === 401 || response.status === 403) {
          setSellerLogged(false);
          setSellerMessage('Seller authorization expired. Please sign in again.');
          return;
        }
        setSellerMessage(data.message || 'Unable to add product.');
      }
    } catch (error) {
      setSellerMessage('Unable to reach the seller server. Check that the backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!sellerLogged) {
    return (
      <div className="container auth-container">
        <div className="auth-card seller-card">
          <span className="eyebrow">Seller portal</span>
          <h2>{sellerAuthMode === 'login' ? 'Manage your storefront' : 'Register as a seller'}</h2>
          <form onSubmit={handleSellerAuth} className="auth-form">
            {sellerAuthMode === 'register' && (
              <input
                type="text"
                placeholder="Business or seller name"
                value={sellerName}
                onChange={(event) => setSellerName(event.target.value)}
                required
              />
            )}
            <input type="email" placeholder="Seller email" value={sellerEmail} onChange={(event) => setSellerEmail(event.target.value)} required />
            <input type="password" placeholder="Seller password" value={sellerPassword} onChange={(event) => setSellerPassword(event.target.value)} required />
            {sellerMessage && <p className="form-message">{sellerMessage}</p>}
            <button className="primary-button full-button" type="submit">
              {sellerAuthMode === 'login' ? 'Login as seller' : 'Register seller'}
            </button>
          </form>
          <p className="switch-link">
            {sellerAuthMode === 'login' ? 'Need an account?' : 'Already a seller?'}{' '}
            <button className="inline-toggle" type="button" onClick={() => setSellerAuthMode((mode) => mode === 'login' ? 'register' : 'login')}>
              {sellerAuthMode === 'login' ? 'Register now' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-block page-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Vendor dashboard</span>
          <h2>Track your GreenCart business</h2>
        </div>
      </div>

      <div className="seller-stats">
        <div className="stat-box">
          <strong>1,248</strong>
          <span>Units sold</span>
        </div>
        <div className="stat-box">
          <strong>$26.4k</strong>
          <span>Revenue</span>
        </div>
        <div className="stat-box">
          <strong>96%</strong>
          <span>Satisfaction</span>
        </div>
      </div>

      <div className="seller-layout">
        <div className="seller-panel">
          <h3>Add new product</h3>
          <form className="product-form" onSubmit={handleAddProduct}>
            <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} placeholder="Product name" required />
            <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Description" rows="4" required />
            <div className="product-form-grid">
              <input type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} placeholder="Price" required />
              <input type="number" value={productForm.offerPrice} onChange={(event) => setProductForm({ ...productForm, offerPrice: event.target.value })} placeholder="Offer price" />
            </div>
            <select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>
              <option>Organic Food</option>
              <option>Wellness</option>
              <option>Home Goods</option>
              <option>Eco Living</option>
            </select>
            <input type="file" accept="image/*" multiple onChange={(event) => setImageFiles(Array.from(event.target.files))} />
            {sellerMessage && <p className="form-message">{sellerMessage}</p>}
            <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Publish product'}</button>
          </form>
        </div>

        <div className="seller-panel">
          <h3>Admin order queue</h3>
          <div className="admin-orders">
            {sellerOrders.length ? (
              sellerOrders.map((order) => (
                <div className="admin-order-card" key={order._id}>
                  <div className="order-header">
                    <span>#{String(order._id).slice(-6)}</span>
                    <strong>{order.status || 'Order Placed'}</strong>
                  </div>
                  <p>{order.items?.length || 0} products</p>
                  <div className="admin-order-actions">
                    {['Order Placed', 'Processing', 'Shipped', 'Delivered'].map((status) => (
                      <button key={status} className={order.status === status ? 'status-chip active' : 'status-chip'} onClick={() => handleStatusUpdate(order._id, status)}>
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="form-message">No recent orders yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
