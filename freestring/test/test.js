var freestring = require("../freestring");

var str = freestring(function(){
    /*
     <ul class="name">
       <li class="id1">${data}</li>
       <li class="id2">${data2.0}</li>
       <li class="id3">${data2[1]}</li>
     </ul>
     */
} , {data:"ss" , data2:[0 , 2 , 3]});

var str2 = freestring(function(){
    /*@preserve
     <ul class="name">
       <li class="id1">${0}</li>
       <li class="id2">${1}</li>
       <li class="id3">${2}</li>
     </ul>
     */
} , ['asd' , '123' , 12344]);

console.log(str);
console.log(str2);