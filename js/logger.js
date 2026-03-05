export function logInfo(...args) {
  console.log("[INFO]", ...args);
}

export function logWarn(...args) {
  console.warn("[WARN]", ...args);
}

export function logError(...args) {
  console.error("[ERROR]", ...args);
}

export function initErrorLogger() {
  // Erros JS normais
  window.addEventListener("error", (event) => {
    console.group("[GLOBAL ERROR]");
    console.error("Mensagem:", event.message);
    console.error("Arquivo:", event.filename);
    console.error("Linha:", event.lineno, "Coluna:", event.colno);
    console.error("Erro:", event.error);
    console.groupEnd();
  });

  // Erros de Promise (async / await)
  window.addEventListener("unhandledrejection", (event) => {
    console.group("[UNHANDLED PROMISE]");
    console.error("Motivo:", event.reason);
    console.groupEnd();
  });
}

const history = [];

function pushLog(type, payload) {
  history.push({
    type,
    payload,
    time: new Date().toISOString(),
  });

  if (type === "error") {
    console.error("[ERROR]", payload);
  } else {
    console.log(`[${type.toUpperCase()}]`, payload);
  }
}

export function log(type, payload) {
  pushLog(type, payload);
}

export function getLogs() {
  return history;
}
