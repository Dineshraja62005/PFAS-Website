# PFAS Contamination Tracker – Modex Assessment

### 🌐 **Deployed Frontend:** *[INSERT YOUR VERCEL/NETLIFY LINK HERE]*
### 🖥️ **Deployed Backend:** *[INSERT YOUR RENDER/RAILWAY LINK HERE]*
### 🎥 **Video Demo:** *[INSERT YOUR YOUTUBE/DRIVE LINK HERE]*

---

## 1. ⭐ Project Objective

### Problem Statement
Per- and polyfluoroalkyl substances (PFAS), also called “forever chemicals,” pose a growing global health concern.
This project tracks, visualizes, and manages PFAS contamination across regions (Soil, Water, Groundwater).  
It serves as a powerful tool for environmental agencies, researchers, and policymakers to monitor PFAS levels and identify contamination hotspots.

### Target Users
- Environmental Researchers  
- Health Organizations  
- Policymakers  
- Government Agencies  

---

## 2. 🏛️ Technical Design & Architecture

### High-Level Architecture
The system follows a **Client–Server RESTful Architecture**.

#### Frontend (Client)
- React.js + Vite  
- State Management via Context API  
- Handles Map Visualization & UI Interactions  

#### Backend (Server)
- Node.js + Express  
- Contains data validation, geospatial logic, and business rules  

#### Database
- PostgreSQL + PostGIS  
- Stores geospatial data and contamination metadata  

---

### Database Design & Scaling Strategy

#### Current Schema
Table: `contamination_sites`  
- PFAS levels  
- JSONB column for chemicals  
- `GEOMETRY(POINT, 4326)` for location storage  

#### Scaling for Production
1. **Read Replicas** – Map apps are read-heavy  
2. **GIST Spatial Indexing** – Sub-millisecond geospatial queries  
3. **Sharding** – Region-based partitioning for global scale  

---

### Concurrency Control & Data Consistency

#### Issue: Race conditions in Gap-Filling ID Logic
Multiple POST requests may grab the same missing ID.

#### Solutions
- **Atomic INSERT + Primary Key Constraint**  
- **Optimistic Locking via version column**  

---

### Caching Strategy
- Redis caching for heavy `/api/sites` GeoJSON  
- Cache invalidated only on POST, PUT, DELETE  

---

## 3. 💡 Innovation & Key Features

### Gap-Filling ID Logic
Fills deleted ID gaps instead of standard auto-increment.

### PostGIS Integration
- Converts coordinates using `ST_MakePoint`  
- Returns standardized GeoJSON via `ST_AsGeoJSON`  

### Dynamic Chemical Tracking (JSONB)
Allows storing unlimited PFAS chemical breakdowns without schema changes.

---

## 4. 🛠️ Tech Stack

### Frontend
- React.js  
- Vite  
- Context API  
- Custom CSS Animations  

### Backend
- Node.js  
- Express.js  

### Database
- PostgreSQL  
- PostGIS  

### Tools
- Git  
- Postman  

---

## 5. 📡 API Documentation

Base URL: `http://localhost:5000`

### Endpoints
-----------------------------------------------------------------------------------------------------------------
| Method | Endpoint          | Description                              | Body Parameters                       |
|--------|------------------|-------------------------------------------|-------------------------------------- |
| GET    | `/api/sites`     | Fetch all sites as GeoJSON                | None                                  |
| POST   | `/api/sites`     | Create new site                           | `{ name, pfas_level, lat, lng, ... }` |
| PUT    | `/api/sites/:id` | Update site                               | `{ name, ... }`                       |
| DELETE | `/api/sites/:id` | Delete site                               | None                                  |
| POST   | `/api/auth/login`| Mock authentication                       | `{ username, password }`              |
-----------------------------------------------------------------------------------------------------------------

## 6. ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)  
- PostgreSQL with PostGIS enabled  

---

### A. Database Setup

```sql
CREATE DATABASE pfas_db;
CREATE EXTENSION IF NOT EXISTS postgis;
```

Run remaining SQL from `SQL.bkp.sql`.

---

### B. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pfas_db
PORT=5000
```

Start:

```bash
node index.js
```

---

### C. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 7. 📝 Assumptions & Limitations

### Assumptions
- PostGIS installed  
- Authentication intentionally mock  

### Limitations
- All points render at once → heavy beyond 10,000  
- Clustering recommended  

---

## 📌 Export to Sheets
Dataset export supported.

---

