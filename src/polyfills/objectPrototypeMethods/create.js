function myCreate(proto, prototypeProperties) {
  function F() {}
  F.prototype = proto;
  const obj = new F();
  // set prototype properties - pending
  return obj;
}
