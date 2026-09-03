import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';

const currency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(Number(value || 0));

export default function ProductCard({ product }) {
  const { addToCart } = useContext(AppContext);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const currentPrice = Number(product.offerPrice || product.price || 0);
  const originalPrice = Number(product.price || 0);
  const discount = originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const rating = Number(product.rating || 4.8).toFixed(1);
  const reviewCount = product.reviewCount || product.reviews?.length || 24;

  const handleAddToCart = async () => {
    await addToCart(product, 1);
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
          <img src={product.image?.[0]} alt={product.name} />
        </Link>
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <button
          className={`wishlist-button ${isWishlisted ? 'active' : ''}`}
          type="button"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          onClick={() => setIsWishlisted((value) => !value)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 8.7c0 5.2-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />
          </svg>
        </button>
      </div>

      <div className="product-content">
        <div className="product-topline">
          <span>{product.category}</span>
          <strong>{product.inStock ? 'In stock' : 'Sold out'}</strong>
        </div>
        <Link to={`/product/${product._id}`} className="product-name-link">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-rating" aria-label={`${rating} out of 5 stars from ${reviewCount} reviews`}>
          <span className="rating-stars">★</span>
          <strong>{rating}</strong>
          <span>({reviewCount})</span>
        </div>
        <div className="price-row">
          <strong>{currency(currentPrice)}</strong>
          {discount > 0 && <span>{currency(originalPrice)}</span>}
        </div>
        <button className={`primary-button cart-button-small ${isAdded ? 'is-added' : ''}`} onClick={handleAddToCart} disabled={!product.inStock}>
          {isAdded ? 'Added to cart' : product.inStock ? 'Add to cart' : 'Sold out'}
        </button>
      </div>
    </article>
  );
}
