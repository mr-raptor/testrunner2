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

module.exports = select;