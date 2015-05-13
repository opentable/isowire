var _ = require('lodash');
var nock = require('nock');

var XHRProvider = require('../lib/XHRProvider');
var Provider = require('../lib/Provider');

describe('XHRProvider', function() {
  
  beforeEach(function() {
  });

  it('has default options', function() {
    var xhrProvider = new XHRProvider();
    var defaults = _.merge({}, Provider.defaultOptions, XHRProvider.defaultOptions);
    
    xhrProvider.options.should.eql(defaults);
  });
  
  it('sets methods using Provider interface', function() {
    var options = { methods: { search: { name: 'search', verb: 'post' }}};
    var xhrProvider = new XHRProvider(options);
    
    xhrProvider.methods.should.eql(options.methods);
  });
  
  it('sets xhrPath', function() {
    var options = { xhrPath: '/foo' };
    var xhrProvider = new XHRProvider(options);
    
    xhrProvider.xhrPath.should.eql(options.xhrPath);
  });
  
  it('execs a method using xhr with the GET verb', function() {
    var xhrProvider = new XHRProvider();
    var name = 'test'
    var path = xhrProvider.xhrPath + name + '?foo=bar';

    var mockRequest = nock('http://localhost').get(path).reply(200);

    var promise = xhrProvider._execMethodBrowser('get', name, {foo: 'bar'}).should.be.fulfilled;

    mockRequest.done();
    
    return promise;
  });
  
  it('execs a method using xhr with the POST verb', function() {
    var xhrProvider = new XHRProvider();
    var name = 'test'
    var path = xhrProvider.xhrPath + name;
    var params = {foo: 'bar'};
    
    var mockRequest = nock('http://localhost').post(path, params).reply(200);
    
    var promise = xhrProvider._execMethodBrowser('post', name, params).should.be.fulfilled;
        
    mockRequest.done();
    
    return promise;
  });
  
});