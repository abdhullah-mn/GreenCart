import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }, testInfo) => {
  if (!testInfo.title.includes('screenshot')) {
    await page.route(/^https:\/\/(images\.unsplash\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//, route => route.abort());
  }
});

async function offlineStore(page) {
  await page.route('**/api/**', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false }) }));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('You’re browsing our sample catalog.')).toBeVisible();
}

test('browse, filter, save, change quantity, persist cart, and place demo order', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await offlineStore(page);
  await page.getByRole('button', { name: 'Vegetables Straight from the farm' }).click();
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Save Farm Fresh Broccoli', exact: true }).click();
  await page.getByRole('button', { name: 'Saved products', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByRole('textbox', { name: 'Search groceries' }).fill('avocado');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'View Fresh Hass Avocados' }).click();
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Add one Fresh Hass Avocados' }).click();
  await expect(page.getByRole('heading', { name: 'Your basket (2)' })).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open cart, 2 items' }).click();
  await page.getByRole('button', { name: 'Continue to demo checkout' }).click();
  for (const [name, value] of Object.entries({ 'First name': 'Test', 'Last name': 'Shopper', 'Email': 'shopper@example.com', 'Phone number': '1234567890', 'Street address': '123 Sample Street', 'City': 'Sample City', 'State / Province': 'Sample State', 'Postal code': '12345', 'Country': 'Sample Country' })) await page.getByLabel(name, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Place demo order' }).click();
  await expect(page.getByRole('heading', { name: 'Demo complete!' })).toBeVisible();
  await expect(page.getByText('No payment or delivery will take place.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'View my orders' }).click();
  await expect(page.locator('.order-card')).toHaveCount(1);
  await expect(page.locator('.order-card')).toContainText('2 × Fresh Hass Avocados');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open cart, 0 items' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile layout, navigation, empty search and accessible dialog dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await offlineStore(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('button', { name: 'Shop all', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search groceries' }).fill('nonexistent-product');
  await expect(page.getByText('No groceries found')).toBeVisible();
  await page.getByRole('button', { name: 'Browse all products' }).click();
  await expect(page.locator('.product-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Open cart, 0 items' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('live API contract: login, address, COD order and server errors', async ({ page }) => {
  const requests = []; let signedIn = false; let orderAttempts = 0;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const body = route.request().method() === 'POST' ? route.request().postDataJSON() : null;
    requests.push({ path, body });
    let data = { success: true };
    if (path === '/api/product/list') data.products = [{ _id: 'live-broccoli', name: 'Live Broccoli', category: 'Vegetables', price: 3, offerPrice: 2.4, image: [], inStock: true }];
    if (path === '/api/user/is-Auth') data = { success: false, message: 'Not signed in' };
    if (path === '/api/user/login') { signedIn = true; data.user = { name: 'Test Shopper', email: 'test@example.com' }; }
    if (path === '/api/cart/') data.cartItems = [];
    if (path === '/api/address/add') data.address = { _id: 'address-123', ...body.address };
    if (path === '/api/order/cod') {
      orderAttempts += 1;
      if (orderAttempts === 1) data = { success: false, message: 'Delivery service temporarily unavailable. Please retry.' };
      else data.order = { _id: 'order-1234567890', amount: 2.83, status: 'Order Placed' };
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Add Live Broccoli to cart' }).click();
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  await page.getByRole('button', { name: 'Continue to checkout' }).click();
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Password', { exact: true }).fill('sample-password');
  await page.getByRole('dialog').getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(signedIn).toBe(true);
  await page.getByRole('button', { name: 'Open cart, 1 items' }).click();
  await page.getByRole('button', { name: 'Continue to checkout' }).click();
  for (const [name, value] of Object.entries({ 'First name': 'Test', 'Last name': 'Shopper', 'Phone number': '1234567890', 'Street address': '12 Garden Lane', 'City': 'Colombo', 'State / Province': 'Western', 'Postal code': '00100', 'Country': 'Sri Lanka' })) await page.getByLabel(name, { exact: true }).fill(value);
  await page.getByRole('button', { name: 'Place order', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Delivery service temporarily unavailable');
  await expect(page.getByLabel('Street address')).toHaveValue('12 Garden Lane');
  await expect(page.getByRole('button', { name: 'Open cart, 1 items' })).toBeAttached();
  await page.getByRole('button', { name: 'Place order', exact: true }).click();
  await expect(page.getByText('Your fresh order is confirmed.')).toBeVisible();
  expect(requests.find(r => r.path === '/api/address/add').body.address.street).toBe('12 Garden Lane');
  expect(requests.find(r => r.path === '/api/order/cod').body).toEqual({ address: 'address-123', items: [{ product: 'live-broccoli', quantity: 1 }] });
});

test('account errors remain visible and do not fake authentication', async ({ page }) => {
  await offlineStore(page);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Password', { exact: true }).fill('password');
  await page.getByRole('dialog').getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('desktop screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await offlineStore(page);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile-with-images.png', fullPage: true });
});
