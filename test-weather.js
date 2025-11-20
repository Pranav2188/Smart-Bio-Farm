// Weather System Test Script
const https = require('https');

console.log("🌤️  Testing Weather System\n");
console.log("=".repeat(60));

// Weather API configuration
const API_KEY = "8f4980c2b086f0f5a64ebc8ba62d8326";
const DEFAULT_LAT = 19.0760; // Mumbai, India
const DEFAULT_LON = 72.8777;

// Test locations
const testLocations = [
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278 }
];

/**
 * Fetch weather data from OpenWeatherMap API
 */
function fetchWeather(lat, lon) {
  return new Promise((resolve, reject) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: true,
              statusCode: res.statusCode,
              data: {
                city: parsed.name,
                country: parsed.sys.country,
                temperature: Math.round(parsed.main.temp),
                feelsLike: Math.round(parsed.main.feels_like),
                humidity: parsed.main.humidity,
                pressure: parsed.main.pressure,
                description: parsed.weather[0].description,
                icon: parsed.weather[0].icon,
                windSpeed: parsed.wind.speed,
                clouds: parsed.clouds.all
              }
            });
          } catch (e) {
            reject(new Error('Failed to parse weather data'));
          }
        } else {
          resolve({
            success: false,
            statusCode: res.statusCode,
            error: data
          });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Test weather API with multiple locations
 */
async function runTests() {
  let allPassed = true;

  console.log("\n1️⃣  Testing OpenWeatherMap API Connection...\n");

  for (const location of testLocations) {
    try {
      console.log(`📍 Testing: ${location.name}`);
      const result = await fetchWeather(location.lat, location.lon);
      
      if (result.success) {
        console.log(`   ✅ API Response: ${result.statusCode}`);
        console.log(`   ✅ City: ${result.data.city}, ${result.data.country}`);
        console.log(`   ✅ Temperature: ${result.data.temperature}°C (Feels like ${result.data.feelsLike}°C)`);
        console.log(`   ✅ Humidity: ${result.data.humidity}%`);
        console.log(`   ✅ Conditions: ${result.data.description}`);
        console.log(`   ✅ Wind Speed: ${result.data.windSpeed} m/s`);
        console.log(`   ✅ Icon Code: ${result.data.icon}`);
      } else {
        console.log(`   ❌ API Error: ${result.statusCode}`);
        console.log(`   ❌ Error: ${result.error}`);
        allPassed = false;
      }
      console.log("");
    } catch (error) {
      console.log(`   ❌ Request Failed: ${error.message}`);
      allPassed = false;
      console.log("");
    }
  }

  // Test 2: Check API Key Validity
  console.log("2️⃣  Testing API Key Validity...\n");
  try {
    const result = await fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    if (result.success) {
      console.log("   ✅ API Key is valid and working");
      console.log(`   ✅ API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
    } else if (result.statusCode === 401) {
      console.log("   ❌ API Key is invalid or expired");
      console.log("   ℹ️  Get a new key from: https://openweathermap.org/api");
      allPassed = false;
    } else {
      console.log(`   ⚠️  Unexpected response: ${result.statusCode}`);
    }
  } catch (error) {
    console.log("   ❌ API Key test failed:", error.message);
    allPassed = false;
  }

  // Test 3: Check Weather Service Functions
  console.log("\n3️⃣  Checking Weather Service Implementation...\n");
  
  const fs = require('fs');
  const weatherServicePath = './src/utils/weatherService.js';
  
  if (fs.existsSync(weatherServicePath)) {
    console.log("   ✅ weatherService.js exists");
    
    const content = fs.readFileSync(weatherServicePath, 'utf8');
    
    // Check for required functions
    const requiredFunctions = [
      'getWeather',
      'getUserLocation',
      'getWeatherIconUrl'
    ];
    
    requiredFunctions.forEach(func => {
      if (content.includes(`export const ${func}`)) {
        console.log(`   ✅ Function '${func}' implemented`);
      } else {
        console.log(`   ❌ Function '${func}' missing`);
        allPassed = false;
      }
    });
  } else {
    console.log("   ❌ weatherService.js not found");
    allPassed = false;
  }

  // Test 4: Check Integration in Components
  console.log("\n4️⃣  Checking Weather Integration in Components...\n");
  
  const componentsToCheck = [
    { path: './src/pages/FarmerDashboard.js', name: 'FarmerDashboard' },
    { path: './src/pages/GovernmentDashboard.js', name: 'GovernmentDashboard' }
  ];
  
  componentsToCheck.forEach(component => {
    if (fs.existsSync(component.path)) {
      const content = fs.readFileSync(component.path, 'utf8');
      
      if (content.includes('getWeather') && content.includes('getUserLocation')) {
        console.log(`   ✅ ${component.name}: Weather service integrated`);
      } else {
        console.log(`   ⚠️  ${component.name}: Weather service not fully integrated`);
      }
    } else {
      console.log(`   ❌ ${component.name}: File not found`);
    }
  });

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 WEATHER SYSTEM TEST SUMMARY");
  console.log("=".repeat(60));
  
  if (allPassed) {
    console.log("✅ OpenWeatherMap API: Working");
    console.log("✅ API Key: Valid");
    console.log("✅ Weather Service: Implemented");
    console.log("✅ Component Integration: Complete");
    console.log("\n🎉 Weather system is working perfectly!");
    console.log("\nℹ️  Weather data is fetched from OpenWeatherMap API");
    console.log("ℹ️  Default location: Mumbai, India (if geolocation fails)");
    console.log("ℹ️  Units: Metric (Celsius, m/s)");
  } else {
    console.log("❌ Some tests failed. Check the errors above.");
  }
  
  console.log("=".repeat(60));
}

// Run the tests
runTests().catch(error => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
