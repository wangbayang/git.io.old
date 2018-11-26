const cacheVersion = 'v0.0.1';

this.addEventListener('install', event => {
  console.log('install');
  // 新线程安装后跳过等待阶段，直接应用新的线程
  this.skipWaiting();
  // 传入一个 Promise 为参数，等到该 Promise 为 resolve 状态为止。
  // event.waitUntil(
  //   caches.open('vue-v1').then(cache => cache.add('/vue.png'))
  // );
  // event.waitUntil(
  //   caches.keys().then(keys => {
  //     console.log(keys)
  //   })
  // );
})

this.addEventListener('activate', event => {
  console.log('activate');
  event.waitUntil(
    Promise.all([
      // 在新线程激活后立即控制之前没有控制的客户端，从而达到第一次创建线程就可以劫持fetch，不用再刷新一次。
      clients.claim(),
      // 清理旧版本
      caches.keys().then(cacheList => {
        return Promise.all(
          cacheList.map(cacheName => {
            if (cacheName !== cacheVersion) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
})

this.addEventListener('fetch', event => {
  console.log('request', event.request.url);
  event.respondWith(
    caches.match(event.request.url).then(res => {
      console.log('response', res && res.url);
      if (res) {
        return res;
      }

      const request = event.request.clone();
      return fetch(request).then(httpRes => {

        if (!httpRes || httpRes.status !== 200) {
          return httpRes;
        }

        const httpResClone = httpRes.clone();
        caches.open(cacheVersion).then(cache => {
          cache.put(event.request.url, httpResClone);
        });

        return httpRes;
      });
    })
      .catch(e => console.log(e))
  );
})

this.addEventListener('message', event => {
  if (event.data === 'start test performance') {
    for(let i = 0; i < 5000; i++) {
      console.log('test')
    }
    clients.matchAll()
      .then(function (clients) {
        if (clients && clients.length) {
          clients.forEach(function (client) {
            client.postMessage('down');
          })
        }
      })
  }
});
