import React, { useEffect, useState } from 'react';
import reactCSS from 'reactcss';
import { SliderPicker, ColorResult } from 'react-color';
import { EditableInput } from 'react-color/lib/components/common';
import { useToggle } from '../contexts/useToggle';
import './ColorPickerComponent.css';

interface ColorPickerProps {
  onColorChange: (color: ColorResult) => void;
  backgroundColor: string;
}

const ColorPickerComponent: React.FC<ColorPickerProps> = ({ onColorChange, backgroundColor}) => {
  const { autoColourRange } = useToggle();
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState<ColorResult>({
    hex: '#DDE6B3',
    rgb: {
      r: 221,
      g: 230,
      b: 179,
      a: 1,
    },
    hsl: {
      h: 71,
      s: 50,
      l: 80,
      a: 1,
    },
  });

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleChange = (newColor: ColorResult) => {
    setColor(newColor);
    onColorChange(newColor);
  };

  useEffect(() => {
    setDisplayColorPicker(false);
  }, [autoColourRange]);

  return (
    <div className='color-picker-container'>
      <div className='swatch-container'>
        <div className = 'swatch' style={{ backgroundColor: backgroundColor, width: '28px', height: '24px', borderRadius: '2px' }} onClick={handleClick}/>
        <EditableInput
          label="hex"
          value={color.hex}
          onChange={handleChange}
        />
      </div>
      {displayColorPicker ? (
        <div className = 'slider-container' >
          <div className = 'cover' onClick={handleClick}/>
          <SliderPicker color={backgroundColor} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPickerComponent;
