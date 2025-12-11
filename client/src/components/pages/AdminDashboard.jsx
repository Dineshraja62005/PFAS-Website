import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        id: '', 
        name: '',
        pfas_level: '',
        sample_type: 'Soil',
        sample_date: new Date().getFullYear(),
        status: 'Known Contamination Site',
        lat: '',
        lng: ''
    });

    // Custom Chemicals State
    const [chemicalRows, setChemicalRows] = useState([
        { type: 'PFOS', value: '' } 
    ]);

    const fetchSites = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/sites');
            const data = await response.json();
            const sortedSites = (data.features || []).sort((a, b) => a.properties.id - b.properties.id);
            setSites(sortedSites);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchSites(); }, []);

    // Filter logic
    const filteredSites = sites.filter((site) => {
        const term = searchTerm.toLowerCase();
        const name = (site.properties.name || '').toLowerCase();
        const id = (site.properties.id || '').toString();
        return name.includes(term) || id.includes(term);
    });

    const resetForm = () => {
        setFormData({ 
            id: '', 
            name: '', pfas_level: '', sample_type: 'Soil', 
            sample_date: new Date().getFullYear(), 
            status: 'Known Contamination Site', lat: '', lng: '' 
        });
        setChemicalRows([{ type: 'PFOS', value: '' }]);
        setEditingId(null);
    };

    const handleEdit = (site) => {
        const props = site.properties;
        const [lng, lat] = site.geometry.coordinates;

        setEditingId(props.id);
        setFormData({
            id: props.id,
            name: props.name,
            pfas_level: props.level,
            sample_type: props.sample && props.sample.includes('(') ? props.sample.split(' (')[0] : 'Soil', 
            sample_date: props.sample && props.sample.includes('(') ? props.sample.split('(')[1].replace(')', '') : new Date().getFullYear(),
            status: props.status || 'Known Contamination Site',
            lat: lat,
            lng: lng
        });

        if (props.chemicals && Object.keys(props.chemicals).length > 0) {
            const loadedRows = Object.entries(props.chemicals).map(([key, value]) => ({
                type: key, value: value
            }));
            setChemicalRows(loadedRows);
        } else {
            setChemicalRows([{ type: 'PFOS', value: '' }]);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleChemicalChange = (index, field, value) => {
        const updatedRows = [...chemicalRows];
        updatedRows[index][field] = value;
        setChemicalRows(updatedRows);
    };
    
    const addChemicalRow = () => setChemicalRows([...chemicalRows, { type: '', value: '' }]);
    const removeChemicalRow = (i) => setChemicalRows(chemicalRows.filter((_, index) => index !== i));

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete Site #${id}?`)) return;
        try {
            await fetch(`http://localhost:5000/api/sites/${id}`, { method: 'DELETE' });
            fetchSites();
            if (editingId === id) resetForm();
        } catch (err) { alert('Error deleting site'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const chemicalObject = chemicalRows.reduce((acc, row) => {
            if (row.type && row.value) acc[row.type] = parseFloat(row.value);
            return acc;
        }, {});

        const payload = {
            ...formData,
            id: formData.id ? parseInt(formData.id) : undefined,
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
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error();
            alert(editingId ? 'Site Updated!' : 'Site Added!');
            fetchSites();
            resetForm();
        } catch (err) { alert('Operation failed'); }
    };

    return (
        <div className="admin-scroll-wrapper">
            <nav className="admin-navbar">
                <div className="nav-brand">PFAS Tracker Admin</div>
                <div className="nav-links">
                    <button onClick={() => navigate('/')} className="nav-btn">View Map</button>
                    <button onClick={() => { localStorage.removeItem('isAdmin'); navigate('/'); }} className="nav-btn logout">Logout</button>
                </div>
            </nav>

            <div className="admin-container">
                
                <div className="admin-section">
                    <div className="section-header">
                        <h2>{editingId ? `Edit Site #${editingId}` : 'Add New Contamination Site'}</h2>
                        {editingId && <button onClick={resetForm} className="cancel-btn">Cancel Edit</button>}
                    </div>

                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-row">
                            <input 
                                type="number" 
                                placeholder="ID (Auto-fill Gap)" 
                                value={formData.id} 
                                onChange={(e) => setFormData({...formData, id: e.target.value})}
                                required={!!editingId} 
                                title="Leave empty to auto-fill"
                            />
                            <input type="text" placeholder="Site Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>

                        <div className="form-row">
                            <input type="number" placeholder="Total PFAS (ng/kg)" value={formData.pfas_level} onChange={(e) => setFormData({...formData, pfas_level: e.target.value})} required />
                            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                <option>Known Contamination Site</option>
                                <option>Hotspot</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <input type="text" placeholder="Sample Type (e.g. Soil)" value={formData.sample_type} onChange={(e) => setFormData({...formData, sample_type: e.target.value})} />
                            <input type="text" placeholder="Year (e.g. 2024)" value={formData.sample_date} onChange={(e) => setFormData({...formData, sample_date: e.target.value})} />
                        </div>

                        <div className="form-row">
                            <input type="number" step="any" placeholder="Latitude" value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} required />
                            <input type="number" step="any" placeholder="Longitude" value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} required />
                        </div>

                        <div className="chemical-section">
                            <h3>Specific Chemical Levels</h3>
                            {chemicalRows.map((row, index) => (
                                <div key={index} className="chemical-row">
                                    <input type="text" placeholder="Chemical Name" value={row.type} onChange={(e) => handleChemicalChange(index, 'type', e.target.value)} />
                                    <input type="number" step="0.01" placeholder="Level" value={row.value} onChange={(e) => handleChemicalChange(index, 'value', e.target.value)} />
                                    {chemicalRows.length > 1 && <button type="button" className="remove-btn" onClick={() => removeChemicalRow(index)}>×</button>}
                                </div>
                            ))}
                            <button type="button" className="add-btn" onClick={addChemicalRow}>+ Add Chemical Row</button>
                        </div>

                        <button type="submit" className={`submit-btn ${editingId ? 'update-mode' : ''}`}>
                            {editingId ? 'Update Site Database' : 'Add Site to Database'}
                        </button>
                    </form>
                </div>

                <div className="admin-section">
                    <div className="section-header">
                        <h2>Manage Sites</h2>
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <input 
                            className="search-input"
                            type="text" 
                            placeholder="Search by ID or Site Name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <ul className="site-list">
                        {filteredSites.length > 0 ? (
                            filteredSites.map((site) => (
                                <li key={site.properties.id} className="site-item">
                                    <div className="site-info">
                                        <span className="site-id-badge">#{site.properties.id}</span>
                                        <span className="site-name">{site.properties.name}</span>
                                        <div className="site-meta">
                                            <span className={`meta-tag ${site.properties.level > 80 ? 'level-high' : ''}`}>
                                                Level: {site.properties.level}
                                            </span>
                                            <span className="meta-tag">{site.properties.status}</span>
                                        </div>
                                    </div>
                                    <div className="action-buttons">
                                        <button onClick={() => handleEdit(site)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(site.properties.id)} className="delete-btn">Delete</button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#666', gridColumn: '1/-1', padding: '2rem' }}>
                                No sites found matching your search.
                            </div>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;