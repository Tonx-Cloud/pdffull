const CACHE_NAME = "pdffull-v2";
const SHARED_FILES_CACHE = "shared-files";
const STATIC_ASSETS = ["/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== SHARED_FILES_CACHE).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Interceptar POST do Web Share Target em /leitor (PDFs) e /converter (imagens)
  if (
    (url.pathname === "/leitor" || url.pathname === "/converter") &&
    event.request.method === "POST"
  ) {
    event.respondWith(handleShareTarget(event.request, url.pathname));
    return;
  }

  // Ignorar requisições de API, auth e extensões do browser
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.protocol === "chrome-extension:"
  ) {
    return;
  }

  // Navegação (páginas HTML) → Network-first com fallback cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets estáticos (_next/static, imagens, fontes) → Cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // Tudo mais (_next/data, JS chunks dinâmicos) → Network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handler para Web Share Target — recebe arquivo compartilhado via POST
async function handleShareTarget(request, pathname) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (file && file instanceof File) {
      // Armazenar o arquivo no Cache API para o client-side consumir
      const cache = await caches.open(SHARED_FILES_CACHE);
      const response = new Response(file, {
        headers: {
          "Content-Type": file.type,
          "X-File-Name": encodeURIComponent(file.name),
          "X-File-Size": String(file.size),
        },
      });
      await cache.put("/shared-pdf", response);
    }
  } catch (err) {
    console.error("[SW] Erro ao processar share target:", err);
  }

  // Redirecionar para a página correta com flag de arquivo compartilhado
  const redirectPath = pathname === "/leitor" ? "/leitor" : "/converter";
  return Response.redirect(redirectPath + "?shared=1", 303);
}
