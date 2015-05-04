var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var isPromise = require('is-promise');
var isNode = require('detect-node');

function Provider(opts) {
  this.options = _.merge({}, Provider.defaultOptions, opts);
  this.methods = this.options.methods;
  this.env = isNode ? 'node' : 'browser';
}

Provider.defaultOptions = {
  methods: {}
};

_.extend(Provider.prototype, {
  addMethod: function addMethod(method) {
    if (method.name in this.methods) {
      throw new Error("Isowire: The method '" + method.name + "' is already defined.");
    }
    this.methods[method.name] = method;
  },

  addAPI: function addAPI(api) {
    _.each(api.methods, function(method) {
      this.addMethod(method);
    }, this);
  },

  execMethod: function execMethod(verb, name, params) {
    if (!(name in this.methods)) {
      throw new Error("Isowire: the method '" + name + "' has not been defined.");
    }

    if (isNode) return this._execMethodNode(verb, name, params);
    else return this._execMethodBrowser(verb, name, params);
  },

  _execMethodNode: function _execMethodNode(verb, name, params) {
    var self = this;
    return new Promise(function(resolve, reject) {
      var method = self.methods[name];
      var result = method.fn(params, function(err, res) {
        if (err) reject(err);
        else resolve(res);
      });
      if (isPromise(result)) {
        result.then(resolve, reject);
      }
    });
  },

  _execMethodBrowser: function _execMethodBrowser(verb, name, params) {
    // NOOP
  },

  dehydrate: function dehydrate() {
    var sanitized = {};
    for (var name in this.methods) {
      sanitized[name] = {
        name: name,
        verb: this.methods[name].verb
      };
    }
    return {methods: sanitized};
  },

  rehydrate: function rehydrate(data) {
    // TODO: more to do here in the future
    _.each(data.methods, function(method) {
      this.addMethod(method);
    }, this);
  }
});

module.exports = Provider;