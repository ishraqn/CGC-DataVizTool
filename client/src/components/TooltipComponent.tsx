import React, { useState } from 'react';
import './uploadForm.css';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

//   const handleMouseLeave = () => {
//     setShowTooltip(false);
//   };

  return (
    <div className="tooltip-container" onMouseEnter={handleMouseEnter}>
      {children}
      {showTooltip && <div className="tooltip">{text}</div>}
    </div>
  );
};

export default Tooltip;
