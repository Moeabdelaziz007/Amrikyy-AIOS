import { cn } from '../../../../lib/utils';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingSpinnerVariant = 'default' | 'cyber' | 'neon' | 'pulse';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export interface LoadingSpinnerProps {
  size?: LoadingSpinnerSize;
  variant?: LoadingSpinnerVariant;
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text,
}: LoadingSpinnerProps) {
  const baseClasses = 'animate-spin';
  const sizeClass = sizeClasses[size];

  const getVariantClasses = () => {
    switch (variant) {
      case 'cyber':
        return 'text-blue-500 border-blue-500 border-t-transparent';
      case 'neon':
        return 'text-purple-500 border-purple-500 border-t-transparent shadow-lg shadow-purple-500/50';
      case 'pulse':
        return 'text-blue-600 animate-pulse';
      default:
        return 'text-blue-600 border-blue-600 border-t-transparent';
    }
  };

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div
          className={cn(
            'rounded-full bg-blue-600',
            sizeClass,
            'animate-pulse'
          )}
        />
        {text && (
          <span className="ml-2 text-sm text-gray-600 animate-pulse">
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-2',
          sizeClass,
          baseClasses,
          getVariantClasses()
        )}
      />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: LoadingSpinnerVariant;
  className?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  text = 'Loading...',
  variant = 'default',
  className,
  children,
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingSpinner size="lg" variant={variant} />
          <p className="mt-2 text-sm text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: LoadingSpinnerVariant;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  variant = 'default',
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center',
        'px-4 py-2 rounded-md font-medium',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'bg-blue-600 hover:bg-blue-700 text-white',
        className
      )}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" variant={variant} />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';
      case 'none':
        return '';
      case 'pulse':
      default:
        return 'animate-pulse';
    }
  };

  return (
    <div
      className={cn(
        baseClasses,
        getVariantClasses(),
        getAnimationClasses(),
        className
      )}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={cn(
            index === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}
