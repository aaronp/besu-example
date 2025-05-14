import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { RestoreRequest, RestoreResponse } from '$lib/types';
import { diffSnapshot, snapshot } from '$lib/snapshot';

const DATA_DIR = process.env.DATA_DIR;
const BACKUP_DIR = process.env.BACKUP_DIR;

export async function POST({ request }) {
    if (!DATA_DIR || !BACKUP_DIR) {
        return json({ error: 'DATA_DIR or BACKUP_DIR environment variable not set' }, { status: 500 });
    }
    const { backup, namespace, nodeName }: RestoreRequest = await request.json();
    if (!backup || !namespace || !nodeName) {
        return json({ error: 'Missing backup, namespace, or nodeName' }, { status: 400 });
    }
    const dataDir = path.join(DATA_DIR, nodeName);

    const tarName = `${backup}.tar.gz`;
    const snapshotDataName = `${backup}.json`;
    const backupPath = path.join(BACKUP_DIR, nodeName, tarName);
    const snapshotDataPath = path.join(BACKUP_DIR, nodeName, snapshotDataName);
    if (!fs.existsSync(backupPath)) {
        return json({ error: 'Backup file not found' }, { status: 404 });
    }
    if (!fs.existsSync(snapshotDataPath)) {
        return json({ error: 'Backup metadata file not found' }, { status: 404 });
    }
    const previousSnapshotData = JSON.parse(fs.readFileSync(snapshotDataPath, 'utf8'));

    console.log('Restoring backup', backupPath, 'to', dataDir);
    // Remove all contents of the dataDir
    try {
        if (fs.existsSync(dataDir)) {
            fs.rmSync(dataDir, { recursive: true, force: true });
        }
        fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
        return json({ error: 'Failed to clear data directory', details: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }

    // Untar the backup into the dataDir
    return new Promise(async (resolve) => {
        exec(`tar -xzf ${backupPath} -C ${dataDir}`, async (err) => {
            if (err) {
                resolve(json({ error: 'Restore failed', details: err.message }, { status: 500 }));
            } else {

                console.log('Checking snapshot');
                const checkSnapshot = await snapshot(dataDir);
                const diff = diffSnapshot(previousSnapshotData, checkSnapshot);
                console.log('Returning diff');

                resolve(json({ message: 'Restore successful', diff }));
            }
        });
    });
} 