/**
 * Neon Database Setup Script
 *
 * Creates required tables, indexes, and triggers.
 * DOES NOT create database (Neon already provides it).
 *
 * Usage: node scripts/setup-db.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing in .env');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  try {
    console.log('🔄 Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to Neon');

    // Enable UUID generation (Neon supports this)
    console.log('📦 Enabling pgcrypto...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // USERS TABLE
    console.log('📦 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // QR CODES TABLE
    console.log('📦 Creating qr_codes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // INDEXES
    console.log('📦 Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_qr_user_id ON qr_codes(user_id);`);

    // UPDATED_AT TRIGGER FUNCTION
    console.log('📦 Creating updated_at trigger...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // TRIGGERS
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_qr_updated_at ON qr_codes;
      CREATE TRIGGER update_qr_updated_at
      BEFORE UPDATE ON qr_codes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✨ Neon database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Neon DB setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
