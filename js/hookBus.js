const hookRegistry = {};

function ensureHookList(hookName) {
  if (!hookRegistry[hookName]) {
    hookRegistry[hookName] = [];
  }
  return hookRegistry[hookName];
}

export function registerHook(hookName, callback) {
  if (!hookName || typeof callback !== "function") return false;
  const list = ensureHookList(hookName);
  list.push(callback);
  return true;
}

export function removeHook(hookName, callback) {
  const list = hookRegistry[hookName];
  if (!list) return false;
  hookRegistry[hookName] = list.filter((fn) => fn !== callback);
  return true;
}

export function runHook(hookName, payload) {
  const list = hookRegistry[hookName];
  if (!list || list.length === 0) return;

  for (const callback of list) {
    try {
      callback(payload);
    } catch (error) {
      console.error(`Erro no hook ${hookName}:`, error);
    }
  }
}

export function runHookOnValue(hookName, value) {
  const list = hookRegistry[hookName];
  if (!list || list.length === 0) return value;

  let nextValue = value;
  for (const callback of list) {
    try {
      const output = callback(nextValue);
      if (typeof output !== "undefined") {
        nextValue = output;
      }
    } catch (error) {
      console.error(`Erro no hook de valor ${hookName}:`, error);
    }
  }

  return nextValue;
}
