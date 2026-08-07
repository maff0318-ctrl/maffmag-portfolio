import { supabase } from '@/lib/supabase'
import type { Photo } from '@/lib/supabase'
import { imageOptimizationService } from './imageOptimizationService'
import { r2Service } from './r2Service'

export interface UploadProgress {
  photoId: string
  fileName: string
  stage: 'validating' | 'optimizing' | 'uploading' | 'saving' | 'complete' | 'error'
  progress: number // 0-100
  message: string
  optimizationResult?: {
    originalSize: number
    totalOptimizedSize: number
    savingsPercent: number
    lqipSize?: number // Size of LQIP in bytes
    variants: Array<{
      type: string
      size: number
      dimensions: string
    }>
  }
  error?: string
}

export const photoService = {
  // Get all photos for an album
  async getByAlbumId(albumId: string) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return (data as Photo[]) || []
  },

  // Get photos with pagination
  async getByAlbumIdPaginated(
    albumId: string,
    limit: number = 30,
    offset: number = 0
  ): Promise<{ photos: Photo[]; total: number; hasMore: boolean }> {
    // Get total count
    const { count } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('album_id', albumId)

    const total = count || 0

    // Get paginated photos
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('display_order', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const photos = (data as Photo[]) || []
    const hasMore = offset + photos.length < total

    return { photos, total, hasMore }
  },

  // Upload single photo with R2 optimization (NEW)
  async uploadWithOptimization(
    albumId: string,
    file: File,
    displayOrder: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Photo> {
    const photoId = crypto.randomUUID()
    const fileName = file.name

    try {
      // Stage 1: Validate
      onProgress?.({
        photoId,
        fileName,
        stage: 'validating',
        progress: 10,
        message: 'Validating image...',
      })

      const validation = imageOptimizationService.validateImage(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Stage 2: Optimize
      onProgress?.({
        photoId,
        fileName,
        stage: 'optimizing',
        progress: 30,
        message: 'Optimizing image (generating 3 variants)...',
      })

      const optimizationResult = await imageOptimizationService.optimizeImage(file)

      const totalOptimizedSize = optimizationResult.variants.reduce((sum, v) => sum + v.size, 0)
      const savingsPercent = ((1 - totalOptimizedSize / file.size) * 100).toFixed(1)

      onProgress?.({
        photoId,
        fileName,
        stage: 'optimizing',
        progress: 50,
        message: `Optimized! ${savingsPercent}% reduction + LQIP`,
        optimizationResult: {
          originalSize: file.size,
          totalOptimizedSize,
          savingsPercent: parseFloat(savingsPercent),
          lqipSize: optimizationResult.lqip.length,
          variants: optimizationResult.variants.map((v) => ({
            type: v.type,
            size: v.size,
            dimensions: `${v.width}×${v.height}`,
          })),
        },
      })

      // Stage 3: Upload to R2
      onProgress?.({
        photoId,
        fileName,
        stage: 'uploading',
        progress: 60,
        message: 'Uploading to Cloudflare R2...',
      })

      const uploadResult = await r2Service.uploadVariants(
        albumId,
        photoId,
        optimizationResult.variants,
        (r2Progress) => {
          onProgress?.({
            photoId,
            fileName,
            stage: 'uploading',
            progress: 60 + (r2Progress.percentage * 0.2), // 60-80%
            message: `Uploading ${r2Progress.variant}...`,
          })
        }
      )

      // Stage 4: Save to database
      onProgress?.({
        photoId,
        fileName,
        stage: 'saving',
        progress: 90,
        message: 'Saving to database...',
      })

      const { data: photo, error } = await supabase
        .from('photos')
        .insert({
          id: photoId,
          album_id: albumId,
          image_url: uploadResult.large_url, // Use large as primary URL
          thumbnail_url: uploadResult.thumbnail_url,
          medium_url: uploadResult.medium_url,
          large_url: uploadResult.large_url,
          image_width: optimizationResult.originalDimensions.width,
          image_height: optimizationResult.originalDimensions.height,
          placeholder_b64: optimizationResult.lqip, // Store LQIP for instant loading
          storage_type: 'r2',
          display_order: displayOrder,
        })
        .select()
        .single()

      if (error) throw error

      // Stage 5: Complete
      onProgress?.({
        photoId,
        fileName,
        stage: 'complete',
        progress: 100,
        message: 'Upload complete!',
        optimizationResult: {
          originalSize: file.size,
          totalOptimizedSize,
          savingsPercent: parseFloat(savingsPercent),
          lqipSize: optimizationResult.lqip.length,
          variants: optimizationResult.variants.map((v) => ({
            type: v.type,
            size: v.size,
            dimensions: `${v.width}×${v.height}`,
          })),
        },
      })

      return photo as Photo
    } catch (error: any) {
      onProgress?.({
        photoId,
        fileName,
        stage: 'error',
        progress: 0,
        message: 'Upload failed',
        error: error.message,
      })
      throw error
    }
  },

  // Legacy upload (Supabase Storage - kept for backward compatibility)
  async upload(albumId: string, file: File, displayOrder: number) {
    const photoId = crypto.randomUUID()
    const fileExt = file.name.split('.').pop()
    const fileName = `${albumId}/${photoId}.${fileExt}`
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        contentType: file.type
      })
    
    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Create database record
    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        album_id: albumId,
        image_url: data.publicUrl,
        storage_type: 'supabase',
        display_order: displayOrder,
      })
      .select()
      .single()
    
    if (error) throw error
    return photo as Photo
  },

  // Update photo metadata
  async update(id: string, updates: Partial<Photo>) {
    const { data, error } = await supabase
      .from('photos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Photo
  },

  // Delete photo (supports both R2 and Supabase storage)
  async delete(id: string, photo: Photo) {
    // Delete from storage based on storage type
    if (photo.storage_type === 'r2') {
      // Delete R2 variants
      try {
        await r2Service.deleteVariants(photo.album_id, photo.id)
      } catch (error) {
        console.error('Error deleting R2 variants:', error)
        // Continue with database deletion even if R2 deletion fails
      }
    } else {
      // Delete from Supabase Storage (legacy)
      try {
        const imageUrl = photo.image_url
        const urlParts = imageUrl.split('/photos/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          await supabase.storage.from('photos').remove([filePath])
        }
      } catch (error) {
        console.error('Error deleting file from storage:', error)
      }
    }

    // Delete from database
    const { error } = await supabase.from('photos').delete().eq('id', id)

    if (error) throw error
  },

  // Get next available display order for album
  async getNextDisplayOrder(albumId: string) {
    const { data, error } = await supabase
      .from('photos')
      .select('display_order')
      .eq('album_id', albumId)
      .order('display_order', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data && data.length > 0 ? data[0].display_order + 1 : 1
  },

  // Swap display order with another photo
  async swapOrder(photoId: string, albumId: string, targetOrder: number) {
    // Get current photo
    const { data: currentPhoto } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .single()

    if (!currentPhoto) return

    const currentOrder = currentPhoto.display_order

    // Get photo at target position
    const { data: targetPhoto } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .eq('display_order', targetOrder)
      .single()

    if (targetPhoto) {
      // Swap orders
      await supabase
        .from('photos')
        .update({ display_order: currentOrder })
        .eq('id', targetPhoto.id)
    }

    await supabase
      .from('photos')
      .update({ display_order: targetOrder })
      .eq('id', photoId)
  },

  // Update photo count in album
  async updateAlbumPhotoCount(albumId: string) {
    const photos = await this.getByAlbumId(albumId)
    await supabase
      .from('albums')
      .update({ photo_count: photos.length })
      .eq('id', albumId)
  },

  // Get total count across all albums
  async getTotalCount() {
    const { count, error } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  },
}
