const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testAuthDirect() {
  let connection;
  
  try {
    console.log('🧪 DIRECT AUTHENTICATION TEST');
    console.log('==============================\n');

    // Create database connection (same as Prisma)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'windevexpert_platform'
    });

    console.log('✅ Database connection successful\n');

    // Simulate the exact authorize function logic
    const credentials = {
      email: 'admin@windevexpert.com',
      password: 'admin123'
    };

    console.log('🔍 Testing credentials:');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Password: ${credentials.password}\n`);

    // Step 1: Check if credentials exist
    if (!credentials?.email || !credentials?.password) {
      console.log('❌ Missing credentials');
      return;
    }
    console.log('✅ Credentials provided\n');

    // Step 2: Find user in database
    console.log('🔍 Looking up user in database...');
    const [users] = await connection.execute(
      `SELECT 
        id, email, name, password, role, emailVerified, isBlocked, blockedReason 
       FROM user 
       WHERE email = ?`,
      [credentials.email]
    );

    if (users.length === 0) {
      console.log('❌ User not found');
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   Is Blocked: ${user.isBlocked}`);
    console.log(`   Blocked Reason: ${user.blockedReason || 'N/A'}\n`);

    // Step 3: Check if password exists
    if (!user.password) {
      console.log('❌ No password set for user (OAuth user?)');
      return;
    }
    console.log('✅ Password exists in database\n');

    // Step 4: Verify password
    console.log('🔐 Verifying password...');
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    console.log(`   Password valid: ${isPasswordValid ? '✅ Yes' : '❌ No'}`);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return;
    }
    console.log('✅ Password verification successful\n');

    // Step 5: Check email verification
    console.log('📧 Checking email verification...');
    const emailVerified = user.emailVerified !== null;
    console.log(`   Email verified: ${emailVerified ? '✅ Yes' : '❌ No'}`);
    
    if (!emailVerified) {
      console.log('❌ Email not verified - authentication should fail');
      return;
    }
    console.log('✅ Email verification passed\n');

    // Step 6: Check if user is blocked
    console.log('🚫 Checking if user is blocked...');
    const isBlocked = user.isBlocked;
    console.log(`   User blocked: ${isBlocked ? '❌ Yes' : '✅ No'}`);
    
    if (isBlocked) {
      console.log(`❌ User is blocked - Reason: ${user.blockedReason || 'No reason provided'}`);
      return;
    }
    console.log('✅ User is not blocked\n');

    // Step 7: Create return object (what NextAuth expects)
    const returnUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    console.log('🎉 AUTHENTICATION SUCCESSFUL!');
    console.log('==============================');
    console.log('Return object:');
    console.log(JSON.stringify(returnUser, null, 2));
    console.log('\n✅ This user should be able to authenticate successfully');
    console.log('✅ All conditions are met for successful login');

    // Additional debugging info
    console.log('\n🔍 ADDITIONAL DEBUG INFO');
    console.log('========================');
    console.log(`Database password hash: ${user.password.substring(0, 20)}...`);
    console.log(`Hash algorithm: ${user.password.startsWith('$2b$') ? 'bcrypt' : 'unknown'}`);
    console.log(`Email verification date: ${user.emailVerified}`);
    console.log(`User creation date: ${user.createdAt || 'N/A'}`);

  } catch (error) {
    console.error('❌ Error during authentication test:', error.message);
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

// Run the test
testAuthDirect();