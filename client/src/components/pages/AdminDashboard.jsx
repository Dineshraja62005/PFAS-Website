import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState([]);
    
    // State to track if we are editing a specific site ID
    const [editingId, setEditingId] = useState(null);

    // Core Site Data
    const [formData, setFormData] = useState({
        name: '',
        pfas_level: '',
        sample_type: 'Soil',
        sample_date: new Date().getFullYear(),
        status: 'Known Contamination Site',
        lat: '',
        lng: ''
    });

    // Dynamic State for Chemical Add-ons
    const [chemicalRows, setChemicalRows] = useState([
        { type: 'PFOS', value: '' } 
    ]);

    const fetchSites = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sites');
            const data = await response.json();
            setSites(data.features || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchSites(); }, []);

    // --- HELPER: RESET FORM ---
    const resetForm = () => {
        setFormData({ 
            name: '', pfas_level: '', sample_type: 'Soil', 
            sample_date: new Date().getFullYear(), 
            status: 'Known Contamination Site', lat: '', lng: '' 
        });
        setChemicalRows([{ type: 'PFOS', value: '' }]);
        setEditingId(null);
    };

    // --- EDIT HANDLER ---
    const handleEdit = (site) => {
        const props = site.properties;
        const [lng, lat] = site.geometry.coordinates;

        setEditingId(props.id);
        
        // Populate core fields
        setFormData({
            name: props.name,
            pfas_level: props.level,
            sample_type: props.sample ? props.sample.split(' (')[0] : '', // Extract type if formatted
            sample_date: props.sample ? props.sample.split('(')[1].replace(')', '') : '', // Extract date
            status: props.status || 'Known Contamination Site',
            lat: lat,
            lng: lng
        });

        // Populate dynamic chemicals
        if (props.chemicals && Object.keys(props.chemicals).length > 0) {
            const loadedRows = Object.entries(props.chemicals).map(([key, value]) => ({
                type: key,
                value: value
            }));
            setChemicalRows(loadedRows);
        } else {
            setChemicalRows([{ type: 'PFOS', value: '' }]);
        }

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- DYNAMIC FIELD HANDLERS ---
    const handleChemicalChange = (index, field, value) => {
        const updatedRows = [...chemicalRows];
        updatedRows[index][field] = value;
        setChemicalRows(updatedRows);
    };

    const addChemicalRow = () => {
        setChemicalRows([...chemicalRows, { type: '', value: '' }]);
    };

    const removeChemicalRow = (index) => {
        const updatedRows = chemicalRows.filter((_, i) => i !== index);
        setChemicalRows(updatedRows);
    };

    // --- DELETE SITE ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this site?")) return;
        try {
            await fetch(`http://localhost:5000/api/sites/${id}`, { method: 'DELETE' });
            fetchSites();
            // If we deleted the site currently being edited, reset form
            if (editingId === id) resetForm();
        } catch (err) { alert('Error deleting site'); }
    };

    // --- FORM SUBMISSION (CREATE or UPDATE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const chemicalObject = chemicalRows.reduce((acc, row) => {
            if (row.type && row.value) acc[row.type] = parseFloat(row.value);
            return acc;
        }, {});

        const payload = {
            ...formData,
            pfas_level: parseInt(formData.pfas_level),
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            chemical_breakdown: chemicalObject
        };

        const url = editingId 
            ? `http://localhost:5000/api/sites/${editingId}`
            : 'http://localhost:5000/api/sites';
        
        const method = editingId ? 'PUT' : 'POST';

        try {
            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            alert(editingId ? 'Site Updated!' : 'Site Added!');
            fetchSites();
            resetForm();
        } catch (err) { alert('Error saving site'); }
    };

    return (
        <div className="admin-scroll-wrapper">
            
            {/* --- NAVBAR --- */}
            <nav className="admin-navbar">
                <div className="nav-brand">PFAS Tracker Admin</div>
                <div className="nav-links">
                    <button onClick={() => navigate('/')} className="nav-btn">View Map</button>
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="nav-btn logout">Logout</button>
                </div>
            </nav>

            <div className="admin-container">
                
                <div className="admin-section">
                    <div className="section-header">
                        <h2>{editingId ? `Edit Site #${editingId}` : 'Add New Contamination Site'}</h2>
                        {editingId && <button onClick={resetForm} className="cancel-btn">Cancel Edit</button>}
                    </div>

                    <form onSubmit={handleSubmit} className="admin-form">
                        {/* Rows are same as before */}
                        <div className="form-row">
                            <input type="text" placeholder="Site Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                <option>Known Contamination Site</option>
                                <option>Hotspot</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <input type="number" placeholder="Total PFAS (ng/kg)" value={formData.pfas_level} onChange={(e) => setFormData({...formData, pfas_level: e.target.value})} required />
                            <input type="text" placeholder="Sample Type" value={formData.sample_type} onChange={(e) => setFormData({...formData, sample_type: e.target.value})} />
                            <input type="text" placeholder="Year" style={{flex: 0.5}} value={formData.sample_date} onChange={(e) => setFormData({...formData, sample_date: e.target.value})} />
                        </div>

                        <div className="form-row">
                            <input type="number" step="any" placeholder="Latitude" value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} required />
                            <input type="number" step="any" placeholder="Longitude" value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} required />
                        </div>

                        <div className="chemical-section">
                            <h3>Specific Chemical Levels</h3>
                            {chemicalRows.map((row, index) => (
                                <div key={index} className="chemical-row">
                                    <input type="text" placeholder="Chemical (e.g. PFOS)" value={row.type} onChange={(e) => handleChemicalChange(index, 'type', e.target.value)} />
                                    <input type="number" step="0.01" placeholder="Level" value={row.value} onChange={(e) => handleChemicalChange(index, 'value', e.target.value)} />
                                    {chemicalRows.length > 1 && <button type="button" className="remove-btn" onClick={() => removeChemicalRow(index)}>×</button>}
                                </div>
                            ))}
                            <button type="button" className="add-btn" onClick={addChemicalRow}>+ Add Chemical</button>
                        </div>

                        <button type="submit" className={`submit-btn ${editingId ? 'update-mode' : ''}`}>
                            {editingId ? 'Update Site' : 'Add Site to Map'}
                        </button>
                    </form>
                </div>

                {/* --- MANAGE LIST --- */}
                <div className="admin-section">
                    <h2>Manage Sites</h2>
                    <ul className="site-list">
                        {sites.map((site) => (
                            <li key={site.properties.id} className="site-item">
                                <div className="site-info">
                                    <strong>{site.properties.name}</strong>
                                    <span className="site-details">
                                        {site.properties.status} | Level: {site.properties.level}
                                    </span>
                                </div>
                                <div className="action-buttons">
                                    <button onClick={() => handleEdit(site)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(site.properties.id)} className="delete-btn">Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;