# CoinMarketCap API Integration

## Overview

This document describes the integration of CoinMarketCap API as the primary price feed for SOL/USD prices in the Sentinel Agent application.

## Implementation Details

### Primary Module: `lib/coinmarketcap.ts`

The CoinMarketCap integration includes:

- **Function**: `getSOLPriceCoinMarketCap()`
- **Returns**: `{ success: boolean, price?: number, error?: string, cached?: boolean }`
- **Endpoint**: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`
- **Parameters**: `id=5426` (Solana), `convert=USD`
- **Authentication**: `X-CMC_PRO_API_KEY` header

### Caching Strategy

- **Cache Duration**: 5 minutes (300 seconds)
- **Storage**: In-memory (server-side)
- **Benefits**: Reduces API calls, avoids rate limits
- **Cache Key**: Price + timestamp
- **Invalidation**: Automatic after 5 minutes

### Error Handling

The integration handles multiple error scenarios:

1. **Missing API Key**: Returns error, falls back to next source
2. **Rate Limiting (429)**: Specific error message, uses cached value if available
3. **API Errors**: Parses CoinMarketCap error response, logs details
4. **Timeout**: 5-second timeout on requests
5. **Invalid Response**: Validates response structure and price value

### Fallback Chain

Priority order for price feeds (implemented in `lib/switchboard.ts`):

1. **CoinMarketCap** (Primary) - With 5-minute caching
2. **Switchboard Oracle** (First fallback) - On-chain oracle
3. **CoinGecko** (Second fallback - Deprecated) - Free API
4. **Simulated Price** (Final fallback) - Demo mode

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
COINMARKETCAP_API_KEY=your_api_key_here
```

**Important**: Do NOT use `NEXT_PUBLIC_` prefix - this should be server-side only.

### API Key

Current API key (provided in ticket):
```
3e7b73e6ace64c6c89712e6c420ad4be
```

Get your own key from: https://coinmarketcap.com/api/

## Usage

The integration is automatically used by the `/api/check-price` endpoint:

```typescript
import { getSOLPrice } from '@/lib/switchboard';

// This will try CoinMarketCap first, then fallback chain
const price = await getSOLPrice();
```

## Testing

### 1. Basic Price Fetch

```bash
curl http://localhost:3000/api/check-price
```

Expected response:
```json
{
  "success": true,
  "price": 167.76099254114797
}
```

### 2. Verify CoinMarketCap Direct

```bash
curl -H "X-CMC_PRO_API_KEY: YOUR_KEY" \
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=5426&convert=USD"
```

### 3. Check Cache Behavior

Make two requests within 5 minutes:

```bash
# First request (fresh)
curl http://localhost:3000/api/check-price

# Second request immediately after (cached)
curl http://localhost:3000/api/check-price
```

Check server logs for:
- First: `✅ SOL price from CoinMarketCap: X (fresh)`
- Second: `✅ Using cached CoinMarketCap price: X` and `✅ SOL price from CoinMarketCap: X (cached)`

### 4. Test Fallback Chain

To test the fallback chain, temporarily invalidate the CoinMarketCap API key in `.env.local` and restart the server. The system should fall back to Switchboard or CoinGecko.

## Performance

### Rate Limits

CoinMarketCap free tier limits:
- **Basic Plan**: 10,000 API calls/month (~333 calls/day)
- **With 5-minute cache**: ~288 calls/day maximum
- **Actual usage**: Much lower due to cache hits

### Response Times

- **Cached**: < 1ms (in-memory lookup)
- **Fresh CoinMarketCap call**: ~100-300ms
- **Timeout**: 5 seconds maximum

## Monitoring

### Log Messages

The integration provides detailed logging:

- `🔄 Attempting to fetch price from CoinMarketCap...` - Starting price fetch
- `🔄 Fetching SOL price from CoinMarketCap...` - Making API call
- `✅ Using cached CoinMarketCap price: X` - Cache hit
- `✅ SOL price from CoinMarketCap: X (fresh)` - Fresh API call success
- `✅ SOL price from CoinMarketCap: X (cached)` - Returned cached price
- `⚠️ CoinMarketCap failed: ERROR` - API call failed, trying fallback
- `❌ CoinMarketCap API error: ERROR` - API returned error

### Metrics to Monitor

1. **Cache hit rate**: Should be high (>80% after warmup)
2. **API error rate**: Should be low (<1%)
3. **Response times**: Should be fast with cache
4. **Fallback usage**: Should be rare (only when CMC fails)

## Deployment

### Vercel Environment Variables

When deploying to Vercel, add the environment variable:

1. Go to Project Settings → Environment Variables
2. Add: `COINMARKETCAP_API_KEY` = `3e7b73e6ace64c6c89712e6c420ad4be`
3. Apply to: Production, Preview, and Development
4. Redeploy the application

### Verification After Deployment

1. Check logs for CoinMarketCap connection
2. Verify price accuracy against CMC website
3. Monitor API usage in CoinMarketCap dashboard
4. Test fallback behavior under various conditions

## Troubleshooting

### Issue: "CoinMarketCap API Key not configured"

**Solution**: Ensure `COINMARKETCAP_API_KEY` is set in `.env.local` and restart the dev server.

### Issue: "CoinMarketCap rate limit exceeded"

**Solution**: The 5-minute cache should prevent this. If it occurs:
1. Check cache implementation is working
2. Verify cache duration is appropriate
3. Consider upgrading CoinMarketCap plan if needed

### Issue: Prices seem stale

**Solution**: Cache duration is 5 minutes. For real-time prices, reduce `CACHE_DURATION_MS` in `lib/coinmarketcap.ts`, but be aware of rate limits.

### Issue: Fallback to Switchboard/CoinGecko

**Solution**: This is expected behavior when CoinMarketCap fails. Check:
1. API key is correct
2. Network connectivity
3. CoinMarketCap API status
4. Rate limits not exceeded

## Maintenance

### Updating Cache Duration

Edit `lib/coinmarketcap.ts`:

```typescript
// Change from 5 minutes to desired duration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
```

### Adding More Cryptocurrencies

To add support for other coins:

1. Get the CoinMarketCap ID from their website
2. Create similar function with different ID
3. Update the endpoint call with new ID

Example:
```typescript
const BITCOIN_CMC_ID = '1';
const ETHEREUM_CMC_ID = '1027';
```

## API Documentation

### CoinMarketCap API Response Structure

```json
{
  "data": {
    "5426": {
      "quote": {
        "USD": {
          "price": 167.76099254114797,
          "last_updated": "2025-11-10T23:57:00.000Z"
        }
      }
    }
  },
  "status": {
    "timestamp": "2025-11-10T23:57:16.572Z",
    "error_code": 0,
    "error_message": null
  }
}
```

### Error Response Structure

```json
{
  "status": {
    "timestamp": "2025-11-10T23:57:16.572Z",
    "error_code": 1001,
    "error_message": "This API Key is invalid.",
    "elapsed": 0,
    "credit_count": 0
  }
}
```

## References

- [CoinMarketCap API Documentation](https://coinmarketcap.com/api/documentation/v1/)
- [Solana on CoinMarketCap](https://coinmarketcap.com/currencies/solana/)
- [Rate Limits and Credits](https://coinmarketcap.com/api/documentation/v1/#section/Standards-and-Conventions)
