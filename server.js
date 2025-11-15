const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// -------------------- Static Files --------------------
app.use(express.static(path.join(__dirname, 'public')));

// เสิร์ฟ index.html ที่อยู่ใน public/
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------- Middleware --------------------

app.post('/api/lanterns', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });      }

    const lantern = await Lantern.create({ message });
    res.status(201).json(lantern);
  } catch (err) {    console.error('Error in POST /api/lanterns:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lanterns', async (req, res) => {
  try {
    const items = await Lantern.find()
      .sort({ createdAt: -1 })
    .limit(50);
    res.json(items);
  } catch (err) {
    console.error('Error in GET /api/lanterns:', err);
    res.status(500).json({ error: 'server error' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
