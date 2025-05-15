import { snapshot } from '$lib/snapshot.js';
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
    if (DATA_DIR === '' || BACKUP_DIR === '') {
        return json({ error: 'DATA_DIR or BACKUP_DIR environment variable is empty' }, { status: 500 });
    }
    const id = params.id;
    const dataDir = path.join(DATA_DIR, id);
    const backupsDir = path.join(BACKUP_DIR, id);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${id}-backup-${timestamp}`;
    const tarName = `${fileName}.tar.gz`;
    const tarPath = path.join(backupsDir, tarName);

    if (!fs.existsSync(dataDir)) {
        console.log(`${dataDir} not found`);
        // fs.mkdirSync(dataDir, { recursive: true });
        return json({ error: 'Validator data directory not found' }, { status: 404 });
    }
    const dataDirContents = fs.readdirSync(dataDir);
    if (dataDirContents.length === 0) {
        return json({ error: 'Validator data directory is empty' }, { status: 404 });
    }

    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }


    console.log('Snapshotting data directory');
    const dataSnapshotMetadata = await snapshot(dataDir);
    console.log('created snapshot');

    fs.writeFileSync(path.join(backupsDir, `${fileName}.json`), JSON.stringify(dataSnapshotMetadata, null, 2));

    console.log(`backing up ${id}, copying ${dataDir} to ${tarPath}`)
    return new Promise((resolve) => {
        exec(`tar -czf ${tarPath} -C ${dataDir} .`, (err) => {
            if (err) {
                resolve(json({ error: 'Backup failed', details: err.message }, { status: 500 }));
            } else {
                resolve(json({ message: 'Backup successful', snapshot: dataSnapshotMetadata, backup: tarPath }));
            }
        });
    });
}

export async function GET({ params }) {
    if (!BACKUP_DIR) {
        return json({ error: 'BACKUP_DIR environment variable not set' }, { status: 500 });
    }
    if (BACKUP_DIR === '') {
        return json({ error: 'BACKUP_DIR environment variable is empty' }, { status: 500 });
    }
    const id = params.id;
    const backupsDir = path.join(BACKUP_DIR, id);

    console.log(`listing ${backupsDir}`)
    if (!fs.existsSync(backupsDir)) {
        return json([]);
    }
    const files = fs.readdirSync(backupsDir)
        .filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    return json(files);
}
