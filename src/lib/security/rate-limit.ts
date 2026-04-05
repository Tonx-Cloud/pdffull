/**
 * Rate limiting por IP usando Map em memória.
 * Em produção no Vercel, cada instância serverless tem seu próprio Map,
 * então o rate limiting é "best effort" — suficiente para barrar abusos.
 */

const rateLimitMap = new Map<
  string,
  { count: number; lastReset: number }
>();

/**
 * Verifica se o IP pode fazer mais requisições.
 * @param ip — endereço IP do cliente
 * @param limit — máximo de requisições na janela (padrão: 60)
 * @param windowMs — tamanho da janela em ms (padrão: 60 000 = 1 min)
 * @returns true se permitido, false se excedeu o limite
 */
export function rateLimit(
  ip: string,
  limit = 60,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  entry.count++;
  return entry.count <= limit;
}

/**
 * Helper para extrair IP da request.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
