#!/usr/bin/env node

/**
 * OAuth Setup Verification Script
 * Checks if all OAuth credentials are properly configured
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '../backend/.env');

  if (!fs.existsSync(envPath)) {
    log('\n❌ Error: backend/.env file not found!', 'red');
    log('\n📝 To fix:', 'yellow');
    log('   cd backend && cp .env.example .env', 'cyan');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });

  return env;
}

function checkOAuthPlatform(platform, config) {
  const { name, vars, setupUrl } = config;
  log(`\n${name}:`, 'bold');

  let allConfigured = true;
  const missing = [];

  vars.forEach(varName => {
    const value = process.env[varName] || config.env[varName];
    const isConfigured = value && value.trim() && !value.includes('your-') && !value.includes('change-in-production');

    if (isConfigured) {
      log(`  ✅ ${varName}: Configured`, 'green');
    } else {
      log(`  ❌ ${varName}: Not configured`, 'red');
      missing.push(varName);
      allConfigured = false;
    }
  });

  if (!allConfigured) {
    log(`\n  📝 Setup guide: ${setupUrl}`, 'cyan');
    log(`  See: OAUTH_SETUP_GUIDE.md`, 'cyan');
  }

  return allConfigured;
}

function checkEncryption(env) {
  log('\n🔐 Security Configuration:', 'bold');

  const encryptionKey = env.ENCRYPTION_KEY;
  const jwtSecret = env.JWT_SECRET;

  let secure = true;

  // Check encryption key
  if (!encryptionKey || encryptionKey.includes('your-')) {
    log('  ❌ ENCRYPTION_KEY: Not configured', 'red');
    secure = false;
  } else if (encryptionKey.length !== 32) {
    log(`  ⚠️  ENCRYPTION_KEY: Must be exactly 32 characters (current: ${encryptionKey.length})`, 'yellow');
    log('     Generate with: node -e "console.log(require(\'crypto\').randomBytes(16).toString(\'hex\'))"', 'cyan');
    secure = false;
  } else if (encryptionKey === 'unmotivated-hero-encryption-32') {
    log('  ⚠️  ENCRYPTION_KEY: Using default value (change for production!)', 'yellow');
  } else {
    log('  ✅ ENCRYPTION_KEY: Configured (32 characters)', 'green');
  }

  // Check JWT secret
  if (!jwtSecret || jwtSecret.includes('your-') || jwtSecret.includes('change-in-production')) {
    log('  ❌ JWT_SECRET: Not configured', 'red');
    secure = false;
  } else if (jwtSecret === 'unmotivated-hero-super-secret-jwt-key-change-in-production-12345678') {
    log('  ⚠️  JWT_SECRET: Using default value (change for production!)', 'yellow');
  } else {
    log('  ✅ JWT_SECRET: Configured', 'green');
  }

  return secure;
}

function checkDatabase(env) {
  log('\n💾 Database Configuration:', 'bold');

  const dbUrl = env.DATABASE_URL;

  if (!dbUrl) {
    log('  ❌ DATABASE_URL: Not configured', 'red');
    return false;
  }

  if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
    log('  ✅ DATABASE_URL: Configured (localhost)', 'green');
    log('     Make sure PostgreSQL is running: docker-compose up -d postgres', 'cyan');
  } else {
    log('  ✅ DATABASE_URL: Configured (remote)', 'green');
  }

  const redisHost = env.REDIS_HOST;
  if (!redisHost) {
    log('  ❌ REDIS_HOST: Not configured', 'red');
    return false;
  }

  if (redisHost === 'localhost' || redisHost === '127.0.0.1') {
    log('  ✅ REDIS_HOST: Configured (localhost)', 'green');
    log('     Make sure Redis is running: docker-compose up -d redis', 'cyan');
  } else {
    log('  ✅ REDIS_HOST: Configured (remote)', 'green');
  }

  return true;
}

function main() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║   OAuth Setup Verification - Unmotivated Hero   ║', 'blue');
  log('╚════════════════════════════════════════════╝\n', 'blue');

  const env = checkEnvFile();
  if (!env) {
    process.exit(1);
  }

  const platforms = {
    google: {
      name: '📺 YouTube (Google OAuth)',
      vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'],
      setupUrl: 'https://console.cloud.google.com/',
      env,
    },
    facebook: {
      name: '📘 Facebook / Instagram',
      vars: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET', 'FACEBOOK_REDIRECT_URI'],
      setupUrl: 'https://developers.facebook.com/',
      env,
    },
    tiktok: {
      name: '🎵 TikTok',
      vars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI'],
      setupUrl: 'https://developers.tiktok.com/',
      env,
    },
  };

  let allPlatformsReady = true;
  const platformResults = {};

  Object.keys(platforms).forEach(key => {
    platformResults[key] = checkOAuthPlatform(key, platforms[key]);
    if (!platformResults[key]) allPlatformsReady = false;
  });

  const securityOk = checkEncryption(env);
  const databaseOk = checkDatabase(env);

  // Summary
  log('\n═══════════════════════════════════════════', 'blue');
  log('📊 Summary:', 'bold');
  log('═══════════════════════════════════════════', 'blue');

  const readyCount = Object.values(platformResults).filter(Boolean).length;
  log(`\n  Platforms configured: ${readyCount}/3`, readyCount === 3 ? 'green' : 'yellow');

  if (readyCount === 0) {
    log('\n⚠️  No OAuth platforms configured yet', 'yellow');
    log('\n📚 Next steps:', 'cyan');
    log('   1. Read OAUTH_SETUP_GUIDE.md', 'cyan');
    log('   2. Create OAuth apps on each platform', 'cyan');
    log('   3. Add credentials to backend/.env', 'cyan');
    log('   4. Run this script again to verify', 'cyan');
  } else if (readyCount < 3) {
    log(`\n✅ ${readyCount} platform(s) ready!`, 'green');
    log(`⚠️  ${3 - readyCount} platform(s) still need configuration`, 'yellow');
    log('\nSee OAUTH_SETUP_GUIDE.md for setup instructions', 'cyan');
  } else {
    log('\n🎉 All OAuth platforms configured!', 'green');
  }

  if (!securityOk) {
    log('\n⚠️  Security configuration needs attention', 'yellow');
  }

  if (!databaseOk) {
    log('\n❌ Database configuration incomplete', 'red');
  }

  // Next steps
  if (allPlatformsReady && securityOk && databaseOk) {
    log('\n✨ System is ready!', 'green');
    log('\nTo start the app:', 'cyan');
    log('   cd backend && npm run start:dev', 'cyan');
    log('   cd frontend && npm run dev', 'cyan');
    log('\nOr use the quick start script:', 'cyan');
    log('   ./scripts/dev-start.sh', 'cyan');
  } else {
    log('\n📋 Configuration incomplete. See above for details.', 'yellow');
  }

  log('\n');
}

main();
