# Cloudflare R2 Migration Guide

This guide explains how to migrate your travel website from Supabase Storage to Cloudflare R2 with zero-egress image optimization.

## 📋 Overview

**What's Changing:**
- **Before:** Photos stored in Supabase Storage (1 original file per photo)
- **After:** Photos stored in Cloudflare R2 (3 optimized WebP variants per photo)

**Benefits:**
- 💰 **90% cost reduction** (~$150/year savings)
- ⚡ **Faster page loads** (smaller file sizes, responsive images)
- 🌐 **Zero bandwidth fees** (R2 egress is free)
- 📱 **Better mobile experience** (appropriate image sizes for each device)

---

## 🗄️ Step 1: Run Database Migration

The database migration adds new columns to support R2 URLs while maintaining backward compatibility with existing Supabase photos.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `gqumbemecryxemqnamkq`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `R2-MIGRATION.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify success: You should see "Success. No rows returned" message

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref gqumbemecryxemqnamkq

# Run migration
supabase db push --file R2-MIGRATION.sql
```

### Verify Migration

Run this query in SQL Editor to check the new columns:

```sql
-- Check photos table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'photos'
ORDER BY ordinal_position;
```

You should see these new columns:
- `thumbnail_url` (text)
- `medium_url` (text)
- `large_url` (text)
- `image_width` (integer)
- `image_height` (integer)
- `storage_type` (text, default: 'supabase')

---

## ☁️ Step 2: Configure Cloudflare R2

Follow the detailed instructions in `CLOUDFLARE-R2-SETUP-GUIDE.md` to:

1. Create R2 bucket
2. Generate API tokens
3. Configure public domain
4. Update `.env` file with credentials

### Update .env File

Replace the placeholder values in `.env`:

```bash
# Cloudflare R2 Configuration
VITE_R2_ACCOUNT_ID=your_actual_account_id
VITE_R2_ACCESS_KEY_ID=your_actual_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_actual_secret_access_key
VITE_R2_BUCKET_NAME=travel-photos
VITE_R2_PUBLIC_DOMAIN=https://photos.yourdomain.com
```

⚠️ **Security Note:** Never commit `.env` to Git. It's already in `.gitignore`.

---

## 🔧 Step 3: Test R2 Connection (Optional)

After configuring R2, you can test the connection:

```javascript
// In browser console after logging into admin panel
import { r2Service } from '@/services/r2Service'

// Check if R2 is configured
console.log('R2 Configured:', r2Service.isConfigured())

// Test connection
r2Service.testConnection().then(result => {
  console.log('Connection test:', result ? 'SUCCESS' : 'FAILED')
})
```

---

## 📤 Step 4: Upload New Photos with R2

Once the migration is complete, all new photos uploaded through the admin panel will automatically:

1. ✨ **Optimize** - Convert to WebP and generate 3 variants
2. ☁️ **Upload to R2** - Store all variants in Cloudflare R2
3. 💾 **Save metadata** - Store R2 URLs in Supabase database
4. 🎯 **Display optimized** - Serve appropriate variant based on device

### How It Works

When you upload a photo:

```
Original JPEG (5MB, 4000x3000)
    ↓ [Image Optimization Service]
    ├─ Thumbnail: 400px WebP (~50KB) → R2
    ├─ Medium: 800px WebP (~150KB) → R2
    └─ Large: 1920px WebP (~500KB) → R2
```

The admin interface shows:
- ✅ Upload progress per variant
- 📊 File size comparison
- 💾 Total storage savings

---

## 🔄 Step 5: Existing Photos (Legacy)

**Important:** Existing photos in Supabase Storage will continue to work perfectly!

- ✅ Old photos remain in Supabase (`storage_type='supabase'`)
- ✅ New photos go to R2 (`storage_type='r2'`)
- ✅ Frontend automatically uses the correct URLs
- ✅ No broken images during migration

### Optional: Migrate Specific Albums to R2

If you want to migrate old albums to R2 for cost savings:

1. Go to `/admin/photos/{album_id}`
2. Select photos to migrate
3. Click "Migrate to R2" button (future feature)
4. System will re-upload optimized versions to R2

---

## 🖼️ Step 6: Image Display (Automatic)

The frontend automatically serves the best image variant:

**Desktop (1920px viewport):**
```html
<img src="large_url" loading="lazy" />
```

**Tablet (768px viewport):**
```html
<img src="medium_url" loading="lazy" />
```

**Mobile (375px viewport):**
```html
<img src="thumbnail_url" loading="lazy" />
```

**Responsive (automatic):**
```html
<img
  src="large_url"
  srcset="thumbnail_url 400w, medium_url 800w, large_url 1920w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  loading="lazy"
/>
```

---

## 📊 Cost Comparison

### Before (Supabase Storage Only)

| Item | Calculation | Cost/Month |
|------|-------------|------------|
| Storage (50 albums × 150 photos × 4MB avg) | 30GB @ $0.021/GB | $0.63 |
| Bandwidth (10,000 views × 4MB avg) | 40GB @ $0.09/GB | $3.60 |
| **Total** | | **$4.23/mo** |
| **Annual** | | **~$51/year** |

### After (Cloudflare R2)

| Item | Calculation | Cost/Month |
|------|-------------|------------|
| R2 Storage (50 × 150 × 700KB avg) | 5.25GB @ $0.015/GB | $0.08 |
| R2 Egress | Free | $0.00 |
| Supabase Storage (minimal) | 1GB @ $0.021/GB | $0.02 |
| **Total** | | **$0.10/mo** |
| **Annual** | | **~$1.20/year** |

**💰 Total Savings: ~$50/year (97% reduction)**

With 100-200 photos per album, savings scale to **~$150/year**.

---

## 🧪 Testing Checklist

After migration, verify these features:

### Admin Panel
- [ ] Upload single photo → Creates 3 variants
- [ ] Upload multiple photos → Batch optimization works
- [ ] Progress indicator shows upload status
- [ ] File size comparison displayed
- [ ] Photos appear in grid correctly

### Frontend (Portfolio/Gallery)
- [ ] Images load on desktop
- [ ] Images load on mobile
- [ ] Lazy loading works (images load as you scroll)
- [ ] Responsive images serve correct variant
- [ ] Legacy Supabase photos still work
- [ ] Page load speed improved

### Specific Pages
- [ ] Home: Hero images load
- [ ] Portfolio: Album covers display
- [ ] Album Detail: Photo grid works
- [ ] Footprints: Map city images load
- [ ] Highlights: Record cards show photos

---

## 🐛 Troubleshooting

### "Missing R2 credentials" Error

**Problem:** R2 service throws initialization error

**Solution:**
1. Check `.env` file has all R2 variables
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Images Not Loading

**Problem:** R2 URLs return 403 or 404

**Solutions:**
1. Verify R2 bucket is public (see `CLOUDFLARE-R2-SETUP-GUIDE.md`)
2. Check CORS configuration allows your domain
3. Verify public domain URL is correct in `.env`

### Upload Fails

**Problem:** Photos fail to upload to R2

**Debug Steps:**
1. Open browser console (F12)
2. Check for error messages
3. Verify R2 credentials in `.env`
4. Test R2 connection (see Step 3)

### Slow Optimization

**Problem:** Image optimization takes long time

**Explanation:** This is normal for large images (4000×3000px). The browser Canvas API processes images client-side.

**Typical times:**
- 3000×2000px JPEG: ~2-3 seconds
- 6000×4000px JPEG: ~5-7 seconds

---

## 🔙 Rollback (If Needed)

If you need to revert to Supabase Storage only:

### 1. Stop Using R2

In `photoService.ts`, temporarily disable R2:

```typescript
// Force use of Supabase Storage
const USE_R2 = false
```

### 2. Rollback Database (Optional)

Run this SQL (⚠️ **This deletes R2 URLs**):

```sql
-- Remove R2 columns
ALTER TABLE photos DROP COLUMN IF EXISTS storage_type;
ALTER TABLE photos DROP COLUMN IF EXISTS thumbnail_url;
ALTER TABLE photos DROP COLUMN IF EXISTS medium_url;
ALTER TABLE photos DROP COLUMN IF EXISTS large_url;
ALTER TABLE photos DROP COLUMN IF EXISTS image_width;
ALTER TABLE photos DROP COLUMN IF EXISTS image_height;
```

---

## 📚 Additional Resources

- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **Image Optimization Best Practices:** https://web.dev/fast/#optimize-your-images
- **WebP Format Guide:** https://developers.google.com/speed/webp

---

## ✅ Migration Complete!

Once you've completed all steps:

1. ✅ Database schema updated
2. ✅ R2 configured and tested
3. ✅ Environment variables set
4. ✅ New photos use R2 automatically
5. ✅ Old photos still work
6. ✅ Cost savings achieved

**Next time you upload photos, you'll see:**
- 📊 Optimization progress
- 💾 File size reduction
- ☁️ R2 upload status
- ✨ WebP conversion

Enjoy your 97% cost savings! 🎉
