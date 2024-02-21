import React, { useState } from 'react';
import reactCSS from 'reactcss';
import { SliderPicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  onColorChange: (color: ColorResult) => void;
}

const ColorPickerComponent: React.FC<ColorPickerProps> = ({ onColorChange }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState<ColorResult>({
    hex: '#ab0f34',
    rgb: {
      r: 171,
      g: 15,
      b: 52,
      a: 1,
    },
    hsl: {
      h: 351,
      s: 84,
      l: 36,
      a: 1,
    },
  });

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (newColor: ColorResult) => {
    setColor(newColor);
    // Invoke the callback function with the selected color
    onColorChange(newColor);
  };

  const styles = reactCSS({
    default: {
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
      },
      popover: {
        width: '500px',
        position: 'absolute' as 'absolute',
        zIndex: '700',
        right: '37%',
      },
      cover: {
        position: 'fixed' as 'fixed',
      },
    },
  });

  return (
    <div>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={{ backgroundColor: color.hex, width: '36px', height: '14px', borderRadius: '2px' }} />
      </div>
      {displayColorPicker ? (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <SliderPicker color={color as any} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPickerComponent;
