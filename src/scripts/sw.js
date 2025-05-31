import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BASE_URL } from './config';

// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// Runtime caching
registerRoute(
  ({ url }) => {
    return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
    cacheName: 'google-fonts',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'MyKisah-api',
  }),
);
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'MyKisah-api-images',
  }),
);
registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);

self.addEventListener('push', (event) => {
  console.log('Service worker pushing...');

  // Deklarasikan notificationData di scope yang lebih luas (di luar try-catch)
  // dan berikan nilai default atau pastikan diinisialisasi sebelum digunakan
  let notificationData = {
    title: 'Notifikasi Default', // Default title
    options: {
      body: 'Pesan notifikasi default', // Default body
    },
  };

  async function chainPromise() {
    if (event.data) {
      try {
        const data = event.data.json();
        if (data.type === 'story_created') {
          notificationData = {
            title: 'Kisah berhasil dibuat', // Perhatikan kapitalisasi 'Kisah'
            options: {
              body: `Anda telah membuat kisah baru dengan deskripsi: ${data.description}`,
            },
          };
        } else {
          // Handle other notification types or set a generic notification
          notificationData = {
            title: 'Notifikasi Baru',
            options: {
              body: 'Anda memiliki notifikasi baru.',
            },
          };
        }
      } catch (error) {
        console.error('Error parsing push event data:', error);
        // Fallback notification if parsing fails
        notificationData = {
          title: 'Error Notifikasi',
          options: {
            body: 'Gagal memproses notifikasi.',
          },
        };
      }
    }

    // Pastikan showNotification dipanggil setelah notificationData diinisialisasi
    await self.registration.showNotification(notificationData.title, notificationData.options)
      .catch((error) => {
        console.error('Error showing push notification:', error);
      });
  }

  event.waitUntil(chainPromise());
});

// Menangani pesan dari postMessage (Tidak ada perubahan signifikan yang diperlukan di sini)
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  if (event.data && event.data.type === 'story_created') {
    const notificationData = {
      title: 'Kisah berhasil dibuat', // Perhatikan kapitalisasi 'Kisah'
      options: {
        body: `Anda telah membuat kisah baru dengan deskripsi: ${event.data.description}`,
      },
    };

    self.registration.showNotification(notificationData.title, notificationData.options).catch((error) => {
      console.error('Error showing notification:', error);
    });
  }
});