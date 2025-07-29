// [R3] Star rating component for 1-10 scale with half stars
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
}

export function StarRating({ 
  rating, 
  maxRating = 10, 
  size = 'md', 
  showNumber = true, 
  reviewCount 
}: StarRatingProps) {
  if (!rating || rating === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Star style={{ 
          width: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
          height: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
          color: '#d1d5db' 
        }} />
        <span style={{ 
          fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem', 
          color: '#9ca3af' 
        }}>
          No ratings
        </span>
      </div>
    );
  }

  // Convert 1-10 scale to 5-star scale for display
  const starsToShow = 5;
  const scaledRating = (rating / maxRating) * starsToShow;
  
  const stars = [];
  
  for (let i = 1; i <= starsToShow; i++) {
    const filled = scaledRating >= i;
    const halfFilled = scaledRating >= i - 0.5 && scaledRating < i;
    
    if (filled) {
      stars.push(
        <Star 
          key={i}
          style={{ 
            width: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
            height: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
            color: '#fbbf24', 
            fill: '#fbbf24' 
          }} 
        />
      );
    } else if (halfFilled) {
      stars.push(
        <div key={i} style={{ position: 'relative' }}>
          <Star 
            style={{ 
              width: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
              height: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
              color: '#d1d5db' 
            }} 
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            overflow: 'hidden'
          }}>
            <Star 
              style={{ 
                width: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
                height: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
                color: '#fbbf24', 
                fill: '#fbbf24' 
              }} 
            />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star 
          key={i}
          style={{ 
            width: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
            height: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.25rem' : '1rem', 
            color: '#d1d5db' 
          }} 
        />
      );
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
        {stars}
      </div>
      {showNumber && (
        <span style={{ 
          fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem', 
          fontWeight: '500', 
          color: '#374151' 
        }}>
          {rating}/10
        </span>
      )}
      {reviewCount !== undefined && (
        <span style={{ 
          fontSize: size === 'sm' ? '0.75rem' : '0.75rem', 
          color: '#6b7280' 
        }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}