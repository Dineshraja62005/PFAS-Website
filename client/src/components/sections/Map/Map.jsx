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

  // ... (Data Fetching & Map Initialization useEffects remain the same) ...
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

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/dataviz-light/style.json?key=${apiKey}`,
      center: [78.9629, 20.5737],
      zoom: 4,
      interactive: isStandalone,
      attributionControl: false
    });
    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.current.on('load', () => { setIsMapLoaded(true); });
  }, [isStandalone]);

  // Inside src/components/sections/Map/Map.jsx

  useEffect(() => {
    if (!isMapLoaded || !pfasData) return;
    const mapInstance = map.current;

    // Create a single popup instance to reuse
    const popup = new maplibregl.Popup({
      closeButton: false, // No 'x' button for hover tooltips
      closeOnClick: false,
      offset: 15, // Offset to not cover the circle
      maxWidth: '320px' // Wider tooltip like the design
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

      // --- HOVER EFFECT LOGIC ---

      // 1. Mouse Enter: Show Popup
      // ... inside useEffect ...
      // Locate this section around line 90
      // 1. Mouse Enter: Show Popup
      mapInstance.on('mouseenter', 'pfas-circles', (e) => {
        // Change cursor to pointer
        mapInstance.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();

        // FIX 1: Destructure 'id' from properties (It comes from your Postgres DB)
        const { id, name, level } = e.features[0].properties;

        // Logic for Hotspot Label (retained from previous fix)
        const isHotspot = level >= 80;
        const hotspotBadge = isHotspot
          ? '<span class="label-hotspot">HOTSPOT</span>'
          : '';

        // Ensure popup appears over the copy being pointed to
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Custom HTML Structure
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
        mapInstance.getCanvas().style.cursor = '';
        popup.remove();
      });
    }
  }, [pfasData, isMapLoaded]);


  // --- NEW: DEBOUNCED AUTOCOMPLETE FETCH ---
  useEffect(() => {
    // Don't fetch if query is empty
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set a timer to fetch after 300ms of inactivity
    const timerId = setTimeout(async () => {
      try {
        // Add '&autocomplete=true' and 'limit=5' to the API call
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&autocomplete=true&limit=5`
        );
        const data = await response.json();

        if (data.features) {
          setSuggestions(data.features);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }, 300); // 300ms delay

    // Cleanup function to cancel the timer if user types again quickly
    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery, apiKey]);


  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Called when a user clicks on a suggestion
  const handleSelectSuggestion = (suggestion) => {
    // Update input with the full place name
    setSearchQuery(suggestion.place_name);

    // Hide suggestions
    setSuggestions([]);
    setShowSuggestions(false);

    // 1. Check if the API returned a Bounding Box (bbox)
    if (suggestion.bbox) {
      // fitBounds automatically calculates the correct zoom level to show the whole area
      map.current.fitBounds(suggestion.bbox, {
        padding: 50, // Adds space around the edges so it's not cramped
        maxZoom: 15, // Prevents zooming in too close on tiny areas
        essential: true
      });
    } else {
      // 2. Fallback: If no bbox exists, use default behavior based on place_type
      // "place_type" is usually an array like ["region"] or ["city"]
      const [lng, lat] = suggestion.center;
      let zoomLevel = 12; // Default

      // Adjust zoom based on what kind of place it is
      if (suggestion.place_type) {
        if (suggestion.place_type.includes('region') || suggestion.place_type.includes('country')) {
          zoomLevel = 6; // State/Country -> Zoom out
        } else if (suggestion.place_type.includes('place') || suggestion.place_type.includes('locality')) {
          zoomLevel = 10; // City -> Medium zoom
        } else {
          zoomLevel = 14; // Address/POI -> Zoom in
        }
      }

      map.current.flyTo({
        center: [lng, lat],
        zoom: zoomLevel,
        essential: true
      });
    }
  };

  const handleClose = () => { if (isStandalone) navigate('/'); };
  const handleOverlayClick = () => { navigate('/map'); };

  return (
    <div className={`map-wrap ${isStandalone ? 'fullscreen animate-in' : ''}`}>

      {/* NEW SEARCH BAR CONTAINER */}
      {isStandalone && (
        <div className="map-search-container">
          {/* Search Icon SVG */}
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 21L16.65 16.65" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <input
            type="text"
            className="map-search-input"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={handleInputChange}
            // Show suggestions again if they exist when input is focused
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          />

          {/* SUGGESTIONS DROPDOWN LIST */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isStandalone && <button className="close-button" onClick={handleClose}>×</button>}
      {!isStandalone && <div className="overlay-fullscreen" onClick={handleOverlayClick}><div className="overlay-text">Explore Contamination Map</div></div>}
      <div className="map" ref={mapContainer} />
    </div>
  );
}