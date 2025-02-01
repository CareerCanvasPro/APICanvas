import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import { ColorPicker } from './ColorPicker';
import { Save, Add, Delete, Preview } from '@mui/icons-material';
import { ChartPreview } from './ChartPreview';

interface CustomPreset extends ChartSettings {
  name: string;
  createdAt: string;
}

export const ChartSettings: React.FC<ChartSettingsProps> = ({
  open,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    const saved = localStorage.getItem('customChartPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPreview, setShowPreview] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSavePreset = () => {
    if (!presetName) return;
    
    const newPreset: CustomPreset = {
      ...settings,
      name: presetName,
      createdAt: new Date().toISOString()
    };
    
    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem('customChartPresets', JSON.stringify(updatedPresets));
    setPresetName('');
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Chart Settings
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<Preview />}
                onClick={() => setShowPreview(true)}
              >
                Preview
              </Button>
              <Select
                size="small"
                value=""
                onChange={(e) => {
                  const presetKey = e.target.value;
                  const preset = CHART_PRESETS[presetKey as keyof typeof CHART_PRESETS] ||
                    customPresets.find(p => p.name === presetKey);
                  if (preset) {
                    onSettingsChange(preset);
                  }
                }}
                displayEmpty
              >
                <MenuItem value="" disabled>Load Preset</MenuItem>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="modern">Modern</MenuItem>
                <MenuItem value="classic">Classic</MenuItem>
                {customPresets.length > 0 && <Divider />}
                {customPresets.map(preset => (
                  <MenuItem
                    key={preset.name}
                    value={preset.name}
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    {preset.name}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomPresets(prev => prev.filter(p => p.name !== preset.name));
                        localStorage.setItem('customChartPresets', 
                          JSON.stringify(customPresets.filter(p => p.name !== preset.name))
                        );
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
          <Box>
            <Typography gutterBottom>Colors</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {settings.colors.map((color, index) => (
                <ColorPicker
                  key={index}
                  color={color}
                  onChange={(newColor) => {
                    const newColors = [...settings.colors];
                    newColors[index] = newColor;
                    handleChange('colors', newColors);
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography gutterBottom>Animation Duration (ms)</Typography>
            <Slider
              value={settings.animationDuration}
              onChange={(_, value) => handleChange('animationDuration', value)}
              min={0}
              max={2000}
              step={100}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showGrid}
                onChange={(e) => handleChange('showGrid', e.target.checked)}
              />
            }
            label="Show Grid"
          />

          <Box>
            <Typography gutterBottom>Grid Style</Typography>
            <TextField
              value={settings.gridStyle}
              onChange={(e) => handleChange('gridStyle', e.target.value)}
              placeholder="3 3"
              size="small"
              disabled={!settings.showGrid}
            />
          </Box>

          <Box>
            <Typography gutterBottom>Legend Position</Typography>
            <Select
              value={settings.legendPosition}
              onChange={(e) => handleChange('legendPosition', e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="top">Top</MenuItem>
              <MenuItem value="right">Right</MenuItem>
              <MenuItem value="bottom">Bottom</MenuItem>
              <MenuItem value="left">Left</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography gutterBottom>Bar Corner Radius</Typography>
            <Slider
              value={settings.barRadius}
              onChange={(_, value) => handleChange('barRadius', value)}
              min={0}
              max={20}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box>
            <Typography gutterBottom>Line Style</Typography>
            <Select
              value={settings.lineStyle}
              onChange={(e) => handleChange('lineStyle', e.target.value)}
              size="small"
              fullWidth
            >
              <MenuItem value="linear">Linear</MenuItem>
              <MenuItem value="monotone">Monotone</MenuItem>
              <MenuItem value="step">Step</MenuItem>
            </Select>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <Button
            startIcon={<Add />}
            onClick={handleSavePreset}
            disabled={!presetName}
          >
            Save as Preset
          </Button>
        </Box>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>

      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Preview</DialogTitle>
        <DialogContent>
          <ChartPreview settings={settings} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};