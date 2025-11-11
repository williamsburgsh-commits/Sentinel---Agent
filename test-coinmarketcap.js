/**
 * Test script to verify CoinMarketCap integration
 * Run with: node test-coinmarketcap.js
 */

const https = require('https');

// Configuration
const API_KEY = process.env.COINMARKETCAP_API_KEY || '3e7b73e6ace64c6c89712e6c420ad4be';
const SOLANA_ID = '5426';
const ENDPOINT = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${SOLANA_ID}&convert=USD`;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testCoinMarketCapAPI() {
  return new Promise((resolve, reject) => {
    log('\n🔄 Testing CoinMarketCap API...', colors.blue);
    log(`   Endpoint: ${ENDPOINT}`);
    log(`   API Key: ${API_KEY.substring(0, 10)}...`);

    const options = {
      method: 'GET',
      headers: {
        'X-CMC_PRO_API_KEY': API_KEY,
        'Accept': 'application/json',
      },
    };

    const startTime = Date.now();

    https.get(ENDPOINT, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        try {
          const json = JSON.parse(data);

          if (json.status && json.status.error_code === 0) {
            const price = json.data[SOLANA_ID].quote.USD.price;
            const lastUpdated = json.data[SOLANA_ID].quote.USD.last_updated;

            log('\n✅ SUCCESS!', colors.green);
            log(`   SOL Price: $${price.toFixed(2)}`);
            log(`   Last Updated: ${lastUpdated}`);
            log(`   Response Time: ${duration}ms`);

            resolve({ success: true, price, duration });
          } else {
            log('\n❌ API ERROR!', colors.red);
            log(`   Error Code: ${json.status.error_code}`);
            log(`   Error Message: ${json.status.error_message}`);

            reject(new Error(json.status.error_message));
          }
        } catch (parseError) {
          log('\n❌ PARSE ERROR!', colors.red);
          log(`   ${parseError.message}`);
          log(`   Response: ${data.substring(0, 200)}...`);

          reject(parseError);
        }
      });
    }).on('error', (error) => {
      log('\n❌ REQUEST ERROR!', colors.red);
      log(`   ${error.message}`);

      reject(error);
    });
  });
}

function testMultipleCalls() {
  log('\n🔄 Testing cache behavior (making 3 calls)...', colors.blue);

  const promises = [];
  for (let i = 1; i <= 3; i++) {
    const delay = (i - 1) * 1000; // 0s, 1s, 2s
    promises.push(
      new Promise((resolve) => {
        setTimeout(async () => {
          log(`\n   Call #${i}:`, colors.yellow);
          try {
            const result = await testCoinMarketCapAPI();
            resolve(result);
          } catch (error) {
            resolve({ success: false, error: error.message });
          }
        }, delay);
      })
    );
  }

  return Promise.all(promises);
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', colors.blue);
  log('║     CoinMarketCap API Integration Test Suite          ║', colors.blue);
  log('╚════════════════════════════════════════════════════════╝', colors.blue);

  try {
    // Test 1: Single API call
    log('\n📋 Test 1: Single API Call', colors.blue);
    const result1 = await testCoinMarketCapAPI();

    // Test 2: Multiple calls to test rate limiting
    log('\n📋 Test 2: Multiple Calls (Rate Limit Test)', colors.blue);
    const results = await testMultipleCalls();

    const successCount = results.filter(r => r.success).length;
    const avgDuration = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / successCount;

    log('\n═══════════════════════════════════════════════════════', colors.blue);
    log('📊 Test Summary:', colors.blue);
    log(`   Total Calls: ${results.length}`);
    log(`   Successful: ${successCount}`, successCount === results.length ? colors.green : colors.yellow);
    log(`   Failed: ${results.length - successCount}`, colors.reset);
    log(`   Average Response Time: ${avgDuration.toFixed(0)}ms`);

    if (successCount === results.length) {
      log('\n✅ ALL TESTS PASSED!', colors.green);
      log('   CoinMarketCap integration is working correctly.', colors.green);
      process.exit(0);
    } else {
      log('\n⚠️  SOME TESTS FAILED', colors.yellow);
      log('   Check the errors above for details.', colors.yellow);
      process.exit(1);
    }
  } catch (error) {
    log('\n❌ TEST SUITE FAILED!', colors.red);
    log(`   ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the tests
runTests();
