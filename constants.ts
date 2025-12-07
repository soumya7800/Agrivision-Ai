
import { CropType } from './types';

export const CROP_OPTIONS = Object.values(CropType);

export const DEFAULT_SOIL_DATA = {
  country: "India",
  nitrogen: 90,
  phosphorus: 42,
  potassium: 43,
  temperature: 20,
  humidity: 82,
  ph: 6.5,
  rainfall: 202,
  cropType: CropType.Rice
};

export const MAX_VALUES = {
  nitrogen: 140,
  phosphorus: 145,
  potassium: 205,
  temperature: 50,
  humidity: 100,
  ph: 14,
  rainfall: 300
};

export const COUNTRIES = [
  { name: "India", lat: 20.5937, lng: 78.9629, avgTemp: 24, avgRain: 1083 },
  { name: "USA", lat: 37.0902, lng: -95.7129, avgTemp: 14, avgRain: 715 },
  { name: "Brazil", lat: -14.2350, lng: -51.9253, avgTemp: 25, avgRain: 1761 },
  { name: "China", lat: 35.8617, lng: 104.1954, avgTemp: 13, avgRain: 645 },
  { name: "Australia", lat: -25.2744, lng: 133.7751, avgTemp: 21, avgRain: 534 },
  { name: "Nigeria", lat: 9.0820, lng: 8.6753, avgTemp: 26, avgRain: 1165 },
  { name: "Argentina", lat: -38.4161, lng: -63.6167, avgTemp: 14, avgRain: 591 },
  { name: "Indonesia", lat: -0.7893, lng: 113.9213, avgTemp: 27, avgRain: 2702 },
  { name: "France", lat: 46.2276, lng: 2.2137, avgTemp: 11, avgRain: 867 },
  { name: "Ukraine", lat: 48.3794, lng: 31.1656, avgTemp: 9, avgRain: 565 },
  { name: "Canada", lat: 56.1304, lng: -106.3468, avgTemp: -5, avgRain: 537 },
  { name: "Russia", lat: 61.5240, lng: 105.3188, avgTemp: -5, avgRain: 460 },
  { name: "Japan", lat: 36.2048, lng: 138.2529, avgTemp: 15, avgRain: 1668 }
];
