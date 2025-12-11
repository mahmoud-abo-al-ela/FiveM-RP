#!/usr/bin/env node

/**
 * Admin User Creation Helper Script
 * 
 * This script helps you create admin users by generating SHA-256 hashed passwords
 * that can be inserted into the admin_users table.
 * 
 * Usage:
 *   node scripts/create-admin.js
 * 
 * Or with arguments:
 *   node scripts/create-admin.js username password email
 */

const crypto = require('crypto');
const readline = require('readline');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateSQL(username, password, email) {
    const hashedPassword = hashPassword(password);

    console.log('\n' + '='.repeat(80));
    console.log('Admin User Creation SQL');
    console.log('='.repeat(80));
    console.log('\nCopy and paste this SQL into your Supabase SQL Editor:\n');
    console.log('-- Create admin user');
    console.log(`INSERT INTO admin_users (username, password, email)`);
    console.log(`VALUES ('${username}', '${hashedPassword}', ${email ? `'${email}'` : 'NULL'});`);
    console.log('\n-- Or use the helper function:');
    console.log(`SELECT create_admin_user('${username}', '${password}'${email ? `, '${email}'` : ''});`);
    console.log('\n' + '='.repeat(80));
    console.log('\nCredentials:');
    console.log(`  Username: ${username}`);
    console.log(`  Password: ${password}`);
    console.log(`  Email: ${email || 'N/A'}`);
    console.log(`  Hashed Password: ${hashedPassword}`);
    console.log('='.repeat(80) + '\n');
    console.log('⚠️  IMPORTANT: Store these credentials securely!\n');
}

async function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log('\n🔐 Admin User Creation Helper\n');

        const username = await question('Enter admin username: ');
        if (!username) {
            console.error('❌ Username is required');
            process.exit(1);
        }

        const password = await question('Enter admin password: ');
        if (!password) {
            console.error('❌ Password is required');
            process.exit(1);
        }

        const email = await question('Enter admin email (optional): ');

        generateSQL(username.trim(), password, email.trim() || null);
    } finally {
        rl.close();
    }
}

// Check if arguments were provided
const args = process.argv.slice(2);

if (args.length >= 2) {
    const [username, password, email] = args;
    generateSQL(username, password, email || null);
} else if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(`
Admin User Creation Helper

Usage:
  node scripts/create-admin.js                    # Interactive mode
  node scripts/create-admin.js <user> <pass>      # Quick mode
  node scripts/create-admin.js <user> <pass> <email>  # With email

Examples:
  node scripts/create-admin.js
  node scripts/create-admin.js admin mypassword123
  node scripts/create-admin.js johndoe secret123 john@example.com

Options:
  -h, --help    Show this help message
  `);
} else {
    promptUser().catch(console.error);
}
