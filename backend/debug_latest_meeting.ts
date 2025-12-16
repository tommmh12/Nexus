
import dotenv from 'dotenv';
import path from 'path';
import { dbPool } from './src/infrastructure/database/connection';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkLatestMeeting() {
    try {
        console.log('Checking latest meeting...');
        const [rows] = await dbPool.execute(`
            SELECT id, title, provider, provider_config, created_at 
            FROM online_meetings 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        if ((rows as any).length === 0) {
            console.log('No meetings found.');
            return;
        }

        const meeting = (rows as any)[0];
        console.log('Latest Meeting:', {
            id: meeting.id,
            title: meeting.title,
            provider: meeting.provider,
            provider_config: meeting.provider_config ? JSON.parse(meeting.provider_config) : null,
            created_at: meeting.created_at
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkLatestMeeting();
