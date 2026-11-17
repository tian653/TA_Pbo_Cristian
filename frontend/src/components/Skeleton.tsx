interface SkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'circle'
}

export default function Skeleton({ className = '', variant = 'card' }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-gray-200 rounded'
  
  if (variant === 'text') {
    return <div className={`${baseClass} h-4 w-full ${className}`} />
  }
  
  if (variant === 'circle') {
    return <div className={`${baseClass} rounded-full ${className}`} />
  }
  
  // card variant
  return <div className={`${baseClass} ${className}`} />
}
