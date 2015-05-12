var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var getMiddleware = require('../lib/middleware');

describe('middleware()', function() {
  var mockProvider;
  var mockResponse;
  var middleware;
  var execMethodArguments;

  beforeEach(function() {
    execMethodArguments = [];

    mockProvider = {
      xhrPath: '/isowire/',
      methods: {
        "test.method": {
          name: "test.method",
          verb: "get",
          fn: function(params) {
            return new Promise(function(resolve, reject) {
              resolve(params);
            });
          }
        }
      },
      execMethod: function() {
        execMethodArguments = Array.prototype.slice.call(arguments);
        return new Promise(function(resolve, reject) { resolve({}); });
      }
    };

    mockResponse = {
      json: function() {
        return this;
      },
      send: function() {
        return this;
      },
      error: function() {
        return this;
      }
    };

    middleware = getMiddleware(mockProvider);
  });

  it('should return a middleware function that takes 3 arguments', function() {
    middleware.should.be.type('function');
    middleware.length.should.equal(3);
  });

  it('should skip requests that aren’t under xhrPath', function() {
    var nextCalled = false;
    var req = {path: '/not/xhrPath/'};
    var res = mockResponse;
    var next = function() { nextCalled = true; };

    middleware(req, res, next);

    nextCalled.should.be.true;
  });

  it('should 400 to requests for undefined API methods', function() {
    var resStatus;

    var req = {path: mockProvider.xhrPath + 'undefined-method'};
    var res = {
      send: function(body, status) { resStatus = status; }
    };
    var next = function() { console.log("next() was called"); };

    middleware(req, res, next);

    resStatus.should.equal(400);
  });

  it('should call user-defined API method', function() {
    var methodName = 'test.method';
    var req = {path: mockProvider.xhrPath + methodName};
    var res = mockResponse;
    var next = function() { console.log("next() was called"); };

    middleware(req, res, next);

    execMethodArguments[0].should.equal('get');
    execMethodArguments[1].should.equal(methodName);
  });

  it('should pass GET params to API method', function() {
    var methodName = 'test.method';
    var query = {foo: 'foo', bar: 'bar'};
    var req = {path: mockProvider.xhrPath + methodName, query: query};
    var res = mockResponse;
    var next = function() { console.log("next() was called"); };

    middleware(req, res, next);

    execMethodArguments[2].foo.should.equal('foo');
    execMethodArguments[2].bar.should.equal('bar');
  });

});