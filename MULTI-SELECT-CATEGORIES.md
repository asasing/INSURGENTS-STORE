# Multi-Select Categories Implementation

## Overview
Products can now belong to multiple categories simultaneously. For example, a product can be in both "Top Selling" and "Running" categories.

## Database Migration

### Step 1: Run the Migration Script
Execute the SQL migration in Supabase SQL Editor:
```bash
supabase/migrate-categories-to-multi-select.sql
```

This script:
- Adds a new `category_ids` JSONB column
- Migrates existing `category_id` data to the new format
- Creates a GIN index for efficient querying
- Keeps both columns during transition for backward compatibility

### Step 2: Verify Migration
Check that your products have been migrated:
```sql
SELECT id, name, category_id, category_ids FROM online_products LIMIT 5;
```

## Admin Interface

### Creating/Editing Products
In the admin product form, you'll now see a checkbox grid for categories:

![Category Selector](screenshot-if-available.png)

**Features:**
- Select multiple categories by clicking checkboxes
- Selected categories are highlighted
- Must select at least one category
- Changes are validated before submission

## Frontend Display

### Product Objects
Products now include both single and multiple category data:

```javascript
{
  id: "...",
  name: "Nike Air Max",
  category_id: "uuid-1",        // Legacy single category (if exists)
  category_ids: ["uuid-1", "uuid-2"],  // New multi-category array
  category: {                    // Primary category (for backward compatibility)
    name: "Running",
    slug: "running"
  },
  categories: [                  // All categories (new)
    { name: "Running", slug: "running" },
    { name: "Top Selling", slug: "top-selling" }
  ]
}
```

### Displaying Multiple Categories
Example usage in components:

```jsx
// Single category (backward compatible)
{product.category?.name}

// Multiple categories
{product.categories?.map(cat => (
  <span key={cat.slug} className="badge">
    {cat.name}
  </span>
))}
```

## Filtering by Category

The filtering logic now supports both old and new formats:

```javascript
// Filter by category ID
getProducts({ categoryId: 'uuid-123' })

// Filter by category slug
getProducts({ categorySlug: 'running' })
```

Products matching either:
- `category_id` equals the filter (old format)
- `category_ids` array contains the filter (new format)

will be returned.

## Technical Details

### Supabase Query
The service uses PostgreSQL's containment operator for JSONB arrays:

```javascript
// Check if category_ids contains the ID
query.or(`category_id.eq.${categoryId},category_ids.cs.["${categoryId}"]`)
```

Where `cs` means "contains" (JSONB @> operator).

### Category Enrichment
Since Supabase can't automatically join on JSONB arrays, we use a helper function:

1. Fetch products with category_ids
2. Collect all unique category IDs
3. Fetch all categories in one query
4. Attach category data to each product

This is efficient even for large product lists as it only makes 2 queries total (products + categories).

## Backward Compatibility

The system supports both old and new formats during migration:

- **Old products**: Have `category_id` (single UUID) → Still works perfectly
- **New products**: Have `category_ids` (JSONB array) → Fully supported
- **Mixed**: Both types can coexist in the database

### When to Remove category_id Column

Once you're confident all products have been migrated and the new system works well:

1. Verify all products have `category_ids` populated
2. Update the migration script (uncomment the DROP COLUMN lines)
3. Run the cleanup:
   ```sql
   DROP INDEX IF EXISTS idx_online_products_category;
   ALTER TABLE online_products DROP COLUMN IF EXISTS category_id;
   ```

## Benefits

1. **Flexible Categorization**: Products can appear in multiple category pages
2. **Better Organization**: One product can be "Running", "Top Selling", and "On Sale" simultaneously
3. **Improved Discovery**: Users find products in multiple relevant sections
4. **SEO**: Products indexed under multiple category pages

## Example Use Cases

### Case 1: Featured Product
```javascript
category_ids: [
  "running-id",      // Main category
  "top-selling-id",  // It's popular
  "on-sale-id"       // Currently discounted
]
```

### Case 2: Multi-Sport Shoe
```javascript
category_ids: [
  "running-id",
  "basketball-id",
  "casual-id"
]
```

### Case 3: Seasonal Promotion
```javascript
category_ids: [
  "apparels-id",     // Main category
  "on-sale-id"       // Holiday sale
]
```

## Validation

The form validates:
- ✅ At least one category must be selected
- ✅ All category IDs must be valid UUIDs
- ✅ Changes are validated in real-time

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Create new product with multiple categories
- [ ] Edit existing product and add more categories
- [ ] Verify product appears in all selected category pages
- [ ] Test filtering by different categories
- [ ] Check that old single-category products still work
- [ ] Verify category display in product cards
- [ ] Test removing categories from a product
