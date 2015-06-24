!function(fn){
	if('define' in window){
		define(function(require, exports, module){
			module.exports = fn;
		})
	}else {
		window.freestring = fn;
	}
}(function(fn){
	if(typeof fn !== "function") return "";

	var re = /\/\*(?:\r\n|\n)?([\s\S]*?)(?:\r\n|\n)?\*\//g;

	return re.test(fn.toString()) ? RegExp.$1 : "";
});