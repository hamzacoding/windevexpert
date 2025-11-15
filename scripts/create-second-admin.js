const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createSecondAdmin() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'windevexpert_platform'
    });

    console.log('✅ Database connection successful');

    // Generate bcrypt hash for password 'admin123'
    const password = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Password hashed successfully');

    // Check if second admin already exists
    const [existingUser] = await connection.execute(
      'SELECT * FROM user WHERE email = ?',
      ['admin2@windevexpert.com']
    );

    if (existingUser.length > 0) {
      console.log('⚠️  Second admin user already exists');
      
      // Update existing user with correct values
      await connection.execute(
        `UPDATE user SET 
         password = ?, 
         emailVerified = ?, 
         isBlocked = ?, 
         role = ?
         WHERE email = ?`,
        [
          hashedPassword,
          new Date(),
          false,
          'ADMIN',
          'admin2@windevexpert.com'
        ]
      );
      
      console.log('✅ Existing second admin user updated successfully');
    } else {
      // Create new second admin user
      await connection.execute(
        `INSERT INTO user (
          name, 
          email, 
          password, 
          emailVerified, 
          isBlocked, 
          role,
          createdAt,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'Administrateur 2',
          'admin2@windevexpert.com',
          hashedPassword,
          new Date(),
          false,
          'ADMIN',
          new Date(),
          new Date()
        ]
      );
      
      console.log('✅ Second admin user created successfully');
    }

    // Verify the second admin user
    const [verifyUser] = await connection.execute(
      'SELECT id, name, email, role, emailVerified, isBlocked FROM user WHERE email = ?',
      ['admin2@windevexpert.com']
    );

    if (verifyUser.length > 0) {
      const user = verifyUser[0];
      console.log('\n📋 Second Admin User Details:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Is Blocked: ${user.isBlocked}`);
      
      // Test password verification
      const [passwordCheck] = await connection.execute(
        'SELECT password FROM user WHERE email = ?',
        ['admin2@windevexpert.com']
      );
      
      const isPasswordValid = await bcrypt.compare('admin123', passwordCheck[0].password);
      console.log(`   Password Valid: ${isPasswordValid ? '✅ Yes' : '❌ No'}`);
      
      console.log('\n🎉 Second admin account is ready for testing!');
      console.log('\n📝 Login Credentials:');
      console.log('   Email: admin2@windevexpert.com');
      console.log('   Password: admin123');
    }

  } catch (error) {
    console.error('❌ Error creating second admin:', error.message);
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

// Run the script
createSecondAdmin();