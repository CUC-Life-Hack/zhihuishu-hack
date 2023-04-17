# 智慧树 Hack

## 安装

发布路径：https://github.com/CUC-Life-Hack/zhihuishu-hack/blob/master/dist/main.user.js

安装方法：请参阅 [TamperMonkey 使用说明](https://github.com/CUC-Life-Hack/.github/wiki/Tampermonkey-%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)。

> 注：不知为何，只支持 Chrome。在 Firefox 上运行会无法劫持事件验证接口，导致自动化操作无法进行。

# 功能

安装后，进入智慧树课程界面，会看到如图悬浮窗：

<center>
	<img
		src="./docs/screenshot.png"
		height="300"
	/>
</center>

支持两个手动操作：

- [x] 切换到最低画质
- [x] 使用最高倍速（16x）

以及自动化操作，开启之后会自动播放视频、以及播放完毕后切换到下一个未完成的课时，
中途遇到弹题也会自动关闭。

> 注意：刷课过程中可能会弹出验证码，需要手动处理。