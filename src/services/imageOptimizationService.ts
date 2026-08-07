/**
 * Image Optimization Service
 * 
 * Handles client-side image optimization before upload to Cloudflare R2.
 * Generates multiple variants (thumbnail, medium, large) with WebP conversion
 * and dimension restrictions to minimize storage and bandwidth costs.
 */

export interface ImageVariant {
  file: File
  width: number
  height: number
  size: number
  type: 'thumbnail' | 'medium' | 'large' | 'original'
}

export interface OptimizationResult {
  variants: ImageVariant[]
  originalFile: File
  originalDimensions: { width: number; height: number }
  lqip: string // Base64 data URI for 10×10px WebP placeholder
}

export interface OptimizationOptions {
  maxDimensions: {
    thumbnail: number  // 400px
    medium: number     // 800px
    large: number      // 1920px
  }
  quality: {
    thumbnail: number  // 0.80
    medium: number     // 0.85
    large: number      // 0.90
  }
  formats: ('webp' | 'jpeg')[]
  preserveOriginal?: boolean
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxDimensions: {
    thumbnail: 400,
    medium: 800,
    large: 1920,
  },
  quality: {
    thumbnail: 0.80,
    medium: 0.85,
    large: 0.90,
  },
  formats: ['webp'],
  preserveOriginal: false,
}

export class ImageOptimizationService {
  private options: OptimizationOptions

  constructor(options: Partial<OptimizationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Optimize a single image file and generate multiple variants
   */
  async optimizeImage(file: File): Promise<OptimizationResult> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Load image to get original dimensions
    const img = await this.loadImage(file)
    const originalDimensions = {
      width: img.width,
      height: img.height,
    }

    console.log(`Optimizing image: ${file.name}`)
    console.log(`Original dimensions: ${originalDimensions.width}x${originalDimensions.height}`)
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

    // Generate LQIP (Low-Quality Image Placeholder) - 10×10px WebP
    console.log('Generating LQIP (10×10px WebP placeholder)...')
    const lqip = await this.generateLQIP(img)
    console.log(`✓ LQIP generated: ${lqip.length} bytes`)

    // Generate variants
    const variants: ImageVariant[] = []

    // Generate thumbnail (400px max)
    if (originalDimensions.width > this.options.maxDimensions.thumbnail || 
        originalDimensions.height > this.options.maxDimensions.thumbnail) {
      const thumbnailFile = await this.resizeAndConvert(
        img,
        this.options.maxDimensions.thumbnail,
        this.options.quality.thumbnail,
        'webp'
      )
      const thumbnailDims = await this.getImageDimensions(thumbnailFile)
      variants.push({
        file: thumbnailFile,
        width: thumbnailDims.width,
        height: thumbnailDims.height,
        size: thumbnailFile.size,
        type: 'thumbnail',
      })
      console.log(`✓ Thumbnail: ${thumbnailDims.width}x${thumbnailDims.height} - ${(thumbnailFile.size / 1024).toFixed(2)} KB`)
    }

    // Generate medium (800px max)
    if (originalDimensions.width > this.options.maxDimensions.medium || 
        originalDimensions.height > this.options.maxDimensions.medium) {
      const mediumFile = await this.resizeAndConvert(
        img,
        this.options.maxDimensions.medium,
        this.options.quality.medium,
        'webp'
      )
      const mediumDims = await this.getImageDimensions(mediumFile)
      variants.push({
        file: mediumFile,
        width: mediumDims.width,
        height: mediumDims.height,
        size: mediumFile.size,
        type: 'medium',
      })
      console.log(`✓ Medium: ${mediumDims.width}x${mediumDims.height} - ${(mediumFile.size / 1024).toFixed(2)} KB`)
    }

    // Generate large (1920px max) - always generate for consistency
    const largeFile = await this.resizeAndConvert(
      img,
      this.options.maxDimensions.large,
      this.options.quality.large,
      'webp'
    )
    const largeDims = await this.getImageDimensions(largeFile)
    variants.push({
      file: largeFile,
      width: largeDims.width,
      height: largeDims.height,
      size: largeFile.size,
      type: 'large',
    })
    console.log(`✓ Large: ${largeDims.width}x${largeDims.height} - ${(largeFile.size / 1024).toFixed(2)} KB`)

    const totalSize = variants.reduce((sum, v) => sum + v.size, 0)
    const savingsPercent = ((1 - totalSize / file.size) * 100).toFixed(1)
    console.log(`Total optimized size: ${(totalSize / 1024 / 1024).toFixed(2)} MB (${savingsPercent}% reduction)`)

    return {
      variants,
      originalFile: file,
      originalDimensions,
      lqip, // Include LQIP in result
    }
  }

  /**
   * Optimize multiple images in batch
   */
  async optimizeBatch(files: File[], onProgress?: (completed: number, total: number) => void): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      const result = await this.optimizeImage(files[i])
      results.push(result)
      
      if (onProgress) {
        onProgress(i + 1, files.length)
      }
    }

    return results
  }

  /**
   * Load image from file
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Get dimensions from a file
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    const img = await this.loadImage(file)
    return { width: img.width, height: img.height }
  }

  /**
   * Resize image and convert to specified format
   */
  private async resizeAndConvert(
    img: HTMLImageElement,
    maxDimension: number,
    quality: number,
    format: 'webp' | 'jpeg'
  ): Promise<File> {
    // Calculate new dimensions maintaining aspect ratio
    let width = img.width
    let height = img.height

    if (width > height) {
      if (width > maxDimension) {
        height = Math.round((height * maxDimension) / width)
        width = maxDimension
      }
    } else {
      if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height)
        height = maxDimension
      }
    }

    // Create canvas and draw resized image
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw image
    ctx.drawImage(img, 0, 0, width, height)

    // Convert to blob
    const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg'
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        mimeType,
        quality
      )
    })

    // Convert blob to file
    const fileName = `optimized_${width}x${height}.${format}`
    return new File([blob], fileName, { type: mimeType })
  }

  /**
   * Generate file name for R2 storage
   * Format: {albumId}/{photoId}-{variant}.webp
   */
  generateR2FileName(albumId: string, photoId: string, variant: 'thumbnail' | 'medium' | 'large'): string {
    return `${albumId}/${photoId}-${variant}.webp`
  }

  /**
   * Get recommended variant based on viewport width
   */
  getRecommendedVariant(viewportWidth: number): 'thumbnail' | 'medium' | 'large' {
    if (viewportWidth <= 640) {
      return 'thumbnail'
    } else if (viewportWidth <= 1024) {
      return 'medium'
    } else {
      return 'large'
    }
  }

  /**
   * Generate LQIP (Low-Quality Image Placeholder)
   * Creates a 10×10px WebP thumbnail encoded as Base64 data URI
   * Target size: <500 bytes
   */
  private async generateLQIP(img: HTMLImageElement): Promise<string> {
    const LQIP_SIZE = 10 // 10×10px
    const LQIP_QUALITY = 0.3 // 30% quality for ultra-small size

    // Create tiny canvas
    const canvas = document.createElement('canvas')
    canvas.width = LQIP_SIZE
    canvas.height = LQIP_SIZE

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context for LQIP')
    }

    // Disable smoothing for sharp pixels (better for blur effect)
    ctx.imageSmoothingEnabled = false

    // Draw image scaled down to 10×10px
    ctx.drawImage(img, 0, 0, LQIP_SIZE, LQIP_SIZE)

    // Convert to WebP blob with very low quality
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate LQIP blob'))
          }
        },
        'image/webp',
        LQIP_QUALITY
      )
    })

    // Convert blob to Base64 data URI
    const base64 = await this.blobToBase64(blob)
    
    // Verify size is under 500 bytes
    if (base64.length > 500) {
      console.warn(`LQIP size (${base64.length} bytes) exceeds 500 bytes target`)
    }

    return base64
  }

  /**
   * Public method to generate LQIP from an image element
   * Used for album covers and other standalone images
   */
  async generateLQIPFromImage(img: HTMLImageElement): Promise<string> {
    return this.generateLQIP(img)
  }

  /**
   * Public method to resize + convert a single standalone image (e.g. album covers).
   * Caps the image to `maxDimension` px on its longest side and converts to WebP,
   * so pages that list many covers (Portfolio grid) never have to download
   * full-resolution master photos just to show a thumbnail.
   */
  async optimizeCoverImage(
    img: HTMLImageElement,
    maxDimension: number = 800,
    quality: number = 0.85
  ): Promise<File> {
    return this.resizeAndConvert(img, maxDimension, quality, 'webp')
  }

  /**
   * Convert Blob to Base64 data URI
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert blob to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Validate image file
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' }
    }

    // Check file size (max 50MB for original)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Image file size must be less than 50MB' }
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    if (!supportedFormats.includes(file.type.toLowerCase())) {
      return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, WebP, or HEIC.' }
    }

    return { valid: true }
  }
}

// Export singleton instance
export const imageOptimizationService = new ImageOptimizationService()
