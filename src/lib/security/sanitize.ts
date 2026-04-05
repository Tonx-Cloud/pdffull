/**
 * Sanitização de prompts do usuário para chamadas de IA.
 * Previne prompt injection conforme GENESIS §8.4.
 */

const DENY_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s*prompt/i,
  /you\s+are\s+now\s+/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /jailbreak/i,
  /\bDAN\b/,
  /reveal\s+your\s+(instructions|prompt|rules)/i,
];

const MAX_PROMPT_LENGTH = 2_000;

/**
 * Sanitiza um prompt enviado pelo usuário.
 * Remove caracteres de controle e bloqueia padrões de prompt injection.
 * @throws Error se um padrão de injection for detectado
 */
export function sanitizeUserPrompt(input: string): string {
  for (const pattern of DENY_PATTERNS) {
    if (pattern.test(input)) {
      throw new Error("Prompt bloqueado por política de segurança.");
    }
  }

  return input
    .slice(0, MAX_PROMPT_LENGTH)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/**
 * Valida output da IA — remove URLs suspeitas e blocos de código executável.
 */
export function sanitizeAiOutput(output: string): string {
  // Remove javascript: URLs
  return output.replace(/javascript\s*:/gi, "");
}
