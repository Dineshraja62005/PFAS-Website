import React, { useState, useEffect, useRef } from 'react';
import FadingLettersText from '../../animations/FadingLettersText/FadingLettersText'; //
import ViteGlowBackground from '../../animations/ViteGlow/ViteGlowBackground'; //
import '../SplitSection/SplitSection.css'; // Shared styles
import '../DarkPane.css'; // Styles for dark background
import './ThirdSection.css'; // Specific styles for this section

const ThirdSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    // Trigger based on intersection
                    setIsVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.5 } // Trigger when 50% is visible
        );

        const currentRef = sectionRef.current; // Capture ref value
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []); // Run effect only once on mount


    return (
        <section ref={sectionRef} className="third-section-container dark-pane">
            <ViteGlowBackground />

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