(function(exports) {
	// summary:
	// runs around obj by DFS algorithm and compares to condition function
	// params:
	// obj - complex object from what result should be selected
	// result - array for result elements
	// key - key for child elements collection
	// condition - function, which check current object and returns boolean
	function select(obj, result, key, condition) {
		if(obj && condition(obj)) {
			result.push(obj);
		}
		
		if(obj && obj[key]) {
			for(node of obj[key]) {
				select(node, result, key, condition);
			}
		}
	}


	// for each test in testTree do callback
	function browseTree(testTree, callback) {
		if(!testTree)
			return;
		
		if(testTree["test-case"])
			for(test of testTree["test-case"])				
				callback(test);

		if(testTree["test-suite"])
			for(test of testTree["test-suite"])
				browseTree(test, callback);
	}
	
	// summary:
	// searches test by condition in tree
	// stops on first fit
	// params:
	// testTree - source
	// testName - value of field
	// field - name of field
	// callback - action on condition fit
	function searchTest(testTree, testName, field, callback) {
		var done = false;
		
		function browse(testTree) {
			if(!testTree)
				return;
			
			if(testTree["test-case"])
				for(test of testTree["test-case"])
					if(test["$"][field] === testName) {
						callback(test);
						done = true;
						break;
					}

			if(!done && testTree["test-suite"])
				for(test of testTree["test-suite"])
					browse(test);
		}
		
		browse(testTree);
	}
	
	exports.select = select;
	exports.browseTree = browseTree;
	exports.searchTest = searchTest;
})(typeof exports === 'undefined' ? this['selector']={} : exports);