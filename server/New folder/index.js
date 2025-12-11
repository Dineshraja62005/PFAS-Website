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

// --- ROUTES ---

// GET All Sites (Real DB Query)
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
// --- NEW CRUD ROUTES ---

// 1. POST: Add a new Contamination Site
app.post('/api/sites', async (req, res) => {
    try {
        const { name, pfas_level, lat, lng } = req.body;
        
        // Insert into Postgres using PostGIS for location
        const query = `
            INSERT INTO contamination_sites (name, pfas_level, location)
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326))
            RETURNING *;
        `;
        
        const newSite = await pool.query(query, [name, pfas_level, lat, lng]);
        res.json(newSite.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// --- AUTH ROUTE ---
// Verify Admin Code securely on the server
app.post('/api/auth/verify', (req, res) => {
    const { code } = req.body;
    
    // In a real app, store this "#33" in a .env file (process.env.ADMIN_CODE)
    // But even hardcoded HERE, it is hidden from the user.
    const ADMIN_SECRET = "#33"; 

    if (code === ADMIN_SECRET) {
        res.json({ success: true, message: "Welcome Admin" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Code" });
    }
});

// 2. DELETE: Remove a Site by ID
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
// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});