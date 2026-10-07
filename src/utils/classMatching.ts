/**
 * Helper to match student classroom against teacher's targeted classroom
 * 
 * Requirement 4:
 * "4. ระบบจะจำการเข้าใช้งานจากการที่ครูระบุชั้นเรียนเท่านั้น เช่น หากครูไม่ได้ระบุชั้นเรียนที่นักเรียนอยู่นักเรียนคนอื่นจะไม่สามารถเห็นชิ้นงาน แบบทดสอบหรืออื่นๆได้"
 */
export function isClassMatching(studentClassRaw?: string, targetClassRaw?: string): boolean {
  if (!targetClassRaw) return true;
  const target = targetClassRaw.trim();
  if (target === 'ทุกห้อง' || target === 'all' || target === '') return true;
  
  if (!studentClassRaw) return false;
  const student = studentClassRaw.trim();
  if (student === target) return true;

  // Split comma-separated target classes e.g. "ม.2/1, ม.2/2"
  const targets = target.split(',').map((t) => t.trim().toLowerCase());
  const stdLower = student.toLowerCase();
  if (targets.includes(stdLower)) return true;

  // Normalize by stripping "ม." or "ป." e.g. "2/1"
  const cleanStd = stdLower.replace(/^[มป]\.?\s*/, '').trim();
  for (const t of targets) {
    const cleanT = t.replace(/^[มป]\.?\s*/, '').trim();
    if (cleanStd === cleanT) return true;
  }

  return false;
}
