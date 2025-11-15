const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const Lantern = require('./models/Lantern');

// -------------------- MONGO CONNECT --------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB error:', err));

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());

// เสิร์ฟไฟล์ static
app.use(express.static(path.join(__dirname, 'public')));

// ให้หน้าเว็บหลักแสดง index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// -------------------- API --------------------
app.post('/api/lanterns', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'message is required' });

    const lantern = await Lantern.create({ message });
    res.status(201).json(lantern);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lanterns', async (req, res) => {
  try {
    const items = await Lantern.find().sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'server error' });
  }
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
