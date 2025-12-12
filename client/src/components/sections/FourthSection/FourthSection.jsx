// src/components/sections/FourthSection/FourthSection.jsx

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './FourthSection.css';

const FourthSection = ({ scrollContainerRef }) => {
    const targetRef = useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: targetRef,
        container: scrollContainerRef, // Connect to main scrollbar
        offset: ["start start", "end end"] 
    });

    // 0 to -300vw (moves left by 3 screens width)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    return (
        <section ref={targetRef} className="fourth-section-scroll-container">
            
            <div className="sticky-viewport">
                
                {/* Header (Fixed at top of sticky view) */}
                <div className="timeline-header">
                    <h2>The PFAS Lifecycle</h2>
                    <div className="progress-bar-container">
                        <motion.div 
                            className="progress-bar-fill" 
                            style={{ scaleX: scrollYProgress }} 
                        />
                    </div>
                </div>

                {/* Horizontal Moving Layer */}
                <motion.div style={{ x }} className="horizontal-slider">
                    
                    {/* --- SLIDE 1 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-number">01</div>
                            <h3>What are PFAS?</h3>
                            <p className="highlight-text">"Forever Chemicals"</p>
                            <p>Per- and polyfluoroalkyl substances (PFAS) are a group of man-made chemicals defined by the <strong>Carbon-Fluorine bond</strong>—one of the strongest in nature.</p>
                        </div>
                    </div>

                    {/* --- SLIDE 2 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-number">02</div>
                            <h3>How They Enter</h3>
                            <p className="highlight-text">From Factory to Food</p>
                            <p>PFAS contaminate water and soil near manufacturing plants. They are absorbed by crops and livestock, eventually reaching our dinner tables.</p>
                        </div>
                    </div>

                    {/* --- SLIDE 3 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-number">03</div>
                            <h3>The Health Impact</h3>
                            <p className="highlight-text">Silent Accumulation</p>
                            <p>Once ingested, they bind to blood proteins and accumulate in the liver and kidneys. Linked to cancer, immune suppression, and hormonal disruption.</p>
                        </div>
                    </div>

                    {/* --- SLIDE 4 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-number">04</div>
                            <h3>Persistence</h3>
                            <p className="highlight-text">Unbreakable Bonds</p>
                            <p>Without intervention, these chemicals take thousands of years to degrade naturally. Every molecule produced essentially exists forever.</p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};

export default FourthSection;