// Raspberry Pi temperature module

import fs from 'fs';

// path to the file with the CPU temperature
const SENSOR_PATH = '/sys/class/thermal/thermal_zone0/temp';

// gets the temperature in °C
function getTemperature() {
  try {
    const raw = fs.readFileSync(SENSOR_PATH, 'utf8');
    const celsius = parseInt(raw.trim(), 10) / 1000;

    return celsius.toFixed(1);
  } catch (error) {
    console.error('Не вдалося зчитати температуру:', error.message);

    return null;
  }
}

export const temperature = {
  getTemperature,
};