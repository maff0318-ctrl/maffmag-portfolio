import { supabase } from '@/lib/supabase'
import type { TravelRecord } from '@/lib/supabase'

export const recordService = {
  // Get all visible records ordered by display_order (public-facing)
  async getAll() {
    const { data, error } = await supabase
      .from('travel_records')
      .select('*')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data as TravelRecord[]) || []
  },

  // Get ALL records regardless of visibility — used by the admin panel so
  // hidden or incomplete records are always visible and can be edited/deleted.
  async getAllAdmin() {
    const { data, error } = await supabase
      .from('travel_records')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return (data as TravelRecord[]) || []
  },

  // Get records by type
  async getByType(type: 'data' | 'photo' | 'split') {
    const { data, error } = await supabase
      .from('travel_records')
      .select('*')
      .eq('type', type)
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return (data as TravelRecord[]) || []
  },

  // Get single record by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('travel_records')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as TravelRecord
  },

  // Create new record
  async create(record: Omit<TravelRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('travel_records')
      .insert(record)
      .select()
      .single()
    
    if (error) throw error
    return data as TravelRecord
  },

  // Update record
  async update(id: string, updates: Partial<TravelRecord>) {
    const { data, error } = await supabase
      .from('travel_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as TravelRecord
  },

  // Delete record
  async delete(id: string) {
    const { error } = await supabase
      .from('travel_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Get next available display order
  async getNextDisplayOrder() {
    const { data, error } = await supabase
      .from('travel_records')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data && data.length > 0 ? data[0].display_order + 1 : 1
  },

  // Toggle visibility
  async toggleVisibility(id: string) {
    const record = await this.getById(id)
    return await this.update(id, { is_visible: !record.is_visible })
  },

  // Get total count
  async getCount() {
    const { count, error } = await supabase
      .from('travel_records')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  },

  // Swap display order with another record (same 3-step pattern used for
  // albums, to safely avoid the display_order UNIQUE constraint).
  async swapOrder(recordId: string, targetOrder: number) {
    const record = await this.getById(recordId)
    const currentOrder = record.display_order

    const { data: targetRecord, error: targetError } = await supabase
      .from('travel_records')
      .select('*')
      .eq('display_order', targetOrder)
      .single()

    if (targetError && targetError.code !== 'PGRST116') {
      throw targetError
    }

    if (targetRecord) {
      const tempOrder = -Math.abs(currentOrder) - 1

      const { error: tempError } = await supabase
        .from('travel_records')
        .update({ display_order: tempOrder })
        .eq('id', recordId)
      if (tempError) throw tempError

      const { error: swapError } = await supabase
        .from('travel_records')
        .update({ display_order: currentOrder })
        .eq('id', targetRecord.id)
      if (swapError) throw swapError

      const { error: finalError } = await supabase
        .from('travel_records')
        .update({ display_order: targetOrder })
        .eq('id', recordId)
      if (finalError) throw finalError
    } else {
      const { error: updateError } = await supabase
        .from('travel_records')
        .update({ display_order: targetOrder })
        .eq('id', recordId)
      if (updateError) throw updateError
    }
  },

  // Upload + optimize an image for a 'photo' or 'highlight' record.
  // Resizes to a max of 1200px (wider than album covers since these are
  // full-bleed background photos) WebP, and generates an LQIP blur
  // placeholder, mirroring the album cover optimization pipeline.
  async uploadImage(recordId: string, file: File): Promise<{ imageUrl: string; lqip: string }> {
    const { imageOptimizationService } = await import('./imageOptimizationService')

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = objectUrl
    })

    const lqip = await imageOptimizationService.generateLQIPFromImage(img)
    const optimizedFile = await imageOptimizationService.optimizeCoverImage(img, 1200, 0.85)
    URL.revokeObjectURL(objectUrl)

    const fileName = `${recordId}-image.webp`
    const { error: uploadError } = await supabase.storage
      .from('record-images')
      .upload(fileName, optimizedFile, {
        upsert: true,
        contentType: 'image/webp',
      })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('record-images').getPublicUrl(fileName)

    return {
      imageUrl: `${data.publicUrl}?v=${Date.now()}`,
      lqip,
    }
  },

  // Delete a record's uploaded image from storage
  async deleteImage(imageUrl: string) {
    try {
      const fileName = imageUrl.split('?')[0].split('/').pop()
      if (fileName) {
        await supabase.storage.from('record-images').remove([fileName])
      }
    } catch (error) {
      console.error('Error deleting record image:', error)
    }
  },
}
