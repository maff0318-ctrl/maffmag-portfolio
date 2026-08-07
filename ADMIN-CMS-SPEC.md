# Admin Dashboard (CMS) Specification
## Travel Photography Website - Content Management System

**Version:** 1.0  
**Last Updated:** July 1, 2026  
**Target User:** Non-technical website owner  
**Tech Stack:** Vue 3 + TypeScript + Supabase (Backend) + Supabase Storage (File Uploads)

---

## Executive Summary

This specification defines a secure, visual Admin Dashboard that allows the website owner to manage all travel portfolio content without writing code. The system will provide:

- **Password-protected admin access** at `/admin`
- **Visual album creation and management** with continent categorization
- **Drag-and-drop photo uploading and reordering**
- **Bilingual caption/description editing** (English + Traditional Chinese)
- **Real-time content updates** reflected immediately on the public website

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & Security](#2-authentication--security)
3. [Data Schema](#3-data-schema)
4. [Feature Requirements](#4-feature-requirements)
5. [User Interface Design](#5-user-interface-design)
6. [Technical Implementation](#6-technical-implementation)
7. [Acceptance Criteria](#7-acceptance-criteria)

---

## 1. Architecture Overview

### 1.1 Technology Stack Choice


**Selected Solution: Supabase (Recommended)**

- **Database:** PostgreSQL (managed by Supabase)
- **File Storage:** Supabase Storage (cloud-based image hosting)
- **Authentication:** Supabase Auth (built-in user management)
- **Real-time Updates:** Automatic via Supabase SDK
- **Cost:** Free tier supports 500MB database + 1GB file storage

**Why Supabase?**
- Zero backend code required
- Visual dashboard for data inspection
- Automatic API generation
- Built-in authentication
- Image CDN with automatic optimization
- Easy to set up and maintain for non-technical users

**Alternative Options (if preferred):**
- Firebase (similar features, Google-backed)
- Local JSON files + GitHub commits (simpler but requires manual deployment)

### 1.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC WEBSITE                           │
│  (Vue 3 Frontend - Read-Only for Visitors)                  │
│                                                              │
│  • Home/Splash Screen                                       │
│  • Portfolio Page (shows all albums by continent)          │
│  • Album Detail Pages (shows photos in each album)         │
│  • About Page                                               │
│  • Contact Page                                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Supabase SDK
                   │ (reads data)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                         │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │   PostgreSQL   │  │ Supabase Auth  │  │   Storage    │ │
│  │   Database     │  │ (Login System) │  │ (Images CDN) │ │
│  │                │  │                │  │              │ │
│  │ • albums       │  │ • Admin user   │  │ • album-     │ │
│  │ • photos       │  │ • Password     │  │   covers/    │ │
│  │                │  │                │  │ • photos/    │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Supabase SDK
                   │ (writes data)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN DASHBOARD                             │
│         (Vue 3 Frontend - Password Protected)                │
│                                                              │
│  • Login Page (/admin/login)                                │
│  • Dashboard Home (/admin/dashboard)                        │
│  • Album Management (/admin/albums)                         │
│  • Photo Upload & Order (/admin/albums/:id)                │
│  • Caption Editor                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Security

### 2.1 Requirements

**REQ-SEC-01: Admin Login Page**
- URL: `/admin/login`
- Single admin account (the website owner)
- Email + Password authentication
- "Remember me" option (30-day session)
- Password reset via email (Supabase built-in)

**REQ-SEC-02: Session Management**
- Authenticated sessions stored securely in browser (httpOnly cookies)
- Auto-logout after 7 days of inactivity
- Manual logout button in dashboard header

**REQ-SEC-03: Route Protection**
- All `/admin/*` routes (except `/admin/login`) require authentication
- Unauthenticated users redirected to `/admin/login`
- Authenticated users trying to access `/admin/login` redirected to `/admin/dashboard`

**REQ-SEC-04: Public Website Security**
- Public pages (`/`, `/portfolio`, `/about`, `/contact`, `/album/:id`) have NO edit/delete capabilities
- API calls from public pages are read-only (enforced by Supabase Row Level Security)
- No admin controls visible to non-authenticated users

### 2.2 Login Page Design

**Visual Mockup:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   [LOGO]                            │
│                                                     │
│              Admin Dashboard                        │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Email                                         │ │
│  │ [___________________________________]         │ │
│  │                                               │ │
│  │ Password                                      │ │
│  │ [___________________________________]         │ │
│  │                                               │ │
│  │ [✓] Remember me                               │ │
│  │                                               │ │
│  │        [  Login  ]                            │ │
│  │                                               │ │
│  │        Forgot password?                       │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Form Validation:**
- Email must be valid format
- Password minimum 8 characters
- Show error messages below form (e.g., "Invalid credentials")
- Disable login button while submitting
- Show loading spinner during authentication

---

## 3. Data Schema

### 3.1 Database Tables

**Table: `albums`**

| Column          | Type        | Description                              | Constraints         |
|-----------------|-------------|------------------------------------------|---------------------|
| `id`            | UUID        | Primary key                              | Auto-generated      |
| `title`         | TEXT        | Album title (e.g., "Kyoto Temples")     | Required            |
| `title_zh`      | TEXT        | Album title in Chinese                   | Optional            |
| `location`      | TEXT        | City/place name (e.g., "Kyoto")         | Required            |
| `continent`     | TEXT        | One of: Africa, Antarctica, Asia, Europe, North America, Oceania, South America | Required |
| `year`          | INTEGER     | Year of travel (e.g., 2023)              | Required            |
| `description`   | TEXT        | Album description (English)              | Optional            |
| `description_zh`| TEXT        | Album description (Chinese)              | Optional            |
| `cover_image`   | TEXT        | URL to cover photo (Supabase Storage)    | Required            |
| `photo_count`   | INTEGER     | Total number of photos in album          | Auto-calculated     |
| `display_order` | INTEGER     | Order on portfolio page (1, 2, 3...)     | Required, unique    |
| `created_at`    | TIMESTAMP   | Record creation time                     | Auto-generated      |
| `updated_at`    | TIMESTAMP   | Last update time                         | Auto-updated        |

**Table: `photos`**

| Column          | Type        | Description                              | Constraints         |
|-----------------|-------------|------------------------------------------|---------------------|
| `id`            | UUID        | Primary key                              | Auto-generated      |
| `album_id`      | UUID        | Foreign key to `albums.id`               | Required            |
| `image_url`     | TEXT        | Full URL to photo (Supabase Storage)     | Required            |
| `caption_en`    | TEXT        | Photo caption in English                 | Optional            |
| `caption_zh`    | TEXT        | Photo caption in Chinese                 | Optional            |
| `description_en`| TEXT        | Longer description (English)             | Optional            |
| `description_zh`| TEXT        | Longer description (Chinese)             | Optional            |
| `display_order` | INTEGER     | Order within album (1, 2, 3...)          | Required            |
| `created_at`    | TIMESTAMP   | Upload time                              | Auto-generated      |
| `updated_at`    | TIMESTAMP   | Last update time                         | Auto-updated        |


**Foreign Key Relationship:**
```sql
photos.album_id → albums.id (CASCADE DELETE)
```
When an album is deleted, all its photos are automatically deleted.

### 3.2 Storage Buckets (Supabase Storage)

**Bucket: `album-covers`**
- **Purpose:** Store album cover images
- **Access:** Public read, authenticated write
- **File naming:** `{album-id}-cover.jpg`
- **Max file size:** 10MB per image
- **Allowed formats:** JPG, PNG, WebP

**Bucket: `photos`**
- **Purpose:** Store all album photos
- **Access:** Public read, authenticated write
- **File naming:** `{album-id}/{photo-id}.jpg`
- **Max file size:** 10MB per image
- **Allowed formats:** JPG, PNG, WebP

---

## 4. Feature Requirements

### 4.1 Album Management

**REQ-ALBUM-01: Create New Album**

*User Story:* As an admin, I want to create a new album so I can add a new travel destination to my portfolio.

**Acceptance Criteria:**
- ✅ Dashboard has a prominent "➕ Create New Album" button
- ✅ Clicking opens a form with the following fields:
  - Album Title (English) - Text input, required
  - Album Title (繁體中文) - Text input, optional
  - Location (e.g., "Kyoto") - Text input, required
  - Continent - Dropdown with 7 options (Africa, Antarctica, Asia, Europe, North America, Oceania, South America), required
  - Year - Number input (1900-2026), required
  - Description (English) - Textarea, optional
  - Description (繁體中文) - Textarea, optional
  - Cover Image - File upload (drag-and-drop or click to browse), required
- ✅ Form validates all required fields before submission
- ✅ Shows upload progress for cover image
- ✅ On success: redirects to album photo management page
- ✅ On error: displays error message and allows retry

**REQ-ALBUM-02: Edit Album Metadata**

*User Story:* As an admin, I want to edit album details so I can fix typos or update information.

**Acceptance Criteria:**
- ✅ Each album in the list has an "✏️ Edit" button
- ✅ Clicking opens the same form as "Create", pre-filled with existing data
- ✅ Admin can update any field including replacing the cover image
- ✅ Changes save immediately to database
- ✅ Public website reflects changes within 2 seconds (real-time or page refresh)

**REQ-ALBUM-03: Delete Album**

*User Story:* As an admin, I want to delete an entire album so I can remove outdated travel destinations.

**Acceptance Criteria:**
- ✅ Each album has a "🗑️ Delete" button
- ✅ Clicking shows a confirmation dialog: "Are you sure? This will delete the album and all {photo_count} photos. This action cannot be undone."
- ✅ Requires typing album title to confirm deletion (prevents accidental deletion)
- ✅ On confirmation: deletes album record + all photos from database + all image files from storage
- ✅ Shows success message and returns to album list


**REQ-ALBUM-04: Reorder Albums on Portfolio Page**

*User Story:* As an admin, I want to change the order albums appear on the portfolio page so I can feature recent trips first.

**Acceptance Criteria:**
- ✅ Album list in dashboard shows current display order
- ✅ Each album has "⬆️ Move Up" and "⬇️ Move Down" buttons (disabled at boundaries)
- ✅ Clicking swaps display_order with adjacent album
- ✅ Changes reflect on portfolio page immediately
- ✅ Alternative: Drag-and-drop reordering (if time permits)

### 4.2 Photo Management

**REQ-PHOTO-01: Upload Photos to Album**

*User Story:* As an admin, I want to upload multiple photos to an album at once so I can efficiently add my travel photos.

**Acceptance Criteria:**
- ✅ Album detail page has a prominent "📸 Upload Photos" section
- ✅ Supports drag-and-drop of multiple files at once
- ✅ Alternative: Click to browse and select multiple files
- ✅ Shows thumbnail previews of selected files before upload
- ✅ Displays upload progress bar for each file
- ✅ Validates file type (JPG, PNG, WebP only) and size (max 10MB per file)
- ✅ On success: photos appear at the end of the album
- ✅ On error: shows which files failed and reason (e.g., "file too large")

**REQ-PHOTO-02: Edit Photo Captions**

*User Story:* As an admin, I want to add bilingual captions to each photo so visitors can understand the story behind each image.

**Acceptance Criteria:**
- ✅ Each photo in the grid has an "✏️ Edit" button (appears on hover or always visible on mobile)
- ✅ Clicking opens an inline or modal form with:
  - Caption (English) - Text input
  - Caption (繁體中文) - Text input
  - Description (English) - Textarea
  - Description (繁體中文) - Textarea
- ✅ Admin can save or cancel changes
- ✅ Changes save immediately to database
- ✅ "Save & Next" button to quickly caption multiple photos in sequence

**REQ-PHOTO-03: Reorder Photos Within Album**

*User Story:* As an admin, I want to rearrange photo order so I can tell a chronological story.

**Acceptance Criteria:**
- ✅ Photos displayed in a grid with current order numbers visible (1, 2, 3...)
- ✅ Each photo has "⬆️ Move Up" and "⬇️ Move Down" buttons
- ✅ Alternative UI: Drag-and-drop grid (user drags photo thumbnails to reorder)
- ✅ Changes persist to database immediately
- ✅ Photo order on public album page reflects changes instantly

**REQ-PHOTO-04: Delete Individual Photo**

*User Story:* As an admin, I want to delete a single photo so I can remove bad shots or duplicates.

**Acceptance Criteria:**
- ✅ Each photo has a "🗑️ Delete" button
- ✅ Clicking shows confirmation: "Delete this photo? This action cannot be undone."
- ✅ On confirmation: deletes photo record from database + image file from storage
- ✅ Album photo_count updates automatically
- ✅ Remaining photos maintain their order


### 4.3 Dashboard Overview

**REQ-DASH-01: Dashboard Home Page**

*User Story:* As an admin, I want to see a summary of my content so I can quickly assess my portfolio.

**Acceptance Criteria:**
- ✅ URL: `/admin/dashboard`
- ✅ Displays key statistics:
  - Total Albums: {count}
  - Total Photos: {count}
  - Storage Used: {size} MB / 1000 MB
  - Last Updated: {date}
- ✅ Shows "Recent Activity" list (last 5 albums created/updated)
- ✅ Quick action buttons:
  - "➕ Create New Album"
  - "📂 Manage Albums"
  - "⚙️ Settings" (future feature)
- ✅ Logout button in header

**REQ-DASH-02: Album List View**

*User Story:* As an admin, I want to see all my albums in one place so I can manage them efficiently.

**Acceptance Criteria:**
- ✅ URL: `/admin/albums`
- ✅ Displays albums as a table or card grid with:
  - Cover image thumbnail
  - Album title (English)
  - Location + Continent
  - Year
  - Photo count
  - Display order number
  - Action buttons (Edit, Delete, Manage Photos, ⬆️, ⬇️)
- ✅ Search/filter by continent (dropdown)
- ✅ Sort by: Display Order (default), Year (newest first), Title (A-Z)


---

## 5. User Interface Design

### 5.1 Admin Dashboard Layout

**Component Structure:**

```
┌────────────────────────────────────────────────────────────┐
│  HEADER                                                     │
│  [Logo]  Admin Dashboard    [Dashboard] [Albums] [Logout]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  BREADCRUMB: Dashboard > Albums > Kyoto Temples            │
│                                                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│                     MAIN CONTENT AREA                       │
│                                                             │
│  (Dynamic based on route - Dashboard/Albums/Photo editor)  │
│                                                             │
│                                                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 5.2 Album Management UI Mockup

**Page: `/admin/albums`**

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Albums                                           │
│                                                              │
│  📂 Manage Albums                        [➕ Create Album]   │
│                                                              │
│  Filter: [All Continents ▼]  Sort: [Display Order ▼]       │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [Cover]  KYOTO TEMPLES                                 │ │
│ │          Kyoto, Japan • Asia • 2023                    │ │
│ │          156 photos                                    │ │
│ │          Display Order: #1                             │ │
│ │                                                        │ │
│ │   [⬆️][⬇️] [✏️ Edit] [📸 Photos] [🗑️ Delete]          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [Cover]  ICELAND ADVENTURE                             │ │
│ │          Reykjavik • Europe • 2022                     │ │
│ │          89 photos                                     │ │
│ │          Display Order: #2                             │ │
│ │                                                        │ │
│ │   [⬆️][⬇️] [✏️ Edit] [📸 Photos] [🗑️ Delete]          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Photo Management UI Mockup

**Page: `/admin/albums/:id/photos`**

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard > Albums > Kyoto Temples > Photos                  │
│                                                              │
│  📸 KYOTO TEMPLES - Photos (156)        [⬅️ Back to Albums] │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📸 Upload Photos                                   │   │
│  │  Drag & drop images here or click to browse        │   │
│  │  (JPG, PNG, WebP • Max 10MB each • Multiple files) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Sort: [Order ▼]  View: [Grid ● List ○]                    │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │[Thumbnail│  │[Thumbnail│  │[Thumbnail│  │[Thumbnail│  │
│  │  Image]  │  │  Image]  │  │  Image]  │  │  Image]  │  │
│  │          │  │          │  │          │  │          │  │
│  │  #1      │  │  #2      │  │  #3      │  │  #4      │  │
│  │ [⬆️][⬇️]  │  │ [⬆️][⬇️]  │  │ [⬆️][⬇️]  │  │ [⬆️][⬇️]  │  │
│  │[✏️][🗑️]  │  │[✏️][🗑️]  │  │[✏️][🗑️]  │  │[✏️][🗑️]  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                              │
│  (continues with all 156 photos in grid...)                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Edit Caption Modal

**Triggered when clicking ✏️ on any photo:**

```
┌─────────────────────────────────────────────────────────┐
│  Edit Photo Caption                             [✕ Close] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [Photo Preview - 400x300px]                             │
│                                                           │
│  Caption (English)                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Golden Pavilion at sunset / 金閣寺的夕陽            │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Caption (繁體中文)                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 金閣寺在夕陽下閃耀著金色光芒                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Description (English) - Optional                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Kinkaku-ji (金閣寺), officially named Rokuon-ji...  │ │
│  │                                                       │ │
│  │                                                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Description (繁體中文) - Optional                        │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 金閣寺正式名稱為鹿苑寺，是京都最著名的寺廟之一...    │ │
│  │                                                       │ │
│  │                                                       │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [Cancel]  [Save & Close]  [Save & Next Photo →]         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Technical Implementation

### 6.1 Setup Checklist

**Step 1: Create Supabase Project**
1. Go to https://supabase.com and create free account
2. Create new project: "travel-portfolio"
3. Note down project URL and anon key
4. Set project region (choose closest to target audience)

**Step 2: Create Database Tables**

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_zh TEXT,
  location TEXT NOT NULL,
  continent TEXT NOT NULL CHECK (continent IN (
    'Africa', 'Antarctica', 'Asia', 'Europe', 
    'North America', 'Oceania', 'South America'
  )),
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  description TEXT,
  description_zh TEXT,
  cover_image TEXT NOT NULL,
  photo_count INTEGER DEFAULT 0,
  display_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption_en TEXT,
  caption_zh TEXT,
  description_en TEXT,
  description_zh TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (album_id, display_order)
);

-- Create index for faster queries
CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_albums_display_order ON albums(display_order);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```


**Step 3: Configure Row Level Security (RLS)**

```sql
-- Enable RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Public can read all albums and photos
CREATE POLICY "Public albums are viewable by everyone"
  ON albums FOR SELECT
  USING (true);

CREATE POLICY "Public photos are viewable by everyone"
  ON photos FOR SELECT
  USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert albums"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update albums"
  ON albums FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete albums"
  ON albums FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE
  TO authenticated
  USING (true);
```

**Step 4: Create Storage Buckets**

1. Go to Supabase Dashboard > Storage
2. Create bucket: `album-covers` (public: true)
3. Create bucket: `photos` (public: true)

**Step 5: Configure Storage Policies**

```sql
-- Allow public to read files
CREATE POLICY "Public can read album covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'album-covers');

CREATE POLICY "Public can read photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

-- Only authenticated can upload/delete
CREATE POLICY "Authenticated can upload album covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'album-covers');

CREATE POLICY "Authenticated can delete album covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'album-covers');

CREATE POLICY "Authenticated can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');
```


**Step 6: Create Admin User**

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter your email and password
4. Confirm email (check inbox)
5. User is now ready to login

### 6.2 Frontend Implementation

**Install Dependencies**

```bash
npm install @supabase/supabase-js
npm install vue-router@4
npm install @vueuse/core  # for localStorage composables
```

**Create Supabase Client**

File: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
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
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  album_id: string
  image_url: string
  caption_en?: string
  caption_zh?: string
  description_en?: string
  description_zh?: string
  display_order: number
  created_at: string
  updated_at: string
}
```


**Environment Variables**

File: `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Authentication Composable**

File: `src/composables/useAuth.ts`

```typescript
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

export function useAuth() {
  const isAuthenticated = computed(() => user.value !== null)

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
  }

  // Listen to auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  return {
    user: computed(() => user.value),
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
}
```


**Album Service**

File: `src/services/albumService.ts`

```typescript
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
    return data as Album[]
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

  // Upload cover image
  async uploadCover(albumId: string, file: File) {
    const fileName = `${albumId}-cover.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage
      .from('album-covers')
      .upload(fileName, file, { upsert: true })
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('album-covers')
      .getPublicUrl(fileName)
    
    return publicUrl
  },
}
```


**Photo Service**

File: `src/services/photoService.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { Photo } from '@/lib/supabase'

export const photoService = {
  // Get all photos for an album
  async getByAlbumId(albumId: string) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('display_order', { ascending: true })
    if (error) throw error
    return data as Photo[]
  },

  // Upload single photo
  async upload(albumId: string, file: File, displayOrder: number) {
    // Upload to storage
    const photoId = crypto.randomUUID()
    const fileName = `${albumId}/${photoId}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file)
    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName)

    // Create database record
    const { data, error } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        album_id: albumId,
        image_url: publicUrl,
        display_order: displayOrder,
      })
      .select()
      .single()
    if (error) throw error
    return data as Photo
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

  // Delete photo
  async delete(id: string, imageUrl: string) {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const filePath = url.pathname.split('/storage/v1/object/public/photos/')[1]
    
    // Delete from storage
    await supabase.storage
      .from('photos')
      .remove([filePath])
    
    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
```


**Router Configuration**

File: `src/router/index.ts` (add admin routes)

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ... existing public routes ...
    
    // Admin routes
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/albums',
      name: 'AdminAlbums',
      component: () => import('@/views/admin/AlbumsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/albums/:id/photos',
      name: 'AdminPhotos',
      component: () => import('@/views/admin/PhotosView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, checkAuth } = useAuth()
  await checkAuth()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/admin/login')
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router
```


### 6.3 Key Components to Build

**Components List:**

1. **Admin Views:**
   - `LoginView.vue` - Admin login page
   - `DashboardView.vue` - Dashboard home with statistics
   - `AlbumsView.vue` - Album list and management
   - `PhotosView.vue` - Photo upload and management for a single album

2. **Admin Components:**
   - `AdminHeader.vue` - Header with navigation and logout
   - `AlbumForm.vue` - Create/edit album form
   - `AlbumCard.vue` - Album display card with actions
   - `PhotoUploader.vue` - Drag-and-drop photo uploader
   - `PhotoGrid.vue` - Grid of photos with edit/delete actions
   - `PhotoEditModal.vue` - Modal for editing captions
   - `DeleteConfirmModal.vue` - Reusable confirmation dialog

3. **Public Views (Updated):**
   - Update `PortfolioView.vue` to fetch from Supabase instead of JSON
   - Update `AlbumDetailView.vue` to fetch from Supabase instead of JSON

### 6.4 Data Migration

**Convert Existing Data:**

File: `scripts/migrate-to-supabase.ts`

```typescript
// Script to migrate existing albums.json and portfolio.json to Supabase
import { supabase } from '../src/lib/supabase'
import albumsData from '../src/data/albums.json'
import portfolioData from '../src/data/portfolio.json'

async function migrate() {
  // 1. Create albums from portfolio covers
  for (let i = 0; i < portfolioData.length; i++) {
    const cover = portfolioData[i]
    const albumData = albumsData.find(a => a.id === cover.albumId)
    
    if (albumData) {
      await supabase.from('albums').insert({
        title: albumData.title,
        location: albumData.location,
        continent: cover.continent,
        year: cover.year,
        description: albumData.description,
        cover_image: cover.url,
        photo_count: albumData.photoCount,
        display_order: i + 1,
      })
    }
  }

  // 2. Insert photos for each album
  for (const album of albumsData) {
    for (let i = 0; i < album.photos.length; i++) {
      const photo = album.photos[i]
      await supabase.from('photos').insert({
        album_id: album.id,
        image_url: photo.url,
        caption_en: photo.caption?.split(' / ')[1] || '',
        caption_zh: photo.caption?.split(' / ')[0] || '',
        display_order: i + 1,
      })
    }
  }
  
  console.log('Migration complete!')
}

migrate()
```


---

## 7. Acceptance Criteria

### 7.1 Security & Authentication

| ID | Criteria | Status |
|----|----------|--------|
| AC-SEC-01 | Admin login page accessible at `/admin/login` | ⬜ |
| AC-SEC-02 | Login form validates email and password (min 8 chars) | ⬜ |
| AC-SEC-03 | Invalid credentials show error message | ⬜ |
| AC-SEC-04 | Successful login redirects to `/admin/dashboard` | ⬜ |
| AC-SEC-05 | Unauthenticated access to `/admin/*` redirects to login | ⬜ |
| AC-SEC-06 | Authenticated user can logout from header | ⬜ |
| AC-SEC-07 | Public website has no admin controls visible | ⬜ |
| AC-SEC-08 | Database enforces read-only for public, write for authenticated | ⬜ |

### 7.2 Album Management

| ID | Criteria | Status |
|----|----------|--------|
| AC-ALB-01 | "Create Album" button opens form with all required fields | ⬜ |
| AC-ALB-02 | Continent dropdown shows all 7 continents | ⬜ |
| AC-ALB-03 | Cover image upload shows preview before submission | ⬜ |
| AC-ALB-04 | Form validation prevents submission with missing required fields | ⬜ |
| AC-ALB-05 | New album appears in album list immediately after creation | ⬜ |
| AC-ALB-06 | Edit button opens pre-filled form with existing data | ⬜ |
| AC-ALB-07 | Album updates reflect on public portfolio within 2 seconds | ⬜ |
| AC-ALB-08 | Delete button shows confirmation dialog | ⬜ |
| AC-ALB-09 | Deleting album removes all photos and storage files | ⬜ |
| AC-ALB-10 | Move Up/Down buttons reorder albums on portfolio page | ⬜ |


### 7.3 Photo Management

| ID | Criteria | Status |
|----|----------|--------|
| AC-PHO-01 | Photo upload area supports drag-and-drop | ⬜ |
| AC-PHO-02 | Can select and upload multiple photos at once | ⬜ |
| AC-PHO-03 | Upload progress shown for each file | ⬜ |
| AC-PHO-04 | Invalid file types (not JPG/PNG/WebP) show error | ⬜ |
| AC-PHO-05 | Files over 10MB show error message | ⬜ |
| AC-PHO-06 | Uploaded photos appear in grid with thumbnails | ⬜ |
| AC-PHO-07 | Edit button opens caption form with bilingual fields | ⬜ |
| AC-PHO-08 | Caption changes save to database immediately | ⬜ |
| AC-PHO-09 | "Save & Next" button moves to next photo in sequence | ⬜ |
| AC-PHO-10 | Move Up/Down buttons reorder photos correctly | ⬜ |
| AC-PHO-11 | Delete button removes photo from database and storage | ⬜ |
| AC-PHO-12 | Album photo_count updates automatically after add/delete | ⬜ |

### 7.4 User Experience

| ID | Criteria | Status |
|----|----------|--------|
| AC-UX-01 | Dashboard shows total albums, photos, and storage used | ⬜ |
| AC-UX-02 | Album list can be filtered by continent | ⬜ |
| AC-UX-03 | Album list can be sorted by order/year/title | ⬜ |
| AC-UX-04 | All forms show loading state during submission | ⬜ |
| AC-UX-05 | Success/error messages appear after all actions | ⬜ |
| AC-UX-06 | Breadcrumb navigation shows current location | ⬜ |
| AC-UX-07 | Responsive design works on tablet and mobile | ⬜ |
| AC-UX-08 | All buttons have clear, descriptive labels | ⬜ |

### 7.5 Data Integrity

| ID | Criteria | Status |
|----|----------|--------|
| AC-DATA-01 | Albums maintain unique display_order values | ⬜ |
| AC-DATA-02 | Photos within album maintain unique display_order | ⬜ |
| AC-DATA-03 | Deleting album cascades to delete all photos | ⬜ |
| AC-DATA-04 | Image files deleted from storage when records deleted | ⬜ |
| AC-DATA-05 | Bilingual fields correctly store UTF-8 Chinese characters | ⬜ |
| AC-DATA-06 | Public website displays data exactly as entered in admin | ⬜ |

---

## 8. Development Phases

### Phase 1: Foundation (Week 1)
- ✅ Set up Supabase project
- ✅ Create database schema and tables
- ✅ Configure Row Level Security policies
- ✅ Create storage buckets with policies
- ✅ Install Supabase SDK in Vue project
- ✅ Create admin user account
- ✅ Build authentication composable
- ✅ Build service layer (albumService, photoService)

### Phase 2: Authentication & Navigation (Week 1-2)
- ⬜ Build admin login page
- ⬜ Implement router guards for protected routes
- ⬜ Create admin layout with header and navigation
- ⬜ Build logout functionality
- ⬜ Test authentication flow end-to-end

### Phase 3: Album Management (Week 2)
- ⬜ Build dashboard home page with statistics
- ⬜ Build album list view
- ⬜ Create album creation form
- ⬜ Implement album editing
- ⬜ Implement album deletion with confirmation
- ⬜ Add album reordering (Move Up/Down)
- ⬜ Test all album CRUD operations

### Phase 4: Photo Management (Week 3)
- ⬜ Build photo upload component (drag-and-drop)
- ⬜ Implement multi-file upload with progress
- ⬜ Create photo grid display
- ⬜ Build photo caption editor (modal/inline)
- ⬜ Implement photo reordering
- ⬜ Implement photo deletion
- ⬜ Test photo operations end-to-end

### Phase 5: Public Website Integration (Week 3-4)
- ⬜ Update PortfolioView to fetch from Supabase
- ⬜ Update AlbumDetailView to fetch from Supabase
- ⬜ Migrate existing JSON data to Supabase
- ⬜ Remove old JSON files
- ⬜ Test real-time updates (admin change → public update)
- ⬜ Verify bilingual content displays correctly

### Phase 6: Polish & Testing (Week 4)
- ⬜ Add loading states to all async operations
- ⬜ Implement error handling and user-friendly messages
- ⬜ Add form validation with clear error messages
- ⬜ Test on mobile/tablet devices
- ⬜ Optimize image loading (lazy load, placeholders)
- ⬜ Security audit (test RLS policies)
- ⬜ Performance testing (large album with 250+ photos)
- ⬜ User acceptance testing with website owner

---

## 9. Future Enhancements (Post-MVP)

### 9.1 Advanced Features
- **Image Editing:** Crop, rotate, adjust brightness/contrast before upload
- **Bulk Operations:** Select multiple photos to delete/reorder at once
- **Advanced Search:** Search albums and photos by keywords
- **Photo Tags:** Add tags (landscape, people, food) for better organization
- **Analytics:** Track which albums/photos get most views
- **SEO Management:** Edit meta titles and descriptions per album

### 9.2 Content Features
- **About/Contact CMS:** Edit About and Contact page content from admin
- **Homepage Management:** Control splash screen image and text
- **Multiple Admin Users:** Invite collaborators with different permission levels
- **Activity Log:** View history of all changes made in admin

### 9.3 Technical Improvements
- **Image Optimization:** Automatic image compression and WebP conversion
- **CDN Integration:** Cloudflare or ImageKit for faster global delivery
- **Offline Support:** Service worker for offline admin access
- **Backup System:** Automatic daily backups of database and images
- **API Webhooks:** Trigger actions when content changes (e.g., notify social media)

---

## 10. User Guide (For Non-Technical Owner)

### 10.1 How to Login
1. Open browser and go to: `https://your-website.com/admin/login`
2. Enter your email and password
3. Check "Remember me" if using personal device
4. Click "Login"
5. You're now in the admin dashboard!

### 10.2 How to Create a New Album
1. From dashboard, click "➕ Create New Album"
2. Fill in the form:
   - **Album Title (English):** "Kyoto Temples" (required)
   - **Album Title (繁體中文):** "京都寺廟" (optional)
   - **Location:** "Kyoto" (required)
   - **Continent:** Select "Asia" from dropdown (required)
   - **Year:** 2023 (required)
   - **Description (English):** Brief description (optional)
   - **Description (繁體中文):** 簡短描述 (optional)
   - **Cover Image:** Drag your best photo here or click to browse (required)
3. Click "Create Album"
4. You'll be taken to the photo upload page


### 10.3 How to Upload Photos
1. From "Manage Albums" page, click "📸 Photos" on any album
2. In the upload area:
   - **Option 1:** Drag multiple photos from your computer and drop them in the box
   - **Option 2:** Click the box to browse and select photos
3. Wait for all photos to finish uploading (you'll see progress bars)
4. Photos will appear in a grid at the bottom

### 10.4 How to Add Photo Captions
1. Find the photo you want to caption in the grid
2. Click the "✏️ Edit" button on that photo
3. A form will pop up with the photo preview
4. Fill in:
   - **Caption (English):** "Golden Pavilion at sunset"
   - **Caption (繁體中文):** "金閣寺的夕陽"
   - **Description (English):** Longer story (optional)
   - **Description (繁體中文):** 更長的描述 (optional)
5. Click "Save & Close" or "Save & Next Photo →" to continue to the next one

### 10.5 How to Reorder Photos
1. In the photo grid, each photo has number (#1, #2, #3...)
2. To move a photo up (make it appear earlier): Click the ⬆️ button
3. To move a photo down (make it appear later): Click the ⬇️ button
4. The order changes immediately on your public website

### 10.6 How to Delete a Photo
1. Find the photo you want to delete
2. Click the "🗑️ Delete" button
3. Confirm you want to delete it
4. The photo disappears from both admin and public website

### 10.7 How to Edit an Album
1. Go to "Manage Albums"
2. Find the album you want to edit
3. Click the "✏️ Edit" button
4. The form opens with all current information filled in
5. Change whatever you want (title, year, cover image, etc.)
6. Click "Save Changes"
7. Changes appear on the public website immediately

### 10.8 How to Delete an Album
1. Go to "Manage Albums"
2. Find the album you want to delete
3. Click the "🗑️ Delete" button
4. **WARNING:** This will delete the album AND all its photos permanently!
5. Type the album title to confirm
6. Click "Yes, Delete Album"
7. The album and all photos are gone forever

### 10.9 How to Change Album Order on Homepage
1. Go to "Manage Albums"
2. Albums are listed in the order they appear on your homepage
3. To feature an album higher: Click ⬆️ until it's in position 1
4. To move an album lower: Click ⬇️
5. The homepage order updates immediately

### 10.10 How to Logout
1. Look at the top right corner of the admin dashboard
2. Click "Logout"
3. You'll be returned to the login page
4. Your session is ended securely

---

## 11. Troubleshooting & FAQ

### Q1: I forgot my password. How do I reset it?
**A:** On the login page, click "Forgot password?" Enter your email, and Supabase will send you a reset link. Check your spam folder if you don't see it within 5 minutes.

### Q2: My photo upload is stuck at 50%. What do I do?
**A:** 
- Check your internet connection
- Make sure the file is under 10MB
- Try refreshing the page and uploading again
- If it keeps failing, the file might be corrupted - try a different photo

### Q3: I changed an album title but it's not showing on the website.
**A:** 
- Wait 5 seconds and refresh the public page
- Check that you clicked "Save Changes" and saw a success message
- Clear your browser cache (Ctrl/Cmd + Shift + R)
- If still not working, logout and login again

### Q4: Can I upload videos?
**A:** No, the system only supports photos (JPG, PNG, WebP formats). Video support may be added in the future.

### Q5: How many photos can I upload to one album?
**A:** You can upload up to 500 photos per album. The free Supabase plan supports 1GB total storage (approximately 1000-2000 photos depending on size).

### Q6: I accidentally deleted an album. Can I recover it?
**A:** No, deletions are permanent and cannot be undone. Always double-check before confirming deletion. Consider implementing a backup system (future enhancement).

### Q7: The admin page looks broken on my phone.
**A:** The admin dashboard is optimized for desktop/tablet use. While it works on mobile, managing albums is much easier on a larger screen. Use a computer or tablet when possible.

### Q8: Can someone else help me manage the website?
**A:** Currently, only one admin account is supported. Multiple admin users with different permission levels is planned as a future enhancement.

### Q9: How do I check how much storage I've used?
**A:** Go to the Dashboard home page. At the top, you'll see "Storage Used: X MB / 1000 MB". When you reach 80% (800MB), consider upgrading Supabase plan or deleting old albums.

### Q10: My photos look pixelated on the website.
**A:** Always upload high-resolution photos (at least 1920px width). The system doesn't enlarge small photos. If photos are already uploaded, delete them and re-upload higher quality versions.

---

## 12. Technical Support

**For the Developer:**

- **Supabase Dashboard:** https://app.supabase.com
- **Supabase Docs:** https://supabase.com/docs
- **Vue 3 Docs:** https://vuejs.org
- **Project GitHub:** [Your repository URL]

**For the Website Owner:**

If something isn't working as expected:
1. Take a screenshot of the issue
2. Note what you were trying to do
3. Note any error messages you see
4. Email your developer with this information

**Common Technical Issues:**

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| 401 Unauthorized errors | Session expired | Logout and login again |
| 413 Payload Too Large | File over 10MB | Compress image before upload |
| Network error during upload | Internet interrupted | Check connection, retry upload |
| Can't login | Wrong password | Use password reset link |
| Photos not appearing | Upload failed silently | Check browser console for errors |

---

## 13. Cost Estimate

### Supabase Free Tier (Sufficient for MVP)
- **Database:** 500MB PostgreSQL
- **Storage:** 1GB file storage
- **Bandwidth:** 2GB egress per month
- **Cost:** $0/month
- **Limitations:** 
  - Pauses after 7 days of inactivity (resumes on first request)
  - 2GB bandwidth might be exceeded if site goes viral

### Supabase Pro Tier (Recommended for production)
- **Database:** 8GB PostgreSQL
- **Storage:** 100GB file storage
- **Bandwidth:** 50GB egress per month
- **Cost:** $25/month
- **Benefits:**
  - No auto-pause
  - Daily backups
  - Priority support
  - Custom domain for admin
  - Higher rate limits

### Domain & Hosting
- **Domain:** $10-15/year (e.g., yourname.com)
- **Vercel/Netlify Hosting:** Free for static sites
- **Total:** ~$10-15/year + optional $25/month for Supabase Pro

---

## 14. Conclusion

This specification provides a complete roadmap for building a secure, user-friendly Admin Dashboard for your travel photography website. The system allows you to:

✅ **Manage all content visually** without touching code  
✅ **Upload and organize photos** with drag-and-drop ease  
✅ **Add bilingual captions** in English and Traditional Chinese  
✅ **Control display order** of albums and photos  
✅ **Maintain security** with password protection  
✅ **See changes instantly** on the public website  

**Key Benefits:**
- **Zero coding required** for day-to-day content management
- **Secure by default** with Supabase Row Level Security
- **Scalable** from 10 albums to 1000+ photos
- **Cost-effective** starting at $0/month
- **Easy to maintain** with visual interface

**Next Steps:**
1. Review this specification
2. Set up Supabase account and create project
3. Follow development phases to build the system
4. Test thoroughly with real content
5. Train the website owner on how to use admin dashboard
6. Go live and enjoy effortless content management!

---

**Document Version:** 1.0  
**Last Updated:** July 1, 2026  
**Status:** Ready for Implementation ✅
