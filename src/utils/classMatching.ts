/**
 * Helper to match student classroom against teacher's targeted classroom
 * 
 * Supports:
 * - "ทุกระดับชั้น" / "ทุกห้อง" / "all" / "" -> matches all students
 * - Grade + Room: e.g. "ม.2/1", "ม.2 ห้อง 1", "ป.4/2", "ม.3 ห้อง 5"
 * - Grade Only / All Rooms in Grade: e.g. "ม.2", "ม.2 ทุกห้อง", "ม.1 ทุกห้อง"
 * - Room Only: e.g. "ห้อง 1", "ห้อง 2", "1"
 * - Comma-separated: e.g. "ม.2/1, ม.2/2"
 */

export interface ParsedClassInfo {
  raw: string;
  grade?: string; // e.g. 'm2', 'p1'
  room?: string;  // e.g. '1', '2'
  isAllGrades: boolean;
  isAllRooms: boolean;
}

export function parseClassString(raw?: string): ParsedClassInfo {
  if (!raw || !raw.trim()) {
    return { raw: '', isAllGrades: true, isAllRooms: true };
  }
  const clean = raw.trim().toLowerCase();

  const isAllGrades = clean.includes('ทุกระดับ') || clean.includes('ทุกชั้น') || clean === 'all' || clean === 'ทั้งหมด';
  const isAllRooms = clean.includes('ทุกห้อง') || clean === 'all' || clean === 'ทั้งหมด';

  // Extract Grade: e.g. "ม.1", "ม.2", "ป.3", "m.1", "p.4", "ชั้น ม.2"
  const gradeMatch = clean.match(/(?:ชั้น\s*)?([มปmp])\.?\s*([1-6])/);
  let grade: string | undefined;
  if (gradeMatch) {
    const type = gradeMatch[1].replace('m', 'ม').replace('p', 'ป');
    grade = `${type}.${gradeMatch[2]}`;
  }

  // Extract Room: e.g. "/1", "ห้อง 1", "-1", "room 1"
  // Note: If raw is "ม.2/1", grade is "ม.2", room is "1"
  let room: string | undefined;
  const roomMatch = clean.match(/(?:ห้อง|ห้องเรียน|room|[\/\-])\s*(\d+|[a-z]+)/);
  if (roomMatch) {
    room = roomMatch[1];
  } else if (!gradeMatch && /^\d+$/.test(clean)) {
    // If string is just "1" or "2"
    room = clean;
  }

  return {
    raw: clean,
    grade,
    room,
    isAllGrades,
    isAllRooms,
  };
}

export function isClassMatching(studentClassRaw?: string, targetClassRaw?: string): boolean {
  if (!targetClassRaw) return true;
  const targetTrimmed = targetClassRaw.trim();
  if (
    targetTrimmed === '' ||
    targetTrimmed === 'ทุกห้อง' ||
    targetTrimmed === 'ทุกระดับชั้น' ||
    targetTrimmed === 'ทุกระดับชั้น - ทุกห้อง' ||
    targetTrimmed.toLowerCase() === 'all'
  ) {
    return true;
  }

  if (!studentClassRaw || !studentClassRaw.trim()) {
    // If student has no classroom set, allow access to general/all
    return false;
  }

  const studentTrimmed = studentClassRaw.trim();
  if (studentTrimmed.toLowerCase() === targetTrimmed.toLowerCase()) return true;

  // Split multiple targets if comma-separated e.g. "ม.2/1, ม.2/2"
  const targets = targetTrimmed.split(',').map((t) => t.trim());
  const parsedStudent = parseClassString(studentTrimmed);

  for (const t of targets) {
    const parsedTarget = parseClassString(t);

    if (parsedTarget.isAllGrades && parsedTarget.isAllRooms) {
      return true;
    }

    // Direct raw match
    if (parsedStudent.raw === parsedTarget.raw) return true;

    // If target specifies grade:
    if (parsedTarget.grade) {
      // Must match student grade if student has grade
      if (parsedStudent.grade && parsedStudent.grade !== parsedTarget.grade) {
        continue; // Different grade -> no match
      }

      // If target says "all rooms" or doesn't specify a room (e.g. "ม.2 ทุกห้อง" or "ม.2")
      if (parsedTarget.isAllRooms || !parsedTarget.room) {
        if (!parsedStudent.grade || parsedStudent.grade === parsedTarget.grade) {
          return true;
        }
      }

      // Target specifies both grade AND room (e.g. "ม.2/1" or "ม.2 ห้อง 1")
      if (parsedTarget.room) {
        if (
          (!parsedStudent.grade || parsedStudent.grade === parsedTarget.grade) &&
          parsedStudent.room === parsedTarget.room
        ) {
          return true;
        }
      }
    } else {
      // Target does NOT specify a grade (e.g. "ห้อง 1", "ห้อง 2", "ทุกห้อง")
      if (parsedTarget.isAllRooms) return true;

      if (parsedTarget.room && parsedStudent.room === parsedTarget.room) {
        return true;
      }
    }
  }

  return false;
}
