'use client';

import React from 'react';

/**
 * BackgroundMagnifier:
 * A subtle, non-intrusive detective magnifying glass that wanders
 * smoothly across the website background, searching for clues.
 */
export function BackgroundMagnifier() {
  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none"
    >
      {/* Roaming Magnifier Element */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 animate-detective-roam">
        <div className="w-full h-full animate-detective-pulse">
          <svg 
            viewBox="0 0 220 220" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-full filter drop-shadow-[0_0_20px_rgba(246,195,36,0.18)]"
          >
            {/* Ambient Searchlight Beam Behind the Lens */}
            <circle cx="85" cy="85" r="80" fill="url(#ambientSearchlight)" />
            
            {/* Outer Metallic Rim */}
            <circle cx="85" cy="85" r="60" stroke="#f6c324" strokeWidth="5.5" strokeOpacity="0.55" />
            <circle cx="85" cy="85" r="54" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.2" />
            
            {/* Glass Lens Tint with Refraction Look */}
            <circle cx="85" cy="85" r="53" fill="url(#lensGlassGrad)" />
            
            {/* Detective Forensic Crosshairs (Subtle searching grid) */}
            <line x1="85" y1="40" x2="85" y2="54" stroke="#f6c324" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round" />
            <line x1="85" y1="116" x2="85" y2="130" stroke="#f6c324" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round" />
            <line x1="40" y1="85" x2="54" y2="85" stroke="#f6c324" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round" />
            <line x1="116" y1="85" x2="130" y2="85" stroke="#f6c324" strokeWidth="1.8" strokeOpacity="0.45" strokeLinecap="round" />
            
            {/* Focus Target Center */}
            <circle cx="85" cy="85" r="6" stroke="#ec1368" strokeWidth="1.2" strokeOpacity="0.5" strokeDasharray="2 2" />
            <circle cx="85" cy="85" r="1.5" fill="#f6c324" fillOpacity="0.75" />
            
            {/* Glass Glint Curved Reflection */}
            <path 
              d="M 48 72 A 48 48 0 0 1 100 42" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeOpacity="0.3" 
            />
            
            {/* Handle Base Connection */}
            <rect 
              x="122" 
              y="122" 
              width="14" 
              height="8" 
              rx="2.5" 
              transform="rotate(45 122 122)" 
              fill="#f6c324" 
              fillOpacity="0.65" 
            />
            
            {/* Detective Wooden/Metallic Handle */}
            <line 
              x1="131" 
              y1="131" 
              x2="190" 
              y2="190" 
              stroke="#1c1917" 
              strokeWidth="15" 
              strokeLinecap="round" 
            />
            <line 
              x1="133" 
              y1="133" 
              x2="188" 
              y2="188" 
              stroke="#f6c324" 
              strokeWidth="11" 
              strokeLinecap="round" 
              strokeOpacity="0.75" 
            />
            <line 
              x1="140" 
              y1="140" 
              x2="182" 
              y2="182" 
              stroke="#ec1368" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeOpacity="0.4" 
            />
            {/* Handle End Pommel Cap */}
            <circle cx="190" cy="190" r="5" fill="#f6c324" fillOpacity="0.8" />

            {/* Gradient Definitions */}
            <defs>
              <radialGradient id="ambientSearchlight" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f6c324" stopOpacity="0.18" />
                <stop offset="45%" stopColor="#ec1368" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="lensGlassGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
                <stop offset="45%" stopColor="#f6c324" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#0a0a0c" stopOpacity="0.2" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
