// Use modern ES Module 'import' syntax
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the backend/.env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE_PATH = path.join(__dirname, 'food_nutrition.csv');
const TABLE_NAME = 'food_nutrition_data';

const COLUMN_MAPPING = {
    'food': 'food_name',
    'Caloric Value': 'caloric_value',
    'Carbohydrates': 'carbohydrates',
    'Protein': 'protein',
    'Fats': 'fats',
    'Free Sugar': 'free_sugar',
    'Fibre': 'fibre',
    'Sodium': 'sodium',
    'Calcium': 'calcium',
    'Iron': 'iron',
    'Vitamin C': 'vitamin_c',
    'Folate': 'folate'
};

const LOOKUP_MAPPING = Object.entries(COLUMN_MAPPING).reduce((acc, [key, value]) => {
    acc[key.trim().toLowerCase()] = value;
    return acc;
}, {});


async function seedDatabase() {
    console.log(`Starting to seed the '${TABLE_NAME}' table...`);
    
    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`[FATAL] CSV file not found at path: ${CSV_FILE_PATH}`);
        return;
    }
    console.log(`[DEBUG] Found CSV file at: ${CSV_FILE_PATH}`);

    console.log(`Deleting existing data from '${TABLE_NAME}'...`);
    const { error: deleteError } = await supabase.from(TABLE_NAME).delete().gt('id', 0);
    if (deleteError) {
        console.error("Error deleting existing data:", deleteError.message);
        return;
    }
    console.log("Existing data deleted successfully.");

    const recordsToInsert = [];
    const parser = fs.createReadStream(CSV_FILE_PATH).pipe(parse({
        columns: header => header.map(column => column.trim()),
        skip_empty_lines: true,
        trim: true,
        cast: (value, context) => {
            if (context.header) return value;
            if (value === '' || value === null) return null;
            if (context.column.toLowerCase().trim() === 'food') return value;
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        },
    }));

    parser.on('error', (err) => {
        console.error('[FATAL] CSV Parser Error:', err.message);
    });

    for await (const record of parser) {
        const mappedRecord = {};
        for (const csvKey in record) {
            const cleanedKey = csvKey.trim().toLowerCase();
            const dbColumn = LOOKUP_MAPPING[cleanedKey];
            if (dbColumn) {
                mappedRecord[dbColumn] = record[csvKey];
            }
        }
        recordsToInsert.push(mappedRecord);
    }

    console.log(`[DEBUG] Finished reading CSV file. Found ${recordsToInsert.length} total rows to insert.`);

    // --- THE FINAL FIX ---
    // Instead of inserting in one large chunk, we insert in smaller, safer chunks.
    // This is more resilient to single-row errors and less likely to time out.
    const CHUNK_SIZE = 100;
    let totalRowsInserted = 0;
    for (let i = 0; i < recordsToInsert.length; i += CHUNK_SIZE) {
        const chunk = recordsToInsert.slice(i, i + CHUNK_SIZE);
        
        const { data, error } = await supabase.from(TABLE_NAME).insert(chunk).select();
        
        if (error) {
            console.error(`Error inserting chunk starting at row ${i}:`, error.message);
            console.error("[DEBUG] First record of failing chunk:", chunk[0]);
            return; // Stop on the first error
        }
        
        if (data) {
            totalRowsInserted += data.length;
            console.log(`Inserted ${data.length} rows. Total inserted: ${totalRowsInserted}`);
        }
    }


    if (totalRowsInserted === 0 && recordsToInsert.length > 0) {
        console.log(`[WARNING] Seeding complete, but 0 rows were inserted. Please check your CSV file and Supabase table schema.`);
    } else {
        console.log(`✅ Successfully seeded the database with ${totalRowsInserted} records.`);
    }
}

seedDatabase();

