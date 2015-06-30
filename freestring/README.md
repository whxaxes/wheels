# freestring
##### 自由书写string 轮子

无意中看到了sindresorhus的[multiline](https://github.com/sindresorhus/multiline)，觉得很实用，逻辑很简单，所以就自己加了点东西造了个轮子；除了multiline的写法外，加了一个简单的模板变量功能。<br>

freestring就是用于模拟ES6的`template string`，让书写string更自由。可以直接复制一段html保持原来的格式粘贴使用，而不需要用js拼接，还可以使用简单的模板变量。<br>

如果需要复杂的模板变量，那就引入`ejs`或者`mustache`吧，直接使用最简单的用法把html转成字符，再通过ejs.render渲染<br>

## How To Use
`nodejs : npm install freestring`<br>
`browser : <script src="freestring">  or  use seajs : require("freestring")`

 最简单用法
```
var str = freestring(function(){
	/*
           <ul class="name">
               <li class="id1"></li>
               <li class="id2"></li>
               <li class="id3"></li>
           </ul>
	*/
})
```

可以添加参数
```
var str = freestring(function(){
	/*
           <ul class="name">
               <li class="id1">${data}</li>
               <li class="id1">${yo.hllo}</li>
               <li class="id2">${data2.0}</li>
               <li class="id3">${data2[1]}</li>
           </ul>
	*/
} , {data:"ss" , yo : {hllo : 'asd'}, data2:[0 , 2 , 3]});
```
或者
```
var str = freestring(function(){
    /*
         <ul class="name">
             <li class="id1">${0}</li>
             <li class="id2">${1}</li>
             <li class="id3">${2}</li>
         </ul>
     */
} , ['asd' , '123' , 12344]);
```
在浏览器使用时，如果使用uglify压缩代码会将注释删除，导致代码失效。<br>
解决办法：<br>
1、添加`@preserve`，同时要在方法体里加点内容，才不会被当成空函数<br>
2、设置uglify的压缩参数：`preserveComments:'some'`，即可保留`@preserve`的注释
```
var str = freestring(function(){
    /*@preserve
         <ul class="name"></ul>
     */console.log
} , ['asd' , '123' , 12344]);
```
