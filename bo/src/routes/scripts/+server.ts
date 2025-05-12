import { json } from '@sveltejs/kit';
import { exec } from 'child_process';

export async function POST({ request }) {
    const { script } = await request.json();
    if (!script || typeof script !== 'string') {
        return json({ error: 'No script provided' }, { status: 400 });
    }
    return new Promise((resolve) => {
        exec(script, { timeout: 10000 }, (err, stdout, stderr) => {
            resolve(json({
                stdout,
                stderr: err ? (stderr || err.message) : stderr
            }));
        });
    });
} 