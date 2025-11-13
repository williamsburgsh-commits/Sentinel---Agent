# Vercel Deployment Guide 🚀

## Prerequisites

1. **GitHub Repository**: ✅ Already pushed to https://github.com/williamsburgsh-commits/Sentinel---Agent
2. **Supabase Project**: You need your Supabase credentials
3. **Vercel Account**: Sign up at https://vercel.com

## Deployment Steps

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `williamsburgsh-commits/Sentinel---Agent`
4. Click "Import"

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### **Required Variables:**

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://deepfiuklrwqveiydzjb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Network (REQUIRED)
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com
```

#### **Optional Variables:**

```bash
# For admin operations (optional)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# For AI analysis features (optional)
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# For mainnet (only when ready for production)
# NEXT_PUBLIC_NETWORK=mainnet
# NEXT_PUBLIC_MAINNET_RPC=https://your-rpc-endpoint.com
```

### 3. Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

## Post-Deployment

### Update Supabase Auth Settings

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local development)

### Test Your Deployment

1. Visit your Vercel URL
2. Try signing up/logging in
3. Create a sentinel and verify it works

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Verify your Supabase credentials are valid

### Authentication Not Working

- Make sure you've added your Vercel URL to Supabase redirect URLs
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Database Errors

- Ensure your Supabase database schema is set up (run the SQL migrations in `supabase/` folder)
- Check that RLS policies are configured correctly

## Important Notes

⚠️ **Security:**
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Keep your `SUPABASE_SERVICE_ROLE_KEY` and `DEEPSEEK_API_KEY` secret
- Only use `NEXT_PUBLIC_` prefix for variables that are safe to expose to the browser

⚠️ **Network:**
- Start with `devnet` for testing (uses fake SOL)
- Only switch to `mainnet` when ready for production (uses real money!)

## Continuous Deployment

Vercel automatically redeploys when you push to the `main` branch on GitHub. Any changes you make will be live within minutes!

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Update Supabase redirect URLs with your custom domain
