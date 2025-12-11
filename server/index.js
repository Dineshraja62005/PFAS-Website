const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Mock Auth Credentials
const ACCESS_KEY = "#33";
const ADMIN_USER = { username: "admin", password: "admin" };

// --- ROUTES ---

// 1. GET: Fetch All Sites (With ALL details)
app.get('/api/sites', async (req, res) => {
    try {
        // We select ALL columns to ensure nothing is lost
        const result = await pool.query(`
            SELECT id, name, pfas_level, sample_type, sample_date, status, chemicals,
            ST_AsGeoJSON(location)::json as geometry
            FROM contamination_sites
            ORDER BY id ASC
        `);

        const geoJson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: row.geometry,
                properties: {
                    id: row.id,
                    name: row.name,
                    level: row.pfas_level,
                    sample: row.sample_type ? `${row.sample_type} (${row.sample_date})` : '',
                    status: row.status,
                    chemicals: row.chemicals // Sends the custom chemicals JSON
                }
            }))
        };
        res.json(geoJson);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. POST: Add Site (With Gap-Filling ID & All Fields)
app.post('/api/sites', async (req, res) => {
    try {
        const { id, name, pfas_level, sample_type, sample_date, status, lat, lng, chemical_breakdown } = req.body;

        let finalId = id;

        // --- CONTINUOUS ID LOGIC ---
        // If ID is not provided manually, calculate the first missing number
        if (!finalId) {
            const gapQuery = `
                SELECT s.i AS missing_id
                FROM generate_series(1, (SELECT COALESCE(MAX(id), 0) + 1 FROM contamination_sites)) s(i)
                WHERE NOT EXISTS (SELECT 1 FROM contamination_sites WHERE id = s.i)
                ORDER BY s.i ASC
                LIMIT 1;
            `;
            const gapResult = await pool.query(gapQuery);
            finalId = gapResult.rows[0]?.missing_id || 1; 
        }

        const query = `
            INSERT INTO contamination_sites 
            (id, name, pfas_level, sample_type, sample_date, status, chemicals, location)
            VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($9, $8), 4326))
            RETURNING *;
        `;
        
        // Ensure 'chemical_breakdown' maps to the 'chemicals' column
        const values = [
            finalId, 
            name, 
            pfas_level, 
            sample_type, 
            sample_date, 
            status, 
            chemical_breakdown, // This saves your custom chemical rows
            lat, 
            lng
        ];

        const newSite = await pool.query(query, values);
        res.json(newSite.rows[0]);

    } catch (err) {
        console.error(err.message);
        // Important: If this fails, check your DB has columns: chemicals, status, sample_type, sample_date
        if (err.code === '23505') return res.status(409).json({ error: "Site ID already exists." });
        res.status(500).send("Server Error");
    }
});

// 3. PUT: Update Site (Preserves all fields)
app.put('/api/sites/:originalId', async (req, res) => {
    try {
        const { originalId } = req.params;
        const { id, name, pfas_level, sample_type, sample_date, status, lat, lng, chemical_breakdown } = req.body;

        const query = `
            UPDATE contamination_sites 
            SET id = $1, name = $2, pfas_level = $3, sample_type = $4, sample_date = $5, 
                status = $6, chemicals = $7, location = ST_SetSRID(ST_MakePoint($9, $8), 4326)
            WHERE id = $10
            RETURNING *;
        `;
        
        const values = [id, name, pfas_level, sample_type, sample_date, status, chemical_breakdown, lat, lng, originalId];
        const updatedSite = await pool.query(query, values);
        
        if (updatedSite.rows.length === 0) return res.status(404).json({ error: "Site not found" });
        res.json(updatedSite.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ error: "New Site ID already exists." });
        res.status(500).send("Server Error");
    }
});

// 4. DELETE Route
app.delete('/api/sites/:id', async (req, res) => {
    try {
        await pool.query("DELETE FROM contamination_sites WHERE id = $1", [req.params.id]);
        res.json({ message: "Site deleted" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// --- AUTH ROUTES ---
app.post('/api/auth/verify-key', (req, res) => {
    const { code } = req.body;
    if (code === ACCESS_KEY) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));