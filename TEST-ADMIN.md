# 🧪 Test Admin QR Generation - 3 Minutes

## Quick Test Flow

### 1️⃣ Access Admin Panel (30 sec)

Visit: `http://localhost:3000/admin/dashboard`

You should see:
- ✅ Admin header with "Cafe Admin"
- ✅ Sidebar navigation
- ✅ Dashboard cards
- ✅ Quick start guide

### 2️⃣ Create Tables (1 min)

1. Click **"Tables & QR Codes"**
2. Click **"Add Table"** (top right)
3. Create 3 tables:
   - Type: `T1` → Create
   - Type: `T2` → Create  
   - Type: `VIP Room` → Create

You should see:
- ✅ 3 table cards in grid
- ✅ Each shows table name
- ✅ Green "Active" badge
- ✅ Token displayed (truncated)

### 3️⃣ Generate QR Code (1 min)

1. Click **"View QR"** on T1 card
2. Wait for QR code to generate

You should see:
- ✅ Modal with QR code preview
- ✅ Large QR code image (400x400)
- ✅ Full URL below QR code
- ✅ Download and Print buttons

### 4️⃣ Test Download (30 sec)

1. Click **"Download PNG"**
2. Check your Downloads folder

You should have:
- ✅ File named `QR-T1.png`
- ✅ Image opens correctly
- ✅ QR code is clear and readable

### 5️⃣ Test Print Preview (30 sec)

1. Click **"Print"** button
2. New window opens with print layout

You should see:
- ✅ Table name (T1) at top
- ✅ "Scan to Order" in English
- ✅ "ស្កេនដើម្បីកុម្ម៉ង់" in Khmer
- ✅ Large centered QR code
- ✅ Clean print-friendly layout

Close print preview without printing.

### 6️⃣ Test QR Code Scanning (1 min)

**Option A: Use Phone Camera**
1. Open QR-T1.png on computer screen
2. Point phone camera at QR code
3. Tap notification that appears

**Option B: Manual Test**
1. Close QR modal
2. Look at URL in T1 card token
3. Manually visit: `http://localhost:3000/?table=T1&token={the-token}`

You should:
- ✅ Land on customer welcome page
- ✅ See "សូមស្វាគមន៍" (Welcome)
- ✅ See "ចាប់ផ្តើមកុម្ម៉ង់" button
- ✅ Table name shows "តុ T1" in header

### 7️⃣ Test Token Regeneration (1 min)

1. Go back to admin tables page
2. Note the current token for T2
3. Click **🔄 Regenerate** button on T2
4. Confirm the warning

You should see:
- ✅ Token changed to new random string
- ✅ Different from old token

**Test Old QR Stops Working:**
1. Try visiting old URL with old token
2. Should not work (table not found or invalid token)

### 8️⃣ Test Delete (30 sec)

1. Click **🗑️ Delete** button on VIP Room
2. Confirm deletion

You should see:
- ✅ VIP Room card removed from grid
- ✅ Only T1 and T2 remain

---

## Expected Results Summary

After testing, you should have:

✅ Admin dashboard accessible  
✅ Created 3 tables  
✅ Generated QR code successfully  
✅ Downloaded QR as PNG  
✅ Viewed print preview  
✅ QR code scans and redirects correctly  
✅ Regenerated token works  
✅ Old token invalidated  
✅ Deleted table successfully  

---

## Common Issues

### 🔴 QR Code Not Generating

**Symptoms:** Modal shows "Generating..." forever

**Fixes:**
```bash
# Check qrcode package installed
npm list qrcode

# If missing:
npm install qrcode @types/qrcode
```

### 🔴 Download Button Does Nothing

**Cause:** Browser blocked download

**Fix:**
- Check browser console for errors
- Allow downloads from localhost
- Try different browser

### 🔴 Print Opens Blank Page

**Cause:** QR data URL not loaded

**Fix:**
- Wait for QR to fully generate before printing
- Check browser console for errors
- Try refreshing admin page

### 🔴 QR Scans to Wrong URL

**Cause:** NEXT_PUBLIC_SITE_URL incorrect

**Fix in `.env.local`:**
```env
# For local testing:
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For production:
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Restart dev server after changing!

### 🔴 "Table not found" After Scan

**Cause:** Token mismatch

**Fix:**
1. Go to Supabase Table Editor
2. Check `tables` table
3. Verify token matches QR URL
4. Or regenerate QR code

---

## Database Verification

### Check Tables Created

In Supabase SQL Editor:
```sql
SELECT * FROM tables ORDER BY created_at DESC;
```

Should show:
- T1, T2 (VIP Room deleted)
- Each with unique token
- active = true

### Manually Create Test Tables

If needed:
```sql
INSERT INTO tables (number, token, active) VALUES
  ('TEST1', 'manual-token-123', true);
```

Then refresh admin page.

---

## Production Checklist

Before going live:

- [ ] Set correct `NEXT_PUBLIC_SITE_URL` in production
- [ ] Use HTTPS for production URL
- [ ] Test QR codes scan on various phone models
- [ ] Print QR codes on quality paper
- [ ] Laminate or protect QR codes
- [ ] Test in actual restaurant lighting
- [ ] Train staff on regenerating QR if needed
- [ ] Keep backup of table tokens

---

## Next Test: Full Customer Journey

1. **Scan QR** with real phone
2. **Browse menu** (should show 8 items)
3. **Add to cart** (3+ items)
4. **Submit order**
5. **Track order** on phone
6. **Update status** in Supabase
7. **See real-time update** on phone

See `QUICK-START.md` for customer flow testing.

---

**Admin QR System:** ✅ Working  
**Ready for Production:** After print quality testing  
**Time to Test:** ~3 minutes  
**Complexity:** Low ⭐
