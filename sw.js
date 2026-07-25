/* Service Worker — 山水有相逢
   Chiến lược NETWORK-FIRST: luôn ưu tiên lấy bản mới nhất từ mạng trước.
   Chỉ dùng bản cache (đã lưu offline) khi KHÔNG có mạng — nhờ vậy mỗi lần
   cập nhật index.html trên GitHub, người dùng sẽ luôn thấy bản mới ngay
   lập tức khi có mạng, không bị kẹt ở bản cũ như chiến lược cache-first trước đây. */
const CACHE_NAME = 'sonthuy-v2'; // Đổi version để buộc xóa sạch cache cũ (sonthuy-v1) đang kẹt bản index.html cũ
const ASSETS = [
  './index.html',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Không cache các gọi API (AI Tutor) — luôn lấy dữ liệu mới nhất
  if (event.request.url.includes('api.anthropic.com')) return;

  event.respondWith(
    fetch(event.request).then((resp) => {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(()=>{});
      return resp;
    }).catch(() => caches.match(event.request)) // Mất mạng → mới dùng bản đã lưu offline
  );
});
