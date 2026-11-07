// 免息期小组件 · 加载器(贴一次进 Scriptable,以后不用再粘贴)
// 先试 GitHub raw,失败再试 jsDelivr 镜像
const URLS = [
  "https://raw.githubusercontent.com/wfby2068/scriptable-widgets/main/grace-widget.js",
  "https://cdn.jsdelivr.net/gh/wfby2068/scriptable-widgets@main/grace-widget.js",
];

let code = null;
let lastErr = null;
for (const u of URLS) {
  try {
    const s = await new Request(u).loadString();
    if (s && s.indexOf("最长免息期") !== -1) { code = s; break; }
  } catch (e) { lastErr = e; }
}

if (code) {
  try {
    eval(code);
  } catch (e) {
    showErr("运行失败:" + e);
  }
} else {
  showErr("加载失败:" + (lastErr ? lastErr : "两个源都打不开"));
}

function showErr(msg) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f172a");
  w.setPadding(16, 16, 16, 16);
  const t = w.addText(msg + "，点按重试");
  t.font = Font.systemFont(13);
  t.textColor = Color.white();
  if (config.runsInWidget) { Script.setWidget(w); } else { w.presentMedium(); }
  Script.complete();
}
