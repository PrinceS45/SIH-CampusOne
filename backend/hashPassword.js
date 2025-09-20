import bcrypt from 'bcryptjs';
import { exit } from 'process';

// This function hashes a password
const hashPassword = async (password) => {
  if (!password) {
    console.error('Please provide a password to hash.');
    console.log('Usage: node hashPassword.js <your-password-here>');
    exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Your hashed password is:');
    console.log(hashedPassword);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
};

// Get the password from the command line arguments
const passwordToHash = process.argv[2];
hashPassword(passwordToHash);
