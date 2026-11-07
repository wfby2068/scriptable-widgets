// 最长免息期 · Chase 5 卡
// Scriptable 小组件:每天按当前日期算,今天刷哪张卡免息最长
// 规则:还款日 = 关账日 + 28 天;关账日当天刷的一般记到下期账单

const CARDS = [
  { name: "CSP", tail: "4588", closeDay: 24 },
  { name: "Flex", tail: "5349", closeDay: 20 },
  { name: "Freedom Unlimited", tail: "8285", closeDay: 19 },
  { name: "Slate", tail: "5253", closeDay: 16 },
  { name: "Boundless", tail: "8248", closeDay: 10 },
];

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const BG = new Color("#0f172a");
const WHITE = Color.white();
const GRAY = new Color("#94a3b8");

// 蓝(免息最长) -> 红(免息最短)渐变
function gradColor(days, min, max) {
  const t = max === min ? 1 : (days - min) / (max - min);
  const r = Math.round(239 + (59 - 239) * t);
  const g = Math.round(68 + (130 - 68) * t);
  const b = Math.round(68 + (246 - 68) * t);
  return new Color(r / 255, g / 255, b / 255);
}

function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function daysBetween(a, b) { return Math.round((midnight(b) - midnight(a)) / 86400000); }
function md(d) { return (d.getMonth() + 1) + "-" + d.getDate(); }

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

function row(parent, left, right, days, highlight) {
  const s = parent.addStack();
  s.layoutHorizontally();
  text(s, left, 12, highlight ? WHITE : GRAY, highlight);
  s.addSpacer();
  text(s, right, 12, gradColor(days, minDays, maxDays), highlight);
}

const family = config.widgetFamily || "medium";

if (family === "small") {
  w.setPadding(16, 16, 16, 16);
  text(w, "今天刷", 13, GRAY, false);
  w.addSpacer(4);
  text(w, best.name, 24, WHITE, true);
  w.addSpacer(2);
  text(w, "免息 " + best.days + " 天", 26, gradColor(best.days, minDays, maxDays), true);
  w.addSpacer(6);
  text(w, "还款日 " + md(best.due) + " · 尾号 " + best.tail, 12, GRAY, false);
} else {
  w.setPadding(10, 16, 10, 16);
  const head = w.addStack();
  head.layoutHorizontally();
  text(head, "今天刷哪张卡", 13, WHITE, true);
  head.addSpacer();
  text(head, md(today) + " 周" + WEEK[today.getDay()], 12, GRAY, false);
  w.addSpacer(4);
  const big = w.addStack();
  big.layoutHorizontally();
  text(big, best.name + " 尾号 " + best.tail, 20, WHITE, true);
  big.addSpacer();
  text(big, best.days + " 天免息", 20, gradColor(best.days, minDays, maxDays), true);
  w.addSpacer(4);
  rows.forEach(r => row(w, r.name + " " + r.tail, r.days + " 天 · " + md(r.due) + " 还", r.days, r === best));
  w.addSpacer(4);
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
