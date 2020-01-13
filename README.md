# wzwtetris 简介 - intro
俄罗斯方块 tetris，小时候玩的那种掌上王中王游戏机上就有俄罗斯方块，本项目还原了里面的俄罗斯方块的效果。游戏共有23关，随着游戏越往后进行关卡越高难度越大，下降速度越快。

# 在线预览 - preview

![效果](http://file.microanswer.cn/222.gif)

[点击立即试玩](https://www.microanswer.cn/tetris.html)

# 使用 - use

通过 jsdelivr，可以快速将 github 上的资源用于cdn公共资源，所以，你可以使用下方的连接将本游戏组件引入你的网页里：

```html
    <script src="https://cdn.jsdelivr.net/gh/microanswer/wzwtetris@1.0.1/dist/wzwTetirs.min.js"></script>
```

然后你就可以愉快的使用了：

```html
<div id="screen"></div>
<script>
// 新建一个俄罗斯方块游戏对象， 通过传递一个id，可一个可选的option即可。
var game = new WzwTetirs("screen", {
        gameWidth:      160,   /* 游戏视窗宽度 */
        gameHeight:     215,   /* 游戏视窗高度 */
        splitPosition:  110,   /* 左边面板和右边面板的分割点，数值以从左到右计算。 */

        fontSize:       13,    /* 文字大小 */
        fontSpace:      13,    /* 文字行间距 */

        atomSpace:      2.5,   /* 点阵间隙大小 */
        atomBorder:     1.5,   /* 点阵外轮廓粗细 */
        atomInset:      0.5    /* 点阵中间的间隙大小 */
    });
</script>
```

# 选项配置 - option

游戏在外观上提供了许多可配置项，下面列出了`option`支持的所有参数及其默认值， 整个 `option` 都是选填的。

```javascript
var option = {
    gameWidth:       320,        /* 游戏视窗宽度 */
    gameHeight:      430,        /* 游戏视窗高度 */
    splitPosition:   222,        /* 左边面板和右边面板的分割点，数值以从左到右计算。 */
    drawColor1:      '#010700',  /* 画笔浓颜色 - 就是界面上很黑的那个*/
    drawColor2:      '#ccebce',  /* 画笔浅颜色 - 就是点阵区域后面你感觉有一层灰色的那个*/
    bgColor:         '#dbffdd',  /* 背景颜色 */
    lineWidth:       1,          /* 画笔粗细 - canvas 绘制时的 lineWidth 参数， 同时它也是 中间分割线的粗细 */
    fontSize:        17,         /* 文字大小 */
    fontSpace:       17,         /* 文字行间距 */
    atomwidthCount:  10,         /* 游戏区域，横向的点阵个数 */
    atomheightCount: 20,         /* 游戏区域，竖向的点阵个数 */
    atomSpace:       5,          /* 点阵间隙大小 */
    atomBorder:      3,          /* 点阵外轮廓粗细 */
    atomInset:       1,          /* 点阵中间的间隙大小 */
    useInnerKeyBoardEvent: true  /* 是否使用键盘支持 */
}
```

# 方法列表 - methods

```javascript

// 开始游戏。
game.startGame();

// 暂停游戏，再次调用则恢复游戏。
game.pauseGame();

// 开启极速模式，开启后会在下一个材料开始的时候自动关闭。你也可以手动调用turboModeOFF方法在当前材料还没下降到底部时提前关闭。
game.turboModeON();

// 关闭极速模式。
game.turboModeOFF();

// 旋转变换材料，当材料所处的空间不足以完成旋转时，不会旋转。
game.rotateStuff();

// 将材料左移动。
game.left();

// 将材料右移动。
game.right();

// 复位/重置游戏。
game.resetGame();

```


# 博文 - blog


[立即查看博文](https://www.microanswer.cn/blog/68)

# 历史版本 - history

- 1.0.1 修复堆砌到顶部后，再消一行，顶部的材料没有跟随下落。\
加入一次消除4行则多加一分的加分逻辑。
- 1.0.0 发布第一版本。