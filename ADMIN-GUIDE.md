# 🔧 Admin Guide - QR Code Generation

## What's Built

The admin panel now includes **Table & QR Code Management** - the first essential feature for getting your cafe QR ordering system running.

## Features Implemented

### ✅ Admin Dashboard (`/admin/dashboard`)
- Landing page with quick access to all admin features
- Visual cards for navigation
- Quick start guide

### ✅ Tables & QR Code Management (`/admin/tables`)
- **Create Tables:** Add new tables with custom names (T1, Table 5, VIP-A, etc.)
- **View QR Codes:** Generate and preview QR codes for each table
- **Download QR:** Save QR codes as PNG images
- **Print QR:** Print-optimized QR code layout with table name
- **Regenerate Token:** Create new QR code if security is compromised
- **Delete Tables:** Remove tables that are no longer needed

### 🚧 Coming Soon
- Menu Management (CRUD operations)
- Kitchen Display System (real-time order queue)
- Analytics Dashboard

---

## How to Use

### Step 1: Access Admin Panel

Visit: `http://localhost:3000/admin/dashboard`

### Step 2: Create Your First Table

1. Click **"Tables & QR Codes"** from the dashboard
2. Click **"Add Table"** button (top right)
3. Enter table name/number (e.g., `T1`, `Table 5`, `VIP Room`)
4. Click **"Create Table"**

The system automatically:
- Generates a unique security token
- Creates the table entry in database
- Makes it ready for QR code generation

### Step 3: Generate QR Code

1. Find your table in the grid
2. Click **"View QR"** button
3. See the QR code preview

The QR code contains:
```
https://your-domain.com/?table=T1&token=abc123xyz
```

### Step 4: Download or Print

**Option A: Download**
- Click **"Download PNG"**
- Save the image
- Use in digital signage, menus, or social media

**Option B: Print**
- Click **"Print"** button
- System opens print-optimized layout
- Includes table name in English & Khmer
- Print on standard A4/Letter paper

**Print Tips:**
- Use high-quality paper for durability
- Consider laminating for longer life
- Print multiple copies as backup

### Step 5: Place QR Codes

**Physical Placement:**
- Table tents (most common)
- Laminated cards on tables
- Stickers on table surface
- Wall-mounted frames

**Best Practices:**
- Place at eye level when seated
- Ensure good lighting
- Keep clean and unobstructed
- Include simple instructions in Khmer

---

## QR Code Security

### Token System

Each table has a unique token that:
- Prevents unauthorized orders
- Links orders to correct tables
- Can be regenerated if compromised

### When to Regenerate Token

Click the 🔄 (Regenerate) button if:
- QR code is shared publicly by mistake
- Security concern arises
- Want to invalidate old QR codes

⚠️ **Warning:** Old QR codes stop working immediately after regeneration

---

## Table Management

### Table Card Features

Each table displays:
- **Table Name/Number** (large, prominent)
- **Active Status** (green badge)
- **Security Token** (for reference)
- **Action Buttons:**
  - 👁️ View QR - Preview and download
  - 🔄 Regenerate - New security token
  - 🗑️ Delete - Remove table

### Bulk Operations

Create multiple tables quickly:
```
Suggested naming conventions:
- Numbers: T1, T2, T3...
- Descriptive: Window 1, Corner Table, VIP Room
- Sections: A1, A2, B1, B2
```

---

## Technical Details

### QR Code Specs

- **Format:** PNG image
- **Size:** 400x400 pixels
- **Colors:** Amber-900 (#92400E) on white
- **Margin:** 2 modules
- **Error Correction:** Medium level

### Generated URL Structure

```
{SITE_URL}/?table={TABLE_NUMBER}&token={SECURITY_TOKEN}

Example:
https://mycafe.com/?table=T1&token=abc123xyz
```

### Database Schema

```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY,
  number TEXT UNIQUE,      -- Table name/number
  token TEXT UNIQUE,       -- Security token
  active BOOLEAN,          -- Enable/disable table
  created_at TIMESTAMPTZ
);
```

---

## Workflow Integration

### Complete Customer Journey

1. **Customer scans QR** at Table T1
2. **Redirects to:** `/?table=T1&token=abc123xyz`
3. **Landing page** validates token
4. **Customer browses menu** and adds items
5. **Submits order** linked to Table T1
6. **Kitchen receives** order with table number
7. **Staff delivers** to correct table

### Staff Workflow

1. **Setup Phase:** Create tables → Generate QR codes → Print & place
2. **Daily Operations:** Monitor orders in KDS (coming soon)
3. **Maintenance:** Regenerate tokens if needed, add/remove tables

---

## Troubleshooting

### QR Code Not Scanning?

- **Check phone camera** - Most modern phones scan automatically
- **Lighting** - Ensure good lighting
- **Distance** - Hold phone 6-12 inches away
- **Print Quality** - Make sure QR is clear, not pixelated

### QR Code Leads to Wrong Page?

- Verify `NEXT_PUBLIC_SITE_URL` in `.env.local`
- Should match your actual domain
- For testing: `http://localhost:3000`

### "Invalid Token" Error?

- Token may have been regenerated
- Print new QR code from admin panel
- Verify token in database matches QR code

### Can't Delete Table?

- Check if table has active orders
- Clear orders first (manually in database for now)

---

## Print Templates

### Simple Table Tent (Fold A4 in half)

```
┌─────────────────────┐
│                     │
│       Table 1       │
│    តុលេខ ១         │
│                     │
│   [QR CODE HERE]    │
│                     │
│   Scan to Order     │
│   ស្កេនដើម្បីកុម្ម៉ង់  │
│                     │
└─────────────────────┘
```

### Design Tips

- **Bilingual:** Khmer + English
- **Large Text:** Easy to read from table
- **Clear CTA:** "Scan to Order"
- **Branding:** Add cafe logo if desired

---

## Next Steps

### Phase 2A: Menu Management
- Add/edit menu items
- Upload images to R2
- Set prices and categories
- Toggle availability

### Phase 2B: Kitchen Display System
- Real-time order queue
- Status update buttons
- Order completion tracking
- Telegram notifications

### Phase 2C: Analytics
- Daily sales reports
- Popular items
- Peak hours analysis
- Revenue tracking

---

## Testing Your Setup

### Test Checklist

- [ ] Create 3 sample tables (T1, T2, T3)
- [ ] Generate QR code for T1
- [ ] Download QR as PNG
- [ ] Test print function
- [ ] Scan QR with phone
- [ ] Verify redirects to landing page
- [ ] Complete test order
- [ ] Regenerate token for T2
- [ ] Verify old QR doesn't work
- [ ] Delete T3 successfully

### Sample Tables for Testing

Run in Supabase SQL Editor (if not already):
```sql
INSERT INTO tables (number, token, active) VALUES
  ('T1', 'test-token-001', true),
  ('T2', 'test-token-002', true),
  ('T3', 'test-token-003', true)
ON CONFLICT (number) DO NOTHING;
```

---

## FAQ

**Q: How many tables can I create?**
A: Unlimited. Database supports as many as you need.

**Q: Can I customize QR code colors?**
A: Yes, edit `QRPreviewModal` component in `app/(admin)/tables/page.tsx`

**Q: Does the QR code expire?**
A: No, unless you manually regenerate the token.

**Q: Can customers order without scanning?**
A: They can access the site directly, but orders need table assignment.

**Q: What if phone doesn't auto-scan QR?**
A: Download a QR scanner app, or type the URL manually (less convenient).

---

**Status:** Admin QR Generation Complete ✅  
**Next Priority:** Menu Management or Kitchen Display System

Need help? Check `SETUP.md` for environment configuration.
