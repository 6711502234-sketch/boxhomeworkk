import { ExamScore } from '../types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script สำหรับรับคะแนนจาก "กล่องการบ้าน & แบบทดสอบ ม.3"
 * บันทึกลงใน Google Sheets อัตโนมัติ
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // หากเป็นแผ่นงานใหม่ ให้สร้างหัวตารางอัตโนมัติ
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "วันเวลาที่ทำแบบทดสอบ",
        "รหัสนักเรียน",
        "ชื่อ-นามสกุล",
        "ห้อง",
        "เลขที่",
        "ชื่อชุดแบบทดสอบ",
        "คะแนนที่ได้",
        "คะแนนเต็ม",
        "ร้อยละ (%)",
        "ดาวที่ได้รับ (⭐)"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#fef3c7");
    }

    var data = JSON.parse(e.postData.contents);
    
    // ตรวจสอบว่าส่งมาเป็น Array หรือรายการเดี่ยว
    if (Array.isArray(data)) {
      data.forEach(function(item) {
        appendScoreRow(sheet, item);
      });
    } else {
      appendScoreRow(sheet, data);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "บันทึกคะแนนเรียบร้อยแล้ว" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendScoreRow(sheet, item) {
  var percentage = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
  sheet.appendRow([
    item.submittedAt || new Date().toLocaleString("th-TH"),
    item.studentId || "-",
    item.studentName || "-",
    item.studentClass || "-",
    item.studentNo ? String(item.studentNo) : "-",
    item.lessonTitle || "-",
    item.score !== undefined ? item.score : 0,
    item.maxScore !== undefined ? item.maxScore : 10,
    percentage + "%",
    item.earnedStars !== undefined ? item.earnedStars : 0
  ]);
}
`;

export interface ScorePayload {
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNo?: string | number;
  lessonId: string;
  lessonTitle: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  earnedStars?: number;
}

export async function sendScoreToGoogleSheets(
  payload: ScorePayload | ScorePayload[],
  webhookUrl: string
): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, message: 'ยังไม่ได้ระบุ Web App URL ของ Google Apps Script' };
  }

  try {
    // Note: Google Apps Script Web App redirects with 302, so we use no-cors or standard fetch
    await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors', // standard for Google Apps Script webhooks from browsers
    });

    return {
      success: true,
      message: 'ส่งข้อมูลคะแนนไปยัง Google Sheets สำเร็จ!',
    };
  } catch (error: any) {
    console.error('Error sending score to Google Sheets:', error);
    return {
      success: false,
      message: error?.message || 'ไม่สามารถส่งคะแนนได้ กรุณาตรวจสอบ URL',
    };
  }
}

export function downloadScoresCSV(scores: ExamScore[], title = 'คะแนนแบบทดสอบ'): void {
  const headers = ['วันเวลา', 'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ห้อง', 'เลขที่', 'ชุดแบบทดสอบ', 'คะแนน', 'คะแนนเต็ม', 'ร้อยละ', 'ดาวที่ได้รับ'];
  
  const rows = scores.map((s) => {
    const percent = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0;
    return [
      `"${s.submittedAt || ''}"`,
      `"${s.studentId || ''}"`,
      `"${s.studentName || ''}"`,
      `"${s.studentClass || ''}"`,
      `"${s.studentNo || ''}"`,
      `"${(s.lessonTitle || '').replace(/"/g, '""')}"`,
      s.score,
      s.maxScore,
      `"${percent}%"`,
      s.earnedStars || 0,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
