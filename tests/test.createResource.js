describe('createResource', function(){
	it('should create the store', function(){
		var MyApp = Bifrost.createResource({host:"http://localhost/",name:"testresource",key:"testresourceid"});
		MyApp.should.have.property("name");
		MyApp.should.have.property("state");
		MyApp.should.have.property("hasRemote");
		Should(MyApp.hasRemote).be.exactly(true);
	})
})