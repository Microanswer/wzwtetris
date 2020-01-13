let STUFS                      = require("./wzw_stufs");
let {LEVELS, SCORE_LEVELS}     = require("./wzw_levels");
let Util                       = require("./wzw_util");

/**
 * 高仿王中王游戏机烈面的俄罗斯方块游戏。
 *
 * 具备功能：
 * 1、左移方块
 * 2、右移方块
 * 3、快速下降。[1]支持直接下降到底，[2]支持下降到一定距离手动停止快速下降。
 * 4、下降素材变型
 * 5、防止溢出。素材不会被移动或变型到屏幕外。
 * 6、防止重叠。素材不会被或变型到已堆砌的素材上。
 * 7、成功行消减动画。
 * 8、游戏结束、重置动画。
 * 9、本地最高分记录。
 *
 * created: Microanswer
 * home page: https://www.microanswer.cn
 * updated: 2020年1月13日09:24:34
 */
window.WzwTetirs = function (domId, option) {

    option = option || {};

    /* 默认使用内部的键盘操作逻辑 */
    if (!option.hasOwnProperty("useInnerKeyBoardEvent")) {
        option.useInnerKeyBoardEvent = true;
    }

    /* 急速模式的时间间隔 */
    var TURBO_TIME_SPACE = 5;

    /* 材料每次开始下落时将使用此数字从左到右指定点阵个数的偏移量向下掉落 */
    var STUFF_START_X_OFFSET = 3;
    var STUFF_START_Y_OFFSET = -3;

    var gameWidth       = option.gameWidth         || 320;       /* 游戏视窗宽度 */
    var gameHeight      = option.gameHeight        || 430;       /* 游戏视窗高度 */
    var gameDom         = null;                                  /* 游戏dom容器 */
    var gameCanvas      = null;                                  /* 游戏画板 */
    var splitPosition   = option.splitPosition     || 222;       /* 左边面板和右边面板的分割点，数值以从左到右计算。 */
    var drawColor1      = option.drawColor1        || '#010700'; /* 画笔浓颜色 */
    var drawColor2      = option.drawColor2        || '#ccebce'; /* 画笔浅颜色 */
    var bgColor         = option.bgColor           || '#dbffdd'; /* 背景颜色 */
    var lineWidth       = option. lineWidth        || 1;         /* 画笔粗细 */
    var fontSize        = option. fontSize         || 17;        /* 文字大小 */
    var fontSpace       = option. fontSpace        || 17;        /* 文字行间距 */

    var atomwidthCount  = option. atomwidthCount   || 10;        /* 游戏区域，横向的点阵个数 */
    var atomheightCount = option. atomheightCount  || 20;        /* 游戏区域，竖向的点阵个数 */
    var atomWidth       = null;                                  /* 单个点阵宽度 */
    var atomHeight      = null;                                  /* 单个点阵高度 */
    var atomSpace       = option. atomSpace        || 5;         /* 点阵间隙大小 */
    var atomBorder      = option. atomBorder       || 3;         /* 点阵外轮廓粗细 */
    var atomInset       = option. atomInset        || 1;         /* 点阵中间的间隙大小 */

    var currStuff       = null;                           /* 当前正在下落的材料 */
    var stuffOffsetX    = STUFF_START_X_OFFSET;           /* 材料每次开始下落时将使用此数字从左到右指定点阵个数的偏移量向下掉落 */
    var stuffOffsetY    = STUFF_START_Y_OFFSET;           /* 材料每次开始下落时将使用此数字从上到下指定某个点阵数偏移量向下掉落 */
    var nextStuff       = null;                           /* 下一个要降落的材料方块 */
    var gameAtoms       = null;                           /* array。整个游戏操作面板，本质上是在操作此数组。 */
    var staticStuffs    = null;                           /* array。已被确认堆砌的材料将在这个数组里保存。*/

    var resetAtoms      = null;                           /* array。重置动画将使用此变量保存所有点阵信息 */
    var turbo           = false;                          /* 为true则是急速模式，此模式下材料下降很快 */
    var succAniming     = false;                          /* 当有成功的行在进行消除动画时，此字段将为true，通过此字段控制正在消除动画时是否降落新材料。 */
    var gameover        = true;                           /* 标记游戏是否结束 */
    var pause           = false;                          /* 标记是否暂停*/

    var bestscore       = 0;                              /* 最佳成绩·本地保存 */
    var score           = 0;                              /* 游戏成绩 */
    var level           = 0;                              /* 当前游戏等级 */
    var onKeyDownEventHander = {                          /* 键盘按键按下事件及对应处理方法。 */
        "87": function () {rotateStuff();},
        "38": function () {rotateStuff();},
        "83": function () {turboModeON();},
        "40": function () {turboModeON();},
        "65": function () {left();},
        "37": function () {left();},
        "68": function () {right();},
        "39": function () {right();},
        "32": function () {rotateStuff();},
    };
    var onKeyUpEventHander = {                            /* 键盘抬起事件及对应处理方法 */
        "83": function () {turboModeOFF();},
        "40": function () {turboModeOFF();}
    };

    /* 初始化游戏根容器方法 */
    function initGameDom (domId) {
        var gameDom = document.querySelector("#" + domId);
        gameDom.style.width = gameWidth + "px";
        gameDom.style.height = gameHeight + "px";
        gameDom.style.border = "1px solid gray";
        gameDom.style.backgroundColor = bgColor;

        return gameDom;
    }

    /* 初始化画板 */
    function initGameCanvas (gameDom) {
        var canvasDom = document.createElement("canvas");
        canvasDom.width = gameWidth;
        canvasDom.height = gameHeight;
        gameDom.appendChild(canvasDom);

        var canvas    = canvasDom.getContext("2d");
        canvas.width  = gameWidth;
        canvas.height = gameHeight;
        canvas.canvas.width  = gameWidth;
        canvas.canvas.height = gameHeight;


        return canvas;
    }

    /* 初始化一些游戏逻辑参数值 */
    function initLogic () {
        /* 根据 splitPosition 计算出点阵大小数值 */
        var gameAreaWidth = splitPosition - lineWidth;
        gameAreaWidth     = gameAreaWidth - (atomSpace * (atomwidthCount + 1));
        atomWidth         = gameAreaWidth / atomwidthCount;

        var gameAreaHeight = gameHeight;
        gameAreaHeight     = gameAreaHeight - (atomSpace * (atomheightCount + 1));
        atomHeight         = gameAreaHeight / atomheightCount;

        /* 最高成绩 */
        bestscore = window.localStorage && window.localStorage.getItem("bestscore") || 0;
    }

    /* 初始化事件：点击、键盘事件 */
    function initEvent () {
        if (!option.useInnerKeyBoardEvent) {
            return;
        }

        document.onkeydown = function (ev) {
            var f = onKeyDownEventHander[String(ev.keyCode)];
            if (f) {
                ev.stopPropagation();
                f();
            }
        };
        document.onkeyup = function (ev) {
            var f = onKeyUpEventHander[String(ev.keyCode)];
            if (f) {
                ev.stopPropagation();
                f();
            }
        };
    }

    /* 此方法将随机产生一个用于游戏的堆砌材料 */
    function randomStuff () {
        var index = Math.floor(Math.random() * STUFS.length);
        return [].concat(STUFS[index]);
    }

    /* 此方法将执行一次"重置动画效果"。效果就是从下到上渲染点阵，然后从上到下撤销渲染点阵。 */
    /* cb 当从下到上渲染完成了所有的点阵后，执行。这时候正是满屏都是点阵，看不到任何其他操作，所以 */
    /* 很方便在此时进行一些新任务的初始化。 */
    function resetAnim (cb) {
        Util.scroll(atomheightCount, 0, {
            goo: function (val) {
                val = (val > atomheightCount - 1) ? atomheightCount - 1 : val;
                if (!resetAtoms) {resetAtoms = new Array(atomheightCount);}
                Util.eachNum(val, atomheightCount - 1, function (row) {
                    resetAtoms[row] = [];
                    Util.eachNum(0, atomwidthCount - 1, function (num) {
                        resetAtoms[row][num] = 1;
                    });
                });
            },
            end: function (end) {
                Util.eachNum(0, atomheightCount - 1, function (row) {
                    resetAtoms[row] = [];
                    Util.eachNum(0, atomwidthCount - 1, function (num) {
                        resetAtoms[row][num] = 1;
                    });
                });
                cb && cb();

                setTimeout(function () {
                    Util.scroll(0, atomheightCount - 1, {
                        goo: function (val) {
                            val = (val > atomheightCount - 1) ? atomheightCount - 1 : val;

                            Util.eachNum(0, val, function (row) {
                                resetAtoms[row] = undefined;
                            });
                        },
                        end: function (end) {
                            resetAtoms = null;
                        }
                    });
                }, 100);
            }
        })
    }

    /* 重置游戏 */
    function _resetGame () {
        gameover     = true;
        gameAtoms    = null;
        staticStuffs = null;
        currStuff    = null;
        nextStuff    = null;
        succAniming  = false;
        turbo        = false;
        score        = 0;
        level        = 0;
        stuffOffsetX = STUFF_START_X_OFFSET;
        stuffOffsetY = STUFF_START_Y_OFFSET;
    }

    /* 移动当前正在掉落的材料。 count 为移动几格，负数则是左移 */
    function _moveCurrStuff (count) {
        if (gameAtoms && currStuff && staticStuffs) {
            var targetOffsetX = stuffOffsetX + count;

            for (var i = 0; i < currStuff.length; i++) {
                for (var j = 0; j < currStuff[i].length; j++) {
                    if (currStuff[i][j] === 1) {
                        if (targetOffsetX + j < 0) {
                            /* 传入的目标位数会导致移动到屏幕左边的外面。则强制让其在屏幕内。 */
                            targetOffsetX = -j;
                        } else if (targetOffsetX + j > atomwidthCount - 1) {
                            /* 传入的目标位数会导致移动到屏幕右边的外面。则强制让其在屏幕内。 */
                            targetOffsetX = atomwidthCount - j - 1;
                        }

                        /* 材料还没完全下降到屏幕内 */
                        if (stuffOffsetY + i < 0) continue;

                        /* 判断新位置上是否有材料了，有就不能进行移动 */
                        if (staticStuffs[stuffOffsetY + i][targetOffsetX + j] === 1) {
                            return;
                        }
                    }
                }
            }


            for (i = 0; i < staticStuffs.length; i++) {
                for (j = 0; j < staticStuffs[j].length; j++) {
                    gameAtoms[i][j] = staticStuffs[i][j];
                }
            }

            // 根据新的 offset ，进行对 gameAtoms 整列重新赋值。
            for (i = 0; i < currStuff.length; i++) {
                for (j = 0; j < currStuff[i].length; j++) {
                    if (stuffOffsetY + i < 0 || targetOffsetX + j < 0 || stuffOffsetY + i >= atomheightCount) {
                        continue;
                    }

                    if (
                        gameAtoms[stuffOffsetY + i][targetOffsetX + j] === 0 &&
                        currStuff[i][j] === 1
                    ) {
                        gameAtoms[stuffOffsetY + i][targetOffsetX + j] = currStuff[i][j];
                    }
                }
            }

            stuffOffsetX = targetOffsetX;
        }
    }

    /*检查堆砌成功的行，并进行消除*/
    function checkSuccessLine() {

        var successLine = [];

        for (var i = 0; i < staticStuffs.length; i++) {

            var isSuccess = true;
            for (var j = 0; j < staticStuffs[i].length; j++) {
                if (staticStuffs[i][j] !== 1){
                    isSuccess = false;
                    break;
                }
            }


            /* 成功一行就+1分*/
            if (isSuccess) {
                succAniming = true;
                score += 1;
                successLine.push(i);

                /*提升等级*/
                var newLevel = SCORE_LEVELS[String(score)];
                if (newLevel > level) {
                    level = newLevel;
                }
            }
        }


        var ended = false;
        var onAnimEnd = function () {
            if (ended) {
                return;
            }
            ended = true;

            setTimeout(function () {
                /*动画完成后重整数组，将消除的行上面的依次向下整理*/
                while (successLine.length > 0) {
                    var rowm = successLine.shift();
                    Util.eachNum(rowm, 1, function (row) {
                        var lastRow = row - 1;

                        if (lastRow === 0) {
                            staticStuffs[row] = [];
                            Util.eachNum(0, atomwidthCount - 1, function (num) {
                                staticStuffs[row][num] = 0;
                            });

                        } else {
                            staticStuffs[row] = [].concat(staticStuffs[lastRow]);
                        }
                    });
                }
                succAniming = false;
                gameAtoms = Util.arrCopy(staticStuffs);
            }, 50);
        };

        /* 在数组里将消除的行全部置为0，通过此操作使得界面上的行有个从左到右消减的动画 */
        Util.each(successLine, function (index, value) {
            Util.scroll(0, gameAtoms[value].length - 1, {
                goo: function (process) {
                    var l = gameAtoms[value].length;
                    /*scroll方法有bug吗，process应该在to范围内啊，但是出现了超过to的现象，所以这里判断一下*/
                    process = process >= l ? l : process;
                    for (var j = 0; j < process; j++) {
                        gameAtoms[value][j] = 0;
                    }
                },
                end: function (end) {
                    for (var j = 0; j < gameAtoms[value].length; j++) {
                        gameAtoms[value][j] = 0;
                    }

                    /* 将消除的行剩下的重整 */
                    onAnimEnd();
                }
            }, 200);
        });
    }

    /* 将 currStuff 材料通过指定的横向偏移量 stuffOffsetX 进行融合，并将 stuffOffsetY 下降1格。*/
    /* 如果 currStuff 材料已经到达了 gameAtoms 底部或已有材料的底部将返回 1， 检查游戏结束将返回 -1，其他的放回0表示正常 */
    function _GameArrMerge (stuffOffsetX, mStuffOffsetY, currStuff, mGameAtoms, mStaticStuffs) {

        var grounded = false;

        w:for (var i = currStuff.length - 1; i >= 0 ; i--) {
            for (var j = currStuff[i].length - 1; j >= 0; j--) {
                if (currStuff[i][j] !== 1) continue;
                /* 判断此元素下降一格后是否触底 */


                var c_stuffOffsetY = mStuffOffsetY + i;
                if (c_stuffOffsetY < 0) continue;

                var c_stuffOffsetX = stuffOffsetX + j;
                if (c_stuffOffsetX < 0) continue;

                /* 素材达到最低边， 或素材下一个位置有已确认的素材，则认为到底了。 */
                if (c_stuffOffsetY === atomheightCount - 1 || mStaticStuffs[c_stuffOffsetY + 1][c_stuffOffsetX] === 1) {
                    grounded = true;
                }

                /* 素材本身出现的位置都已经是頂部了，这绝逼是玩家玩到顶了。 */
                if (c_stuffOffsetY <= 0 && grounded) {
                    /* 游戏结束 */
                    return -1;
                }

                if (grounded) {
                    break w;
                }
            }
        }

        /* 将 currStuff 融合到 mGameAtoms 里面 */
        if (!grounded) {
            mStuffOffsetY = stuffOffsetY = mStuffOffsetY + 1;

            mGameAtoms = gameAtoms = Util.arrCopy(mStaticStuffs);

            for (i = 0; i < currStuff.length; i++) {
                for (j = 0; j < currStuff[i].length; j++) {
                    if (mStuffOffsetY + i < 0 || stuffOffsetX + j < 0 || mStuffOffsetY + i >= atomheightCount) {
                        continue;
                    }

                    if (
                        mGameAtoms[mStuffOffsetY + i][stuffOffsetX + j] === 0 &&
                        currStuff[i][j] === 1
                    ) {
                        mGameAtoms[mStuffOffsetY + i][stuffOffsetX + j] = currStuff[i][j];
                    }
                }
            }
        }

        /* 如果触底了，则将 mGameAtoms 保存一份为 mStaticStuffs */
        if (grounded) {
            staticStuffs = Util.arrCopy(mGameAtoms);
        }


        return grounded ? 1 : 0;
    }

    /* x 所有点阵起始计算横坐标点 */
    /* y 所有点阵起始计算竖坐标点 */
    /* 绘制一个点阵，通过 2 个下标确定绘制具体哪一个点阵 */
    /* 下标的数值规则是：从左上角到右上交 widthIndex 1~10 */
    /* 从左上角到左下交 heightIndex 1~20 */
    /* c 绘制颜色 */
    function renderAtom (startX, startY, widthIndex, heightIndex, ctx, c) {
        var x = startX + (widthIndex * (atomSpace + atomWidth)) - atomWidth;
        var y = startY + (heightIndex * (atomSpace + atomHeight)) - atomHeight;

        var osc = ctx.strokeStyle;
        var osw = ctx.lineWidth;
        var ofc = ctx.fillStyle;
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.lineWidth = atomBorder;
        ctx.beginPath();
        ctx.rect(x, y, atomWidth, atomHeight);
        ctx.stroke();

        ctx.fillRect(
            x + atomBorder + atomInset,
            y+atomBorder+atomInset,
            atomWidth-(2*atomBorder)-(2*atomInset),
            atomHeight-(2*atomBorder)-(2*atomInset)
        );

        ctx.strokeStyle = osc;
        ctx.lineWidth = osw;
        ctx.fillStyle = ofc;
    }

    /* 绘制左边游戏面板 */
    function renderLeft (ctx) {
        /* 先绘制点阵背景 */
        for (var i = 1; i <= atomwidthCount; i++) {
            for (var j = 1; j <= atomheightCount; j++) {
                renderAtom(0, 0, i,j, ctx, drawColor2);
            }
        }

        /* 绘制游戏数组 */
        if (gameAtoms) {
            for (i = 0; i < gameAtoms.length; i++) {
                for (j = 0; j < gameAtoms[i].length; j++) {
                    if (gameAtoms[i][j] === 1) {
                        renderAtom(0, 0, j + 1, i + 1, ctx, drawColor1);
                    }
                }
            }
        }


        /* 绘制重置动画 */
        if (resetAtoms) {
            for (i = resetAtoms.length - 1; i >= 0; i--) {
                if (resetAtoms[i]) {
                    for (j = resetAtoms[i].length - 1; j >= 0 ; j--) {
                        if (resetAtoms[i][j] === 1) {
                            renderAtom(0, 0, j+1, i+1, ctx, drawColor1);
                        }
                    }
                }
            }
        }
    }

    /* 绘制右边 下一个方块，游戏成绩 */
    function renderRight (ctx) {

        /* 绘制游戏成绩 */
        var yOffset = fontSize;
        ctx.font = "italic normal normal " + fontSize + "px arial";
        ctx.fillText("Score", splitPosition + atomSpace, yOffset);
        ctx.font = "normal normal bold " + fontSize + "px arial";
        yOffset = yOffset + fontSize;
        ctx.fillText(String(score), splitPosition + atomSpace, yOffset);

        ctx.font = "italic normal normal " + fontSize + "px arial";
        yOffset = yOffset + fontSize + fontSpace;
        ctx.fillText("Next", splitPosition + atomSpace, yOffset);
        /* 绘制接下来要使用的材料。 */
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 4; j++) {
                /* 绘制背景 */
                renderAtom(splitPosition, yOffset, i, j, ctx, drawColor2);

                /* 绘制预备材料 */
                if (nextStuff) {
                    var ns = nextStuff[j - 1][i - 1];
                    if (ns === 1) {
                        renderAtom(splitPosition, yOffset, i, j, ctx, drawColor1);
                    }
                }
            }
        }

        /* 绘制等级 */
        ctx.font = "italic normal normal " + fontSize + "px arial";
        yOffset = yOffset + fontSize + fontSpace + (4 * (atomHeight + atomSpace));
        ctx.fillText("Level", splitPosition + atomSpace, yOffset);
        ctx.font = "normal normal bold " + fontSize + "px arial";
        yOffset = yOffset + fontSize;
        ctx.fillText(String(level), splitPosition + atomSpace, yOffset);

        /* 绘制最佳成绩 */
        ctx.font = "italic normal normal " + fontSize + "px arial";
        yOffset = yOffset + fontSize + fontSpace;
        ctx.fillText("Best", splitPosition + atomSpace, yOffset);
        ctx.font = "normal normal bold " + fontSize + "px arial";
        yOffset = yOffset + fontSize;
        ctx.fillText(String(bestscore), splitPosition + atomSpace, yOffset);

        /* 绘制暂停提示 */
        if (pause) {
            ctx.font = "italic normal normal " + fontSize + "px arial";
            yOffset = yOffset + fontSize + fontSpace;
            ctx.fillText("Paused", splitPosition + atomSpace, yOffset);
        }
    }

    /* 此方法会被循环调用，用于绘制游戏内容 */
    function onRender (ctx) {
        ctx.strokeStyle = drawColor1;
        ctx.fillStyle   = bgColor;
        ctx.lineCap     = 'butt';
        ctx.lineWidth   = lineWidth;
        ctx.clearRect(0, 0, gameWidth, gameHeight);
        ctx.fillStyle   = drawColor1;

        /* 绘制游戏区域 */
        renderLeft(ctx);

        /* 绘制分割线 */
        ctx.beginPath();
        ctx.moveTo(splitPosition, 0);
        ctx.lineTo(splitPosition, gameHeight);
        ctx.stroke();
        ctx.closePath();

        /* 绘制右边状态值区域 */
        renderRight(ctx);
    }

    /* 开始执行绘制 */
    function render (ctx) {
        (function loop () {
            onRender(ctx);
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(loop);
            } else if (window.webkitRequestAnimationFrame) {
                window.webkitRequestAnimationFrame(loop);
            } else {
                setTimeout(loop, 33);
            }
        })();
    }

    /* ------------------------------------------------------------------------------------- */
    /* 上列方法均是游戏内部逻辑方法，外界不可以调用。 */


    /* 下列方法均是用于操控游戏的方法，外界可以调用。 */
    /* ------------------------------------------------------------------------------------- */

    /* 调用此方法开始游戏。 如果在游戏进行中重复调用了此方法，将忽略。 */
    function startGame () {

        /* 一旦此数组有值，则认为在游戏中，直接不处理。 */
        if (!gameover) {
            return;
        }
        gameover = false;

        /* 初始化游戏数组为一个空数组 */
        gameAtoms = [];
        staticStuffs = [];
        for (var j = 0; j < atomheightCount; j++) {
            gameAtoms[j] = [];
            staticStuffs[j] = [];
            for (var i = 0; i < atomwidthCount; i++) {
                gameAtoms[j][i] = 0;
                staticStuffs[j][i] = 0;
            }
        }

        var lastTime = 0;
        (function loop() {

            if (
                (!pause) &&
                (!gameover /* 游戏未标记为结束 */) &&
                (!succAniming/*在消减动画时不执行下落*/) &&
                Date.now() - lastTime >= (turbo ? TURBO_TIME_SPACE : LEVELS[level])
            ) {

                var isNewCurrStuf = false;

                if (!currStuff) {
                    currStuff = nextStuff; /* 始终优先从下一个材料获取 */
                    nextStuff = null;
                    isNewCurrStuf = !!currStuff;
                }
                if (!currStuff) {
                    currStuff = randomStuff(); /* 通过下一个材料也没能获取到材料，说明这是游戏刚开始，此处可以直接随机获取一个。 */
                    nextStuff = null;
                    isNewCurrStuf = !!currStuff;
                }
                if (!nextStuff) {
                    nextStuff = randomStuff(); /* 产生下一个新材料 */
                    isNewCurrStuf = !!currStuff;
                }

                if (isNewCurrStuf) {
                    turboModeOFF(); /*新材料掉下来时关闭急速模式*/
                }

                /* 将 当前掉落 的材料通过指定的横向偏移量进行融合，并将 currStuff 下降1格。 */
                var grounded = _GameArrMerge(stuffOffsetX, stuffOffsetY, currStuff, gameAtoms, staticStuffs);
                if (grounded === 1) {
                    /* 掉落到了能够掉落的最底部了，可以进行下一个材料的掉落了。 */
                    currStuff = null;
                    stuffOffsetX = STUFF_START_X_OFFSET;
                    stuffOffsetY = STUFF_START_Y_OFFSET;

                    /* 检查堆砌成功了的 */
                    checkSuccessLine();
                } else if (grounded === -1) {

                    /* 游戏结束 */
                    resetGame();
                } else {
                    /* 正常下落。什么都不用处理。 */
                }

                lastTime = Date.now();
            }
            if (!gameover) {
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(loop);
                } else if (window.webkitRequestAnimationFrame) {
                    window.webkitRequestAnimationFrame(loop);
                } else {
                    setTimeout(loop, 5);
                }
            }
        })();
    }

    /*暂停游戏，再次调用则恢复*/
    function pauseGame () {
        if (!gameover && gameAtoms && staticStuffs) {
            pause = !pause;
        }
    }

    /*开启急速模式，急速模式下落完成一个材料后自动关闭，也可以手动调用 turboModeOFF 方法关闭，*/
    function turboModeON() {
        if (gameAtoms && currStuff) {
            turbo = true;
        }
    }

    /* 关闭急速模式 */
    function turboModeOFF() {
        turbo = false;
    }

    /* 旋转材料。 此方法只有在游戏中有效，可以将正在下落的材料进行顺时针90度旋转。 */
    function rotateStuff () {
        if (gameAtoms && currStuff) {
            var temp = [[], [], [], []];

            // 进行旋转材料
            for (var i = 0; i < currStuff.length; i++) {
                for (var j = 0; j < currStuff[i].length; j++) {

                    var ni = j;
                    var nj = currStuff.length - 1 - i;
                    temp[ni][nj] = currStuff[i][j];

                    if (stuffOffsetY + ni < 0) {
                        /* 材料还没下降到屏幕内 */
                        continue;
                    }

                    if (stuffOffsetY + ni >= atomheightCount) {
                        /*变化会超出屏幕，不准变*/
                        return;
                    }

                    if (stuffOffsetX + nj >= atomwidthCount || stuffOffsetX + nj < 0) {
                        return;
                    }


                    /*判断变化后的材料是否和已确定的堆砌产生重叠，产生了则不进行此次变化*/
                    if (staticStuffs[stuffOffsetY + ni][stuffOffsetX + nj] === 1) {
                        return;
                    }
                }
            }

            /* 变化了之后，重新赋值数组，让界面变化。 */
            currStuff = temp;
            for (i = 0; i < staticStuffs.length; i++) {
                for (j = 0; j < staticStuffs[j].length; j++) {
                    gameAtoms[i][j] = staticStuffs[i][j];
                }
            }
            for (i = 0; i < currStuff.length; i++) {
                for (j = 0; j < currStuff[i].length; j++) {
                    if (stuffOffsetY + i < 0 || stuffOffsetX + j < 0 || stuffOffsetY + i >= atomheightCount) {
                        continue;
                    }

                    if (
                        gameAtoms[stuffOffsetY + i][stuffOffsetX + j] === 0 &&
                        currStuff[i][j] === 1
                    ) {
                        gameAtoms[stuffOffsetY + i][stuffOffsetX + j] = currStuff[i][j];
                    }
                }
            }
        }
    }

    /* 将材料向左边移动一格 */
    function left () {
        _moveCurrStuff(-1);
    }

    /* 将材料向右边移动一格 */
    function right () {
        _moveCurrStuff(1);
    }

    /* 结束游戏、复位 */
    function resetGame () {
        if (gameover) {
            return;
        }

        gameover = true;

        /* 保存最佳成绩。*/
        if (score > bestscore) {
            bestscore = score;
            window.localStorage && window.localStorage.setItem("bestscore", bestscore);
        }

        resetAnim(function () {
            _resetGame();
        });
    }

    gameDom    = initGameDom(domId);
    gameCanvas = initGameCanvas(gameDom);
    initLogic();
    initEvent();
    render(gameCanvas);

    this.startGame    = startGame;
    this.pauseGame    = pauseGame;
    this.turboModeON  = turboModeON;
    this.turboModeOFF = turboModeOFF;
    this.rotateStuff  = rotateStuff;
    this.left         = left;
    this.right        = right;
    this.resetGame    = resetGame;
};