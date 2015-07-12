var assert = require("assert");
var matrix = require("../matrix");

/**
 * 测试三元一次方程
 */
describe('equation test' , function(){
    it('should equal {x:0.75 , y:-0.25 , z:150}', function () {
        var r = matrix.equation(
            [100 , 100 , 1 , 200],
            [500 , 100 , 1 , 500],
            [100 , 500 , 1 , 100]
        );

        assert.equal(0.75, r.x);
        assert.equal(-0.25, r.y);
        assert.equal(150, r.z);
    });
});
