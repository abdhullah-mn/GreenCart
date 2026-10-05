import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, totals } from '../src/shop.js';

test('checkout includes the same 18% tax as the order API', () => {
  assert.deepEqual(totals([{ product: { price: 4.5 }, quantity: 2 }, { product: { price: 2.4 }, quantity: 1 }]), { subtotal: 11.4, tax: 2.05, total: 13.45 });
  assert.deepEqual(totals([]), { subtotal: 0, tax: 0, total: 0 });
});
test('API product mapping preserves unavailable stock and a zero offer price', () => {
  const result = normalizeProduct({ _id: 'abc', name: 'Carrots', price: 10, offerPrice: 0, inStock: false, image: ['carrots.jpg'], description: ['Fresh', 'Organic'] });
  assert.equal(result.id, 'abc'); assert.equal(result.price, 0); assert.equal(result.inStock, false); assert.equal(result.description, 'Fresh Organic');
});
