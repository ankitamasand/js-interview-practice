if (!Function.prototype.myBind) {
  Function.prototype.myBind = function (thisArg, ...boundArgs) {
    const originalFn = this;

    function boundFn(...callArgs) {
      // check if the bound function is called with the new operator
      if (this instanceof boundFn.prototype) {
        return new originalFn(...boundArgs, ...callArgs);
      } else {
        return originalFn.apply(thisArg, [...boundArgs, ...callArgs]);
      }
    }

    boundFn.prototype = Object.create(originalFn.prototype);

    return boundFn;
  };
}

//Example
