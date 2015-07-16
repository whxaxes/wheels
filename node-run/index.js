"use strict";

var child_process = require("child_process");
var fs = require("fs");
var path = require("path");

var child;
var node_path_re = /require\((?:'|")[^()"']+(?:'|")\)/g;
var watcherList = {};
var waiting = false;
var isDebug = false;
var delay = 2000;

/**
 * @param baseFile  nodejs文件路径
 * @param dg
 */
module.exports = function(baseFile , dg){
    isDebug = dg;
    baseFile += path.extname(baseFile) ? "" : ".js";
    var filePath = path.resolve(baseFile);

    if(!fs.existsSync(filePath)){
        throw new Error('"' + filePath + '" file is not found');
    }

    spawn(filePath);

    watchFile(filePath);
};

/**
 * debug模式才会输出信息
 * @param msg
 */
function debug(msg){
    if(isDebug){
        console.log('\x1b[36m' + msg + '\x1b[0m');
    }
}

/**
 * 监听filePath的文件
 * @param filePath  文件绝对地址
 */
function watchFile(filePath){
    filePath += path.extname(filePath) ? "" : ".js";

    if(!fs.existsSync(filePath) || watcherList[filePath]) return;

    var watcher = fs.watch(filePath);

    debug("Listen: " + filePath);

    watcher.path = filePath;

    watcherList[filePath] = watcher;

    watcher.on('change' , function(e){
        if(e !== "change") return;

        console.log('\x1b[32m> "' + this.path + '" changed\x1b[0m');

        //如果文件发生改动，则再次检查文件有无添加新的引用
        checkAndAdd(this.path);

        if(waiting) return;

        child.kill('SIGTERM');
    });

    watcher.on('error' , function(e){
        console.log("Watch Error:" + e.message);

        if(this.path in watcherList){
            delete watcherList[this.path];
        }
    });

    checkAndAdd(filePath);
}

/**
 * 检查文件内容中require的模块（除了node_module里的），加入监听
 * @param filePath
 */
function checkAndAdd(filePath){
    var contents = fs.readFileSync(filePath).toString();
    var result = contents.match(node_path_re);

    if(!result) return;

    debug("Checking: " + filePath);

    result.forEach(function(p){
        //截取文件部分
        p = p.substring(9 , p.length-2);

        if (p.indexOf('/') == -1) return;

        p = path.resolve(path.dirname(filePath), p);

        debug("  require:" + p);

        watchFile(p);
    });
}

/**
 * 开启一个子进程执行node程序
 * @param nodePath
 * @returns {*}
 */
function spawn(nodePath){
    child = child_process.spawn("node" , [nodePath]);

    console.log("Server is running");

    child.on("exit" , function (code, sign) {
        if(code !== 0){
            respawn(nodePath);
        }
    });

    child.on('error' , function(err){
        console.log(err);

        respawn(nodePath);
    });

    child.stdout.setEncoding("utf8");
    child.stdout.on('data' , function(data){
        process.stdout.write(data);
    });

    child.stderr.setEncoding("utf8");
    child.stderr.on('data' , function(data){
        process.stdout.write(data);
    });

    return child;
}

/**
 * 重启子进程
 * @param nodePath
 */
function respawn(nodePath){
    if (waiting) return;

    waiting = true;

    console.log("Restart the server after " + delay + "ms ...\r\n");

    setTimeout(function () {
        waiting = false;
        spawn(nodePath);
    }, delay)
}