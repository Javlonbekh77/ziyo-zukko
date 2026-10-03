import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GalleryItem {
  id: number | string;
  img: string;
  caption?: string;
  embedUrl?: string;
}

interface FeatureCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
}

export const FeatureCarousel = React.forwardRef<HTMLDivElement, FeatureCarouselProps>(
  ({ items, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeStory, setActiveStory] = useState<string | number | null>(null);
    const [storyProgress, setStoryProgress] = useState(0);

    const dragStartX = useRef(0);
    const isDragging = useRef(false);
    const hasDragged = useRef(false);

    const handleNext = useCallback(() => {
      if (activeStory !== null) { setActiveStory(null); setStoryProgress(0); }
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, [items.length, activeStory]);

    const handlePrev = useCallback(() => {
      if (activeStory !== null) { setActiveStory(null); setStoryProgress(0); }
      setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    }, [items.length, activeStory]);
    
    // Auto rotation every 4s, paused when story is active
    useEffect(() => {
      if (activeStory === null) {
        const timer = setInterval(() => {
            handleNext();
        }, 4000);
        return () => clearInterval(timer);
      }
    }, [handleNext, activeStory]);

    // Story logic (60 seconds)
    useEffect(() => {
      if (activeStory !== null) {
        const duration = 60000;
        const interval = 100;
        const step = (interval / duration) * 100;
        
        const timer = setInterval(() => {
          setStoryProgress(prev => {
            if (prev + step >= 100) {
              clearInterval(timer);
              setActiveStory(null);
              // Auto advance to next item when story finishes
              handleNext();
              return 0;
            }
            return prev + step;
          });
        }, interval);
        return () => clearInterval(timer);
      } else {
        setStoryProgress(0);
      }
    }, [activeStory, handleNext]);

    // Swipe handlers
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = true;
      hasDragged.current = false;
      dragStartX.current = e.clientX;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 10) {
        hasDragged.current = true;
      }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const deltaX = e.clientX - dragStartX.current;
      if (deltaX > 50) {
        handlePrev();
      } else if (deltaX < -50) {
        handleNext();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full h-full flex flex-col items-center justify-center overflow-x-hidden p-2',
          className
        )}
        {...props}
      >
        <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
          {/* Carousel Wrapper */}
          <div 
            className="relative w-full h-full flex items-center justify-center [perspective:1000px] touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {items.map((item, index) => {
              const offset = index - currentIndex;
              const total = items.length;
              let pos = (offset + total) % total;
              if (pos > Math.floor(total / 2)) {
                pos = pos - total;
              }

              const isCenter = pos === 0;
              const isAdjacent = Math.abs(pos) === 1;
              const isActiveStory = isCenter && activeStory === item.id;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'absolute w-52 h-[320px] sm:w-64 sm:h-[400px] md:w-72 md:h-[450px] transition-all duration-500 ease-in-out',
                    'flex items-center justify-center cursor-pointer'
                  )}
                  style={{
                    transform: `
                      translateX(${(pos) * 45}%) 
                      scale(${isCenter ? 1 : isAdjacent ? 0.85 : 0.7})
                      rotateY(${(pos) * -10}deg)
                    `,
                    zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
                    opacity: isCenter ? 1 : isAdjacent ? 0.4 : 0,
                    filter: isCenter ? 'blur(0px)' : 'blur(4px)',
                    visibility: Math.abs(pos) > 1 ? 'hidden' : 'visible',
                  }}
                  onClick={(e) => {
                    if (hasDragged.current) return;
                    if (!isCenter) {
                      if (pos > 0) handleNext();
                      else handlePrev();
                    } else {
                      if (isActiveStory) {
                        setActiveStory(null);
                      } else {
                        setActiveStory(item.id);
                        setStoryProgress(0);
                      }
                    }
                  }}
                >
                  <div className="relative w-full h-full rounded-3xl border-2 border-foreground/10 shadow-2xl overflow-hidden bg-black group">
                    {/* Story Progress Bar */}
                    {isActiveStory && (
                      <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
                        <div className="h-1 bg-white/30 rounded-full w-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-100 ease-linear" 
                            style={{ width: `${storyProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Always render the cropped iframe to act as the thumbnail/video player */}
                    <div 
                      className={cn(
                        "absolute inset-0 overflow-hidden transition-all duration-500",
                        isActiveStory ? "z-10 pointer-events-auto" : "z-0 pointer-events-none opacity-80 group-hover:opacity-100 group-hover:scale-105"
                      )}
                      onClick={(e) => isActiveStory && e.stopPropagation()}
                    >
                      <iframe 
                        src={`${item.embedUrl}?hidecaption=1`} 
                        className="absolute w-full h-full border-none bg-black" 
                        scrolling="no" 
                        allow="encrypted-media; autoplay"
                        tabIndex={-1}
                      />
                    </div>
                    
                    {/* Invisible overlay when not active to capture clicks for carousel rotation */}
                    {!isActiveStory && (
                      <div className="absolute inset-0 z-20 bg-transparent cursor-pointer"></div>
                    )}

                    {/* Removed custom play button since iframe has its own */}

                    {item.caption && !isActiveStory && (
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 pointer-events-none">
                        <p className="text-sm font-semibold line-clamp-2">{item.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-50 bg-white/80 backdrop-blur-md shadow-lg border-gray-200 hover:bg-white hover:scale-110 transition-all text-black"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 z-50 bg-white/80 backdrop-blur-md shadow-lg border-gray-200 hover:bg-white hover:scale-110 transition-all text-black"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }
);

FeatureCarousel.displayName = 'FeatureCarousel';
