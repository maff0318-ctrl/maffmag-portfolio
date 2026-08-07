# Cloudflare R2 Setup Guide - Zero Egress Cost Architecture

## 🎯 Cost Savings Overview

### Current Supabase Storage Costs
- **Storage**: $0.021 per GB/month
- **Bandwidth**: $0.09 per GB (egress)
- **Example**: 100 albums × 200 photos × 2MB = 40GB storage + heavy bandwidth costs

### With Cloudflare R2
- **Storage**: $0.015 per GB/month (10GB free)
- **Bandwidth**: **$0** (zero egress fees!)
- **Savings**: ~85% cost reduction + unlimited free downloads

---

## 📦 Step 1: Create Cloudflare R2 Bucket

### 1.1 Sign Up / Log In to Cloudflare
1. Go to https://dash.cloudflare.com
2. Navigate to **R2** in the left sidebar
3. Click **Create bucket**

### 1.2 Bucket Configuration
```
Bucket Name: travel-portfolio-images
Region: Automatic (closest to your users)
```

### 1.3 Get R2 Access Credentials
1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Permissions:
   - **Object Read & Write**
   - Select your bucket: `travel-portfolio-images`
4. Copy and save:
   - **Access Key ID**
   - **Secret Access Key**
   - **Bucket Endpoint URL** (looks like: `https://abc123.r2.cloudflarestorage.com`)

### 1.4 Enable Public Access (Optional)
For public image viewing without authentication:
1. Go to your bucket → **Settings**
2. Enable **Public Access**
3. Set custom domain (recommended): `images.yourdomain.com`
4. Or use R2.dev subdomain: `travel-portfolio-images.r2.dev`

---

## 🔧 Step 2: Environment Variables

Add these to your `.env` file:

```env
# Cloudflare R2 Configuration
VITE_R2_ACCOUNT_ID=your-account-id
VITE_R2_ACCESS_KEY_ID=your-access-key-id
VITE_R2_SECRET_ACCESS_KEY=your-secret-access-key
VITE_R2_BUCKET_NAME=travel-portfolio-images
VITE_R2_BUCKET_ENDPOINT=https://abc123.r2.cloudflarestorage.com
VITE_R2_PUBLIC_URL=https://travel-portfolio-images.r2.dev

# Or with custom domain:
# VITE_R2_PUBLIC_URL=https://images.yourdomain.com
```

---

## 📐 Image Variants Strategy

### Variant Sizes
```javascript
{
  thumbnail: {
    width: 400,
    quality: 80,
    format: 'webp'
  },
  medium: {
    width: 800,
    quality: 85,
    format: 'webp'
  },
  large: {
    width: 1920,
    quality: 90,
    format: 'webp'
  },
  original: {
    // Stored as backup
    format: 'original'
  }
}
```

### File Naming Convention
```
albums/
  {album-id}/
    {photo-id}-thumbnail.webp    (400px)
    {photo-id}-medium.webp        (800px)
    {photo-id}-large.webp         (1920px)
    {photo-id}-original.jpg       (original backup)
```

---

## 💰 Cost Comparison (Real Example)

### Scenario: 50 Albums × 150 Photos Each = 7,500 Photos

**Supabase Storage Only:**
```
Storage: 7,500 photos × 2MB avg = 15GB
  → 15GB × $0.021/GB = $0.32/month

Bandwidth: 10,000 views/month × 15GB
  → 150GB × $0.09/GB = $13.50/month

Total: $13.82/month = $165.84/year
```

**Cloudflare R2 + Image Optimization:**
```
Storage: 7,500 photos × 3 variants × 0.3MB avg = 6.75GB
  → Free (under 10GB tier)
  → Or $0.10/month if >10GB

Bandwidth: Unlimited views × any GB
  → $0 (zero egress!)

Total: $0-$1.20/month = $0-$14.40/year
```

**Savings: ~$150/year (90%+ reduction)**

---

## 🚀 Migration Strategy

### Option A: Gradual Migration (Recommended)
1. New uploads go to R2 automatically
2. Old Supabase images remain (dual system)
3. Migrate old images in batches over time
4. Delete from Supabase after verification

### Option B: Full Migration
1. Download all images from Supabase
2. Process through optimization pipeline
3. Upload to R2 in organized folders
4. Update database URLs
5. Verify all images load correctly
6. Delete from Supabase storage

---

## 🔒 Security Best Practices

### 1. Separate Buckets
```
travel-portfolio-images-public   → Public access (compressed photos)
travel-portfolio-images-private  → Admin only (originals, backups)
```

### 2. CORS Configuration
For R2 bucket, add CORS rules:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:5173"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. Signed URLs (Optional)
For time-limited access to private photos:
```javascript
// Generate expiring URL (24 hours)
const signedUrl = await generateSignedUrl(photoPath, 86400)
```

---

## 📊 Monitoring & Analytics

### Track These Metrics:
- **Storage Usage**: R2 Dashboard → Storage
- **Request Count**: R2 Dashboard → Requests
- **Bandwidth**: Always $0, but track volume
- **Cost**: Set up Cloudflare billing alerts at $1, $5, $10

### Optimization Targets:
- Keep under 10GB for free tier
- Average file size: < 300KB per variant
- Total variants: 3 per photo (thumb, medium, large)

---

## 🎯 Next Steps

1. ✅ Create R2 bucket
2. ✅ Get API credentials
3. ✅ Add to `.env` file
4. ✅ Test connection with provided code
5. ✅ Upload first test image
6. ✅ Verify public access works
7. ✅ Integrate with admin panel

---

## 🆘 Troubleshooting

### Images Not Loading
- Check `VITE_R2_PUBLIC_URL` is correct
- Verify bucket has public access enabled
- Test URL directly in browser
- Check CORS configuration

### Upload Fails
- Verify access key credentials
- Check bucket name spelling
- Ensure bucket exists
- Review R2 API logs in dashboard

### High Costs
- Monitor storage dashboard
- Check for duplicate uploads
- Review image sizes (should be <500KB)
- Implement automatic cleanup of old variants

---

## 📚 Additional Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [AWS S3 SDK for R2](https://developers.cloudflare.com/r2/api/s3/)

Your zero-egress architecture is ready! 🎉
