var _ = require('lodash');
var Provider = require('../lib/Provider');

describe('Provider', function() {

  beforeEach(function() {
  });
  
  it('has default options', function() {
    var provider = new Provider();
    
    provider.options.should.eql(Provider.defaultOptions);
  });
  
  it('overloads default options', function() {
    var options = { methods: { search: { name: 'search', verb: 'post' }}};
    var provider = new Provider(options);
    
    provider.options.should.eql(options);
    provider.methods.should.eql(options.methods);
  });
  
  it('adds a method', function() {
    var provider = new Provider();
    var method = { name: 'search', verb: 'post' };
    
    provider.addMethod(method);
    
    provider.methods.search.should.eql(method);
  });
  
  it('errors adding a method if the method is already defined', function() {
    var provider = new Provider();
    var method = { name: 'search', verb: 'post' };
    
    provider.addMethod(method);
    
    provider.methods.search.should.eql(method);
    (function() {
      provider.addMethod(method);
    }).should.throw("Isowire: The method 'search' is already defined.")
  });
  
  it('adds methods from api', function() {
    var provider = new Provider();
    var api = { methods: {
      search: { name: 'search', verb: 'post' },
      select: { name: 'select', verb: 'post' }
    }};
    
    provider.addAPI(api);
    
    // TODO: huhhhhhh
    _.each(api.methods, function(method) {
      method.should.eql(api.methods[method.name]);
    });
  });
  
  it("errows executing an API method that isn't defined", function() {
    var provider = new Provider();
    
    (function() {
      provider.execMethod('post', 'nope', {});
    }).should.throw("Isowire: the method 'nope' has not been defined.")
  });
  
  it('dehydrates methods', function() {
    var options = { methods: {
      search: { name: 'search', verb: 'post', fn: function() {} },
      select: { name: 'select', verb: 'post', fn: function() {} }
    }};
    var provider = new Provider(options);
    var dehydrated = provider.dehydrate();
    
    _.each(dehydrated.methods, function(method) {
      method.name.should.eql(options.methods[method.name].name);
      method.verb.should.eql(options.methods[method.name].verb);
      (method.fn === undefined).should.be.true;
    });
  });
  
  
  it('rehydrates methods', function() {
    var provider = new Provider();
    var data = { methods: {
      search: { name: 'search', verb: 'post' },
      select: { name: 'select', verb: 'post' }
    }};
    
    provider.rehydrate(data);
    
    _.each(data.methods, function(method) {
      provider.methods[method.name].should.eql(data.methods[method.name]);
    });
  });
  
  
  
});