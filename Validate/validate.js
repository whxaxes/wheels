/**
 * @description: 表单验证组件
 * @author wanghx
 * @dependencies
 */

(function (func) {
    if ("define" in window) {
        define(function (require, exports, module) {
            module.exports = func();
        })
    } else {
        window.Validate = func();
    }
}(function () {
    "use strict";

    function trim(msg) {
        return ('trim' in String.prototype) ? msg.trim() : msg.replace(/^\s+|\s+$/g, '');
    }

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

    //表单验证组件类
    function Validate(options) {
        this.extend(options);
        this.init();
    }

    //进行简易的继承事件类
    Validate.prototype = new EventEmitter();

    var Vp = Validate.prototype;

    //将传入的参数转为对象属性
    Vp.extend = function (t, o) {
        if (arguments.length == 1) {
            o = t;
            t = this;
        }

        for (var k in o) {
            if ((o[k] instanceof RegExp) || typeof o[k] !== "object" || o[k].nodeType) {
                t[k] = o[k];
                continue;
            }

            if (o[k] instanceof Array) {
                t[k] = o[k].slice(0);
                continue;
            }

            this.extend(t[k] = {}, o[k]);
        }
    };

    //兼容IE的事件绑定
    Vp.addEvent = function (ele, ev, func) {
        if (!ele.nodeType || typeof ev !== "string" || !(func instanceof Function))return;

        if ('addEventListener' in ele) {
            ele.addEventListener(ev, function () {
                func.apply(ele, arguments);
            })
        } else {
            ele.attachEvent("on" + ev, function () {
                func.apply(ele, arguments);
            })
        }
    };

    //组件初始化，添加事件绑定
    Vp.init = function () {
        var that = this;
        //如果存在form，则对form的submit方法进行绑定
        if (this.form && this.form.tagName === "FORM") {
            this.action = this.form.action;
            this.method = this.form.method;
            this.form.onsubmit = function () {
                if (that.checkForm && (that.action !== that.form.action || that.method !== that.form.method)) {
                    alert("表单提交参数发生了改变，禁止提交");
                    return false;
                }

                if (!that.checkAll()) return false;
            };
        }

        if (!this.rules) return;

        var ele;
        for (var k in this.rules) {
            ele = dom("#" + k);

            if (!ele.nodeType) continue;

            !function (k) {
                var rule = that.rules[k] || {};
                //当输入框被focus时分发focus事件
                that.addEvent(ele, 'focus', function () {
                    rule.focuing = true;
                    that.emit('focus', this);
                });

                //当输入失去焦点，分发blur，并且传入有无经常格式检查
                that.addEvent(ele, 'blur', function () {
                    rule.focuing = false;
                    var result = that.check(this);
                    that.emit('blur', this, result);
                });

                //当输入框内容改变时pass为false
                that.addEvent(ele, 'change', function () {
                    rule.pass = false;
                });
            }(k);
        }
    };

    //检查所有输入框
    Vp.checkAll = function () {
        for (var k in this.rules) {
            if (!this.check(k)) return false;
        }
        return true;
    };

    /**检查单个输入框
     * @param id   可以为dom对象也可以为dom的id
     * @returns {boolean}   如果为true则通过检查，否则为没有通过
     */
    Vp.check = function (id) {
        var that = this;
        var ele = id.nodeType ? id : dom("#" + id);
        id = id.nodeType ? id.id : id;

        var rule = this.rules[id];
        var mess = this.message[id];
        var value = trim(ele.value);
        var msg;

        if (!rule) return true;

        //如果input已经通过检测，则直接分发检测成功事件
        if(rule.pass){
            this.emit("success", ele);
            return true;
        }

        //检查input是否必须
        if (rule.required && value.length === 0) {
            msg = mess ? (mess.required || "") : "";
            this.emit("error", ele, msg || "不能为空");
            return false;
        }

        //检查value是否短于最小长度
        if (rule.minlength && value.length < rule.minlength) {
            msg = mess ? (mess.minlength || "") : "";
            this.emit("error", ele, msg || "最少" + rule.minlength + "个字符");
            return false;
        }

        //检查value是否超过最大长度
        if (rule.maxlength && value.length > rule.maxlength) {
            msg = mess ? (mess.maxlength || "") : "";
            this.emit("error", ele, msg || "最多" + rule.maxlength + "个字符");
            return false;
        }

        //判断input是否跟需要相等的值相等
        if (rule.equal) {
            var eqdom = dom(rule.equal);

            if (!eqdom.nodeType || value !== eqdom.value) {
                msg = mess ? (mess.equal || "") : "";
                this.emit("error", ele, msg || "两次输入结果不相同");
                return false;
            }
        }

        //检查input的格式
        if (rule.type || rule.reg) {
            var reg;
            //根据type提供五种正则，匹配用户名、密码、邮箱和url，电话(匹配11位手机，和区号-固定电话格式)
            switch (rule.type) {
                case "username":
                    reg = /^[\da-zA-Z_]+$/g;
                    break;
                case "password":
                    reg = /^[\da-zA-Z_.~@!$^#%*&+-]+$/g;
                    break;
                case "email":
                    reg = /^[\da-zA-Z_.\-]+@[\da-zA-Z]+\.[a-zA-Z]{2,4}$/g;
                    break;
                case "url":
                    reg = /^https?\:\/\/[\da-zA-Z.]+(?:\:\d+)?(?:\/[\da-zA-Z_.-]+)+\/?$/g;
                    break;
                case "phone":
                    reg = /^\d{11}|\d{3,4}-\d{7,8}$/g;
                    break;
                default :
                    break;
            }

            //如果用户设置了正则，则使用用户设置的正则
            reg = rule.reg ? rule.reg : reg;

            if (value.length > 0 && (!reg || !(reg instanceof RegExp) || !reg.test(value))) {
                msg = mess ? (mess.formate || "") : "";
                this.emit("error", ele, msg || "格式错误");
                return false;
            }
        }

        //wait用于需要跟后台交互检查的input
        if (rule.wait && (typeof rule.wait === "function")) {
            rule.wait.call(this, function (result, msg) {
                if(value !== ele.value) return;

                if(rule.pass) return;

                rule.pass = !!result;

                if(rule.focuing)return;

                if (result) {
                    that.emit("success", ele);
                } else {
                    that.emit("error", ele, msg || "检查失败");
                }
            });

            return false;
        }

        if (value.length > 0) this.emit("success", ele);

        rule.pass = true;

        return true;
    };

    /**简易选择器
     * @param selector  只能为单个id或class或类名
     * @returns {*}
     */
    function dom(selector) {
        selector = selector.replace(/\s/g, '');

        var symbol = selector.charAt(0);
        if (symbol == "#") {
            return document.getElementById(selector.replace(/#/g, ''))
        } else if (symbol == ".") {
            var collector = [];
            var elements = document.getElementsByTagName("*");
            var classReg = new RegExp('\\b' + selector.replace(/\./g, '') + '\\b', 'g');
            for (var i = 0; i < elements.length; i++) {
                if (classReg.test(elements[i].className)) {
                    collector.push(elements[i])
                }
                classReg.lastIndex = 0;
            }
            return collector;
        } else {
            return document.getElementsByTagName(selector);
        }
    }

    return Validate;
}));