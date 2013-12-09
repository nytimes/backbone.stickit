(function (factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('backbone'));
  } else if (typeof define === 'function' && define.amd) {
    define(['backbone'], factory);
  }
}(function (Backbone) {
  //= backbone.stickit.js
  return Backbone.Stickit;
}));
