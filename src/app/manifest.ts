import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return{
  "name": "AuraFinance - Glassmorphic Finance Tracker",
  "short_name": "AuraFinance",
  "description": "Sleek, real-time personal finance manager with visual analytics",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/globe.svg",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/globe.svg",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
}