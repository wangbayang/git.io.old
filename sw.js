this.addEventListener('install', event => {
  console.log('installing');
  // 新线程安装后跳过等待阶段，直接应用新的线程
  this.skipWaiting();
  event.waitUntil(
    caches.open('vue-v1').then(cache => cache.add('/vue.png'))
  );
})

this.addEventListener('activate', event => {
  console.log('activate');
  // 在新线程激活后立即控制之前没有控制的客户端，从而达到第一次创建线程就可以劫持fetch，不用再刷新一次。
  clients.claim();
})

this.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin && url.pathname === '/logo.svg') {
    // if (!caches.match('/vue.png')) return;
    event.respondWith(caches.match('/vue.png'));
  }
})