// server/index.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

// Load/save helpers
const load = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const save = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Initialize db file if missing
if (!fs.existsSync(DB_FILE)) save([]);

// GET all saved IPs
app.get('/api/ips', (req, res) => res.json(load()));

// POST save a new IP
app.post('/api/ips', (req, res) => {
    const db = load();
    const entry = { id: uuidv4(), savedAt: new Date().toISOString(), ...req.body };
    db.push(entry);
    save(db);
    res.status(201).json(entry);
});

// PUT update notes/threat level
app.put('/api/ips/:id', (req, res) => {
    const db = load();
    const idx = db.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });     
    db[idx] = { ...db[idx], ...req.body };
    save(db);
    res.json(db[idx]);
});

// DELETE an IP
app.delete('/api/ips/:id', (req, res) => {
    let db = load();
    db = db.filter(e => e.id !== req.params.id);
    save(db);
    res.status(204).end();
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));