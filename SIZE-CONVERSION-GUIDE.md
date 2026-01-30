# Size Conversion System Guide

## Overview
The store now supports automatic size conversion between EU, US Men, US Women, and Kids sizes. All sizes are stored in EU format in the database, but customers can shop in their preferred size system.

## Features

### 1. **Admin Size Selection**
- Multi-select button interface for easy size selection
- Separate views for Adult and Kids sizes
- "Select All" and "Clear" quick actions
- Visual feedback showing all selected sizes
- Automatically detects product type (Shoes vs Apparel)

### 2. **Customer Size Conversion**
- Choose between EU, US Men, US Women, or Kids sizing
- Available sizes automatically converted and displayed
- If EU 41 is available, its US equivalents (US 9 Men, US 11 Women) are also shown as available
- Size chart shows all conversions for reference

### 3. **Storage Format**
- All shoe sizes stored as **EU sizes** in the database
- Apparel sizes stored as-is (XS, S, M, L, etc.)
- Conversions happen on-the-fly during display

## Size Conversion Table

### Adult Sizes
| EU | US Men | US Women |
|----|--------|----------|
| 35 | 3      | 5        |
| 36 | 4      | 6        |
| 37 | 5      | 7        |
| 38 | 6      | 8        |
| 39 | 7      | 9        |
| 40 | 8      | 10       |
| 41 | 9      | 11       |
| 42 | 10     | 12       |
| 43 | 11     | 13       |
| 44 | 12     | 14       |
| 45 | 13     | 15       |
| 46 | 14     | 16       |
| 47 | 15     | 17       |
| 48 | 16     | 18       |

### Kids Sizes
| EU    | US Kids |
|-------|---------|
| 24-27 | 7.5-10  |
| 28-31 | 11-13   |
| 32-34 | 1-3     |

## Admin: Adding Products with Sizes

### Step 1: Select Category
Choose the appropriate category. The size picker automatically adjusts:
- **Apparels category** → Shows apparel sizes (XS, S, M, L, XL, etc.)
- **Other categories** → Shows shoe sizes (EU format with Adult/Kids tabs)

### Step 2: Select Sizes

#### For Shoes:
```
1. Click the "Adult" or "Kids" tab
2. Click size buttons to select/deselect
3. Use "Select All" to quickly add all sizes in current view
4. Selected sizes shown at top: "15 sizes selected (35, 36, 37...)"
```

#### For Apparel:
```
1. Click size buttons to select (XS, S, M, L, XL, etc.)
2. Can select multiple sizes
3. Only shows apparel-relevant sizes
```

### Step 3: Save
Sizes are automatically saved in the correct format:
- Shoes: Stored as EU sizes array `["38", "39", "40", "41"]`
- Apparel: Stored as apparel sizes array `["S", "M", "L", "XL"]`

## Customer Shopping Experience

### Viewing Products

When a customer views a shoe product:

1. **Default View (EU)**
   ```
   Product has: EU 38, 39, 40, 41
   Customer sees: EU 38, 39, 40, 41 (all available)
   ```

2. **Switch to US Men**
   ```
   Product has: EU 38, 39, 40, 41
   System converts: 38→6, 39→7, 40→8, 41→9
   Customer sees: US 6, 7, 8, 9 (Men) (all available)
   ```

3. **Switch to US Women**
   ```
   Product has: EU 38, 39, 40, 41
   System converts: 38→8, 39→9, 40→10, 41→11
   Customer sees: US 8, 9, 10, 11 (Women) (all available)
   ```

4. **Switch to Kids**
   ```
   Product has: EU 28, 29, 30
   System converts: 28→11, 29→11.5, 30→12
   Customer sees: US 11, 11.5, 12 (Kids) (all available)
   ```

### Adding to Cart

When customer adds to cart:
1. Select size in their preferred format (e.g., US 9 Men)
2. System converts to EU (9 → 41)
3. Cart stores: `{ size: "41", product: {...} }`
4. Cart displays: "US 9 (Men)" based on customer's selection

## Technical Implementation

### Files

#### `src/lib/sizeConversion.js`
Core conversion logic:
```javascript
// Convert any size to EU
convertToEU(size, type) // "9", "US_MEN" → 41

// Convert EU to other formats
convertFromEU(euSize, targetType) // 41, "US_MEN" → 9

// Check availability with conversion
isSizeAvailable(productSizes, size, sizeType)
```

#### `src/components/admin/SizePicker.jsx`
Admin size selection component:
- Multi-select button grid
- Adult/Kids tabs
- Select All / Clear actions

#### `src/pages/ProductDetail.jsx`
Customer-facing product detail:
- Size type selector (EU/US Men/US Women/Kids)
- Converted size buttons
- Availability checking with conversion

## Database Structure

### Products Table
```sql
{
  id: "uuid",
  name: "Nike Air Max",
  sizes: ["38", "39", "40", "41", "42"], -- Always EU format
  category_id: "uuid"
}
```

### Why EU Format?
1. **Single source of truth** - No duplicate data
2. **Consistent storage** - Same format for all products
3. **Easy conversion** - Standard international sizing
4. **Flexibility** - Add new size systems without DB changes

## Example Scenarios

### Scenario 1: Limited Stock
```
Admin sets: EU 40, 41, 42
Customer views in US Men: Sees US 8, 9, 10 (all available)
Customer views in US Women: Sees US 10, 11, 12 (all available)
Customer views in EU: Sees EU 40, 41, 42 (all available)
```

### Scenario 2: Kids Shoes
```
Admin sets: EU 28, 29, 30, 31 (Kids tab)
Customer views in Kids: Sees US 11, 11.5, 12, 13 (all available)
Customer switches to EU: Sees EU 28, 29, 30, 31 (all available)
```

### Scenario 3: Out of Stock Sizes
```
Admin sets: EU 38, 39, 40
Product stock for 39: 0 items

Customer views in US Men:
- US 6 (✓ Available)
- US 7 (✗ Grayed out - Out of Stock)
- US 8 (✓ Available)
```

## Apparel Sizes

Apparel uses direct size names without conversion:
```javascript
Available: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"]
```

No conversion needed as these are standard across regions.

## Benefits

### For Customers
- Shop in familiar size system
- No mental conversion needed
- Accurate size availability
- Size chart for reference

### For Admin
- Easy size management
- Visual selection interface
- Works for both adult and kids
- No manual typing errors

### For Store
- Consistent data storage
- Flexible display options
- Easy to add new size systems
- Reduced customer service inquiries

## Migration Guide

If you have existing products with sizes:

### Old Format (Comma-separated strings)
```json
{
  "sizes": "38, 39, 40, 41, 42"
}
```

### New Format (Array)
```json
{
  "sizes": ["38", "39", "40", "41", "42"]
}
```

The system automatically handles both formats during migration. When editing old products, they're automatically converted to the new format.

## Testing Checklist

- [ ] Admin: Add product with adult sizes
- [ ] Admin: Add product with kids sizes
- [ ] Admin: Add apparel product
- [ ] Customer: View shoe product in all size types (EU, US Men, US Women, Kids)
- [ ] Customer: Add shoe to cart in US Men sizing
- [ ] Customer: Verify cart shows correct size
- [ ] Customer: Check size chart displays correctly
- [ ] Admin: Edit existing product and update sizes
- [ ] Verify unavailable sizes are grayed out
- [ ] Test size conversion accuracy with size chart

## Future Enhancements

Possible additions:
- UK size system
- Japan (JP) size system
- Foot length in cm/inches
- Size recommendations based on customer history
- Virtual try-on with AR
