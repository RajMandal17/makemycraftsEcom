import React from 'react';
import './DeerLoadingAnimation.css';

interface DeerLoadingAnimationProps {
  message?: string;
}

const DeerLoadingAnimation: React.FC<DeerLoadingAnimationProps> = ({ 
  message = "Loading beautiful artworks..." 
}) => {
  return (
    <div className="deer-loading-overlay">
      <div className="deer-loading-container">
        {}
        <div className="deer-animation">
          <svg viewBox="0 0 200 200" className="deer-svg">
            {}
            <ellipse cx="100" cy="120" rx="35" ry="45" className="deer-body" />
            
            {}
            <circle cx="100" cy="70" r="25" className="deer-head" />
            
            {}
            <ellipse cx="85" cy="55" rx="8" ry="15" className="deer-ear left-ear" />
            <ellipse cx="115" cy="55" rx="8" ry="15" className="deer-ear right-ear" />
            
            {}
            <g className="antler left-antler">
              <line x1="88" y1="50" x2="75" y2="35" className="antler-main" />
              <line x1="78" y1="42" x2="70" y2="38" className="antler-branch" />
              <line x1="80" y1="38" x2="72" y2="30" className="antler-branch" />
            </g>
            
            {}
            <g className="antler right-antler">
              <line x1="112" y1="50" x2="125" y2="35" className="antler-main" />
              <line x1="122" y1="42" x2="130" y2="38" className="antler-branch" />
              <line x1="120" y1="38" x2="128" y2="30" className="antler-branch" />
            </g>
            
            {}
            <circle cx="92" cy="68" r="3" className="deer-eye" />
            <circle cx="108" cy="68" r="3" className="deer-eye" />
            
            {}
            <circle cx="100" cy="78" r="4" className="deer-nose" />
            
            {}
            <rect x="85" y="160" width="6" height="35" rx="3" className="deer-leg" />
            <rect x="109" y="160" width="6" height="35" rx="3" className="deer-leg" />
            
            {}
            <ellipse cx="130" cy="125" rx="8" ry="12" className="deer-tail" />
            
            {}
            <circle cx="95" cy="115" r="4" className="deer-spot spot-1" />
            <circle cx="110" cy="125" r="3" className="deer-spot spot-2" />
            <circle cx="90" cy="135" r="3" className="deer-spot spot-3" />
          </svg>
          
          {}
          <div className="floating-palette palette-1">🎨</div>
          <div className="floating-palette palette-2">🖌️</div>
          <div className="floating-palette palette-3">✨</div>
        </div>
        
        {}
        <div className="loading-text">
          <h3>{message}</h3>
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
        
        {}
        <div className="circular-progress">
          <svg className="progress-ring" viewBox="0 0 120 120">
            <circle
              className="progress-ring-circle"
              cx="60"
              cy="60"
              r="54"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DeerLoadingAnimation;
