const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

console.log('URI:', process.env.MONGODB_URI);

const Lantern = require('./models/Lantern');
const app = express();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Lantern Message API is running');
});

app.post('/api/lanterns', async (req, res) => {
  try {
    console.log(' POST /api/lanterns body =', req.body);

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
    // ชั่วคราวให้ดู error จริง ๆ จะได้ debug ง่าย
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/lanterns', async (req, res) => {
  try {
    const items = await Lantern.find()
      .sort({ createdAt: -1 }) // ใหม่ → เก่า
      .limit(50);              // เอาแค่ 50 อันพอ
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});