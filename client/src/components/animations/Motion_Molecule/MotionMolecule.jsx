import React from 'react';
import { motion } from 'framer-motion';
import './MotionMolecule.css';

const MotionMolecule = () => {
  return (
    <div className="pfas-molecule-container">
      {/* This is the core of the animation. We use a motion.div and tell it 
        what to animate to and how to transition. 
      */}
      <motion.div
        className="pfas-molecule-svg"
        animate={{
          y: ["0rem", "-1.5rem", "0rem"],      // Move up and down
          rotate: [0, 15, 0, -15, 0], // Rotate back and forth
        }}
        transition={{
          duration: 8,              // The animation lasts 8 seconds
          ease: "easeInOut",        // Smooth easing
          repeat: Infinity,         // Loop forever
        }}
      >
        {/* SVG code for the PFOA molecule */}
        <svg
          viewBox="0 0 250 100"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: 'auto' }}
        >
          <g fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round">
            {/* Atoms */}
            <circle cx="10" cy="50" r="5" fill="#ADD8E6" />
            <circle cx="30" cy="50" r="5" fill="#90EE90" />
            <circle cx="50" cy="50" r="5" fill="#90EE90" />
            <circle cx="70" cy="50" r="5" fill="#90EE90" />
            <circle cx="90" cy="50" r="5" fill="#90EE90" />
            <circle cx="110" cy="50" r="5" fill="#90EE90" />
            <circle cx="130" cy="50" r="5" fill="#90EE90" />
            <circle cx="150" cy="50" r="5" fill="#90EE90" />
            <circle cx="170" cy="50" r="8" fill="#FF6347" />
            <circle cx="190" cy="35" r="8" fill="#FF6347" />
            <circle cx="190" cy="65" r="5" fill="#FFFFFF" />
            {/* Bonds */}
            <line x1="15" y1="50" x2="25" y2="50" />
            <line x1="35" y1="50" x2="45" y2="50" />
            <line x1="55" y1="50" x2="65" y2="50" />
            <line x1="75" y1="50" x2="85" y2="50" />
            <line x1="95" y1="50" x2="105" y2="50" />
            <line x1="115" y1="50" x2="125" y2="50" />
            <line x1="135" y1="50" x2="145" y2="50" />
            <line x1="155" y1="50" x2="162" y2="50" />
            <line x1="178" y1="50" x2="185" y2="40" />
            <line x1="178" y1="50" x2="185" y2="60" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default MotionMolecule;