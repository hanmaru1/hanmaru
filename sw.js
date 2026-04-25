// 평창교회 PWA Service Worker
const CACHE_NAME = 'pyeongchang-church-v1';
const ASSETS = [
  './',
  './평창교회.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// 활성화: 구 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청 가로채기: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', e => {
  // 외부 폰트/지도 등은 네트워크 우선
  if (e.request.url.includes('googleapis') ||
      e.request.url.includes('kakao') ||
      e.request.url.includes('naver')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        // 성공한 응답은 캐시에 저장
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
