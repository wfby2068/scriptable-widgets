# Scriptable 小组件

## 免息期小组件 (grace-widget.js)

每天按当前日期算,今天刷哪张 Chase 卡免息最长。

- 规则:还款日 = 关账日 + 28 天
- 颜色:蓝色免息最长,红色最短,中间紫色过渡

## 安装(只贴一次)

1. App Store 安装 Scriptable(免费)
2. 新建脚本,粘贴 `loader.js` 的内容,命名"免息期"
3. 主屏幕添加 Scriptable 小组件,选这个脚本

以后改代码直接改 `grace-widget.js` 并 push,小组件刷新即更新,不用再粘贴。

## 卡片

| 卡 | 尾号 | 关账日 |
| --- | --- | --- |
| CSP | 4588 | 24 日 |
| Flex | 5349 | 20 日 |
| Freedom Unlimited | 8285 | 19 日 |
| Slate | 5253 | 16 日 |
| Boundless | 8248 | 10 日 |
