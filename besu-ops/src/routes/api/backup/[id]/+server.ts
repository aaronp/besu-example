import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR;
const BACKUP_DIR = process.env.BACKUP_DIR;

export async function POST({ params }) {
    console.log('starting back up', {
        dataDir: DATA_DIR,
        backupDir: BACKUP_DIR,
    })
    if (!DATA_DIR || !BACKUP_DIR) {
        return json({ error: 'DATA_DIR or BACKUP_DIR environment variable not set' }, { status: 500 });
    }
    const id = params.id;
    const dataDir = path.join(DATA_DIR, id);
    const backupsDir = path.join(BACKUP_DIR, id);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tarName = `${id}-backup-${timestamp}.tar.gz`;
    const tarPath = path.join(backupsDir, tarName);

    if (!fs.existsSync(dataDir)) {
        return json({ error: 'Validator data directory not found' }, { status: 404 });
    }
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }

    console.log(`backing up ${id}, copying ${dataDir} to ${tarPath}`)
    return new Promise((resolve) => {
        exec(`tar -czf ${tarPath} -C ${dataDir} .`, (err) => {
            if (err) {
                resolve(json({ error: 'Backup failed', details: err.message }, { status: 500 }));
            } else {
                resolve(json({ message: 'Backup successful', backup: tarPath }));
            }
        });
    });
}

export async function GET({ params }) {
    if (!BACKUP_DIR) {
        return json({ error: 'BACKUP_DIR environment variable not set' }, { status: 500 });
    }
    const id = params.id;
    const backupsDir = path.join(BACKUP_DIR, id);

    console.log(`listing ${backupsDir}`)
    if (!fs.existsSync(backupsDir)) {
        return json([]);
    }
    const files = fs.readdirSync(backupsDir)
        .filter(f => f.endsWith('.tar.gz'));
    return json(files);
} 