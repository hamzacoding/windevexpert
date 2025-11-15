const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function comprehensiveAuthDebug() {
  let connection;
  
  try {
    console.log('🔍 COMPREHENSIVE AUTHENTICATION DEBUG');
    console.log('=====================================\n');

    // 1. Database Connection Test
    console.log('1️⃣ Testing Database Connection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'windevexpert_platform'
    });
    console.log('✅ Database connection successful\n');

    // 2. Check Both Admin Users
    console.log('2️⃣ Checking Admin Users...');
    const adminEmails = ['admin@windevexpert.com', 'admin2@windevexpert.com'];
    
    for (const email of adminEmails) {
      console.log(`\n📧 Checking: ${email}`);
      const [users] = await connection.execute(
        'SELECT id, name, email, password, role, emailVerified, isBlocked, createdAt FROM user WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      const user = users[0];
      console.log(`   ✅ User exists - ID: ${user.id}`);
      console.log(`   📝 Name: ${user.name}`);
      console.log(`   🔑 Role: ${user.role}`);
      console.log(`   📅 Email Verified: ${user.emailVerified}`);
      console.log(`   🚫 Is Blocked: ${user.isBlocked}`);
      console.log(`   📅 Created: ${user.createdAt}`);

      // Test password
      const isPasswordValid = await bcrypt.compare('admin123', user.password);
      console.log(`   🔐 Password Valid: ${isPasswordValid ? '✅ Yes' : '❌ No'}`);
      
      // Check password hash format
      const hashPrefix = user.password.substring(0, 4);
      console.log(`   🔒 Hash Format: ${hashPrefix} (${hashPrefix === '$2b$' ? 'bcrypt' : 'unknown'})`);
    }

    // 3. Environment Variables Check
    console.log('\n3️⃣ Checking Environment Variables...');
    const envVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'DATABASE_URL',
      'DB_HOST',
      'DB_USER',
      'DB_NAME'
    ];

    for (const envVar of envVars) {
      const value = process.env[envVar];
      console.log(`   ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`);
      if (envVar === 'NEXTAUTH_URL' && value) {
        console.log(`     Value: ${value}`);
      }
    }

    // 4. Database Schema Check
    console.log('\n4️⃣ Checking Database Schema...');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`   Tables found: ${tableNames.join(', ')}`);
    
    if (tableNames.includes('user')) {
      const [columns] = await connection.execute('DESCRIBE user');
      console.log('   User table columns:');
      columns.forEach(col => {
        console.log(`     - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    // 5. Test Authentication Logic
    console.log('\n5️⃣ Testing Authentication Logic...');
    const testEmail = 'admin@windevexpert.com';
    const testPassword = 'admin123';
    
    const [authUsers] = await connection.execute(
      'SELECT * FROM user WHERE email = ?',
      [testEmail]
    );

    if (authUsers.length > 0) {
      const authUser = authUsers[0];
      console.log(`   📧 Email found: ${authUser.email}`);
      
      const passwordMatch = await bcrypt.compare(testPassword, authUser.password);
      console.log(`   🔐 Password match: ${passwordMatch ? '✅ Yes' : '❌ No'}`);
      
      const emailVerified = authUser.emailVerified !== null;
      console.log(`   📧 Email verified: ${emailVerified ? '✅ Yes' : '❌ No'}`);
      
      const notBlocked = !authUser.isBlocked;
      console.log(`   🚫 Not blocked: ${notBlocked ? '✅ Yes' : '❌ No'}`);
      
      const isAdmin = authUser.role === 'ADMIN';
      console.log(`   👑 Is Admin: ${isAdmin ? '✅ Yes' : '❌ No'}`);
      
      const shouldAuthenticate = passwordMatch && emailVerified && notBlocked;
      console.log(`   🎯 Should authenticate: ${shouldAuthenticate ? '✅ Yes' : '❌ No'}`);
    }

    // 6. Check for any authentication-related records
    console.log('\n6️⃣ Checking Authentication Records...');
    
    // Check for sessions
    if (tableNames.includes('sessions')) {
      const [sessions] = await connection.execute('SELECT COUNT(*) as count FROM sessions');
      console.log(`   Active sessions: ${sessions[0].count}`);
    }
    
    // Check for accounts
    if (tableNames.includes('accounts')) {
      const [accounts] = await connection.execute('SELECT COUNT(*) as count FROM accounts');
      console.log(`   Linked accounts: ${accounts[0].count}`);
    }

    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('If all checks above show ✅, the issue might be:');
    console.log('1. NextAuth configuration in src/lib/auth.ts');
    console.log('2. API route configuration');
    console.log('3. Session/JWT token issues');
    console.log('4. Browser cache/cookies');
    console.log('5. Network/CORS issues');

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Load environment variables
require('dotenv').config();

// Run the comprehensive debug
comprehensiveAuthDebug();