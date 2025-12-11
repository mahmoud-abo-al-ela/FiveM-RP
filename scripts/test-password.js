#!/usr/bin/env node

/**
 * Password Hash Tester
 * This script helps you verify password hashes
 */

const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const password = process.argv[2] || 'admin123';
const hash = hashPassword(password);

console.log('\n' + '='.repeat(80));
console.log('Password Hash Test');
console.log('='.repeat(80));
console.log(`\nPassword: ${password}`);
console.log(`SHA-256 Hash: ${hash}`);
console.log('\n' + '='.repeat(80));
console.log('\nTo check if this matches your database:');
console.log('\nRun this SQL in Supabase:');
console.log(`\nSELECT username, password FROM admin_users WHERE password = '${hash}';`);
console.log('\nIf no results, the password in database is different.');
console.log('\nTo update the password in database:');
console.log(`\nUPDATE admin_users SET password = '${hash}' WHERE username = 'admin';`);
console.log('='.repeat(80) + '\n');
