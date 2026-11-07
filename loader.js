// 免息期小组件 · 加载器(贴一次进 Scriptable,以后不用再粘贴)
// 代码在 GitHub 上改完 push,小组件刷新即更新
const URL = "https://raw.githubusercontent.com/wfby2068/scriptable-widgets/main/grace-widget.js";
try {
  const code = await new Request(URL).loadString();
  eval(code);
} catch (e) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f172a");
  w.setPadding(16, 16, 16, 16);
  const t = w.addText("免息期小组件加载失败,检查网络后点按刷新");
  t.font = Font.systemFont(13);
  t.textColor = Color.white();
  if (config.runsInWidget) { Script.setWidget(w); } else { await w.presentMedium(); }
  Script.complete();
}
