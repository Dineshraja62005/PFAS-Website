import React from 'react';
import './FadingLettersText.css';

const FadingLettersText = ({ text, startAnimation }) => {
    return (
        <span aria-label={text} className={`fading-text-container ${startAnimation ? 'animate' : ''}`}>
            {text.split('').map((char, index) => (
                <span
                    key={index}
                    className="fading-letter"
                    // Reduce the maximum random delay from 2.5s to 1.0s
                    style={{ animationDelay: `${Math.random() * 1.0}s` }}
                    aria-hidden="true"
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
};

export default FadingLettersText;