import express, { Request, Response } from 'express';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { promisify } from 'util';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const SCRIPT_DIR = process.env.SCRIPT_DIR || path.join(__dirname, '../../besu-scripts');
const execAsync = promisify(exec);

app.use(express.json());

app.post('/backup', async (_req: Request, res: Response) => {
    try {
        const { stdout, stderr } = await execAsync(`${SCRIPT_DIR}/backup.sh`);
        res.json({ stdout, stderr, error: null });
    } catch (error: any) {
        res.json({ stdout: error?.stdout, stderr: error?.stderr, error: error.message });
    }
});

app.post('/manual', async (req: Request, res: Response) => {
    const { script } = req.body;
    if (typeof script !== 'string' || !script.trim()) {
        res.json({ error: 'No script provided.' });
        return;
    }
    try {
        const { stdout, stderr } = await execAsync(script);
        res.json({ stdout, stderr, error: null });
    } catch (error: any) {
        res.json({ stdout: error?.stdout, stderr: error?.stderr, error: error.message });
    }
});

app.post('/send-transaction', async (req: Request, res: Response) => {
    const { rpcUrl, from, to, value } = req.body;
    if (!rpcUrl || !from || !to || typeof value === 'undefined') {
        res.json({ error: 'Missing required fields.' });
        return;
    }
    try {
        const tx = {
            from,
            to,
            value: '0x' + BigInt(value).toString(16)
        };
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_sendTransaction',
                params: [tx],
                id: 1
            })
        });
        const data = await response.json();
        if ((data as any).error) {
            res.json({ error: (data as any).error.message });
            return;
        }
        res.json({ result: (data as any).result });
    } catch (err: any) {
        res.json({ error: err.message });
    }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 