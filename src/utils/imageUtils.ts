/**
 * Image Utilities
 * 
 * Helper functions for working with images from different storage backends
 * (Supabase Storage vs Cloudflare R2) and selecting appropriate variants.
 */

import type { Photo } from '@/lib/supabase'

export type ImageVariantType = 'thumbnail' | 'medium' | 'large' | 'original'

export interface ImageSource {
  url: string
  width?: number
  height?: number
  variant: ImageVariantType
  storageType: 'supabase' | 'r2'
}

/**
 * Get the appropriate image URL based on desired variant and viewport size
 */
export function getImageUrl(
  photo: Photo,
  variant: ImageVariantType = 'large',
  viewportWidth?: number
): string {
  // R2 photo with variants
  if (photo.storage_type === 'r2') {
    // Auto-select variant based on viewport if provided
    if (viewportWidth) {
      if (viewportWidth <= 640) {
        return photo.thumbnail_url || photo.medium_url || photo.large_url || photo.image_url
      } else if (viewportWidth <= 1024) {
        return photo.medium_url || photo.large_url || photo.image_url
      } else {
        return photo.large_url || photo.image_url
      }
    }

    // Manual variant selection
    switch (variant) {
      case 'thumbnail':
        return photo.thumbnail_url || photo.medium_url || photo.large_url || photo.image_url
      case 'medium':
        return photo.medium_url || photo.large_url || photo.image_url
      case 'large':
        return photo.large_url || photo.image_url
      case 'original':
        return photo.image_url
      default:
        return photo.large_url || photo.image_url
    }
  }

  // Legacy Supabase photo - only has image_url
  return photo.image_url
}

/**
 * Get srcset string for responsive images
 * Returns undefined for Supabase photos (no variants available)
 */
export function getImageSrcSet(photo: Photo): string | undefined {
  if (photo.storage_type !== 'r2') {
    return undefined
  }

  const srcset: string[] = []

  if (photo.thumbnail_url) {
    srcset.push(`${photo.thumbnail_url} 400w`)
  }
  if (photo.medium_url) {
    srcset.push(`${photo.medium_url} 800w`)
  }
  if (photo.large_url) {
    srcset.push(`${photo.large_url} 1920w`)
  }

  return srcset.length > 0 ? srcset.join(', ') : undefined
}

/**
 * Get sizes attribute for responsive images
 */
export function getImageSizes(breakpoints?: {
  mobile?: string
  tablet?: string
  desktop?: string
}): string {
  const defaults = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
  }

  const sizes = { ...defaults, ...breakpoints }

  return `(max-width: 640px) ${sizes.mobile}, (max-width: 1024px) ${sizes.tablet}, ${sizes.desktop}`
}

/**
 * Get all available image sources for a photo
 */
export function getImageSources(photo: Photo): ImageSource[] {
  const sources: ImageSource[] = []

  if (photo.storage_type === 'r2') {
    if (photo.thumbnail_url) {
      sources.push({
        url: photo.thumbnail_url,
        variant: 'thumbnail',
        storageType: 'r2',
      })
    }
    if (photo.medium_url) {
      sources.push({
        url: photo.medium_url,
        variant: 'medium',
        storageType: 'r2',
      })
    }
    if (photo.large_url) {
      sources.push({
        url: photo.large_url,
        width: photo.image_width,
        height: photo.image_height,
        variant: 'large',
        storageType: 'r2',
      })
    }
  }

  // Always include original/image_url as fallback
  sources.push({
    url: photo.image_url,
    width: photo.image_width,
    height: photo.image_height,
    variant: 'original',
    storageType: photo.storage_type || 'supabase',
  })

  return sources
}

/**
 * Check if a photo has R2 variants available
 */
export function hasR2Variants(photo: Photo): boolean {
  return photo.storage_type === 'r2' && !!(photo.thumbnail_url || photo.medium_url || photo.large_url)
}

/**
 * Get aspect ratio from photo dimensions
 */
export function getAspectRatio(photo: Photo): number | undefined {
  if (photo.image_width && photo.image_height) {
    return photo.image_width / photo.image_height
  }
  return undefined
}

/**
 * Calculate responsive image dimensions
 */
export function getResponsiveDimensions(
  photo: Photo,
  containerWidth: number
): { width: number; height: number } | undefined {
  const aspectRatio = getAspectRatio(photo)
  if (!aspectRatio) {
    return undefined
  }

  return {
    width: containerWidth,
    height: Math.round(containerWidth / aspectRatio),
  }
}

/**
 * Estimate data savings using R2 variants vs original
 */
export function estimateDataSavings(viewportWidth: number, originalSize: number): {
  variant: ImageVariantType
  estimatedSize: number
  savings: number
  savingsPercent: number
} {
  let variant: ImageVariantType
  let compressionRatio: number

  if (viewportWidth <= 640) {
    variant = 'thumbnail'
    compressionRatio = 0.05 // ~95% reduction for 400px WebP
  } else if (viewportWidth <= 1024) {
    variant = 'medium'
    compressionRatio = 0.15 // ~85% reduction for 800px WebP
  } else {
    variant = 'large'
    compressionRatio = 0.35 // ~65% reduction for 1920px WebP
  }

  const estimatedSize = originalSize * compressionRatio
  const savings = originalSize - estimatedSize
  const savingsPercent = (savings / originalSize) * 100

  return {
    variant,
    estimatedSize,
    savings,
    savingsPercent,
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Get loading strategy based on image position
 */
export function getLoadingStrategy(index: number, threshold: number = 6): 'eager' | 'lazy' {
  // Load first few images eagerly, rest lazily
  return index < threshold ? 'eager' : 'lazy'
}

/**
 * Preload critical images (for LCP optimization)
 */
export function preloadImage(url: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = url
  document.head.appendChild(link)
}
