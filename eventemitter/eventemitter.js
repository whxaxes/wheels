(function(func) {
    if ("define" in window) {
        define(function(require, exports, module) {
            module.exports = func();
        })
    } else {
        window.EventEmitter = func();
    }
}(function() {
    "use strict";

    var slice = Array.prototype.slice;

    //事件绑定发射器
    function EventEmitter() {
        this.eventList = {};
    }

    var Ep = EventEmitter.prototype;

    //绑定事件
    Ep.addListener = Ep.on = function(name, func) {
        if (!(func instanceof Function)) return;

        name = name + "";

        this.eventList[name] = this.eventList[name] || [];
        this.eventList[name].push({
            method: func
        });

        return true;
    };

    //只执行一次的绑定
    Ep.once = function(name, func) {
        if (this.on(name, func)) {
            var ev = this.eventList[name];
            ev[ev.length - 1].once = true;
        }
    };

    //解绑事件
    Ep.removeListener = Ep.unon = function(name, func, index) {
        if (!(func instanceof Function)) return;
        name = name + "";
        var funcs;

        if (!(funcs = this.eventList[name])) return;

        for (var i = 0; i < funcs.length; i++) {
            if (func == funcs[i].method) {
                funcs.splice(i, 1);
                break;
            }
        }
    };

    //删除所有lintener
    Ep.removeAllListener = function(name){
        if(!name){
            this.eventList = {}
        }else {
            name = name + "";

            if(this.eventList[name]) delete this.eventList[name]
        }
    }

    //分发事件
    Ep.emit = function(name) {
        name = name + "";
        var funcs;

        if (!(funcs = this.eventList[name])) return;

        for (var i = 0; i < funcs.length; i++) {
            funcs[i].method.apply(this, slice.call(arguments, 1, arguments.length));
            
            if (funcs[i].once) {
                funcs.splice(i , 1);
                i--;
            }
        }
    };

    return EventEmitter;
}));