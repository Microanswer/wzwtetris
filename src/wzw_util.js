function Util() {

    /**
     * 滚动。 此方法并不滚动界面，而是将一个数值变化到另一个数值。
     * @param from 从某个值
     * @param to 到某个值
     * @param back 不停的回调
     * @param dur 动画执行时长，默认 500 毫秒
     */
    this.scroll = function (from, to, back, dur) {
        var y = from;
        y = y || 0;
        var startY = y;

        var distanceY = to - startY;

        if (distanceY === 0) {
            // 没有意义的滚动
            back && back.end && back.end(to);
            return undefined
        }

        var ended = false;
        var time = dur || 500;
        var ftp = 60;

        var ease = function (pos) { // 要使用的缓动公式
            return pos;
        };

        var startTime = Date.now(); // 开始时间
        // 开始执行
        (function dd () {
            setTimeout(function () {
                var now = Date.now(); // 当前帧开始时间
                var timestamp = now - startTime; // 逝去的时间(已进行动画的时间)
                var detal2 = ease(timestamp / time);
                var result2 = Math.ceil(startY + detal2 * distanceY);

                if (!ended) {
                    back && back.goo && back.goo(result2);
                }
                if (time <= timestamp) {
                    ended = true;
                    back.end(to);
                } else {
                    setTimeout(dd, 1000 / ftp);
                }
            }, 1000 / ftp);
        })();
    };

    /*
     打印数组
     * */
    this.printArr = function (arr) {
        var s = "";
        this.each(arr, function (i, arrr) {
            s += (i + ":" + arrr.join(" ")) + "\n";
        });
        console.log(s);
    };

    /**
     * 二维数组拷贝
     * */
    this.arrCopy = function (src) {
        var temp = [];
        for (var i = 0; i < src.length; i++) {
            temp[i] = [];
            for (var j = 0; j < src[j].length; j++) {
                temp[i][j] = src[i][j];
            }
        }
        return temp;
    };

    /**
     * 循环数字
     * @param from 自
     * @param to 到
     * @param fun 每次调用
     */
    this.eachNum = function (from, to, fun) {
        if (from > to) {

            for (var i = from; i >= to; i--) {
                fun && fun(i);
            }

            return;
        }
        for (var i = from; i <= to; i++) {
            fun && fun(i);
        }
    };

    /* 循环数组 */
    this.each = function (arr, fun) {
        for (var i = 0; i < arr.length; i++) {
            fun && fun(i, arr[i]);
        }
    }
}

module.exports = new Util();