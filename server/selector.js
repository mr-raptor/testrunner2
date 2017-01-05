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
	/*function browseTree(testTree, callback) {
		if(!testTree)
			return;
		
		if(testTree["test-case"])
			for(test of testTree["test-case"])				
				callback(test);

		if(testTree["test-suite"])
			for(test of testTree["test-suite"])
				browseTree(test, callback);
	}

	function browseParamFixtures(testTree, callback) {
		if(!testTree)
			return;
		
		if(testTree.$["type"] === "ParameterizedFixture")				
			callback(testTree);

		if(testTree["test-suite"])
			for(testsuite of testTree["test-suite"])
				browseParamFixtures(testsuite, callback);
	}*/

	function browseTree(testTree, actions) {
		if(!actions || actions.length === 0)
			return;

		function browse(testTree, actions) {
			if(!testTree)
				return;

			if(testTree.$ && testTree.$.type && actions[testTree.$.type])
				actions[testTree.$.type](testTree);	

			if(testTree["test-suite"])
				for(subTree of testTree["test-suite"])
					browse(subTree, actions);
		}
		browse(testTree, actions);
	}
	
	// summary:
	// searches test by condition in tree
	// stops on first fit
	// params:
	// testTree - source
	// testName - value of field
	// field - name of field
	// callback - action on condition fit
	function searchTest(testTree, field, testName, callback) {
		var done = false;
		
		function browse(testTree) {
			if(!testTree)
				return;

			if(testTree["test-case"])
				for(test of testTree["test-case"])
					if(test.$[field] === testName) {
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

	function searchTests(testTree, field, testName,  callback) {
		function browse(testTree) {
			if(!testTree)
				return;
			
			if(testTree["test-case"]) 
				for(test of testTree["test-case"])
					if(test.$[field] === testName) 
						callback(test);

			if(testTree["test-suite"])
				for(test of testTree["test-suite"])
					browse(test);
		}
		
		browse(testTree);
	}
	
	exports.select = select;
	exports.browseTree = browseTree;
	exports.searchTest = searchTest;
	exports.searchTests = searchTests;
})(typeof exports === 'undefined' ? this['selector']={} : exports);