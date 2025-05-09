import express from 'express';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/backup', (req, res) => {
  exec('/mnt/scripts/backup.sh', (error, stdout, stderr) => {
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