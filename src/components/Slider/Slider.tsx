import * as React from 'react';
import Switch from '@mui/material/Switch';

export default function ControlledSwitches({ handleChange, checked, style }: {
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    checked: boolean,
    style: React.CSSProperties,
  }) {

  return (
    <Switch
      checked={checked}
      onChange={handleChange}
      style={style}
      inputProps={{ 'aria-label': 'controlled' }}
    />
  );
}