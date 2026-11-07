// 最长免息期 · Chase 5 卡
// Scriptable 小组件:每天按当前日期算,今天刷哪张卡免息最长
// 规则:还款日 = 关账日 + 28 天;关账日当天刷的一般记到下期账单

const CARDS = [
  { name: "CSP", tail: "4588", closeDay: 24 },
  { name: "Flex", tail: "5349", closeDay: 20 },
  { name: "CFU", tail: "8285", closeDay: 19 },
  { name: "Slate", tail: "5253", closeDay: 16 },
  { name: "Boundless", tail: "8248", closeDay: 10 },
];

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const BG = new Color("#0f172a");
const WHITE = Color.white();
const GRAY = new Color("#94a3b8");

// 蓝(免息最长) -> 白(免息最短)渐变
// 注意:Scriptable 的 Color 只接受十六进制字符串,先拼成 "#rrggbb" 再传
function gradColor(days, min, max) {
  const t = max === min ? 1 : (days - min) / (max - min);
  const r = Math.round(255 + (59 - 255) * t);
  const g = Math.round(255 + (130 - 255) * t);
  const b = Math.round(255 + (246 - 255) * t);
  const h = v => v.toString(16).padStart(2, "0");
  return new Color("#" + h(r) + h(g) + h(b));
}

function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function daysBetween(a, b) { return Math.round((midnight(b) - midnight(a)) / 86400000); }
function md(d) {
  const p = n => String(n).padStart(2, "0");
  return p(d.getMonth() + 1) + "-" + p(d.getDate());
}

const today = midnight(new Date());

function nextClose(closeDay) {
  let c = new Date(today.getFullYear(), today.getMonth(), closeDay);
  if (today.getDate() >= closeDay) c = new Date(today.getFullYear(), today.getMonth() + 1, closeDay);
  return c;
}

const rows = CARDS.map(c => {
  const close = nextClose(c.closeDay);
  const due = addDays(close, 28);
  return { name: c.name, tail: c.tail, due, days: daysBetween(today, due) };
}).sort((a, b) => b.days - a.days);

const best = rows[0];
const minDays = rows[rows.length - 1].days;
const maxDays = rows[0].days;

// 下一个最长窗口(某张卡关账后第一天)
const nextWin = CARDS.map(c => {
  const start = addDays(nextClose(c.closeDay), 1);
  return { name: c.name, start };
}).sort((a, b) => a.start - b.start)[0];

const w = new ListWidget();
w.backgroundColor = BG;
const tomorrow = addDays(today, 1);
tomorrow.setHours(0, 5, 0, 0);
w.refreshAfterDate = tomorrow;

function text(parent, str, size, color, bold) {
  const t = parent.addText(str);
  t.font = bold ? Font.boldSystemFont(size) : Font.systemFont(size);
  t.textColor = color;
  return t;
}

// 等宽字体:数字、点、空格宽度固定,各行严格对齐
function mtext(parent, str, size, color, bold) {
  const t = parent.addText(str);
  t.font = bold ? Font.semiboldMonospacedSystemFont(size) : Font.regularMonospacedSystemFont(size);
  t.textColor = color;
  t.leftAlignText();
  return t;
}

function row(parent, left, right, days, highlight) {
  const s = parent.addStack();
  s.layoutHorizontally();
  text(s, left, 12, WHITE, highlight);
  s.addSpacer();
  mtext(s, right, 12, gradColor(days, minDays, maxDays));
}

const family = config.widgetFamily || "medium";

if (family === "small") {
  w.setPadding(16, 16, 16, 16);
  text(w, "今天刷", 13, GRAY, false);
  w.addSpacer(4);
  text(w, best.name, 24, WHITE, true);
  w.addSpacer(2);
  mtext(w, "免息 " + best.days + " 天", 26, gradColor(best.days, minDays, maxDays), true);
  w.addSpacer(6);
  text(w, "还款日 " + md(best.due) + " · 尾号 " + best.tail, 12, GRAY, false);
} else {
  w.setPadding(16, 16, 16, 16);
  const head = w.addStack();
  head.layoutHorizontally();
  text(head, "今天刷哪张卡", 13, WHITE, true);
  head.addSpacer();
  text(head, md(today) + " 周" + WEEK[today.getDay()], 12, GRAY, false);
  w.addSpacer(14);
  rows.forEach(r => row(w, r.name + " " + r.tail, r.days + " 天 · " + md(r.due) + "还款", r.days, r === best));
  w.addSpacer(14);
  const foot = best.days >= 57
    ? "今天就是最长窗口 · 下个最长窗口:" + md(nextWin.start) + " " + nextWin.name
    : "下个最长窗口:" + md(nextWin.start) + " " + nextWin.name;
  text(w, foot, 11, GRAY, false);
}

if (config.runsInWidget) {
  Script.setWidget(w);
  Script.complete();
} else {
  // 预览用:包一层 async 函数,远程 eval 不支持顶层 await
  (async () => {
    if (family === "small") { await w.presentSmall(); } else { await w.presentMedium(); }
    Script.complete();
  })();
}
