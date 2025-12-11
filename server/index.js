const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Import Postgres driver
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Test DB Connection
pool.connect((err) => {
    if (err) console.error('Database connection error:', err.stack);
    else console.log('Connected to PostgreSQL Database');
});

// --- AUTHENTICATION CREDENTIALS (MOCK) ---
// In a real production app, store these in your .env file
const ACCESS_KEY = "#33";
const ADMIN_USER = {
    username: "admin",
    password: "ModexPassword123!" 
};

// --- ROUTES ---

// 1. GET All Sites
app.get('/api/sites', async (req, res) => {
    try {
        // Query to get data and convert PostGIS geometry to GeoJSON
        const result = await pool.query(`
            SELECT id, name, pfas_level,
            ST_AsGeoJSON(location)::json as geometry
            FROM contamination_sites
        `);

        // Transform into the GeoJSON format MapLibre expects
        const geoJson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id,
                    name: row.name,
                    level: row.pfas_level
                }
            }))
        };

        res.json(geoJson);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. POST: Add a new Contamination Site
app.post('/api/sites', async (req, res) => {
    try {
        const { name, pfas_level, lat, lng } = req.body;

        // Validation: Ensure all fields exist and are valid numbers
        if (!name || !pfas_level || !lat || !lng) {
            return res.status(400).json({ error: "All fields (name, pfas_level, lat, lng) are required." });
        }
        if (isNaN(pfas_level) || isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ error: "Level, Latitude, and Longitude must be numbers." });
        }
        
        // Insert into Postgres using PostGIS for location
        const query = `
            INSERT INTO contamination_sites (name, pfas_level, location)
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326))
            RETURNING id, name, pfas_level;
        `;
        
        const newSite = await pool.query(query, [name, pfas_level, lat, lng]);
        res.json(newSite.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. DELETE: Remove a Site by ID
app.delete('/api/sites/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM contamination_sites WHERE id = $1", [id]);
        res.json({ message: "Site deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// --- AUTH ROUTES ---

// 4. Access Key Verification (Gatekeeper Route)
app.post('/api/auth/verify-key', (req, res) => {
    const { code } = req.body;
    if (code === ACCESS_KEY) {
        res.json({ success: true, message: "Access Granted" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Access Key" });
    }
});

// 5. Admin Login (Authentication Route)
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        res.json({ success: true, message: "Login Successful" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});