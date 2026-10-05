import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Heart, Leaf, MapPin, Menu, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBasket, ShoppingCart, SlidersHorizontal, Sparkles, Star, Trash2, Truck, UserRound, X } from 'lucide-react';
import { api, categories, money, normalizeProduct, photo, readStorage, sampleProducts, saveStorage, totals } from './shop.js';

function Brand() { return <a className="brand" href="#home" aria-label="Freshora home"><span className="brand-mark"><ShoppingBasket size={24}/><Leaf size={13}/></span>Fresh<span>ora</span><i>®</i></a>; }
function Img({ src, alt, ...props }) { const [failed, setFailed] = useState(false); return failed || !src ? <div className="image-fallback" role="img" aria-label={alt}><ShoppingBasket/><span>{alt}</span></div> : <img src={src} alt={alt} onError={() => setFailed(true)} {...props}/>; }

function Dialog({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`dialog ${wide ? 'wide' : ''}`} onCancel={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}><div className="dialog-head"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X/></button></div>{children}</dialog>;
}

export default function App() {
  const [products, setProducts] = useState(sampleProducts);
  const [mode, setMode] = useState('loading');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(() => { const value = readStorage('greencart-cart-v2', {}); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; });
  const [favorites, setFavorites] = useState(() => { const value = readStorage('greencart-favorites', []); return Array.isArray(value) ? value : []; });
  const [category, setCategory] = useState('All products');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [review, setReview] = useState(0);
  const orderLock = useRef(false);
  const cartSync = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    api('/product/list').then(data => { if (active) { setProducts(data.products.map(normalizeProduct)); setMode('live'); } }).catch(() => { if (active) setMode('demo'); });
    api('/user/is-Auth').then(async data => {
      const saved = await api('/cart/').catch(() => ({ cartItems: [] }));
      if (!active) return;
      setCart(previous => {
        const merged = { ...previous };
        for (const item of saved.cartItems || []) {
          const id = typeof item.product === 'object' ? item.product?._id : item.product;
          if (id && Number.isInteger(item.quantity) && item.quantity > 0) merged[id] = Math.min(99, Math.max(merged[id] || 0, item.quantity));
        }
        return merged;
      });
      setUser(data.user);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => { saveStorage('greencart-cart-v2', cart); }, [cart]);
  useEffect(() => { saveStorage('greencart-favorites', favorites); }, [favorites]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { setError(''); }, [modal, authMode]);

  const items = products.filter(p => Number.isInteger(cart[p.id]) && cart[p.id] > 0).map(product => ({ product, quantity: cart[product.id] }));
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const { subtotal, tax, total } = totals(items);
  const visible = products.filter(p => (category === 'All products' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase().trim()) && (!favoritesOnly || favorites.includes(p.id)) && (!dealsOnly || p.originalPrice > p.price)).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name) : 0);
  const availableCategories = [...new Set([...categories.map(c => c.name), ...products.map(p => p.category)])];

  function updateCart(id, delta) {
    setCart(previous => {
      const next = { ...previous };
      next[id] = Math.max(0, Math.min(99, (Number(next[id]) || 0) + delta));
      if (!next[id]) delete next[id];
      return next;
    });
  }
  // Serialize signed-in cart writes so a slower older request cannot overwrite a newer one.
  useEffect(() => {
    if (!user || mode !== 'live') return;
    const timer = setTimeout(() => {
      const cartItems = Object.entries(cart).filter(([id]) => products.some(p => p.id === id)).map(([product, quantity]) => ({ product, quantity }));
      cartSync.current = cartSync.current.catch(() => {}).then(() => api('/cart/update', { cartItems })).catch(() => setToast('Cart saved on this device. Account sync is temporarily unavailable.'));
    }, 500);
    return () => clearTimeout(timer);
  }, [cart, user, mode, products]);

  function shop(nextCategory = 'All products', deals = false) {
    setCategory(nextCategory); setDealsOnly(deals); setFavoritesOnly(false); setQuery(''); setMobileMenu(false);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
  function toggleFavorite(id) { setFavorites(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); }
  function open(next) { setError(''); setModal(next); setMobileMenu(false); }
  async function authenticate(e) {
    e.preventDefault(); setBusy(true); setError('');
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const data = await api(`/user/${authMode === 'register' ? 'register' : 'login'}`, form);
      const saved = await api('/cart/').catch(() => ({ cartItems: [] }));
      setCart(previous => {
        const merged = { ...previous };
        for (const item of saved.cartItems || []) { const id = typeof item.product === 'object' ? item.product?._id : item.product; if (id && Number.isInteger(item.quantity) && item.quantity > 0) merged[id] = Math.min(99, Math.max(merged[id] || 0, item.quantity)); }
        return merged;
      });
      setUser(data.user); setModal(null); setToast(`Welcome${authMode === 'login' ? ' back' : ''}, ${data.user.name}!`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function showOrders() {
    open('orders'); setBusy(true);
    try { setOrders(mode === 'demo' ? readStorage('greencart-demo-orders', []) : (await api('/order/user')).orders); }
    catch (err) { setError(user ? err.message : 'Sign in to see your orders.'); setOrders([]); }
    finally { setBusy(false); }
  }
  function checkout() {
    if (mode === 'loading') { setToast('Please wait while we connect to the store.'); return; }
    if (!items.length) return;
    if (items.some(item => !item.product.inStock)) { setError('Remove unavailable products before checking out.'); return; }
    if (mode === 'live' && !user) { setAuthMode('login'); open('auth'); setToast('Please sign in, then continue checkout from your cart.'); return; }
    open('checkout');
  }
  async function placeOrder(e) {
    e.preventDefault(); if (orderLock.current || !items.length) return;
    orderLock.current = true; setBusy(true); setError('');
    const address = Object.fromEntries(new FormData(e.currentTarget));
    try {
      let order;
      if (mode === 'demo') {
        order = { _id: `DEMO-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), items, amount: total, address, status: 'Demo order', demo: true };
        saveStorage('greencart-demo-orders', [order, ...readStorage('greencart-demo-orders', [])]);
      } else {
        const saved = await api('/address/add', { address });
        const result = await api('/order/cod', { address: saved.address._id, items: items.map(({ product, quantity }) => ({ product: product.id, quantity })) });
        order = result.order;
      }
      setCompletedOrder(order); setCart({}); setModal('success');
    } catch (err) { setError(err.message); } finally { setBusy(false); orderLock.current = false; }
  }
  function Quantity({ product, quantity }) { return <div className="quantity"><button aria-label={`Remove one ${product.name}`} onClick={() => updateCart(product.id, -1)}><Minus size={14}/></button><span>{quantity}</span><button disabled={quantity >= 99} aria-label={`Add one ${product.name}`} onClick={() => updateCart(product.id, 1)}><Plus size={14}/></button></div>; }
  function ProductCard({ product }) {
    return <article className="product-card"><div className="product-image"><button className="image-link" onClick={() => { setSelected(product); open('product'); }} aria-label={`View ${product.name}`}><Img src={product.image} alt={product.name} loading="lazy"/></button>{product.badge && <span className={`product-badge ${product.badge.includes('OFF') ? 'sale' : ''}`}>{product.badge}</span>}<button className={`favorite ${favorites.includes(product.id) ? 'saved' : ''}`} aria-label={`${favorites.includes(product.id) ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={favorites.includes(product.id)} onClick={() => toggleFavorite(product.id)}><Heart size={16}/></button></div><div className="product-info"><span className="product-category">{product.category}</span><button className="product-name" onClick={() => { setSelected(product); open('product'); }}>{product.name}</button><span className="unit">{product.unit}</span><div className="product-bottom"><div><strong>{money(product.price)}</strong>{product.originalPrice > product.price && <del>{money(product.originalPrice)}</del>}</div>{cart[product.id] ? <Quantity product={product} quantity={cart[product.id]}/> : <button className="add-button" disabled={!product.inStock} aria-label={`Add ${product.name} to cart`} onClick={() => { updateCart(product.id, 1); setToast(`${product.name} added to your cart`); }}>{product.inStock ? <><Plus size={15}/> Add</> : 'Sold out'}</button>}</div></div></article>;
  }
  const reviews = [
    { quote: 'The kind of freshness you can taste. My weekly shop is now the easiest part of my week!', name: 'Sarah Mitchell', role: 'Home cook & happy customer', image: 'photo-1580489944761-15a19d654956' },
    { quote: 'Beautiful produce, thoughtful packaging, and everything I need for a weekend full of cooking.', name: 'James Wilson', role: 'Food lover & happy customer', image: 'photo-1500648767791-00dcc994a43e' },
    { quote: 'From breakfast essentials to dinner ingredients, it all arrives fresh. A little everyday luxury.', name: 'Emily Chen', role: 'Busy parent & happy customer', image: 'photo-1534528741775-53994a69daeb' },
  ];

  return <>
    <div className="announcement"><span><Leaf size={13}/> A little fresher. A little greener. A whole lot better.</span><span>Fresh picks, delivered with care <Truck size={15}/></span></div>
    <header className="header" id="home"><div className="container header-main"><Brand/><form className="search" role="search" onSubmit={e => { e.preventDefault(); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); }}><Search size={18}/><input aria-label="Search groceries" placeholder="Search for fresh groceries..." value={query} onChange={e => { setQuery(e.target.value); setCategory('All products'); setFavoritesOnly(false); setDealsOnly(false); }}/><button type="submit" aria-label="Submit search"><ArrowRight size={17}/></button></form><div className="header-actions"><button className="icon-button saved-header" aria-label="Saved products" onClick={() => { setFavoritesOnly(true); setCategory('All products'); setQuery(''); setDealsOnly(false); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); }}><Heart size={21}/>{favorites.length > 0 && <i>{favorites.length}</i>}</button><button className="icon-button" aria-label={user ? 'My account' : 'Sign in'} onClick={() => open(user ? 'account' : 'auth')}><UserRound size={21}/></button><span className="action-divider"/><button className="cart-button" onClick={() => open('cart')} aria-label={`Open cart, ${count} items`}><span><ShoppingCart size={21}/><i>{count}</i></span><span className="cart-label">Your cart<strong>{money(subtotal)}</strong></span></button><button className="icon-button mobile-toggle" aria-label="Toggle navigation" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X/> : <Menu/>}</button></div></div><div className="nav-border"><nav className={`container navigation ${mobileMenu ? 'mobile-open' : ''}`} aria-label="Main navigation"><a className="all-categories" href="#categories" onClick={() => setMobileMenu(false)}><Menu size={18}/> All categories <ChevronDown size={14}/></a><div className="nav-links"><a className="active" href="#home" onClick={() => setMobileMenu(false)}>Home</a><button onClick={() => shop()}>Shop all</button><button onClick={() => shop('All products', true)}>Deals & offers <span className="tiny-badge">HOT</span></button><a href="#why-us" onClick={() => setMobileMenu(false)}>Why Freshora?</a><button onClick={showOrders}>My orders</button></div><span className="nav-note"><Truck size={16}/> Freshness, right to your door</span></nav></div></header>

    <main>
      <section className="container hero"><div className="hero-content"><span className="eyebrow"><span/> YOUR DAILY DOSE OF FRESH</span><h1>Fresh groceries.<br/><em>Happy days.</em><br/>Delivered.</h1><p>From farm-fresh favourites to everyday essentials.<br className="desktop-break"/> All the goodness you love, right at your doorstep.</p><div className="hero-buttons"><button className="button yellow" onClick={() => shop()}>Start shopping <ArrowUpRight size={19}/></button><a className="text-link" href="#categories">Explore categories <ArrowRight size={17}/></a></div><div className="hero-benefits"><div><span className="round-icon"><Truck size={19}/></span><p><strong>Fresh to your door</strong><small>Carefully packed, always</small></p></div><div><span className="round-icon"><Leaf size={19}/></span><p><strong>100% fresh & quality</strong><small>Good food. No compromises.</small></p></div></div></div><div className="hero-visual"><div className="hero-circle"/><img className="hero-person" src="/hero-groceries.png" alt="Friendly Freshora delivery person holding a box of fresh vegetables"/><div className="fresh-sticker"><Leaf size={21}/><span>FARM FRESH<br/><strong>every day</strong></span></div><div className="delivery-sticker"><span><PackageCheck size={23}/></span><div><strong>A box full of goodness</strong><small>Freshly picked. Happily delivered.</small></div><CheckCircle2 size={18}/></div><span className="hero-sparkle one">✳</span><span className="hero-sparkle two">✧</span></div></section>

      <section className="container categories-section" id="categories"><div className="section-heading"><div><span className="eyebrow">SOMETHING GOOD IN EVERY AISLE</span><h2>Shop by category<span className="heading-dot">.</span></h2></div><button className="text-link" onClick={() => shop()}>View all products <ArrowUpRight size={18}/></button></div><div className="category-grid">{categories.map(c => <button className="category-card" key={c.name} onClick={() => shop(c.name)}><div className="category-image" style={{ background: c.color }}><Img src={photo(c.image, 450)} alt={c.name} loading="lazy"/><span><ArrowUpRight size={18}/></span></div><h3>{c.name}</h3><p>{c.caption}</p></button>)}</div></section>

      <section className="container promo-grid" aria-label="Fresh grocery collections"><article className="promo promo-green"><div><span className="promo-label"><Sparkles size={12}/> GOOD FOOD, BETTER DAYS</span><h2>A fresh start<br/>to your every day.</h2><p>Fill your basket with nature’s best.</p><button className="text-link" onClick={() => shop('Vegetables')}>Shop fresh produce <ArrowRight size={17}/></button></div><Img src={photo('photo-1540420773420-3366772f4999', 650)} alt="A vibrant selection of fresh vegetables" loading="lazy"/></article><article className="promo promo-peach"><div><span className="promo-label"><Heart size={12}/> LITTLE PRICES. BIG GOODNESS.</span><h2>Your favourites.<br/>Even better prices.</h2><p>Good things come in full baskets.</p><button className="text-link" onClick={() => shop('All products', true)}>Discover the offers <ArrowRight size={17}/></button></div><Img src={photo('photo-1619566636858-adf3ef46400b', 650)} alt="Fresh seasonal fruit selection" loading="lazy"/></article></section>

      <section className="container products-section" id="products"><div className="section-heading"><div><span className="eyebrow">FRESH FINDS, EVERYDAY FAVOURITES</span><h2>{favoritesOnly ? 'Your saved favourites' : dealsOnly ? 'Good food. Great deals' : query ? 'Find your fresh favourites' : 'Your basket’s best friends'}<span className="heading-dot">.</span></h2></div><span className="product-count">{visible.length} fresh picks</span></div><div className="product-toolbar"><div className="tabs" aria-label="Filter products"><button className={category === 'All products' ? 'selected' : ''} onClick={() => setCategory('All products')}>All products</button>{availableCategories.map(c => <button key={c} className={category === c ? 'selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="sort"><SlidersHorizontal size={15}/><select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A–Z</option></select></label></div>{mode === 'demo' && <p className="demo-note"><span/> You’re browsing our sample catalog. Demo orders won’t be charged or delivered.</p>}{(query || favoritesOnly || dealsOnly) && <div className="filter-summary"><span>{query ? `Results for “${query}”` : favoritesOnly ? 'Showing saved products' : 'Showing special offers'}</span><button onClick={() => { setQuery(''); setFavoritesOnly(false); setDealsOnly(false); setCategory('All products'); }}>Clear filters <X size={13}/></button></div>}<div className="products-grid">{visible.map(product => <ProductCard key={product.id} product={product}/>)}</div>{!visible.length && <div className="empty-state"><Search size={35}/><h3>No groceries found</h3><p>Try another search or explore a different aisle.</p><button className="button green" onClick={() => shop()}>Browse all products <ArrowRight size={16}/></button></div>}</section>

      <section className="why-section" id="why-us"><div className="container"><div className="section-heading centered"><span className="eyebrow">A LITTLE MORE CARE IN EVERY CART</span><h2>Good for you. Great for your day<span className="heading-dot">.</span></h2><p>Because your everyday shop should feel anything but ordinary.</p></div><div className="benefit-grid">{[{ icon: Leaf, title: 'Freshness comes first', text: 'Thoughtfully selected produce and quality essentials, packed with care.' }, { icon: Truck, title: 'Your day, made easier', text: 'Skip the queues and the heavy bags. We bring your favourites to your door.' }, { icon: ShieldCheck, title: 'Goodness you can trust', text: 'Honest quality, thoughtful choices, and food you’ll feel good bringing home.' }, { icon: Heart, title: 'A little love, every day', text: 'From the first click to the last bite, we’re here to make your day a little better.' }].map(b => <div className="benefit" key={b.title}><span><b.icon size={26}/></span><h3>{b.title}</h3><p>{b.text}</p></div>)}</div></div></section>

      <section className="container testimonials"><div className="review-intro"><span className="eyebrow">FRESH FOOD. HAPPY PEOPLE.</span><h2>A little love<br/>from our community<span className="heading-dot">.</span></h2><p>Good food brings people together.<br/>Here’s a taste of the Freshora experience.</p><div className="review-controls"><button className="icon-button" aria-label="Previous review" onClick={() => setReview((review + 2) % 3)}><ChevronLeft size={20}/></button><button className="icon-button" aria-label="Next review" onClick={() => setReview((review + 1) % 3)}><ChevronRight size={20}/></button><span>{String(review + 1).padStart(2, '0')} <i>/ 03</i></span></div></div><article className="review-card" aria-live="polite"><div className="stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={17} fill="currentColor"/>)}</div><blockquote>“{reviews[review].quote}”</blockquote><div className="review-author"><Img src={photo(reviews[review].image, 100)} alt={reviews[review].name} loading="lazy"/><div><strong>{reviews[review].name}</strong><small>{reviews[review].role}</small></div><span className="quote-mark">”</span></div><small className="sample-review">Illustrative customer story</small></article></section>

      <section className="container bottom-banner"><div><span className="eyebrow">GOOD FOOD IS JUST A CLICK AWAY</span><h2>Less running around.<br/>More living well.</h2><p>Make room for the things you love. We’ll handle the groceries.</p></div><button className="button yellow" onClick={() => shop()}>Fill your basket <ShoppingBasket size={19}/></button><Leaf className="banner-leaf" size={160}/></section>
    </main>
    <footer className="container footer"><div className="footer-top"><div><Brand/><p>A little freshness. A lot of goodness.<br/>Your everyday grocery companion.</p></div><div><h3>Explore the aisles</h3><button onClick={() => shop('Vegetables')}>Fresh vegetables</button><button onClick={() => shop('Fruits')}>Seasonal fruits</button><button onClick={() => shop('Dairy & Eggs')}>Dairy & eggs</button></div><div><h3>Here to help</h3><button onClick={() => open('help')}>Delivery & returns</button><button onClick={showOrders}>Your orders</button><button onClick={() => open(user ? 'account' : 'auth')}>Your account</button></div><div className="footer-promise"><span><Leaf size={18}/> Fresh by nature.</span><p>Carefully selected.<br/>Thoughtfully delivered.<br/>Always Freshora.</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Freshora. A fresh take on everyday.</span><div><span><ShieldCheck size={14}/> Secure shopping</span><span><ShoppingBasket size={14}/> Pay on delivery</span></div></div></footer>
    {toast && <div className="toast" role="status"><CheckCircle2 size={19}/><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15}/></button></div>}

    {modal === 'product' && selected && <Dialog title="A closer look" onClose={() => setModal(null)} wide><div className="product-detail"><Img src={selected.image} alt={selected.name}/><div><span className="eyebrow">{selected.category}</span><h2>{selected.name}</h2><p>{selected.description}</p><p className="unit">{selected.unit}</p><div className="detail-price">{money(selected.price)} {selected.originalPrice > selected.price && <del>{money(selected.originalPrice)}</del>}</div><p className="stock-status">{selected.inStock ? <><Check size={16}/> In stock · Packed with care</> : 'Currently out of stock'}</p>{cart[selected.id] ? <Quantity product={selected} quantity={cart[selected.id]}/> : <button className="button green" disabled={!selected.inStock} onClick={() => { updateCart(selected.id, 1); setToast('Added to your cart'); }}><ShoppingCart size={18}/> Add to cart</button>}<button className="text-link detail-save" onClick={() => toggleFavorite(selected.id)}><Heart size={16} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'}/>{favorites.includes(selected.id) ? 'Saved to favourites' : 'Save for later'}</button></div></div></Dialog>}
    {modal === 'cart' && <Dialog title={`Your basket (${count})`} onClose={() => setModal(null)} wide>{items.length ? <><div className="cart-items">{items.map(({ product, quantity }) => <div className="cart-item" key={product.id}><Img src={product.image} alt={product.name}/><div className="cart-item-info"><strong>{product.name}</strong><small>{product.unit} · {money(product.price)} each</small><Quantity product={product} quantity={quantity}/></div><div className="cart-item-end"><strong>{money(product.price * quantity)}</strong><button className="icon-button" aria-label={`Remove ${product.name} from cart`} onClick={() => updateCart(product.id, -quantity)}><Trash2 size={17}/></button></div></div>)}</div><div className="order-summary"><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p><p><span>Tax (18%)</span><span>{money(tax)}</span></p><p><span>Delivery</span><span className="green-text">Included</span></p><p className="total"><strong>Total</strong><strong>{money(total)}</strong></p></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button green full" onClick={checkout} disabled={mode === 'loading'}>{mode === 'demo' ? 'Continue to demo checkout' : 'Continue to checkout'} <ArrowRight size={18}/></button><button className="text-link centered-link" onClick={() => { setModal(null); shop(); }}>Keep shopping</button></> : <div className="empty-state"><ShoppingBasket size={46}/><h3>A little empty. Full of possibilities.</h3><p>Let’s find something fresh for your basket.</p><button className="button green" onClick={() => { setModal(null); shop(); }}>Explore groceries <ArrowRight size={17}/></button></div>}</Dialog>}
    {modal === 'auth' && <Dialog title={authMode === 'login' ? 'Welcome back' : 'A fresh start'} onClose={() => { if (!busy) setModal(null); }}><p className="dialog-description">{authMode === 'login' ? 'Sign in for a smoother grocery run.' : 'Create your Freshora account.'}</p>{mode === 'demo' && <p className="notice">The store server is currently offline. Account access will be available when it reconnects. You can still explore the demo.</p>}<form className="form" onSubmit={authenticate}>{authMode === 'register' && <label>Your name<input name="name" autoComplete="name" required placeholder="Alex Green"/></label>}<label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label><label>Password<input name="password" type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength={authMode === 'register' ? 8 : 1} required placeholder={authMode === 'register' ? 'At least 8 characters' : 'Your password'}/></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button green full" disabled={busy}>{busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={17}/></button></form><p className="auth-switch">{authMode === 'login' ? 'New around here?' : 'Already have an account?'} <button disabled={busy} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Create an account' : 'Sign in'}</button></p></Dialog>}
    {modal === 'account' && <Dialog title={`Hello, ${user?.name}`} onClose={() => setModal(null)}><p className="dialog-description">{user?.email}</p><div className="account-actions"><button className="button green" onClick={showOrders}>View my orders <PackageCheck size={18}/></button><button className="button outline" disabled={busy} onClick={async () => { setBusy(true); try { await api('/user/logout'); setUser(null); setCart({}); setModal(null); setToast('You’re signed out. See you soon!'); } catch (err) { setError(err.message); } finally { setBusy(false); } }}>Sign out</button></div>{error && <p className="form-error" role="alert">{error}</p>}</Dialog>}
    {modal === 'checkout' && <Dialog title={mode === 'demo' ? 'Demo checkout' : 'Your fresh delivery'} onClose={() => { if (!busy) setModal(null); }} wide>{mode === 'demo' && <p className="notice">This is a demo. Use sample details; no payment is collected and no delivery will be arranged.</p>}<form className="form" onSubmit={placeOrder}><h3><MapPin size={18}/> Where should we deliver?</h3><div className="form-row"><label>First name<input name="firstName" autoComplete="given-name" required/></label><label>Last name<input name="lastName" autoComplete="family-name" required/></label></div><div className="form-row"><label>Email<input name="email" type="email" autoComplete="email" defaultValue={user?.email || ''} required/></label><label>Phone number<input name="phoneNumber" type="tel" autoComplete="tel" minLength={7} required/></label></div><label>Street address<input name="street" autoComplete="street-address" placeholder="House number and street" required/></label><div className="form-row"><label>City<input name="city" autoComplete="address-level2" required/></label><label>State / Province<input name="state" autoComplete="address-level1" required/></label></div><div className="form-row"><label>Postal code<input name="postalCode" autoComplete="postal-code" required/></label><label>Country<input name="country" autoComplete="country-name" required/></label></div><div className="payment-method"><span><CheckCircle2 size={21}/><strong>Cash on delivery</strong></span><small>Pay when your groceries arrive.</small></div><div className="order-summary"><p><span>{count} items</span><strong>{money(subtotal)}</strong></p><p><span>Tax (18%)</span><span>{money(tax)}</span></p><p><span>Delivery</span><span className="green-text">Included</span></p><p className="total"><strong>Total to pay</strong><strong>{money(total)}</strong></p></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button green full" disabled={busy || !items.length}>{busy ? 'Placing your order…' : mode === 'demo' ? 'Place demo order' : 'Place order'}<ArrowRight size={18}/></button></form></Dialog>}
    {modal === 'success' && <Dialog title={completedOrder?.demo ? 'Demo complete!' : 'You’re all set!'} onClose={() => setModal(null)}><div className="success-content"><span><PackageCheck size={42}/></span><h2>{completedOrder?.demo ? 'That’s a basket full of goodness.' : 'Your fresh order is confirmed.'}</h2><p>{completedOrder?.demo ? 'Your sample order is saved on this device. No payment or delivery will take place.' : 'Thanks for shopping with Freshora. You can follow your order in My orders.'}</p><div className="confirmation"><span>Order #{completedOrder?._id?.slice(-10).toUpperCase()}</span><strong>{money(completedOrder?.amount || total)}</strong></div><button className="button green full" onClick={showOrders}>View my orders <ArrowRight size={18}/></button></div></Dialog>}
    {modal === 'orders' && <Dialog title="Your orders" onClose={() => setModal(null)} wide>{busy ? <p className="empty-state">Loading your orders…</p> : error ? <div className="empty-state"><p className="form-error" role="alert">{error}</p>{!user && <button className="button green" onClick={() => open('auth')}>Sign in</button>}</div> : orders.length ? <div className="orders-list">{[...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(order => <article className="order-card" key={order._id}><div><strong>#{order._id.slice(-10).toUpperCase()}</strong><span className="status-pill">{order.status}</span></div><small>{order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Just now'}</small>{order.items?.map((item,i) => <p key={i}>{item.quantity} × {item.product?.name || 'Grocery item'}</p>)}<strong>{money(order.amount)}</strong>{order.demo && <p className="unit">Demo only · no payment or delivery</p>}</article>)}</div> : <div className="empty-state"><PackageCheck size={42}/><h3>Your next good meal starts here.</h3><p>No orders yet. Fill your basket with something fresh.</p><button className="button green" onClick={() => { setModal(null); shop(); }}>Start shopping</button></div>}</Dialog>}
    {modal === 'help' && <Dialog title="A little help with your order" onClose={() => setModal(null)}><div className="help-content"><h3><Truck size={20}/> Delivery</h3><p>Enter your full delivery address at checkout. Delivery is included in the displayed total. Your order status is available in My orders.</p><h3><ShoppingBasket size={20}/> Payment</h3><p>This storefront supports cash on delivery. Your basket shows the item total and 18% tax before you place your order.</p><h3><PackageCheck size={20}/> Order support & returns</h3><p>Keep your order reference for any order enquiries. A customer support contact and returns policy have not yet been configured by this store.</p>{mode === 'demo' && <p className="notice">You are currently using the sample storefront. Demo orders are stored only on this device.</p>}</div></Dialog>}
  </>;
}
