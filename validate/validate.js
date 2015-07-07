/**
 * @description: 表单验证组件
 * @author wanghx
 * @dependencies
 */

(function (func) {
    if ("define" in window && define.cmd) {
        define(function (require, exports, module) {
            module.exports = func();
        })
    } else {
        window.Validate = func();
    }
}(function () {
    "use strict";

    //各种type对应的正则
    var typeReDict = {
        'username' : /^[\da-zA-Z_]+$/g,
        'password' : /^[\da-zA-Z_.~@!$^#%*&+-]+$/g,
        'email'    : /^[\da-zA-Z_.\-]+@[\da-zA-Z]+\.[a-zA-Z]{2,4}$/g,
        'url'      : /^https?\:\/\/[\da-zA-Z.]+(?:\:\d+)?(?:\/[\da-zA-Z_.-]+)+\/?$/g,
        'phone'    : /^\d{11}|\d{3,4}-\d{7,8}$/g
    };
    function trim(msg) {
        return ('trim' in String.prototype) ? msg.trim() : msg.replace(/^\s+|\s+$/g, '');
    }
    var slice = Array.prototype.slice;

    /**
     * 事件绑定发射器
     * @constructor
     */
    function EventEmitter() {
        this.eventList = {};
    }
    var Ep = EventEmitter.prototype;

    /**
     * 绑定事件
     * @param name
     * @param func
     * @returns {boolean}
     */
    Ep.on = function(name, func) {
        if (!(func instanceof Function)) return;
        this.eventList[name] = this.eventList[name] || [];
        this.eventList[name].push(func);
        return true;
    };

    /**
     * 解绑事件
     * @param name
     * @param func
     */
    Ep.off = function(name, func) {
        if (!(func instanceof Function)) return;
        name = name + "";
        var funcs;

        if (!(funcs = this.eventList[name])) return;

        for (var i = 0; i < funcs.length; i++) {
            if (func == funcs[i]) {
                funcs.splice(i, 1);
                break;
            }
        }
    };

    /**
     * 分发事件
     * @param name  事件名
     */
    Ep.emit = function(name) {
        name = name + "";
        var funcs;

        if (!(funcs = this.eventList[name])) return;

        for (var i = 0; i < funcs.length; i++) {
            funcs[i].apply(this, slice.call(arguments, 1, arguments.length));
        }
    };

    /**
     * 表单验证组件类
     * @param options
     * @constructor
     */
    function Validate(options) {
        this.extend(options);
        this.init();
    }

    //进行简易的继承事件类
    Validate.prototype = new EventEmitter();

    var Vp = Validate.prototype;

    /**
     * 将传入的参数转为对象属性
     * @param t
     * @param o
     */
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

    /**
     * 兼容IE的事件绑定
     * @param ele
     * @param ev
     * @param func
     */
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

    /**
     * 组件初始化，添加事件绑定
     */
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
                    that.emit('focus', this);
                });

                //当输入失去焦点，分发blur，并且传入有无经常格式检查
                that.addEvent(ele, 'blur', function () {
                    var result = that.check(this);
                    that.emit('blur', this, result);
                });

                //当输入框内容改变时pass为false
                that.addEvent(ele, 'change', function () {
                    rule.pass = false;
                    that.emit('change', this);
                });
            }(k);
        }
    };

    /**
     * 检查所有输入框
     * @returns {boolean}
     */
    Vp.checkAll = function () {
        var isPass = true;
        for (var k in this.rules) {
            if (!this.check(k)){
                isPass = false;
            }
        }
        return isPass;
    };

    /**
     * 检查单个输入框
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
        var valueIsChange = rule.recordValue !== value;    //当前内容是否有更改
        var msg;

        //每次检查都记录输入框的输入内容
        rule.recordValue = value;

        //如果不存在相应的数据，直接返回true
        if (!rule) return true;

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
            var eqdom = (typeof rule.equal === "string") ? dom(rule.equal) : rule.equal;

            if (!eqdom.nodeType || value !== eqdom.value) {
                msg = mess ? (mess.equal || "") : "";
                this.emit("error", ele, msg || "两次输入结果不相同");
                return false;
            }
        }

        //判断input是否跟目标输入框的值不相等
        if (rule.notequal) {
            var neqdom = (typeof rule.notequal === "string") ? dom(rule.notequal) : rule.notequal;

            if (!neqdom.nodeType || value === neqdom.value) {
                msg = mess ? (mess.notequal || "") : "";
                this.emit("error", ele, msg || "两次输入结果不能相同");
                return false;
            }
        }

        //检查input的格式
        if (rule.type || rule.reg) {
            //如果用户设置了正则，则使用用户设置的正则
            var reg = rule.reg || typeReDict[rule.type];

            if(value.length && reg instanceof RegExp){
                if(!reg.test(value)){
                    msg = mess ? (mess.formate || "") : "";
                    this.emit("error", ele, msg || "格式错误");
                    return false;
                }

                reg.lastIndex = 0;
            }
        }

        //wait用于需要跟后台交互检查的input
        if (rule.wait && (typeof rule.wait === "function")) {

            //如果input内容尚未发生改变，则不进行ajax请求，如果上一次请求中成功，则直接分发检测成功事件，否则分发检测失败事件
            if(!valueIsChange){
                if(rule.pass){
                    this.emit("success", ele);
                }else {
                    this.emit("error", ele, mess.wait);
                }

                return rule.pass;
            }

            //如果输入框内容由改变，则执行异步
            rule.wait.call(this, ele, function (result, msg) {
                if(value !== ele.value) return;

                rule.pass = !!result;

                if (result) {
                    that.emit("success", ele);
                } else {
                    mess.wait = msg || mess.wait || "检查失败";
                    that.emit("error", ele, mess.wait);
                }
            });

            return false;
        }

        if (value.length > 0) this.emit("success", ele);

        rule.pass = true;

        return true;
    };

    /**
     * 简易选择器
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