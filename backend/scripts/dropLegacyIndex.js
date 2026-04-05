import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dropLegacyIndex = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('attendances');

        console.log('Checking indexes on attendances collection...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        const legacyIndexName = 'user_1_date_1';
        if (indexes.some(idx => idx.name === legacyIndexName)) {
            console.log(`Dropping legacy index: ${legacyIndexName}...`);
            await collection.dropIndex(legacyIndexName);
            console.log('Legacy index dropped successfully.');
        } else {
            console.log(`Legacy index ${legacyIndexName} not found. No action needed.`);
        }

        console.log('Verifying remaining indexes...');
        const remainingIndexes = await collection.indexes();
        console.log('Remaining indexes:', remainingIndexes.map(idx => idx.name));

        process.exit(0);
    } catch (error) {
        console.error('Error dropping index:', error);
        process.exit(1);
    }
};

dropLegacyIndex();
