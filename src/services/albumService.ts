import { supabase } from '@/lib/supabase'
import type { Album } from '@/lib/supabase'

export const albumService = {
  // Get all albums ordered by display_order
  async getAll() {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return (data as Album[]) || []
  },

  // Get albums by continent
  async getByContinent(continent: string) {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('continent', continent)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return (data as Album[]) || []
  },

  // Get single album by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Album
  },

  // Create new album
  async create(album: Omit<Album, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('albums')
      .insert(album)
      .select()
      .single()
    
    if (error) throw error
    return data as Album
  },

  // Update album
  async update(id: string, updates: Partial<Album>) {
    const { data, error } = await supabase
      .from('albums')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Album
  },

  // Delete album (will cascade delete photos)
  async delete(id: string) {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get next available display order
  async getNextDisplayOrder() {
    const { data, error } = await supabase
      .from('albums')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data && data.length > 0 ? data[0].display_order + 1 : 1
  },

  // Swap display order with another album
  async swapOrder(albumId: string, targetOrder: number) {
    console.log(`swapOrder called: albumId=${albumId}, targetOrder=${targetOrder}`)
    
    // Get current album
    const album = await this.getById(albumId)
    const currentOrder = album.display_order
    console.log(`Current album order: ${currentOrder}`)

    // Get album at target position
    const { data: targetAlbum, error: targetError } = await supabase
      .from('albums')
      .select('*')
      .eq('display_order', targetOrder)
      .single()

    console.log(`Target album:`, targetAlbum, `Target error:`, targetError)

    if (targetError && targetError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error fetching target album:', targetError)
      throw targetError
    }

    if (targetAlbum) {
      // Use negative temporary values to avoid UNIQUE constraint conflicts
      // display_order has UNIQUE constraint, so we can't have duplicates
      const tempOrder = -Math.abs(currentOrder)
      
      console.log(`Step 1: Moving current album ${albumId} to temp order ${tempOrder}`)
      const { error: tempError } = await supabase
        .from('albums')
        .update({ display_order: tempOrder })
        .eq('id', albumId)
      
      if (tempError) {
        console.error('Error moving to temp order:', tempError)
        throw tempError
      }

      console.log(`Step 2: Moving target album ${targetAlbum.id} from ${targetOrder} to ${currentOrder}`)
      const { error: swapError } = await supabase
        .from('albums')
        .update({ display_order: currentOrder })
        .eq('id', targetAlbum.id)
      
      if (swapError) {
        console.error('Error swapping target album:', swapError)
        throw swapError
      }

      console.log(`Step 3: Moving current album ${albumId} from ${tempOrder} to ${targetOrder}`)
      const { error: finalError } = await supabase
        .from('albums')
        .update({ display_order: targetOrder })
        .eq('id', albumId)
      
      if (finalError) {
        console.error('Error moving to final order:', finalError)
        throw finalError
      }
    } else {
      // No album at target position, just update
      console.log(`No album at target position, directly updating album ${albumId} to ${targetOrder}`)
      const { error: updateError } = await supabase
        .from('albums')
        .update({ display_order: targetOrder })
        .eq('id', albumId)
      
      if (updateError) {
        console.error('Error updating album order:', updateError)
        throw updateError
      }
    }
    
    console.log('swapOrder completed successfully')
  },

  // Upload cover image to Supabase Storage with LQIP generation.
  // The cover is downscaled to a max of 800px (WebP) before upload so the
  // Portfolio grid never has to fetch full-resolution master photos just to
  // render a thumbnail-sized album cover.
  async uploadCover(albumId: string, file: File): Promise<{ coverUrl: string; lqip: string }> {
    const { imageOptimizationService } = await import('./imageOptimizationService')

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = objectUrl
    })

    // Generate LQIP using the same service as photos
    console.log('Generating LQIP for album cover...')
    const lqip = await imageOptimizationService.generateLQIPFromImage(img)
    console.log(`✓ Album cover LQIP generated: ${lqip.length} bytes`)

    // Downscale cover to max 800px WebP - covers are only ever shown as
    // thumbnails in the Portfolio grid, so there's no reason to store/serve
    // the original multi-megapixel upload.
    console.log(`Optimizing cover image (original: ${(file.size / 1024).toFixed(0)} KB)...`)
    const optimizedFile = await imageOptimizationService.optimizeCoverImage(img, 800, 0.85)
    console.log(`✓ Cover optimized: ${(optimizedFile.size / 1024).toFixed(0)} KB (WebP, max 800px)`)

    URL.revokeObjectURL(objectUrl)

    // Upload optimized cover to Supabase Storage (always .webp now)
    const fileName = `${albumId}-cover.webp`

    const { error: uploadError } = await supabase.storage
      .from('album-covers')
      .upload(fileName, optimizedFile, {
        upsert: true,
        contentType: 'image/webp'
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('album-covers')
      .getPublicUrl(fileName)

    return {
      coverUrl: data.publicUrl,
      lqip
    }
  },

  // Re-optimize an EXISTING album's cover image in place: downloads the
  // currently-stored cover, runs it through the same resize (max 800px) +
  // WebP + LQIP pipeline used for new uploads, re-uploads it, and updates
  // the album record. Used to backfill albums created before cover
  // optimization existed, without requiring a manual re-upload.
  async migrateCoverToOptimized(album: Album): Promise<{ coverUrl: string; lqip: string; originalSize: number; optimizedSize: number }> {
    const { imageOptimizationService } = await import('./imageOptimizationService')

    // Fetch the currently-stored cover as a blob
    const response = await fetch(album.cover_image)
    if (!response.ok) {
      throw new Error(`Failed to fetch existing cover (${response.status})`)
    }
    const blob = await response.blob()
    const originalSize = blob.size

    // Load into an Image element for canvas processing
    const objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = objectUrl
    })

    // Generate LQIP + optimized (max 800px WebP) version
    const lqip = await imageOptimizationService.generateLQIPFromImage(img)
    const optimizedFile = await imageOptimizationService.optimizeCoverImage(img, 800, 0.85)
    URL.revokeObjectURL(objectUrl)

    // Upload optimized cover, overwriting the previous file
    const fileName = `${album.id}-cover.webp`
    const { error: uploadError } = await supabase.storage
      .from('album-covers')
      .upload(fileName, optimizedFile, {
        upsert: true,
        contentType: 'image/webp',
      })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('album-covers').getPublicUrl(fileName)

    // Cache-bust so <img> tags don't keep showing the old cached file at the same URL
    const coverUrl = `${data.publicUrl}?v=${Date.now()}`

    await this.update(album.id, {
      cover_image: coverUrl,
      cover_placeholder_b64: lqip,
    } as Partial<Album>)

    return {
      coverUrl,
      lqip,
      originalSize,
      optimizedSize: optimizedFile.size,
    }
  },

  // Delete cover image
  async deleteCover(coverUrl: string) {
    try {
      const fileName = coverUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('album-covers')
          .remove([fileName])
      }
    } catch (error) {
      console.error('Error deleting cover:', error)
    }
  },

  // Get total count
  async getCount() {
    const { count, error } = await supabase
      .from('albums')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  },
}
