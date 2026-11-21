
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MEM_FILE = path.join(__dirname, 'memory.json');

function loadMem() {
  try {
    return JSON.parse(fs.readFileSync(MEM_FILE, 'utf8'));
  } catch {
    return { profile: '', facts: [], recent: [] };
  }
}

function saveMem(data) {
  fs.writeFileSync(MEM_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/memory', (req, res) => {
  res.json(loadMem());
});

app.post('/api/memory', (req, res) => {
  const data = loadMem();
  data.profile = req.body.profile || data.profile;
  data.facts = req.body.facts || data.facts;
  saveMem(data);
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Bujjikonda AI is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Bujjikonda AI running on port ' + PORT);
});
