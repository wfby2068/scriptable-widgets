// GCP $300 试用额度 · 使用情况
// Scriptable 小组件:剩余额度、已用、剩余天数、每天可用
// 数据来自 GitHub 上的 gcp-credit.json(助手定期更新已用金额),取不到就用内置默认值
// 试用期 2026-11-08 至 2027-02-07,共 91 天;结算账号 0149FC-7F27B3-21F0DA

const TOTAL = 300;
const START = "2026-11-08";
const END = "2027-02-07";
const DATA_URLS = [
  "https://raw.githubusercontent.com/wfby2068/scriptable-widgets/main/gcp-credit.json",
  "https://cdn.jsdelivr.net/gh/wfby2068/scriptable-widgets@main/gcp-credit.json",
];
const FALLBACK = { total: 300, used: 0, updated: "2026-11-08", start: START, end: END };

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const BG = new Color("#0f172a");
const WHITE = Color.white();
const GRAY = new Color("#94a3b8");
const BLUE = new Color("#3b82f6");
const GREEN = new Color("#34d399");
const AMBER = new Color("#fbbf24");
const RED = new Color("#f87171");

function midnight(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function daysBetween(a, b) { return Math.round((midnight(b) - midnight(a)) / 86400000); }
function parseDate(s) { const p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function md(d) {
  const p = n => String(n).padStart(2, "0");
  return p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function money(n) { return "$" + n.toFixed(2); }

async function loadData() {
  for (const u of DATA_URLS) {
    try {
      const j = await new Request(u).loadJSON();
      if (j && typeof j.used === "number") return j;
    } catch (e) { /* 换下一个源 */ }
  }
  return FALLBACK;
}

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

function row(parent, left, right, color) {
  const s = parent.addStack();
  s.layoutHorizontally();
  text(s, left, 12, GRAY, false);
  s.addSpacer();
  mtext(s, right, 12, color || WHITE);
}

async function run() {
  const data = await loadData();
  const total = data.total || TOTAL;
  const used = data.used || 0;
  const remaining = Math.max(total - used, 0);
  const today = midnight(new Date());
  const end = parseDate(data.end || END);
  const daysLeft = Math.max(daysBetween(today, end), 0);
  const daily = remaining / Math.max(daysLeft, 1);
  const pctLeft = remaining / total;
  const updated = data.updated || "2026-11-08";

  const daysColor = daysLeft > 30 ? GREEN : daysLeft > 7 ? AMBER : RED;

  const w = new ListWidget();
  w.backgroundColor = BG;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 5, 0, 0);
  w.refreshAfterDate = tomorrow;

  const family = config.widgetFamily || "medium";

  if (family === "small") {
    w.setPadding(16, 16, 16, 16);
    text(w, "GCP $300 试用", 13, GRAY, false);
    w.addSpacer(4);
    mtext(w, money(remaining), 26, WHITE, true);
    w.addSpacer(6);
    text(w, "剩 " + daysLeft + " 天 · 每天 " + money(daily), 12, daysColor, false);
    w.addSpacer(2);
    text(w, "到期 " + md(end), 12, GRAY, false);
  } else {
    w.setPadding(16, 16, 16, 16);
    const head = w.addStack();
    head.layoutHorizontally();
    text(head, "GCP $300 试用", 13, WHITE, true);
    head.addSpacer();
    text(head, md(today) + " 周" + WEEK[today.getDay()], 12, GRAY, false);
    w.addSpacer(10);
    text(w, "剩余额度", 12, GRAY, false);
    const big = w.addStack();
    big.layoutHorizontally();
    mtext(big, money(remaining), 30, WHITE, true);
    big.addSpacer();
    text(big, Math.round(pctLeft * 100) + "%", 12, GRAY, false);
    w.addSpacer(6);
    // 进度条:12 格,已用蓝色、剩余灰色
    const bar = w.addStack();
    bar.layoutHorizontally();
    const filled = Math.round(Math.min(used / total, 1) * 12);
    if (filled > 0) mtext(bar, "█".repeat(filled), 12, BLUE);
    if (filled < 12) mtext(bar, "░".repeat(12 - filled), 12, GRAY);
    w.addSpacer(12);
    row(w, "已用", money(used));
    row(w, "剩余额度", money(remaining));
    row(w, "剩余天数", daysLeft + " 天", daysColor);
    row(w, "每天可用", money(daily));
    w.addSpacer(12);
    text(w, "更新于 " + md(parseDate(updated)) + " · 到期 " + md(end), 11, GRAY, false);
  }

  if (config.runsInWidget) {
    Script.setWidget(w);
    Script.complete();
  } else {
    if (family === "small") { await w.presentSmall(); } else { await w.presentMedium(); }
    Script.complete();
  }
}

run();
