var exists = Bifrost.exists;

describe('Bifrost Utils', function(){

	describe('exists function',function(){

		it('should return false for []', function(){
			Should(exists([])).be.exactly(false);
		});

		it('should return true for [...]', function(){
			Should(exists([1,2,3])).be.exactly(true);
		});

	})

});