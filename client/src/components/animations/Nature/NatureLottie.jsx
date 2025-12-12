// src/components/animations/Nature/NatureLottie.jsx

import React, { useEffect, useRef } from 'react'; // Import hooks
import Lottie from 'lottie-react';

// --- WHITE PANE ASSETS ---
import cherryBlossomData from '../../../assets/Cherry Blossom.json'; 
import flowerData from '../../../assets/Flower Animation.json';

// --- DARK PANE ASSETS ---
import rainData from '../../../assets/Rain.json'; 
import lightningData from '../../../assets/Lightning VFX.json';

import './NatureLottie.css';

const NatureLottie = () => {
    // 1. Create a ref for the Cherry Blossom
    const cherryRef = useRef(null);
    
    // 2. Create a ref for Lightning (for the existing cooldown logic)
    const lightningRef = useRef(null);

    // 3. Set the speed when the component mounts
    useEffect(() => {
        if (cherryRef.current) {
            // 0.5 = 50% speed (Slower, more gentle)
            cherryRef.current.setSpeed(0.1); 
        }
    }, []);

    const handleLightningComplete = () => {
        setTimeout(() => {
            if (lightningRef.current) {
                lightningRef.current.goToAndPlay(0);
            }
        }, 4000); 
    };

    return (
        <div className="nature-lottie-container">
            
            {/* --- TOP PANE: WHITE --- */}
            <div className="nature-pane top-nature">
                <div className="lottie-item cherry-wrapper">
                    <Lottie 
                        lottieRef={cherryRef} // Attach the ref here
                        animationData={cherryBlossomData} 
                        loop={true} 
                    />
                </div>
            </div>

            {/* --- BOTTOM PANE: DARK --- */}
            <div className="nature-pane bottom-nature">
                
                <div className="lottie-item rain-wrapper">
                    <Lottie 
                        animationData={rainData} 
                        loop={true} 
                        style={{ width: '100%', height: '100%' }} 
                    />
                </div>

                <div className="lottie-item lightning-wrapper">
                    <Lottie 
                        lottieRef={lightningRef}
                        animationData={lightningData} 
                        loop={false}
                        onComplete={handleLightningComplete} 
                        autoplay={true}
                    />
                </div>

            </div>

        </div>
    );
};

export default NatureLottie;