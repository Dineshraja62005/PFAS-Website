import React, { useState, useEffect, useRef } from 'react';
import ScrambledText from '../../animations/ScrambledText/ScrambledText';
import FadingLettersText from '../../animations/FadingLettersText/FadingLettersText';
import './SplitSection.css';
import '../DarkPane.css';
import NatureLottie from '../../animations/Nature/NatureLottie';

const SplitSection = () => {
    const topPaneRef = useRef(null);
    const bottomPaneRef = useRef(null);
    const [isTopPaneVisible, setIsTopPaneVisible] = useState(false);
    const [isBottomPaneVisible, setIsBottomPaneVisible] = useState(false);

    // Effect for Pane Visibility and Animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.target.id === 'top-pane') {
                        setIsTopPaneVisible(entry.isIntersecting);
                    } else if (entry.target.id === 'bottom-pane') {
                        setIsBottomPaneVisible(entry.isIntersecting);
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (topPaneRef.current) observer.observe(topPaneRef.current);
        if (bottomPaneRef.current) observer.observe(bottomPaneRef.current);

        return () => {
            if (topPaneRef.current) observer.unobserve(topPaneRef.current);
            if (bottomPaneRef.current) observer.unobserve(bottomPaneRef.current);
        };
    }, []);

    return (
        <section className="split-section">
            <NatureLottie />
            <div id="top-pane" ref={topPaneRef} className="split-pane white-pane">
                <div className="pane-overlay"></div>
                <div className={`content-wrapper top-content ${isTopPaneVisible ? 'is-visible' : ''}`}>
                    <p className="animated-text">
                        Chemicals <ScrambledText text="engineered to resist" startAnimation={isTopPaneVisible} />
                        <br />
                        <strong>Used widely in everyday products</strong>
                        <br />
                        Designed for modern convenience
                    </p>
                </div>
            </div>

            <div id="bottom-pane" ref={bottomPaneRef} className="split-pane dark-pane">
                <div className="pane-overlay"></div>
                <div className={`content-wrapper bottom-content ${isBottomPaneVisible ? 'is-visible' : ''}`}>
                    <p className="animated-text dark-bg-text">
                        <FadingLettersText text="But they never truly break down" startAnimation={isBottomPaneVisible} />
                        <br />
                        <strong>Accumulating silently in our <span className="focus-pulse-text">bodies</span></strong>
                        <br />
                        And impacting our environment
                    </p>
                </div>
            </div>

        </section>

    );
};

export default SplitSection;