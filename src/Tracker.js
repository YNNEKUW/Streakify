// ========== CONFIG ==========
const EVENT_NAME = "Reading"; // Change the title here
const DAYS_TO_TRACK = 180;
const MS_PER_DAY = 86400000;
const COLOR_DONE = new Color("#00ff7f"); // green
const COLOR_EMPTY = new Color("#2f2f2f"); // dark gray
const BG_COLOR = new Color("#1e1e1e");
const FILE_NAME = "reading-log.json";

const fm = FileManager.local();
const filePath = fm.joinPath(fm.documentsDirectory(), FILE_NAME);

// ========== HELPERS ==========
function formatLocalDateKey(date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ========== TIME ==========
const NOW = new Date();
const END_DATE = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
const START_DATE = new Date(END_DATE.getTime() - (DAYS_TO_TRACK - 1) * MS_PER_DAY);
const TODAY_KEY = formatLocalDateKey(END_DATE);

// ========== LOG FILE ==========
let studyLog = {};
if (fm.fileExists(filePath)) {
  try {
    studyLog = JSON.parse(fm.readString(filePath));
  } catch (e) {
    console.error("Log read error", e);
  }
}

// ========== MANUAL MODE ==========
if (!config.runsInWidget) {
  studyLog[TODAY_KEY] = !studyLog[TODAY_KEY];
  fm.writeString(filePath, JSON.stringify(studyLog, null, 2));
  const alert = new Alert();
  alert.title = EVENT_NAME;
  alert.message = `${TODAY_KEY} → ${studyLog[TODAY_KEY] ? "✅ Marked as studied" : "❌ Unmarked"}`;
  await alert.present();
  Script.complete();
}

// ========== WIDGET ==========
const widget = new ListWidget();
widget.backgroundColor = BG_COLOR;
widget.setPadding(10, 10, 10, 10);

// ========== TITLE ==========
const titleStack = widget.addStack();
titleStack.layoutHorizontally();
titleStack.centerAlignContent();
titleStack.addSpacer();
const title = titleStack.addText(EVENT_NAME);
title.font = Font.boldSystemFont(14);
title.textColor = Color.white();
titleStack.addSpacer();
widget.addSpacer(6);

// Centered main stack
const mainStack = widget.addStack();
mainStack.layoutVertically();
mainStack.centerAlignContent();

// Day Grid (no month labels)
const gridRow = mainStack.addStack();
gridRow.spacing = 2;

gridRow.addSpacer(0);

const totalWeeks = Math.ceil(DAYS_TO_TRACK / 7);

for (let week = 0; week < totalWeeks; week++) {
  const colStack = gridRow.addStack();
  colStack.layoutVertically();
  colStack.spacing = 2;

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const dayIndex = week * 7 + dayOfWeek;
    const date = new Date(START_DATE.getTime() + dayIndex * MS_PER_DAY);
    if (date > END_DATE) break;

    const key = formatLocalDateKey(date);
    const filled = studyLog[key] === true;

    const square = colStack.addStack();
    square.size = new Size(10, 10);
    square.backgroundColor = filled ? COLOR_DONE : COLOR_EMPTY;
    square.cornerRadius = 3;
  }
}

// ========== STREAK COUNTER ==========
function calculateStreak(log, endDate) {
  let streak = 0;
  for (let i = 0; i < DAYS_TO_TRACK; i++) {
    const date = new Date(endDate.getTime() - i * MS_PER_DAY);
    const key = formatLocalDateKey(date);
    if (log[key]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const streak = calculateStreak(studyLog, END_DATE);
widget.addSpacer(10);
const streakRow = widget.addStack();
streakRow.addSpacer();
const streakText = streakRow.addText(`🔥 Streak: ${streak}`);
streakText.font = Font.systemFont(10);
streakText.textColor = Color.white();

// Done!
Script.setWidget(widget);
Script.complete();