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
  const [error, setError] = useState('');

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleChange = (newColor: ColorResult) => {
    if (validateHexColor(newColor.hex)){
      setError('');
      setColor(newColor);
      onColorChange(newColor);
    } else {
      setError('Invalid hex code');
    }
  };

  const validateHexColor = (newColorHex:string): boolean => {
    const hexRegex6 = /^#([0-9A-Fa-f]{6})$/;
    const hexRegex3 = /^#([0-9A-Fa-f]{3})$/;
    return hexRegex6.test(newColorHex) || hexRegex3.test(newColorHex);
  }

  useEffect(() => {
    setDisplayColorPicker(false);
  }, [autoColourRange]);

  useEffect(() => {
    const input = document.querySelectorAll('input[id^="rc-editable-input"]') as NodeListOf<HTMLInputElement>;
    input.forEach((input) => {
      if (input !== null) {
              input.maxLength = 7;
          }
      });
  },[]);

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
      <div id="errorText">{error}</div>
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
