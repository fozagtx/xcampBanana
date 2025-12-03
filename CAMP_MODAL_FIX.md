# Camp Modal Content Moderation Authorization Fix

## Problem

When clicking on the Camp Modal and trying to mint anything, you were getting an error:
```
Unauthorized content moderation
```

## Root Cause

The Origin SDK from Camp Network requires proper configuration including:
1. **Client ID** - To identify your application
2. **Environment** - To specify whether to use Camp Testnet (DEVELOPMENT) or Camp Mainnet (PRODUCTION)
3. Proper authentication flow

The content moderation authorization error was occurring because:
- The environment variable `NEXT_PUBLIC_CAMP_CLIENT_ID` was not set in your `.env` file
- The environment setting was not explicitly configured
- The SDK was falling back to defaults which may not have had proper authorization

## Solution Implemented

### 1. Created `.env` File
Created a `.env` file with your Camp Network credentials:

```env
# Camp Network Configuration
NEXT_PUBLIC_CAMP_CLIENT_ID=fce77d7a-8085-47ca-adff-306a933e76aa
NEXT_PUBLIC_CAMP_API_KEY=4f1a2c9c-008e-4a2e-8712-055fa04f9ffa
NEXT_PUBLIC_CAMP_ENVIRONMENT=PRODUCTION
```

### 2. Updated `app/providers.tsx`
Modified the CampProvider to explicitly use the environment configuration:

```typescript
<CampProvider
  clientId={process.env.NEXT_PUBLIC_CAMP_CLIENT_ID || "fce77d7a-8085-47ca-adff-306a933e76aa"}
  environment={process.env.NEXT_PUBLIC_CAMP_ENVIRONMENT as "DEVELOPMENT" | "PRODUCTION" || "PRODUCTION"}
>
  {children}
</CampProvider>
```

### 3. Updated `.env.example`
Updated the example environment file to include proper Camp Network configuration template.

## How to Use

### Step 1: Verify Environment Variables
Make sure your `.env` file exists in the root directory with the following variables:

```env
NEXT_PUBLIC_CAMP_CLIENT_ID=fce77d7a-8085-47ca-adff-306a933e76aa
NEXT_PUBLIC_CAMP_API_KEY=4f1a2c9c-008e-4a2e-8712-055fa04f9ffa
NEXT_PUBLIC_CAMP_ENVIRONMENT=PRODUCTION
```

### Step 2: Restart Development Server
If you're running the development server, restart it to pick up the new environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
# or
bun dev
```

### Step 3: Clear Browser Cache
Clear your browser cache and local storage to ensure the new configuration is loaded:
1. Open Developer Tools (F12)
2. Go to Application tab
3. Clear Local Storage and Session Storage
4. Reload the page

### Step 4: Test the Minting Process
1. Click on the Camp Modal button
2. Connect your wallet
3. Try to mint a brandkit
4. The content moderation authorization should now work

## Environment Options

### PRODUCTION (Recommended)
Uses the Camp Mainnet for real transactions:
```env
NEXT_PUBLIC_CAMP_ENVIRONMENT=PRODUCTION
```

### DEVELOPMENT
Uses the Camp Testnet for testing:
```env
NEXT_PUBLIC_CAMP_ENVIRONMENT=DEVELOPMENT
```

## Troubleshooting

### Issue: Still Getting Authorization Error
**Solution:**
1. Verify the `.env` file is in the root directory (same level as `package.json`)
2. Ensure environment variables start with `NEXT_PUBLIC_` (required for Next.js client-side)
3. Restart the development server completely
4. Clear browser cache and cookies
5. Try reconnecting your wallet in the Camp Modal

### Issue: Environment Variables Not Loading
**Solution:**
1. Check that variable names are exactly as shown (case-sensitive)
2. Make sure there are no spaces around the `=` sign
3. Verify the `.env` file is not named `.env.txt` or `.env.local` (should be exactly `.env`)
4. For Next.js, client-side variables MUST start with `NEXT_PUBLIC_`

### Issue: Wrong Network
**Solution:**
- If you're on testnet but want mainnet, change:
  ```env
  NEXT_PUBLIC_CAMP_ENVIRONMENT=PRODUCTION
  ```
- If you're on mainnet but want testnet, change:
  ```env
  NEXT_PUBLIC_CAMP_ENVIRONMENT=DEVELOPMENT
  ```

## Additional Information

### What is Content Moderation?
The Origin SDK includes built-in content moderation to ensure that minted content complies with platform policies. This requires proper authentication through:
- Valid client ID
- Correct environment configuration
- Authenticated wallet connection

### Client ID & API Key
- **Client ID**: `fce77d7a-8085-47ca-adff-306a933e76aa` (Your app identifier)
- **API Key**: `4f1a2c9c-008e-4a2e-8712-055fa04f9ffa` (For API authentication)

These credentials are specific to your application and should be kept secure.

## Files Modified

1. **`.env`** (Created) - Contains your Camp Network credentials
2. **`.env.example`** (Updated) - Template for environment variables
3. **`app/providers.tsx`** (Updated) - Added environment configuration to CampProvider
4. **`CAMP_MODAL_FIX.md`** (Created) - This documentation file

## Next Steps

After applying this fix:
1. ✅ Restart your development server
2. ✅ Clear browser cache
3. ✅ Test the minting functionality
4. ✅ Verify that content moderation authorization works

The "unauthorized content moderation" error should now be resolved!

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Verify your wallet is connected and on the correct network
3. Ensure you have sufficient funds for gas fees
4. Contact Camp Network support if the issue persists

## Reference Documentation

For more information about the Origin SDK:
- GitHub: https://github.com/campaign-layer/origin-sdk
- Documentation: Refer to the Origin SDK README provided in the task
