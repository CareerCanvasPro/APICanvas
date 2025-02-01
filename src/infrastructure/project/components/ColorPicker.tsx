import React, { useState } from 'react';
import { Box, Popover, IconButton } from '@mui/material';
import { SketchPicker } from 'react-color';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          width: 32,
          height: 32,
          backgroundColor: color,
          '&:hover': { backgroundColor: color },
          border: '2px solid',
          borderColor: 'divider'
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <SketchPicker
          color={color}
          onChange={(color) => onChange(color.hex)}
        />
      </Popover>
    </>
  );
};