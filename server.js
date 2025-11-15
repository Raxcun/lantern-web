const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

console.log('URI:', process.env.MONGODB_URI);

const Lantern = require('./models/Lantern');
const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});


app.post('/api/lanterns', async (req, res) => {
  try {
    console.log('POST /api/lanterns body =', req.body);

    const { message } = req.body;

    if (!message || !message.trim()) {
      console.log('message is empty');
      return res.status(400).json({ error: 'message is required' });
    }

    const lantern = await Lantern.create({ message });
    console.log('Saved lantern:', lantern);

    res.status(201).json(lantern);
  } catch (err) {
    console.error('Error in POST /api/lanterns:', err);
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
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// -------------------- Start server --------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
