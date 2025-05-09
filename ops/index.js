import express from 'express';
import { exec } from 'child_process';
import dotenv from 'dotenv';
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 