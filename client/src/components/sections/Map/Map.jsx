import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './Map.css';

export default function Map({ isStandalone = false }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();

  // Data States
  const [pfasData, setPfasData] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Search & Autocomplete States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const apiKey = 'Z5URJ8EPi1Ep6uxksueX';

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/sites');
        const data = await response.json();
        setPfasData(data);
      } catch (error) { console.error("Error fetching data:", error); }
    };
    fetchData();
  }, []);

  // --- 2. INITIALIZE MAP ---
  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${apiKey}`,
      center: [78.9629, 20.5737],
      zoom: 4,
      interactive: isStandalone, // Only interactive in standalone mode
      attributionControl: false
    });
    
    if (isStandalone) {
        map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    }
    
    map.current.on('load', () => { setIsMapLoaded(true); });
  }, [isStandalone]);

  // --- 3. LAYERS & INTERACTION ---
  useEffect(() => {
    if (!isMapLoaded || !pfasData) return;
    const mapInstance = map.current;

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      maxWidth: '320px'
    });

    if (mapInstance.getSource('pfas-points')) {
      mapInstance.getSource('pfas-points').setData(pfasData);
    } else {
      mapInstance.addSource('pfas-points', { type: 'geojson', data: pfasData });

      mapInstance.addLayer({
        id: 'pfas-circles',
        type: 'circle',
        source: 'pfas-points',
        paint: {
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'level'],
            0, '#4CAF50',   // Green for low
            50, '#FFC107',  // Yellow for medium
            100, '#F44336'  // Red for high (Hotspot)
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // 1. Mouse Enter: Show Popup
      mapInstance.on('mouseenter', 'pfas-circles', (e) => {
        if (!isStandalone) return;

        mapInstance.getCanvas().style.cursor = 'pointer';
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { id, name, level } = e.features[0].properties;

        const isHotspot = level >= 80;
        const hotspotBadge = isHotspot
          ? '<span class="label-hotspot">HOTSPOT</span>'
          : '';

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const popupHTML = `
          <div class="pfas-popup">
            <div class="popup-header">
              <span class="label-subtle">KNOWN CONTAMINATION SITE ${isHotspot ? '| ' : ''}</span>
              ${hotspotBadge}
            </div>
            <h3 class="popup-title">${name}</h3>
            <div class="popup-grid">
              <div class="grid-label">Site ID:</div>
              <div class="grid-value">#${id}</div>
              <div class="grid-label">Sample:</div>
              <div class="grid-value">Soil (2024)</div>
            </div>
            <div class="popup-metrics">
              <div class="metric-row">
                <span class="metric-label">PFAS level:</span>
                <span class="metric-value">${level} ng/kg</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">PFOA:</span>
                <span class="metric-value">${(level * 0.8).toFixed(2)} ng/kg</span>
              </div>
            </div>
          </div>
        `;

        popup.setLngLat(coordinates).setHTML(popupHTML).addTo(mapInstance);
      });

      // 2. Mouse Leave: Hide Popup
      mapInstance.on('mouseleave', 'pfas-circles', () => {
        if (!isStandalone) return;
        mapInstance.getCanvas().style.cursor = '';
        popup.remove();
      });
    }
  }, [pfasData, isMapLoaded, isStandalone]);


  // --- 4. AUTOCOMPLETE LOGIC ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timerId = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&autocomplete=true&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (error) { console.error("Error:", error); }
    }, 300);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);

    if (suggestion.bbox) {
      map.current.fitBounds(suggestion.bbox, { padding: 50, maxZoom: 15 });
    } else {
      map.current.flyTo({ center: suggestion.center, zoom: 12 });
    }
  };

  const handleClose = () => { if (isStandalone) navigate('/'); };
  const handleOverlayClick = () => { navigate('/map'); };

  return (
    <div className={`map-section-container ${!isStandalone ? 'embedded-view' : ''}`}>
      
      {!isStandalone && (
        <div className="map-page-intro">
          <h2 className="intro-heading">Explore Contamination Across India</h2>
          <p className="intro-subtext">
            This interactive map visualizes PFAS concentration levels from recent samples. 
            Click to enter full-screen mode for detailed analysis.
          </p>
        </div>
      )}

      <div className={`map-wrap ${isStandalone ? 'fullscreen animate-in' : ''}`}>

        {/* --- LEGEND (ADDED HERE) --- */}
        <div className="map-legend">
            <h4>PFAS Levels (ng/kg)</h4>
            <div className="legend-item">
                <span className="legend-color" style={{ background: '#4CAF50' }}></span>
                <span>Low (&lt; 50)</span>
            </div>
            <div className="legend-item">
                <span className="legend-color" style={{ background: '#FFC107' }}></span>
                <span>Medium (50 - 90)</span>
            </div>
            <div className="legend-item">
                <span className="legend-color" style={{ background: '#F44336' }}></span>
                <span>High (&gt; 90)</span>
            </div>
        </div>

        {isStandalone && (
          <>
            <div className="map-search-container">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="map-search-input"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((s) => (
                    <li key={s.id} className="suggestion-item" onClick={() => handleSelectSuggestion(s)}>
                      {s.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <button className="close-button" onClick={handleClose}>×</button>
          </>
        )}

        {!isStandalone && (
          <div className="overlay-fullscreen" onClick={handleOverlayClick}>
            <div className="overlay-text">Click to Explore Map</div>
          </div>
        )}

        <div className="map" ref={mapContainer} />
      </div>
    </div>
  );
}