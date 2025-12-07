let _getEnv = (key) => process.env[key];
function setGetEnv(fn) {
  _getEnv = fn;
  _onSetGetEnv();
}
let _onSetGetEnv = () => {
};
function setOnSetGetEnv(fn) {
  _onSetGetEnv = fn;
}
function getEnv(...args) {
  return _getEnv(...args);
}

export { setGetEnv as a, getEnv as g, setOnSetGetEnv as s };
