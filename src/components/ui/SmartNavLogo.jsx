import React from 'react';
import { motion } from 'framer-motion';

export const SmartNavLogo = ({ className = "", animated = true }) => {
  const drawTransition = { duration: 1.8, ease: [0.25, 1, 0.5, 1] };
  const fadeTransition = { delay: 1.4, duration: 1.2, ease: "easeOut" };

  if (!animated) {
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={`shrink-0 ${className}`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="grad-core" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="grad-ring" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#042f2e" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="45" stroke="url(#grad-ring)" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="50" cy="50" r="30" stroke="url(#grad-ring)" strokeWidth="1" strokeDasharray="4 8" opacity="0.6" />
        <path d="M50 15 L70 50 L50 85 L50 15 Z" fill="url(#grad-core)" />
        <path d="M50 15 L30 50 L50 85 L50 15 Z" fill="#115e59" opacity="0.8" />
        <path d="M15 50 Q50 70 85 50 Q50 30 15 50 Z" stroke="#5eead4" strokeWidth="0.5" fill="none" opacity="0.7" />
        <circle cx="50" cy="50" r="4" fill="#ccfbf1" className="drop-shadow-[0_0_8px_rgba(45,212,191,1)]" />
      </svg>
    );
  }

  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      className={`shrink-0 ${className}`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="grad-ring" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#042f2e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer Radar Rings */}
      <motion.circle 
        cx="50" cy="50" r="45" 
        stroke="url(#grad-ring)" strokeWidth="1.5" strokeDasharray="6 6" 
        initial={{ pathLength: 0, opacity: 0, rotate: -45 }}
        animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
        transition={{ ...drawTransition, opacity: { duration: 1 } }}
        style={{ transformOrigin: "center" }}
      />
      <motion.circle 
        cx="50" cy="50" r="30" 
        stroke="url(#grad-ring)" strokeWidth="1" strokeDasharray="4 8" opacity="0.6" 
        initial={{ pathLength: 0, rotate: 45 }}
        animate={{ pathLength: 1, rotate: 0 }}
        transition={drawTransition}
        style={{ transformOrigin: "center" }}
      />
      
      {/* Central 3D Crystalline Compass Needle - Wireframe Tracing */}
      <motion.path 
        d="M50 15 L70 50 L50 85 L50 15 Z" stroke="#2dd4bf" strokeWidth="1"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{ pathLength: drawTransition, opacity: fadeTransition }}
      />
      <motion.path 
        d="M50 15 L30 50 L50 85 L50 15 Z" stroke="#115e59" strokeWidth="1"
        initial={{ pathLength: 0, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 0 }}
        transition={{ pathLength: drawTransition, opacity: fadeTransition }}
      />
      
      {/* Central 3D Crystalline Compass Needle - Filled Reveal */}
      <motion.path 
        d="M50 15 L70 50 L50 85 L50 15 Z" fill="url(#grad-core)" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={fadeTransition}
      />
      <motion.path 
        d="M50 15 L30 50 L50 85 L50 15 Z" fill="#115e59" opacity="0.8" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={fadeTransition}
      />
      
      {/* Futuristic Orbit/Equator Line */}
      <motion.path 
        d="M15 50 Q50 70 85 50 Q50 30 15 50 Z" 
        stroke="#5eead4" strokeWidth="0.5" fill="none" opacity="0.7" 
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ ...drawTransition, delay: 0.3 }}
      />
      
      {/* Glowing Center Core */}
      <motion.circle 
        cx="50" cy="50" r="4" 
        fill="#ccfbf1" className="drop-shadow-[0_0_8px_rgba(45,212,191,1)]" 
        initial={{ opacity: 0, filter: "blur(4px)", scale: 0.5 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
      />
    </motion.svg>
  );
};
