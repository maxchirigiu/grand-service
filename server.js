const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// ensure data dir and file exist
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if(!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf8');

function readBookings(){
  try{
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  }catch(e){
    return [];
  }
}
function writeBookings(data){
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API endpoints
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  if(!booking || !booking.name || !booking.phone || !booking.datetime){
    return res.status(400).json({error: 'Missing required fields: name, phone, datetime'});
  }
  const bookings = readBookings();
  booking.id = (bookings.length? (bookings[bookings.length-1].id || bookings.length) + 1 : 1);
  booking.receivedAt = new Date().toISOString();
  bookings.push(booking);
  writeBookings(bookings);
  res.json({ok:true, booking});
});

app.get('/api/bookings', (req, res) => {
  res.json(readBookings());
});

// fallback to serve index for SPA-like navigation
app.get('*', (req, res) =>{
  const filePath = path.join(__dirname, 'index.html');
  if(fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).send('Not found');
});

app.listen(PORT, ()=>{
  console.log(`Grand Service server running on http://localhost:${PORT}`);
});
