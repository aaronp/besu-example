const express = require('express');
const { exec } = require('child_process');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');
dotenv.config();

const app = express();
const PORT = 3001;
const SCRIPT_DIR = process.env.SCRIPT_DIR || path.join(__dirname, '../../besu-scripts');

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
  console.log(`Express backend running on http://localhost:${PORT}`);
}); 