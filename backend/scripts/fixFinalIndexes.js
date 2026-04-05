import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const fixFinalIndexes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        const collection = db.collection('attendances');

        console.log('Checking indexes on attendances collection...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));

        const indexesToDrop = ['user_1_date_1_role_1', 'studentProfile_1_date_1'];
        
        for (const indexName of indexesToDrop) {
            if (indexes.some(idx => idx.name === indexName)) {
                console.log(`Dropping problematic index: ${indexName}...`);
                await collection.dropIndex(indexName);
                console.log(`Index ${indexName} dropped successfully.`);
            } else {
                console.log(`Index ${indexName} not found. Skipping.`);
            }
        }

        console.log('Verifying remaining indexes...');
        const remainingIndexes = await collection.indexes();
        console.log('Remaining indexes:', remainingIndexes.map(idx => idx.name));

        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixFinalIndexes();
