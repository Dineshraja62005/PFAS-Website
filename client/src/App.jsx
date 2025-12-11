import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/sections/Header/Header';
import Hero from './components/sections/Hero/Hero';
import SplitSection from './components/sections/SplitSection/SplitSection';
import ThirdSection from './components/sections/ThirdSection/ThirdSection';
import AdminDashboard from './components/pages/AdminDashboard';
import Map from './components/sections/Map/Map';

// Main Layout Component
const MainApp = () => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const heroRef = useRef(null);
  const location = useLocation();
  
  // Check if we are currently on the standalone map page
  const isMapOpen = location.pathname === '/map';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.target.id === 'hero-section') {
            setIsNavVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (heroRef.current) observer.observe(heroRef.current);

    return () => {
      if (heroRef.current) observer.unobserve(heroRef.current);
    };
  }, []);

  return (
    <>
      {/* Header and Main Content behave normally.
        They stay mounted even when /map is active, preserving scroll position.
      */}
      <Header isNavVisible={isNavVisible} />
      
      <div className="scroll-container" id="scroll-container">
        <div id="hero-section" ref={heroRef} className="scroll-section"><Hero /></div>
        <div className="scroll-section"><SplitSection /></div>
        <div className="scroll-section"><ThirdSection /></div>
        
        {/* Embedded Map Section (The preview at the bottom) */}
        <div className="scroll-section" id="map-section">
          <Map isStandalone={false} /> 
        </div>
      </div>

      {/* Standalone Map Overlay
        Rendered on top of the site when URL is /map 
      */}
      {isMapOpen && (
        <Map isStandalone={true} />
      )}
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Catch-all route: Both '/' and '/map' render MainApp.
           This prevents unmounting/remounting the landing page.
        */}
        <Route path="*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;