this.addEventListener('install', event => {
  console.log('install');
  // 新线程安装后跳过等待阶段，直接应用新的线程
  this.skipWaiting();
  // waitUntil() 方法会确保 Service Worker 不会在 waitUntil() 里面的代码执行完毕之前安装完成。
  event.waitUntil(
    caches.open('vue-v1').then(cache => cache.add('/vue.png'))
  );
  // event.waitUntil(
  //   caches.keys().then(keys => {
  //     console.log(keys)
  //   })
  // );
})

this.addEventListener('activate', event => {
  console.log('activate');
  // 在新线程激活后立即控制之前没有控制的客户端，从而达到第一次创建线程就可以劫持fetch，不用再刷新一次。
  clients.claim();
})

this.addEventListener('fetch', event => {
  console.log('fetch', event.request)
  event.respondWith(
    caches.match(event.request).then(res => {
      console.log(res)
      if (res) {
        return res;
      }

      const request = event.request.clone();
      return fetch(request).then(httpRes => {

        if (!httpRes || httpRes.status !== 200) {
          return httpRes;
        }

        const httpResClone = httpRes.clone();
        caches.open('my-cache-v1').then(cache => {
          cache.put(event.request, httpResClone);
        });

        return httpRes;
      });
    })
    .catch(e => console.log(e))
  );
  // const url = new URL(event.request.url);
  // if (url.origin === location.origin && url.pathname === '/logo.svg') {
  //   // if (!caches.match('/vue.png')) return;
  //   event.respondWith(caches.match('/vue.png'));
  // }
})