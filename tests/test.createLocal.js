describe('createLocal', function(){
	it('should create the store', function(){
		var MyApp = Bifrost.createLocal({name:"testlocal",key:"testlocalid"});
		MyApp.should.have.property("name");
		MyApp.should.have.property("state");
		MyApp.should.have.property("hasRemote");
		Should(MyApp.hasRemote).be.exactly(false);
	})
})