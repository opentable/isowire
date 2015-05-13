var _ = require('lodash');
var XHRProvider = require('./XHRProvider');
var middleware = require('./middleware');

module.exports = function isowirePlugin(opts) {
  opts = _.merge({provider: XHRProvider}, opts);
  var provider = new opts.provider(opts);

  return {
    name: 'Isowire',
    
    plugContext: function plugContext(contextOptions) {
      // TODO: pass options through to provider

      return {
        plugActionContext: function plugActionContext(actionContext) {
          actionContext.api = function(verb, name, params, cb) {
            if (!_.isString(name)) {
              cb = params;
              params = name;
              name = verb;
              verb = 'post';
            }

            if (_.isFunction(params)) {
              cb = params;
              params = null;
            }

            if (!params) {
              params = {};
            }

            var promise = provider.execMethod(verb, name, params);

            if (_.isFunction(cb)) {
              promise.then(function(results) {
                cb(null, results);
              })['catch'](function(err) {
                cb(err);
              });
            }

            return promise;
          };
        },

        dehydrate: function dehydrate() {
          return provider.dehydrate();
        },

        rehydrate: function rehydrate(data) {
          provider.rehydrate(data);
        }
      };
    },

    add: function() {
      var apis = Array.prototype.slice.call(arguments);
      apis.forEach(function(api) {
        provider.addAPI(api);
      });
    },

    execMethod: function() {
      return provider.execMethod.apply(provider, arguments);
    },

    getProvider: function() {
      return provider;
    },

    getMiddleware: function() {
      return middleware(provider);
    }
  }
};