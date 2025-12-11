import React, { useState, useEffect, useRef } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import staticLogo from '../../../assets/logo.svg';
import animatedLogo from '../../../assets/logo-animated.gif';
import './Header.css';

const Header = React.forwardRef(({ isNavVisible }, ref) => {
    const navigate = useNavigate();

    // --- EASTER EGG STATE ---
    const [clickCount, setClickCount] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [accessKey, setAccessKey] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const clickTimer = useRef(null);

    // Reset click count if user stops clicking for 1 second
    useEffect(() => {
        if (clickCount === 0) return;
        const timer = setTimeout(() => {
            setClickCount(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [clickCount]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (clickTimer.current) clearTimeout(clickTimer.current);
        };
    }, []);

    const handleLogoClick = (e) => {
        e.preventDefault();

        if (e.shiftKey) {
            // --- ADMIN MODE: Shift + Click ---
            // If user was previously clicking without shift (pending redirect), cancel it.
            if (clickTimer.current) clearTimeout(clickTimer.current);

            const newCount = clickCount + 1;
            setClickCount(newCount);

            if (newCount === 3) {
                setShowPopup(true);
                setClickCount(0);
            }
        } else {
            // --- USER MODE: Normal Click ---
            // If they let go of Shift, reset the secret count
            setClickCount(0);

            // Debounce the redirect to prevent accidental double-opening
            if (clickTimer.current) clearTimeout(clickTimer.current);

            clickTimer.current = setTimeout(() => {
                window.open("https://www.honeybadger.com/", "_blank");
            }, 300); // 300ms delay for smoother UX
        }
    };

    const handleKeySubmit = async (e) => {
        e.preventDefault();

        try {
            // Send the key to the backend for verification (Gatekeeper check)
            const response = await fetch('http://localhost:5000/api/auth/verify-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: accessKey })
            });

            const data = await response.json();

            if (data.success) {
                setShowPopup(false);
                setAccessKey(''); // Clear the key for security
                // Redirect to the Login page for actual authentication
                navigate('/login');
            } else {
                setErrorMsg('Access Denied. Invalid Key.');
                setTimeout(() => setErrorMsg(''), 2000);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setErrorMsg('Server Error');
        }
    };

    return (
        <>
            <header ref={ref} className={`site-header ${!isNavVisible ? 'nav-hidden' : ''}`}>
                <div className="header-container">
                    <a href="https://www.honeybadger.com/" className="logo-link" onClick={handleLogoClick}>
                        <img src={staticLogo} alt="PFAS Map Logo" className="logo-image logo-static" />
                        <img src={animatedLogo} alt="" className="logo-image logo-gif" aria-hidden="true" />
                    </a>

                    <nav className="main-nav">
                        <ul>
                            <li><ScrollLink to="hero-section" smooth={true} duration={1000}>Home</ScrollLink></li>
                            <li><ScrollLink to="map-section" smooth={true} duration={1000}>Map</ScrollLink></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <button className="button-primary">Contribute</button>
                    </div>
                </div>
            </header>

            {showPopup && (
                <div className="easter-egg-overlay">
                    <div className="easter-egg-modal">
                        <h3>Restricted Access</h3>
                        <p>Enter the Access Key to proceed to login.</p>
                        <form onSubmit={handleKeySubmit}>
                            <input
                                type="password"
                                value={accessKey}
                                onChange={(e) => setAccessKey(e.target.value)}
                                placeholder="Access Key"
                                autoFocus
                            />
                            <button type="submit">Proceed</button>
                        </form>
                        {errorMsg && <div className="error-msg">{errorMsg}</div>}
                        <button className="close-egg" onClick={() => setShowPopup(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
});

export default Header;