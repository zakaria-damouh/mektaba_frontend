import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Maktaba POS',
    short_name: 'Maktaba',
    description: 'Système de caisse et gestion de stock pour Maktaba',
    start_url: '/caisse',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#059669', // Emerald Green theme
    icons: [
      {
        src: '/logo.png', // Uses your logo for the phone home screen
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}