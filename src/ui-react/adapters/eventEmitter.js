/**
 * EventEmitter - Ponte de comunicação entre Core e React
 * O Core emite 'stateChange' quando estado muda
 * React hooks escutam este evento para re-renderizar
 */

class GameEventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * Registra um listener para um evento
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove um listener
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  /**
   * Emite um evento para todos os listeners
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        console.error(`Erro no listener de ${event}:`, e);
      }
    });
  }

  /**
   * Limpa listeners
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

export const eventEmitter = new GameEventEmitter();
