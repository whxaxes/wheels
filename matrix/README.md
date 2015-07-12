# matrix

矩阵计算组件<br>

How to Used:

> 传入平行四边形的三个点，变化前与变化后的坐标，即可返回该变换的矩阵
> 坐标格式为{x : 100 , y : 100}
> arg_1为变化前的坐标，_arg_1为arg_1变化后的坐标

```
var result = matrix.getMatrix(arg_1 , _arg_1 , arg_2 , _arg_2 , arg_3 , _arg_3);

ctx.transform(result.a , result.b , result.c , result.d , result.e , result.f);
```

[demo](http://whxaxes.github.io/canvas-test/src/Funny-demo/transform/demo1.html)

[demo源代码](https://github.com/whxaxes/canvas-test/tree/gh-pages/src/Funny-demo/transform)