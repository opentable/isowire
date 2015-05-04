var Promise = require('es6-promise').Promise;
var FluxibleApp = require('fluxible');

var isowirePlugin = require('../lib/isowirePlugin');

describe('isowirePlugin', function() {
  var testMethodName = "test.method";
  var testParams = {foo: 'foo', bar: 'bar'};

  var app;
  var pluginInstance;
  var context;
  var actionContext;
  var contextModFns;
  var mockAPI;

  beforeEach(function() {
    app = new FluxibleApp();
    pluginInstance = isowirePlugin();
    app.plug(pluginInstance);
    context = app.createContext();
    actionContext = context.getActionContext();
    mockAPI = {
      methods: [
        {
          name: testMethodName,
          verb: "get",
          fn: function(params) {
            return new Promise(function(resolve, reject) {
              resolve(params);
            });
          }
        }
      ]
    };
  });

  it('factory should work', function() {
    pluginInstance.name.should.equal('Isowire');
    pluginInstance.plugContext.should.be.type('function');
  });

  it('should rehydrate / dehyradte', function() {
    var contextPlug = pluginInstance.plugContext();
    var state = {methods: {foo: {name: 'foo', verb: 'get'}}};

    contextPlug.rehydrate(state);

    pluginInstance.getProvider().methods.foo.should.be.ok;

    var dehydrated = contextPlug.dehydrate();

    dehydrated.should.eql(state);
  });

  describe('instance', function() {
    it('instantiates a provider', function() {
      pluginInstance.getProvider().should.be.ok;
    });

    it('can add APIs', function() {
      pluginInstance.add(mockAPI);

      pluginInstance.getProvider().methods[testMethodName].should.be.ok;
    });

    it('can call execMethod on provider', function() {
      pluginInstance.add(mockAPI);

      var result = pluginInstance.execMethod("get", testMethodName, testParams);

      result.should.be.an.instanceOf(Promise);
    });

    it('can return middleware', function() {
      pluginInstance.getMiddleware().should.be.type('function');
    });
  });

  describe('actionContext.api()', function() {
    beforeEach(function() {
      pluginInstance.add(mockAPI);
    });

    it('exposes "api" method', function() {
      actionContext.api.should.be.type('function');
    });

    it('returns a promise', function() {
      var result = actionContext.api("get", testMethodName, testParams);

      result.should.be.an.instanceOf(Promise);
    });

    it('verb argument is optional', function() {
      return actionContext.api(testMethodName, testParams)
        .then(function(result) {
          result.foo.should.equal(testParams.foo);
        });
    });

    it('params argument is optional', function() {
      return actionContext.api('get', testMethodName)
        .then(function(result) {
          result.should.eql({});
        });
    });

    it('params *and* verb arguments are optional', function() {
      return actionContext.api(testMethodName)
        .then(function(result) {
          result.should.eql({});
        });
    });

    it('can use a callback instead of only returning promise', function(done) {
      actionContext.api(testMethodName, testParams, function(err, result) {
        result.foo.should.equal('foo');
        done();
      });
    });
  });

});