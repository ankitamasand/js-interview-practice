Function.prototype.myCall = function myCall(thisArg, ...args) {
  thisArg ?? globalThis;
  /* creating a temp symbol property for attaching the 
  calling function to thisArg to make sure the function name 
  does not override with already existing same name property on thisArg */
  const fnSymbol = Symbol("tempFn");
  thisArg[fnSymbol] = this;
  const result = thisArg[fnSymbol](...args); //calling the original function with this as thisArgs and the input arguments
  delete thisArg[fnSymbol];
  return result;
};
