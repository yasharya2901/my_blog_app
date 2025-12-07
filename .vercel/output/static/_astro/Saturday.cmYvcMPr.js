var u={exports:{}},e={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var o;function v(){if(o)return e;o=1;var R=Symbol.for("react.transitional.element"),d=Symbol.for("react.fragment");function i(l,r,t){var n=null;if(t!==void 0&&(n=""+t),r.key!==void 0&&(n=""+r.key),"key"in r){t={};for(var s in r)s!=="key"&&(t[s]=r[s])}else t=r;return r=t.ref,{$$typeof:R,type:l,key:n,ref:r!==void 0?r:null,props:t}}return e.Fragment=d,e.jsx=i,e.jsxs=i,e}var x;function p(){return x||(x=1,u.exports=v()),u.exports}var a=p();const c=()=>a.jsx("div",{className:"",children:a.jsx("h1",{children:"This is my react component"})});export{c as Saturday};
