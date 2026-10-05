export const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
export const photo = (id, width = 600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export const categories = [
  { name: 'Vegetables', caption: 'Straight from the farm', image: 'photo-1540420773420-3366772f4999', color: '#eef3e8' },
  { name: 'Fruits', caption: 'A little natural sweetness', image: 'photo-1619566636858-adf3ef46400b', color: '#fff3e1' },
  { name: 'Dairy & Eggs', caption: 'Your daily essentials', image: 'photo-1563636619-e9143da7973b', color: '#eef3f8' },
  { name: 'Bakery', caption: 'Baked with love', image: 'photo-1509440159596-0249088772ff', color: '#f8eee5' },
  { name: 'Meat & Fish', caption: 'Quality in every cut', image: 'photo-1510130387422-82bed34b37e9', color: '#f9ece9' },
  { name: 'Pantry', caption: 'Stock up on the good stuff', image: 'photo-1474979266404-7eaacbcd87c5', color: '#f6f2df' },
];
export const sampleProducts = [
  ['avocado', 'Fresh Hass Avocados', 'Fruits', 4.50, 5.50, '2 pieces', 'photo-1523049673857-eb18f1d7b578', 'POPULAR'],
  ['broccoli', 'Farm Fresh Broccoli', 'Vegetables', 2.40, 3.00, '500 g', 'photo-1459411621453-7b03977f4bfc', 'ORGANIC'],
  ['strawberry', 'Sweet Strawberries', 'Fruits', 3.99, 5.00, '250 g', 'photo-1464965911861-746a04b4bca6', '20% OFF'],
  ['bread', 'Artisan Sourdough', 'Bakery', 4.25, 4.75, '1 loaf · 400 g', 'photo-1509440159596-0249088772ff', 'FRESHLY BAKED'],
  ['carrot', 'Organic Carrots', 'Vegetables', 1.99, 2.50, '500 g', 'photo-1445282768818-728615cc910a', 'ORGANIC'],
  ['milk', 'Whole Farm Milk', 'Dairy & Eggs', 3.20, 3.60, '1 litre', 'photo-1563636619-e9143da7973b', ''],
  ['fish', 'Fresh Whole Fish', 'Meat & Fish', 9.50, 11.00, '500 g', 'photo-1510130387422-82bed34b37e9', ''],
  ['oil', 'Extra Virgin Olive Oil', 'Pantry', 8.99, 10.50, '500 ml', 'photo-1474979266404-7eaacbcd87c5', ''],
].map(([id, name, category, price, originalPrice, unit, image, badge]) => ({ id, name, category, price, originalPrice, unit, image: photo(image), badge, inStock: true, description: 'Carefully selected for exceptional quality and taste. A fresh addition to your kitchen, perfect for your everyday meals.' }));

export function normalizeProduct(product) {
  return { id: product._id, name: product.name, category: product.category, price: Number(product.offerPrice ?? product.price), originalPrice: Number(product.price), unit: product.unit || 'per pack', image: product.image?.[0] || '', inStock: product.inStock !== false, badge: '', description: Array.isArray(product.description) ? product.description.join(' ') : product.description || 'Freshly selected for your everyday essentials.' };
}
export function totals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 18) / 100;
  return { subtotal, tax, total: subtotal + tax };
}
export function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Shopping remains usable when storage is disabled. */ }
}
export async function api(path, body) {
  let response;
  try {
    response = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api${path}`, { method: body ? 'POST' : 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000) });
  } catch { throw new Error('We couldn’t connect to the store. Please try again shortly.'); }
  let data;
  try { data = await response.json(); } catch { throw new Error('The store is temporarily unavailable. Please try again shortly.'); }
  if (!response.ok || !data.success) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}
