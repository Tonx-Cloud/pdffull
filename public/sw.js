const CACHE_NAME = "pdffull-v4";
const SHARED_FILES_CACHE = "shared-files";
const STATIC_ASSETS = ["/manifest.json"];

// Garante que o respondWith sempre receba um Response válido.
async function safeMatch(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return new Response("", {
    status: 504,
    statusText: "Offline and not cached",
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Permite ao client forçar ativação imediata da nova versão
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
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

  // Ignorar requisições de API, auth, extensões do browser e qualquer
  // origem diferente da nossa (vercel.live feedback, supabase, mercadopago, etc.)
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.protocol === "chrome-extension:"
  ) {
    return;
  }

  // Navegação (páginas HTML) → Network-only com fallback 504.
  // Não cacheamos HTML para evitar mismatch de hidratação do React
  // (HTML antigo + JS novo após deploy). O Next.js já cacheia os assets estáticos.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            "<h1>Sem conexão</h1><p>Tente novamente quando estiver online.</p>",
            {
              status: 504,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          )
      )
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
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => safeMatch(event.request));
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
      .catch(() => safeMatch(event.request))
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
