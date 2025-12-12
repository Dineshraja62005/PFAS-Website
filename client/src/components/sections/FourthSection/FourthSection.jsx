// src/components/sections/FourthSection/FourthSection.jsx

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './FourthSection.css';

const FourthSection = ({ scrollContainerRef }) => {
    const targetRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        container: scrollContainerRef,
        offset: ["start start", "end end"]
    });

    // 1. Slide Movement (Horizontal Scroll)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

    // 2. Line Animation (Scale X from 0 to 1)
    const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

    // 3. Spark Movement (Move 'left' from 0% to 100%)
    const sparkPosition = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={targetRef} className="fourth-section-scroll-container">
            <div className="sticky-viewport">

                {/* Header */}
                <div className="timeline-header">
                    <h2>The PFAS Lifecycle</h2>
                    <div className="progress-bar-container">
                        <motion.div
                            className="progress-bar-fill"
                            style={{ scaleX: scrollYProgress }}
                        />
                    </div>
                </div>

                {/* Horizontal Slider */}
                <motion.div style={{ x }} className="horizontal-slider">

                    {/* --- MODERN GLOW LINE CONTAINER --- */}
                    <div className="connector-line-container">

                        {/* The Base Track (Dim) */}
                        <div className="connector-line-base"></div>

                        {/* The Growing Beam (Scale Animation) */}
                        <motion.div
                            className="connector-line-beam"
                            style={{ scaleX: lineScale }}
                        />

                        {/* The Leading Spark (Position Animation) */}
                        <motion.div
                            className="connector-line-spark"
                            style={{ left: sparkPosition }}
                        >
                            <div className="spark-core"></div>
                            <div className="spark-glow"></div>
                        </motion.div>

                    </div>

                    {/* --- SLIDE 1 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-text">
                                <div className="slide-number">01</div>
                                <h3>What are PFAS?</h3>
                                <p className="highlight-text">"Forever Chemicals"</p>
                                <p>Per- and polyfluoroalkyl substances (PFAS) are man-made chemicals defined by the <strong>Carbon-Fluorine bond</strong>—one of the strongest in nature.</p>
                            </div>
                            <div className="slide-visual">
                                <img src="/img.png" alt="Structure" />
                                <div className="visual-caption">Molecular Structure</div>
                            </div>
                        </div>
                    </div>

                    {/* --- SLIDE 2 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-text">
                                <div className="slide-number">02</div>
                                <h3>How They Enter</h3>
                                <p className="highlight-text">Factory to Food</p>
                                <p>PFAS contaminate water and soil near manufacturing plants. They are absorbed by crops and livestock, eventually reaching our dinner tables.</p>
                                <div className="flow-diagram">
                                    <span className="flow-step">Factory</span>
                                    <span className="arrow">→</span>
                                    <span className="flow-step">Water</span>
                                    <span className="arrow">→</span>
                                    <span className="flow-step">You</span>
                                </div>
                            </div>
                            <div className="slide-visual">
                                <img src="https://images.unsplash.com/photo-1617155093730-a8bf47be792d?q=80&w=800&auto=format&fit=crop" alt="Pollution" />
                                <div className="visual-caption">Environmental Contamination</div>
                            </div>
                        </div>
                    </div>

                    {/* --- SLIDE 3 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-text">
                                <div className="slide-number">03</div>
                                <h3>The Health Impact</h3>
                                <p className="highlight-text">Silent Accumulation</p>
                                <div className="impact-grid">
                                    <div className="impact-item">Hormone Disruption</div>
                                    <div className="impact-item">Cancer Risk</div>
                                    <div className="impact-item">Immune System</div>
                                </div>
                            </div>
                            <div className="slide-visual">
                                <img src="https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?q=80&w=800&auto=format&fit=crop" alt="Health" />
                                <div className="visual-caption">Bioaccumulation in Blood</div>
                            </div>
                        </div>
                    </div>

                    {/* --- SLIDE 4 --- */}
                    <div className="timeline-slide">
                        <div className="slide-content">
                            <div className="slide-text">
                                <div className="slide-number">04</div>
                                <h3>Why "Forever"?</h3>
                                <p className="highlight-text">Unbreakable Bonds</p>
                                <div className="stat-box">
                                    <span className="stat-number">1,000+</span>
                                    <span className="stat-label">Years to degrade</span>
                                </div>
                            </div>
                            <div className="slide-visual">
                                <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop" alt="Nature" />
                                <div className="visual-caption">Generational Impact</div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};

export default FourthSection;