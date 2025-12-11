// src/data/mock-pfas-sites.js
export const pfasSites = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [77.5946, 12.9716] },
      properties: { name: 'Bengaluru Contamination Site', level: 45 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [72.8777, 19.0760] },
      properties: { name: 'Mumbai Industrial Area', level: 120 }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [77.2090, 28.6139] },
      properties: { name: 'Delhi Water Treatment Plant', level: 88 }
    }
  ]
};