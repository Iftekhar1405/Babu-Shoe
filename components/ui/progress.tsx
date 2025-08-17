'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const animationStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes pulse-scale {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 0.6s ease-out;
  }
  
  .animate-pulse-scale {
    animation: pulse-scale 0.6s ease-out;
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animationStyles;
  if (!document.head.querySelector('style[data-progress-animations]')) {
    styleElement.setAttribute('data-progress-animations', 'true');
    document.head.appendChild(styleElement);
  }
}

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    indicatorClassName,
    showPercentage = false,
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {

    const normalizedValue = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const prevValueRef = React.useRef(normalizedValue);
    const [isIncreasing, setIsIncreasing] = React.useState<boolean | null>(null);
    const [showPulse, setShowPulse] = React.useState(false);
    
    React.useEffect(() => {
      const prevValue = prevValueRef.current;
      
      if (normalizedValue !== prevValue) {
        setIsIncreasing(normalizedValue > prevValue);
        setShowPulse(true);
        
        const timer = setTimeout(() => {
          setShowPulse(false);
          setIsIncreasing(null);
        }, 600);
        
        prevValueRef.current = normalizedValue;
        
        return () => clearTimeout(timer);
      }
    }, [normalizedValue]);
    
    const sizeConfig = {
      sm: 'h-2',
      md: 'h-4', 
      lg: 'h-6'
    };
    
    const variantConfig = {
      default: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          sizeConfig[size],
          className
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        {/* Progress indicator */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden',
            variantConfig[variant],
            indicatorClassName,
            // Add scale animation when changing
            showPulse && 'animate-pulse-scale'
          )}
          style={{
            width: `${normalizedValue}%`,
          }}
        >
          {/* Shimmer effect on change */}
          {showPulse && (
            <div 
              className={cn(
                'absolute inset-0 -translate-x-full animate-shimmer',
                isIncreasing 
                  ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-red-200/30 to-transparent'
              )}
            />
          )}
        </div>
        
        {/* Progress container with enhanced animations */}
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500',
            // Add glow effect based on direction
            showPulse && isIncreasing && 'shadow-lg shadow-green-500/20',
            showPulse && isIncreasing === false && 'shadow-lg shadow-red-500/20'
          )}
        />
        
        {/* Optional percentage display with animation */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={cn(
                "text-xs font-medium text-foreground/80 transition-all duration-300",
                showPulse && "scale-110 font-bold",
                showPulse && isIncreasing && "text-green-600",
                showPulse && isIncreasing === false && "text-red-600"
              )}
            >
              {Math.round(normalizedValue)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };