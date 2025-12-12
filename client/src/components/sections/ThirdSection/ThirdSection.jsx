// src/components/sections/ThirdSection/ThirdSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import rainData from '../../../assets/Rain.json';         // Continuous background rain
import rainFlowerData from '../../../assets/Rain Flower.json'; // Rain Flower (Stops at end)
// Removed Wind Import

import FadingLettersText from '../../animations/FadingLettersText/FadingLettersText'; 
import ViteGlowBackground from '../../animations/ViteGlow/ViteGlowBackground'; 
import '../SplitSection/SplitSection.css'; 
import '../DarkPane.css'; 
import './ThirdSection.css'; 

const ThirdSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.5 }
        );

        const currentRef = sectionRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []); 

    return (
        <section ref={sectionRef} className="third-section-container dark-pane">
            
            {/* 1. Background Glow */}
            <ViteGlowBackground />

            {/* 2. Background Rain (Continuous Loop) */}
            <div className="third-section-rain">
                <Lottie 
                    animationData={rainData} 
                    loop={true} 
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            {/* 4. Text Content */}
            <div className={`content-wrapper bottom-content ${isVisible ? 'is-visible' : ''}`} style={{ zIndex: 2 }}>
                <p className="animated-text dark-bg-text">
                    <FadingLettersText text="Persistence & Bioaccumulation" startAnimation={isVisible} />
                    <br />
                    <strong>They Appear, They Stay.</strong>
                    <br/>
                    <FadingLettersText text="Building Up Everywhere." startAnimation={isVisible} />
                </p>
            </div>
        </section>
    );
};

export default ThirdSection;