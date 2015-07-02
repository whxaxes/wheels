!function(root){
    var base64Maps = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");

    if(!Array.prototype.indexOf){
        Array.prototype.indexOf = function(ele){
            for(var i=0;i<this.length;i++){
                if(this[i] == ele){
                    return i;
                }
            }
            return -1;
        }
    }

    /**
     * 将字符串编码为base64字符串
     * @param str
     * @returns {string}
     */
    function tobase64(str){
        str = encodeURI(str);

        var baseStr = "";
        var sLength = str.length;

        var special = "00000000";
        for(var i=0;i<sLength;i+=3){
            var k1 = str.charCodeAt(i);
            var k2 = str.charCodeAt(i+1) || special;
            var k3 = str.charCodeAt(i+2) || special;

            var ns = getBitBlob(k1) + getBitBlob(k2) + getBitBlob(k3);

            for(var j=0;j<4;j++){
                var nblobStr = "00" + ns.substring(j*6 , (j+1)*6);
                if (nblobStr == special && sLength-i < 3 && j > (sLength-i)) {
                    baseStr += "=";
                }else {
                    baseStr += base64Maps[parseInt(nblobStr , 2)];
                }
            }
        }

        return baseStr;
    }

    /**
     * 解析base64字符串为普通字符
     * @param str
     * @returns {string}
     */
    function frombase64(str){
        var normalStr = "";
        var sLength = str.length;
        var collector = "";

        for(var i=0;i<sLength;i++){
            var code = str.charAt(i);
            var map = code === "=" ? 0 : base64Maps.indexOf(code);

            if(map === -1){
                throw new Error(code + ":" + i + " is not an base64 string");
            }

            collector += getBitBlob(map , 6);

            if(collector.length>=8){
                normalStr += String.fromCharCode(parseInt(collector.substring(0 , 8) , 2));
                collector = collector.substring(8 , collector.length);
            }
        }

        return decodeURI(normalStr);
    }

    function getBitBlob(n , c){
        c = c || 8;
        n = n.toString("2");

        if(c > n.length){
            while(c - n.length){
                n = '0'+n;
            }
        }else {
            n = n.substring(n.length - c - 1 , n.length);
        }

        return n;
    }

    if(typeof module === "object" && module.exports){
        module.exports = {
            tobase64:tobase64,
            frombase64:frombase64
        }
    }else {
        root.tobase64 = tobase64;
        root.frombase64 = frombase64;
    }
}(this)
