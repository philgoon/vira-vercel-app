// [R3] Star rating component for 1-10 scale with half stars
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
}

const SIZE_PX = { sm: '14px', md: '16px', lg: '20px' }
const FONT_SIZE = { sm: 'var(--stm-text-xs)', md: 'var(--stm-text-sm)', lg: 'var(--stm-text-base)' }

export function StarRating({
  rating,
  maxRating = 10,
  size = 'md',
  showNumber = true,
  reviewCount
}: StarRatingProps) {
  const px = SIZE_PX[size]
  const fs = FONT_SIZE[size]

  if (!rating || rating === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
        <Star style={{ width: px, height: px, color: 'var(--stm-border)' }} />
        <span style={{ fontSize: fs, color: 'var(--stm-muted-foreground)' }}>No ratings</span>
      </div>
    )
  }

  // Convert 1-10 scale to 5-star scale for display
  const starsToShow = 5
  const scaledRating = (rating / maxRating) * starsToShow

  const stars = []

  for (let i = 1; i <= starsToShow; i++) {
    const filled = scaledRating >= i
    const halfFilled = scaledRating >= i - 0.5 && scaledRating < i

    if (filled) {
      stars.push(
        <Star key={i} style={{ width: px, height: px, color: 'var(--stm-warning)', fill: 'var(--stm-warning)' }} />
      )
    } else if (halfFilled) {
      stars.push(
        <div key={i} style={{ position: 'relative' }}>
          <Star style={{ width: px, height: px, color: 'var(--stm-border)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
            <Star style={{ width: px, height: px, color: 'var(--stm-warning)', fill: 'var(--stm-warning)' }} />
          </div>
        </div>
      )
    } else {
      stars.push(
        <Star key={i} style={{ width: px, height: px, color: 'var(--stm-border)' }} />
      )
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--stm-space-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {stars}
      </div>
      {showNumber && (
        <span style={{ fontSize: fs, fontWeight: 'var(--stm-font-medium)', color: 'var(--stm-foreground)' }}>
          {rating}/10
        </span>
      )}
      {reviewCount !== undefined && (
        <span style={{ fontSize: 'var(--stm-text-xs)', color: 'var(--stm-muted-foreground)' }}>
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
