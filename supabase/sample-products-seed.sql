-- Sample Products Seed Data
-- Run this in Supabase SQL Editor after setting up online_categories

-- First, get the category UUIDs (you'll need to replace these with actual UUIDs from your database)
-- Run this query first to get your category IDs:
-- SELECT id, name FROM online_categories;

-- For this seed, we'll use a subquery to fetch category IDs

-- Sample Products for Running Shoes
INSERT INTO online_products (name, category_id, description, price, sale_price, stock_quantity, sizes, colors, images, is_featured, is_active)
VALUES
(
  'Nike Air Zoom Pegasus 40',
  (SELECT id FROM online_categories WHERE slug = 'running' LIMIT 1),
  'Responsive cushioning in the Pegasus provides an energized ride for everyday road running. Experience lighter-weight energy return with dual Air Zoom units and a ReactX foam midsole. Plus, improved engineered mesh on the upper decreases weight and increases breathability.',
  7495.00,
  5996.00,
  50,
  '["7", "8", "9", "10", "11", "12"]'::jsonb,
  '["Black/White", "Blue/Orange", "Grey/Volt"]'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  'Adidas Ultraboost 23',
  (SELECT id FROM online_categories WHERE slug = 'running' LIMIT 1),
  'Made in part with recycled content generated from production waste, this product has a lower environmental impact. Our iconic Ultraboost running shoe is back with even more energy return and comfort. The Boost midsole delivers incredible energy with every step.',
  9995.00,
  7496.00,
  35,
  '["7", "8", "9", "10", "11", "12"]'::jsonb,
  '["Core Black", "Cloud White", "Solar Red"]'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  'Asics Gel-Kayano 30',
  (SELECT id FROM online_categories WHERE slug = 'running' LIMIT 1),
  'The GEL-KAYANO 30 shoe creates a stable stride that moves you towards a balanced mindset. Featuring 4D GUIDANCE SYSTEM technology that provides adaptative stability, this helps you experience a more supportive and smooth stride.',
  8995.00,
  NULL,
  40,
  '["7", "8", "9", "10", "11", "12"]'::jsonb,
  '["Black/Red", "French Blue", "White/Silver"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),

-- Basketball Shoes
(
  'Nike LeBron 21',
  (SELECT id FROM online_categories WHERE slug = 'basketball' LIMIT 1),
  'LeBrons speed and strength are legendary. The LeBron 21 harnesses the awesome force with a speedy forefoot Air Zoom unit and a large-volume Max Air unit under the heel. Cabling through the collar and foot wraps around your foot for a secure feel when sprinting or jumping.',
  10995.00,
  8796.00,
  25,
  '["8", "9", "10", "11", "12", "13"]'::jsonb,
  '["Bred", "Purple/Gold", "Black/White"]'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  'Adidas Dame 8',
  (SELECT id FROM online_categories WHERE slug = 'basketball' LIMIT 1),
  'Damian Lillards signature basketball shoe built for explosive players. These adidas basketball shoes have a textile upper with a padded collar for comfort. Bounce Pro cushioning provides comfort on hard courts.',
  6995.00,
  5596.00,
  30,
  '["8", "9", "10", "11", "12", "13"]'::jsonb,
  '["Team Black", "Cloud White", "Solar Red"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),
(
  'Jordan Why Not .6',
  (SELECT id FROM online_categories WHERE slug = 'basketball' LIMIT 1),
  'Russell Westbrooks 6th signature shoe is—you guessed it—all about speed. To get you goin as fast as possible, the upper is ultra-lightweight. Cushlon 3.0 foam helps keep it comfortable when youre beating your opponent down the court.',
  7495.00,
  NULL,
  20,
  '["8", "9", "10", "11", "12", "13"]'::jsonb,
  '["White/Black", "Bright Crimson", "Pale Ivory"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),

-- Casual Shoes
(
  'Nike Air Force 1 07',
  (SELECT id FROM online_categories WHERE slug = 'casual' LIMIT 1),
  'The radiance lives on in the Nike Air Force 1 07, the basketball original that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and the perfect amount of flash to make you shine.',
  5995.00,
  4496.00,
  100,
  '["6", "7", "8", "9", "10", "11", "12"]'::jsonb,
  '["Triple White", "Triple Black", "White/Red"]'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  'Adidas Stan Smith',
  (SELECT id FROM online_categories WHERE slug = 'casual' LIMIT 1),
  'Clean and simple. This Stan Smith shoe stays true to its legacy with a smooth leather upper and perforated 3-Stripes. It stands on a durable rubber cupsole. Minimal branding includes a woven tongue label.',
  4995.00,
  NULL,
  80,
  '["6", "7", "8", "9", "10", "11", "12"]'::jsonb,
  '["Cloud White/Green", "Triple White", "Core Black"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),
(
  'Puma Suede Classic',
  (SELECT id FROM online_categories WHERE slug = 'casual' LIMIT 1),
  'Forever a favorite, the PUMA Suede Classic has been winning over sneaker fans ever since it stepped onto the scene. Its a classic for good reason, with legendary suede and a laid-back vibe that pairs perfectly with your everyday style.',
  3995.00,
  2996.00,
  60,
  '["6", "7", "8", "9", "10", "11", "12"]'::jsonb,
  '["Black/White", "Navy/White", "Red/White"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),

-- Apparels
(
  'Nike Dri-FIT Running Shirt',
  (SELECT id FROM online_categories WHERE slug = 'apparels' LIMIT 1),
  'Made from soft jersey fabric with sweat-wicking Dri-FIT technology, this tee helps you stay dry and comfortable from warm-up to cool-down. A relaxed fit is easy to layer and gives you room to move through your workout.',
  1495.00,
  1196.00,
  150,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black", "White", "Navy", "Grey", "Red"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),
(
  'Under Armour Tech 2.0 Tee',
  (SELECT id FROM online_categories WHERE slug = 'apparels' LIMIT 1),
  'UA Tech is the original go-to training gear: loose, light, and it keeps you cool. Its everything you need for working out. The textured fabric is quick-drying, ultra-soft & has a more natural feel.',
  1295.00,
  NULL,
  120,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black", "Royal", "Red", "Green"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),
(
  'Adidas Essentials Training Shorts',
  (SELECT id FROM online_categories WHERE slug = 'apparels' LIMIT 1),
  'These versatile adidas training shorts keep you comfortable through every workout. Made of soft cotton single jersey, they have an elastic waist with a drawcord so you can adjust the fit. Slip your essentials into the side pockets.',
  1695.00,
  1356.00,
  100,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black", "Navy", "Grey"]'::jsonb,
  '[]'::jsonb,
  false,
  true
),
(
  'Nike Sportswear Tech Fleece Hoodie',
  (SELECT id FROM online_categories WHERE slug = 'apparels' LIMIT 1),
  'Our premium, lightweight fleece—smooth both inside and out—gives you plenty of warmth without adding bulk. Elongated ribbing at the cuffs and hem help keep the cold out while you make your way around town.',
  4995.00,
  3996.00,
  75,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black", "Grey", "Navy", "Olive"]'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  'Puma Essentials Logo Joggers',
  (SELECT id FROM online_categories WHERE slug = 'apparels' LIMIT 1),
  'These joggers are all about no-fuss, relaxed style. Made from cotton and equipped with an elastic waistband, theyll keep you comfortable all day long. PUMA branding details the legs for a signature finish.',
  2495.00,
  1996.00,
  90,
  '["S", "M", "L", "XL", "XXL"]'::jsonb,
  '["Black", "Grey", "Navy"]'::jsonb,
  '[]'::jsonb,
  false,
  true
);

-- Create an active sale promotion (ends in 7 days from now)
INSERT INTO online_sale_promotions (name, end_date, is_active, message)
VALUES (
  'Year-End Clearance Sale',
  NOW() + INTERVAL '7 days',
  true,
  'Massive discounts on selected items! Limited time only!'
);

-- Verification query to see all online_products
-- SELECT p.name, c.name as category, p.price, p.sale_price, p.stock_quantity
-- FROM online_products p
-- JOIN online_categories c ON p.category_id = c.id
-- ORDER BY c.name, p.name;

-- Update top-selling category with best-selling online_products
-- (You can manually move online_products to top-selling category after seeing which ones sell best)
