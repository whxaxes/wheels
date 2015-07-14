var bs = require("../tobase64");

var testString = "asadsasdasdahttp://www.cnblogs.com/nano/archive/2013/05/27/3101348.htmldasdd";

console.log(bs.tobase64(testString))
console.log((new Buffer(testString)).toString("base64"))