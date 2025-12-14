-- 1. Enable PostGIS Extension (Required for geometry/location features)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the contamination_sites table
CREATE TABLE contamination_sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pfas_level NUMERIC NOT NULL,
    sample_type VARCHAR(100),
    sample_date VARCHAR(50),
    status VARCHAR(100) DEFAULT 'Known Contamination Site',
    chemicals JSONB DEFAULT '{}'::jsonb, -- Stores your chemical breakdown
    location GEOMETRY(POINT, 4326) -- Stores Lat/Lng
);

-- 3. Seed some initial data so your map isn't empty
INSERT INTO contamination_sites (name, pfas_level, sample_type, sample_date, status, chemicals, location)
VALUES 
('Bengaluru Peenya Industrial Area', 450, 'Groundwater', '2023', 'Known Contamination Site', '{"PFOS": 200, "PFOA": 250}', ST_SetSRID(ST_MakePoint(77.5206, 13.0285), 4326)),
('Mumbai Chembur Region', 1200, 'Soil', '2024', 'Hotspot', '{"PFOS": 800, "PFHxS": 400}', ST_SetSRID(ST_MakePoint(72.8953, 19.0330), 4326)),
('Delhi Okhla Waste Plant', 850, 'Surface Water', '2023', 'Hotspot', '{"PFOA": 600, "PFNA": 250}', ST_SetSRID(ST_MakePoint(77.2769, 28.5396), 4326));

