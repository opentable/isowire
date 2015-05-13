var _ = require('lodash');

function API() {
  if (!(this instanceof API)) return new API();
  this.methods = [];
}

API.prototype.method = function(verb, name, fn) {
  if (_.isFunction(name)) {
    fn = name;
    name = verb;
    verb = 'post';
  }

  this.methods.push({
    name: name,
    verb: verb,
    fn: fn
  });
};

module.exports = API;