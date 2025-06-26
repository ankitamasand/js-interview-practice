const PROMISE_STATUS = {
  PENDING: "pending",
  FULFILED: "fulfiled",
  REJECTED: "rejected",
};

function MyPromise(executor) {
  let value; // promise value
  let status = PROMISE_STATUS.PENDING;
  let handlers = [];

  // only handle method will take care of calling the callbacks
  function handle(handler) {
    if (status === PROMISE_STATUS.PENDING) {
      handlers.push(handler);
      return;
    }

    const cb =
      status === PROMISE_STATUS.FULFILED
        ? handler.onFulFilled
        : handler.onRejected;

    if (!cb) {
      status === PROMISE_STATUS.FULFILED
        ? handler.resolve(value)
        : handler.reject(value);
      return;
    }

    try {
      const result = cb(value);
      if (result instanceof MyPromise) {
        result.then(handler.resolve, handler.reject);
      } else {
        handler.resolve(result);
      }
    } catch (err) {
      handler.reject(err);
    }
  }

  // then method will return a new promise object for chaining
  this.then = function (onFulFilled) {
    return new MyPromise((resolve, reject) => {
      handle({ onFulFilled, resolve, reject });
    });
  };

  // catch method will return a new promise object for chaining
  this.catch = function (onRejected) {
    return new MyPromise((resolve, reject) => {
      handle({ onRejected, resolve, reject });
    });
  };

  function resolve(val) {
    if (status !== PROMISE_STATUS.PENDING) return; // promise is already settled
    status = "fulfiled";
    value = val;
    // calling all the stored handlers (handlers is an object with onFulFilled or onRejected and resolve/reject methods)
    setTimeout(() => handlers.forEach(handle));
  }

  function reject(err) {
    if (status !== PROMISE_STATUS.PENDING) return; // promise is already settled
    status = "rejected";
    value = err;
    setTimeout(() => handlers.forEach(handle));
  }

  // call the executor immediately
  executor(resolve, reject);
}

const p = new MyPromise((resolve, reject) => {
  console.log("inside the promise executor");
  setTimeout(() => resolve("resolved"), 100);
});

p.then((data) => console.log("inside then", data));
