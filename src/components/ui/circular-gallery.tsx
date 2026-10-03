import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

// Define the type for a single gallery item
export interface GalleryItem {
  id: number | string;
  img: string;
  caption?: string;
  embedUrl?: string;
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 220, autoRotateSpeed = 0.3, onItemClick, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    // Story states
    const [activeStory, setActiveStory] = useState<string | number | null>(null);
    const [storyProgress, setStoryProgress] = useState(0);
    
    const dragStartX = useRef(0);
    const dragStartRotation = useRef(0);
    const hasDragged = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    // Mouse / Touch handlers for manual rotation
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // If a story is active, touching anywhere will cancel it and let you drag
      if (activeStory !== null) {
        setActiveStory(null);
        setStoryProgress(0);
      }
      setIsDragging(true);
      hasDragged.current = false;
      dragStartX.current = e.clientX;
      dragStartRotation.current = rotation;
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 5) {
        hasDragged.current = true; // threshold to differentiate click and drag
      }
      setRotation(dragStartRotation.current + deltaX * 0.4);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const isPaused = isDragging || activeStory !== null;

    // Continuous auto-rotation
    useEffect(() => {
      const autoRotate = () => {
        if (!isPaused) {
          setRotation(prev => prev - autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isPaused, autoRotateSpeed]);

    // Story progress timer (60 seconds)
    useEffect(() => {
      if (activeStory !== null) {
        const duration = 60000; // 60 seconds
        const interval = 100;
        const step = (interval / duration) * 100;
        
        const timer = setInterval(() => {
          setStoryProgress(prev => {
            if (prev + step >= 100) {
              clearInterval(timer);
              setActiveStory(null);
              return 0;
            }
            return prev + step;
          });
        }, interval);
        
        return () => clearInterval(timer);
      } else {
        setStoryProgress(0);
      }
    }, [activeStory]);

    const anglePerItem = 360 / items.length;
    
    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing touch-none", className)}
        style={{ perspective: '1200px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        {...props}
      >
        <div
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: activeStory !== null ? 'transform 0.5s ease-out' : 'none'
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const isActive = activeStory === item.id;
            
            return (
              <div
                key={item.id} 
                role="group"
                aria-label={item.caption}
                className="absolute w-[200px] h-[300px] sm:w-[260px] sm:h-[350px] pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  if (hasDragged.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  
                  // Snap to front and activate story
                  let targetRot = -itemAngle;
                  // Normalize current rotation to match closest target rotation
                  const currentRot = rotation;
                  const diff = ((targetRot - currentRot) % 360 + 360) % 360;
                  if (diff > 180) targetRot = currentRot + diff - 360;
                  else targetRot = currentRot + diff;

                  setRotation(targetRot);
                  setActiveStory(item.id);
                  setStoryProgress(0);
                  
                  onItemClick?.(item);
                }}
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  zIndex: isActive ? 50 : 1, // Bring to front when active
                }}
              >
                <div className={cn(
                  "relative w-full h-full rounded-2xl shadow-xl overflow-hidden group border bg-black transition-all duration-500",
                  isActive ? "border-white/50 scale-105" : "border-gray-200/20"
                )}>
                  
                  {/* Story Progress Bar */}
                  {isActive && (
                    <div className="absolute top-2 left-2 right-2 flex gap-1 z-50">
                      <div className="h-1 bg-white/30 rounded-full w-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-100 ease-linear" 
                          style={{ width: `${storyProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* If active and has video, show iframe. Else show image */}
                  {isActive && item.embedUrl ? (
                    <div className="absolute inset-0 z-10 bg-black flex items-center justify-center">
                      <iframe 
                        src={`${item.embedUrl}?autoplay=1&hidecaption=1`} 
                        className="w-[150%] h-[150%] scale-[0.8] origin-center border-none" 
                        scrolling="no" 
                        allow="autoplay; encrypted-media"
                      />
                    </div>
                  ) : (
                    <>
                      <img
                        src={item.img}
                        alt={item.caption || "Instagram Media"}
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Layer for hover effect */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none"></div>
                    </>
                  )}
                  
                  {item.embedUrl && !isActive && (
                    <div className="absolute top-3 right-3 text-white drop-shadow-md z-20 pointer-events-none">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.888 22.5a3.46 3.46 0 0 1-1.724-.46 3.49 3.49 0 0 1-1.732-2.998V4.958c0-1.25.666-2.392 1.732-2.998a3.486 3.486 0 0 1 3.456-.006l12.186 6.945c1.1.626 1.77 1.774 1.77 3.036 0 1.261-.67 2.41-1.77 3.036L7.62 21.916a3.457 3.457 0 0 1-1.732.584Z"/></svg>
                    </div>
                  )}

                  {item.caption && !isActive && (
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white z-20 pointer-events-none">
                      <p className="text-sm font-semibold line-clamp-2">{item.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
