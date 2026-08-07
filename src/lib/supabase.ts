import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Album {
  id: string
  title: string
  title_zh?: string
  location: string
  continent: string
  year: number
  description?: string
  description_zh?: string
  cover_image: string
  photo_count: number
  display_order: number
  cover_storage_type?: 'supabase' | 'r2' // Storage backend for cover image
  cover_placeholder_b64?: string // LQIP: Base64-encoded 10×10px WebP placeholder for cover
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  album_id: string
  image_url: string // Legacy field or points to large_url for R2 photos
  thumbnail_url?: string // R2: 400px variant (WebP)
  medium_url?: string // R2: 800px variant (WebP)
  large_url?: string // R2: 1920px variant (WebP)
  image_width?: number // Original image width in pixels
  image_height?: number // Original image height in pixels
  storage_type?: 'supabase' | 'r2' // Storage backend
  placeholder_b64?: string // LQIP: Base64-encoded 10×10px WebP placeholder (data:image/webp;base64,...)
  caption_en?: string
  caption_zh?: string
  description_en?: string
  description_zh?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface TravelRecord {
  id: string
  type: 'data' | 'photo' | 'split' | 'highlight'
  display_order: number
  grid_size: 'small' | 'medium' | 'large'
  title_en?: string
  title_zh?: string
  value?: string
  caption_en?: string
  caption_zh?: string
  image_url?: string
  image_placeholder_b64?: string // LQIP: Base64-encoded 10x10px WebP placeholder for the background photo
  split_left_value?: string
  split_left_caption_en?: string
  split_left_caption_zh?: string
  split_right_value?: string
  split_right_caption_en?: string
  split_right_caption_zh?: string
  // Fields for 'highlight' type (Bento "Travel Extreme" cards)
  metric?: string // Oversized hero number, e.g. "-18°C", "5,364m"
  location_tag?: string // e.g. "Oymyakon, Russia"
  year_tag?: string // e.g. "2024"
  is_featured?: boolean // Larger typography + wider grid span
  is_visible: boolean
  created_at: string
  updated_at: string
}
