function createAsyncEventEmitter() {
  let events = new Map();
  return {
    on(eventName, handler) {
      if (!events.has(eventName)) {
        events.set(eventName, []);
      }

      events.get(eventName).push(handler);
    },

    off(eventName, listener) {
      const listeners = events.get(eventName);
      if (!listeners) return;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }

      if (listeners.length === 0) {
        events.delete(eventName);
      }
    },

    emit(eventName, ...args) {
      const listeners = events.get(eventName);
      if (listeners) {
        [...listeners].forEach((listener) => {
          try {
            listener(...args);
          } catch (err) {
            console.log(`Error in listener ${eventName} - ${listener}`, err);
          }
        });
      }
    },

    once(eventName, listener) {
      const wrapper = () => {
        listener();
        this.off(eventName, listener);
      };
      this.on(eventName, wrapper);
    },

    async emitAsync(eventName, ...args) {
      const listeners = events.get(eventName);
      if (!listeners) return;
      await Promise.all(listeners.map((listener) => listener(...args)));
    },
  };
}

const eventEmitter = createAsyncEventEmitter();
function log() {
  console.log("hello!");
}

function asyncLog() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
      console.log("hello async log");
    }, 200);
  });
}

eventEmitter.on("one", log);
eventEmitter.on("one", log);
eventEmitter.emit("one");
eventEmitter.once("two", log);
eventEmitter.on("one", asyncLog);
eventEmitter.emitAsync("one");
