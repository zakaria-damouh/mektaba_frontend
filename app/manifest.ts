import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Maktaba POS',
    short_name: 'Maktaba',
    description: 'Système de caisse et gestion de stock pour Maktaba',
    start_url: '/caisse',
    display: 'standalone', // Opens in its own window without browser bars!
    background_color: '#ffffff',
    theme_color: '#059669', // Emerald Green theme
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}