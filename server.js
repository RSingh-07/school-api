// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'schooldb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// validators
function isValidLatitude(lat) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}
function isValidLongitude(lng) {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

// Haversine formula to calculate distance in km
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = v => v * Math.PI / 180;
  const R = 6371; // earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// POST /addSchool
app.post('/addSchool', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    if (!name || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'name, address, latitude and longitude are required' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude values' });
    }
    const [result] = await pool.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, lat, lng]
    );
    return res.status(201).json({ message: 'School added', id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /listSchools?lat=...&lng=...
app.get('/listSchools', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);
    if (!isValidLatitude(userLat) || !isValidLongitude(userLng)) {
      return res.status(400).json({ error: 'Valid query parameters lat and lng are required' });
    }
    const [rows] = await pool.query('SELECT id, name, address, latitude, longitude FROM schools');
    const withDist = rows.map(r => {
      const distKm = haversineDistanceKm(userLat, userLng, Number(r.latitude), Number(r.longitude));
      return { ...r, distanceKm: Number(distKm.toFixed(3)) };
    });
    withDist.sort((a,b) => a.distanceKm - b.distanceKm);
    return res.json({ count: withDist.length, schools: withDist });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
