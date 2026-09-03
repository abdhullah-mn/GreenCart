import Brand from './Brand.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand"><Brand />GreenCart</div>
          <p>Thoughtfully curated essentials for a peaceful, greener lifestyle.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul><li>Organic kitchen</li><li>Eco living</li><li>Wellness picks</li></ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul><li>Shipping policy</li><li>Returns</li><li>Help center</li></ul>
        </div>
      </div>
    </footer>
  );
}
