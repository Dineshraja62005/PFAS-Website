import React, { useState, useEffect, useRef } from 'react';

const ScrambledText = ({ text, startAnimation }) => {
    const [displayedText, setDisplayedText] = useState(text);
    const intervalRef = useRef();

    useEffect(() => {
        if (startAnimation) {
            scramble();
        }
        return () => clearInterval(intervalRef.current);
    }, [startAnimation]);

    const scramble = () => {
        // A cleaner set of characters for a more stylish scramble
        const letters = '*_#SZYXWVUTROPQNMLKJIHGFEDCBA';
        let iteration = 0;

        clearInterval(intervalRef.current);

        // The interval delay is increased from 30ms to 40ms
        intervalRef.current = setInterval(() => {
            setDisplayedText(
                text
                    .split('')
                    .map((letter, index) => {
                        if (index < iteration) {
                            return text[index];
                        }
                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                clearInterval(intervalRef.current);
            }

            // The reveal speed is slowed down from 1/3 to 1/4
            iteration += 1 / 4;
        }, 12); // Slower interval
    };

    return <span>{displayedText}</span>;
};

export default ScrambledText;