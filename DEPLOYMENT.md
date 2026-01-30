# Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub repository connected to Vercel
- Supabase project set up
- Maya merchant account with production keys

### Environment Variables for Production

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-anon-key

# Maya Payment Gateway - PRODUCTION KEYS
VITE_MAYA_PUBLIC_KEY=pk-live-xxxxxxxxxxxxxxxxxx
VITE_MAYA_SECRET_KEY=sk-live-xxxxxxxxxxxxxxxxxx
VITE_MAYA_API_BASE=https://pg.paymaya.com
```

**Important:**
- Use **production** Maya keys (starts with `pk-live-` and `sk-live-`)
- Use **production** Maya API base URL: `https://pg.paymaya.com` (no `-sandbox`)
- Make sure all variables are set for **Production** environment in Vercel

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Vercel will auto-deploy**
   - Go to Vercel dashboard
   - Check deployment logs
   - Wait for build to complete

3. **Verify Deployment**
   - Visit your production URL
   - Test checkout flow end-to-end
   - Verify Maya redirects to production payment page

### Testing Production Maya Integration

1. **Before going live:**
   - Keep `VITE_MAYA_API_BASE=https://pg-sandbox.paymaya.com` in Vercel
   - Use sandbox keys
   - Test with Maya test cards

2. **When ready for live payments:**
   - Update `VITE_MAYA_API_BASE=https://pg.paymaya.com` in Vercel
   - Update to production Maya keys
   - Redeploy (Vercel will auto-redeploy on environment variable change)

### Post-Deployment Checklist

- [ ] All products have images
- [ ] Site logo uploaded in Admin → Settings
- [ ] Categories set up correctly
- [ ] Test checkout with real payment
- [ ] Verify order confirmation emails (if configured)
- [ ] Check mobile responsiveness
- [ ] Test dark mode on production
- [ ] Verify admin login works
- [ ] Test cart persistence across sessions

### Switching from Sandbox to Production

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Find `VITE_MAYA_API_BASE`
3. Change value from `https://pg-sandbox.paymaya.com` to `https://pg.paymaya.com`
4. Update `VITE_MAYA_PUBLIC_KEY` and `VITE_MAYA_SECRET_KEY` to production keys
5. Vercel will auto-redeploy

### Rollback Procedure

If issues occur in production:
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." menu → Promote to Production
4. Fix issues in development
5. Redeploy when ready

### Performance Optimization for Production

**Supabase:**
- Enable connection pooling in Supabase dashboard
- Review RLS policies for performance
- Index frequently queried columns

**Images:**
- Optimize product images before upload (max 1MB recommended)
- Use WebP format when possible
- Enable Supabase CDN for storage

**React Query:**
- Default 5min stale time is good for production
- Adjust in `src/main.jsx` if needed

### Monitoring

**Check regularly:**
- Vercel Analytics (if enabled)
- Supabase Dashboard → Database → Performance
- Maya Dashboard → Transactions
- Browser console for errors (test on real devices)

### Common Production Issues

**Issue: Maya payments failing**
- Check API base URL is production (no `-sandbox`)
- Verify production keys are active in Maya dashboard
- Check Maya webhook configuration (if using webhooks)

**Issue: Images not loading**
- Verify storage bucket is public
- Check CORS settings in Supabase
- Verify image URLs are accessible

**Issue: Slow page loads**
- Check React Query cache settings
- Optimize images
- Review database queries in Supabase

### Support

- Supabase: https://supabase.com/docs
- Maya: https://developers.maya.ph/
- Vercel: https://vercel.com/docs

---

**Built with React + Vite + Supabase + Maya**
