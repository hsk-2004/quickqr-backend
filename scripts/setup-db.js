/**
 * Database Setup Script
 * 
 * Creates the PostgreSQL database and users table with proper schema.
 * Run this script once before starting the application.
 * 
 * Usage: node scripts/setup-db.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();

/**
 * SQL commands to create database and tables
 */
const SQL_COMMANDS = `
-- Create database (if not exists)
CREATE DATABASE auth_app;

-- Connect to auth_app database (this needs to be done separately in real connection)
-- Users table with UUID primary key
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * Setup function
 */
async function setupDatabase() {
  // First, connect to default 'postgres' database to create auth_app
  const superClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // Connect to default postgres DB
  });

  try {
    console.log('🔄 Connecting to PostgreSQL server...');
    await superClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const dbExists = await superClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );

    if (!dbExists.rows.length) {
      console.log(`📦 Creating database '${process.env.DB_NAME}'...`);
      await superClient.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✅ Database '${process.env.DB_NAME}' created`);
    } else {
      console.log(`✅ Database '${process.env.DB_NAME}' already exists`);
    }

    await superClient.end();
    console.log('✅ Disconnected from PostgreSQL server\n');

    // Now connect to auth_app database to create tables
    const appClient = new Client({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

    console.log(`🔄 Connecting to '${process.env.DB_NAME}' database...`);
    await appClient.connect();
    console.log(`✅ Connected to '${process.env.DB_NAME}'`);

    // Create users table
    console.log('📦 Creating users table...');
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create indexes
    console.log('📦 Creating indexes...');
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await appClient.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
    console.log('✅ Indexes created');

    // Create trigger function and trigger
    console.log('📦 Creating update trigger...');
    await appClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await appClient.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Update trigger created');

    await appClient.end();
    console.log(`✅ Disconnected from '${process.env.DB_NAME}'\n`);

    console.log('✨ Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update .env with your PostgreSQL credentials if needed');
    console.log('   2. Run: npm install');
    console.log('   3. Run: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
