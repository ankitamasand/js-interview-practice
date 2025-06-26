Function.prototype.myApply = function myApply(thisArg, args) {
  thisArg ?? globalThis;
  const fnSymbol = Symbol("tempFn");
  thisArg[fnSymbol] = this;

  const result = Array.isArray(args)
    ? thisArg[fnSymbol](...args)
    : thisArg[fnSymbol]();
  delete thisArg[fnSymbol];
  return result;
};
