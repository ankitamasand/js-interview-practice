function myNew(constructorFn, ...args) {
  const obj = {};

  Object.setPrototypeOf(obj, constructorFn.prototype);
  const result = constructorFn.apply(obj, args);

  // return the result of the constructorfn if the result is an object, function otherwise return the new object;
  return result !== null &&
    (typeof result === "object" || typeof result === "function")
    ? result
    : obj;
}
