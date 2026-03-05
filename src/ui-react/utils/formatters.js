/**
 * Utilitários de formatação para exibição na UI
 */

const NUMBER_FORMAT_STORAGE_KEY = "cocada:number-format-mode";
const NUMBER_FORMAT_MODES = ["short", "long", "raw"];

const SHORT_SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];
const LONG_SUFFIXES = [
  "",
  " mil",
  " milhões",
  " bilhões",
  " trilhões",
  " quadrilhões",
  " quintilhões",
  " sextilhões",
  " septilhões",
  " octilhões",
  " nonilhões",
];

function normalizeMode(mode) {
  return NUMBER_FORMAT_MODES.includes(mode) ? mode : "short";
}

function loadInitialMode() {
  if (typeof window === "undefined") return "short";

  try {
    return normalizeMode(window.localStorage.getItem(NUMBER_FORMAT_STORAGE_KEY) || "short");
  } catch {
    return "short";
  }
}

let currentNumberFormatMode = loadInitialMode();

export function getNumberFormatMode() {
  return currentNumberFormatMode;
}

export function getAvailableNumberFormatModes() {
  return [...NUMBER_FORMAT_MODES];
}

export function setNumberFormatMode(mode) {
  const nextMode = normalizeMode(mode);
  const changed = nextMode !== currentNumberFormatMode;
  currentNumberFormatMode = nextMode;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(NUMBER_FORMAT_STORAGE_KEY, nextMode);
    } catch {
      // Silencioso por segurança (modo privado/localStorage bloqueado)
    }

    if (changed) {
      window.dispatchEvent(
        new CustomEvent("cocada:number-format-change", {
          detail: { mode: nextMode },
        }),
      );
    }
  }

  return nextMode;
}

function formatCompactNumber(num, suffixes) {
  const abs = Math.abs(num);

  if (abs < 1000) {
    return num.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
    });
  }

  let scaled = abs;
  let suffixIndex = 0;
  while (scaled >= 1000 && suffixIndex < suffixes.length - 1) {
    scaled /= 1000;
    suffixIndex++;
  }

  const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  const sign = num < 0 ? "-" : "";
  const base = scaled.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  return `${sign}${base}${suffixes[suffixIndex]}`;
}

function formatRawNumber(num) {
  if (Number.isInteger(num)) return String(num);
  return String(Math.round(num * 100) / 100);
}

/**
 * Formata um número para exibição com separadores
 */
export function formatNumber(num) {
  if (typeof num !== "number") return String(num);
  if (!Number.isFinite(num)) return "Infinity";

  const mode = currentNumberFormatMode;

  if (mode === "raw") {
    return formatRawNumber(num);
  }

  if (mode === "long") {
    return formatCompactNumber(num, LONG_SUFFIXES);
  }

  return formatCompactNumber(num, SHORT_SUFFIXES);
}

/**
 * Formata número como moeda (Cocadas)
 */
export function formatCurrency(num) {
  return `${formatNumber(num)} cocadas`;
}

/**
 * Formata duração em ms para HH:MM:SS
 */
export function formatDurationMs(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formata percentual para exibição estável
 */
export function formatPercent(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(1)}%`;
}
