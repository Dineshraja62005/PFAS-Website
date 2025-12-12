import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/sections/Header/Header';
import Hero from './components/sections/Hero/Hero';
import SplitSection from './components/sections/SplitSection/SplitSection';
import ThirdSection from './components/sections/ThirdSection/ThirdSection';
import Map from './components/sections/Map/Map';
import FourthSection from './components/sections/FourthSection/FourthSection';

// Auth Imports
import { AuthProvider } from './components/context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/pages/AdminDashboard';
import Login from './components/pages/Login';

// ... MainApp Component code stays the same ...
const MainApp = () => {
  // ... existing MainApp logic ...
  // (Copy the MainApp logic from your previous file here)
  const [isNavVisible, setIsNavVisible] = useState(true);
  const heroRef = useRef(null);
  const location = useLocation();
  const isMapOpen = location.pathname === '/map';
  const scrollContainerRef = useRef(null);

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
      <Header isNavVisible={isNavVisible} />
      <div className="scroll-container" id="scroll-container" ref={scrollContainerRef}>
        <div id="hero-section" ref={heroRef} className="scroll-section"><Hero /></div>
        <div className="scroll-section"><SplitSection /></div>
        <div className="scroll-section"><ThirdSection /></div>
        <div>
          <FourthSection scrollContainerRef={scrollContainerRef} />
        </div>
        <div className="scroll-section" id="map-section">
          <Map isStandalone={false} />
        </div>
      </div>
      {isMapOpen && <Map isStandalone={true} />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<MainApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;