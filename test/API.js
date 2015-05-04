describe('API', function() {
  var API = require('../lib/Api');

  beforeEach(function() {
  });
  
  it('initializes with an empty instance', function() {
    var api = API();
    
    api.should.be.an.instanceof(API);
    api.methods.should.be.empty;
  });
  
  it('builds methods', function() {
    var api = API();
    var verb = 'post';
    var name = 'test.foo';
    var fn = function() {};
    
    api.method(verb, name, fn);
    
    api.methods.should.have.lengthOf(1);
    api.methods[0].verb.should.equal(verb);
    api.methods[0].name.should.equal(name);
    api.methods[0].fn.should.equal(fn);
  });
  
  it('builds methods with a default verb of "get"', function() {
    var api = API();
    var name = 'test.foo';
    var fn = function() {};
    
    api.method(name, fn);
    
    api.methods.should.have.lengthOf(1);
    api.methods[0].verb.should.eql('get');
    api.methods[0].name.should.equal(name);
    api.methods[0].fn.should.equal(fn);
  });
  
});