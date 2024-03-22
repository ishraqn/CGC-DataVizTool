import React, { useState } from 'react';
import reactCSS from 'reactcss';
import { SliderPicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  onColorChange: (color: ColorResult) => void;
  backgroundColor: string;
}

const ColorPickerComponent: React.FC<ColorPickerProps> = ({ onColorChange, backgroundColor}) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(true);
  const [color, setColor] = useState<ColorResult>({
    hex: '#755b73',
    rgb: {
      r: 152,
      g: 175,
      b: 199,
      a: 1,
    },
    hsl: {
      h: 211,
      s: 30,
      l: 69,
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
        width: '100%',
        display: 'block',
      },
      popover: {
        position: 'absolute',
        zIndex: '2',
        right: '0%',
      },
      sliderContainer: {
        marginTop: '10px',
      },
      cover: {
        position: 'fixed' as 'fixed',
        borderRadius: '2px',
      },
    },
  });

  return (
    <div className='color-picker-container'>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={{ backgroundColor: backgroundColor, width: '28px', height: '24px', borderRadius: '2px' }} />
      </div>
      {displayColorPicker ? (
        <div style={styles.sliderContainer}>
          <div style={styles.cover} onClick={handleClose} />
          <SliderPicker color={backgroundColor} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPickerComponent;
