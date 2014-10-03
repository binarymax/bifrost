describe('Bifrost Utils', function(){

	describe('exists function',function(){

		var exists = Bifrost.exists;

		it('should return false for []', function(){
			Should(exists([])).be.exactly(false);
		});

		it('should return true for [...]', function(){
			Should(exists([1,2,3])).be.exactly(true);
		});

		it('should return false for {}', function(){
			Should(exists({})).be.exactly(false);
		});

		it('should return true for {...}', function(){
			Should(exists({a:1,b:2})).be.exactly(true);
		});

		it('should return false for ""', function(){
			Should(exists("")).be.exactly(false);
		});

		it('should return true for "..."', function(){
			Should(exists("Odin's beard!")).be.exactly(true);
		});

		it('should return false for 0', function(){
			Should(exists(0)).be.exactly(false);
		});

		it('should return true for n!=0', function(){
			Should(exists(505)).be.exactly(true);
			Should(exists(-35)).be.exactly(true);
		});

		it('should return false for null', function(){
			Should(exists(null)).be.exactly(false);
		});

		it('should return false for undefined', function(){
			Should(exists(undefined)).be.exactly(false);
		});		

	});

	describe('exists function',function(){

		var buildquery = Bifrost.buildquery;

		it('should return ?a=1&b=2&c=3 for {a:1,b:2,c:3}', function(){
			var qs = buildquery({a:1,b:2,c:3});
			Should(qs).be.exactly("?a=1&b=2&c=3");
		});

	});

});