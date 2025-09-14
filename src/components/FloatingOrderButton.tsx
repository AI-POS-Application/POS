'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Floating order button component for quick access to order taking
 * Similar to Swiggy's floating action button
 */
export default function FloatingOrderButton() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Navigate to order taking page
   */
  const handleOrderClick = () => {
    router.push('/order-taking');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Main floating button */}
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          onClick={handleOrderClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap animate-in fade-in-0 zoom-in-95">
            Take Order
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Plus icon overlay for visual appeal */}
        <div className="absolute -top-1 -right-1">
          <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
            <Plus className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
