var _ = require('lodash');
var Promise = require('es6-promise').Promise;

var defaultResponse = {
  status: 200,
  body: {}
};

function createMockIsowirePlugin() {

  function api(method, params) {
    var mock = findMock(api.mocks, method, params);
    
    if (!mock) {
      mock = _.extend({}, defaultResponse);
      console.warn("Nothing mocked for " + method + (params ? ' ' + JSON.stringify(params) : ''));
    }

    return new Promise(function(resolve, reject) {
      if (mock.response.status === 200) resolve(mock.response.body);
      else reject(mock.response.body);
    });
  }

  api.mocks = [];

  api.mock = function(method, params, response) {
    if (typeof method !== 'string') {
      response = params;
      params = method;
      method = undefined;
    }

    if (response == null) {
      response = params;
      params = undefined;
    }

    api.mocks.push({
      method: method,
      params: params,
      response: _.merge({}, defaultResponse, response)
    });
  }

  return api;
}

function findMock(mocks, method, params) {
  var methodAndParams = _.filter(_.filter(mocks, 'method'), 'params');
  var methodOnly = _.reject(_.filter(mocks, 'method'), 'params');
  var catchAll = _.reject(_.reject(mocks, 'method'), 'params');

  var match = _.findWhere(methodAndParams, {method: method, params: params});
  if (match) return match;

  match = _.findWhere(methodOnly, {method: method});
  if (match) return match;

  return catchAll[0];
}

module.exports = {
  createMockIsowirePlugin: createMockIsowirePlugin
};