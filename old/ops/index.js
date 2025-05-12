import express from 'express';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const app = express();
const PORT = 3000;
const SCRIPT_DIR = process.env.SCRIPT_DIR || '/mnt/scripts';

app.use(express.static('public'));
app.use(express.json());

app.post('/backup', (req, res) => {
  exec(`${SCRIPT_DIR}/backup.sh`, (error, stdout, stderr) => {
    res.json({
      stdout,
      stderr,
      error: error ? error.message : null
    });
  });
});

app.post('/manual', (req, res) => {
  const { script } = req.body;
  if (typeof script !== 'string' || !script.trim()) {
    return res.json({ error: 'No script provided.' });
  }
  exec(script, (error, stdout, stderr) => {
    res.json({
      stdout,
      stderr,
      error: error ? error.message : null
    });
  });
});

app.post('/send-transaction', async (req, res) => {
  const { rpcUrl, from, to, value } = req.body;
  if (!rpcUrl || !from || !to || typeof value === 'undefined') {
    return res.json({ error: 'Missing required fields.' });
  }
  try {
    const tx = {
      from,
      to,
      value: '0x' + BigInt(value).toString(16)
      // gas: '0x5208' // 21000 gas
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
    if (data.error) {
      return res.json({ error: data.error.message });
    }
    res.json({ result: data.result });
  } catch (err) {
    res.json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 