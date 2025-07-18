// Fix Missing Entry for 2025-04-16

// ========== CONFIG ==========
const FILE_NAME = "reading-log.json";
const FIX_DATE = "2025-07-17"; // Date to be fixed
const fm = FileManager.local();
const filePath = fm.joinPath(fm.documentsDirectory(), FILE_NAME);

// ========== READ & UPDATE LOG ==========
let studyLog = {};
if (fm.fileExists(filePath)) {
  try {
    studyLog = JSON.parse(fm.readString(filePath));
  } catch (e) {
    console.error("Error reading log file", e);
  }
}

studyLog[FIX_DATE] = true;
fm.writeString(filePath, JSON.stringify(studyLog, null, 2));

// ========== CONFIRMATION ==========
const alert = new Alert();
alert.title = "✅ Date Fixed";
alert.message = `${FIX_DATE} marked as completed.`;
await alert.present();

Script.complete();