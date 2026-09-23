export const downloadStandaloneHtml = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>กล่องการบ้าน - Homework Box ม.3</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Charm:wght@400;700&family=Gaegu:wght@400;700&family=Itim&family=Mali:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Patrick+Hand&family=Sriracha&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'JaoTomato Thin';
      src: local('JaoTomato Thin'), local('JaoTomato-Thin'), local('JaoTomatoThin'), local('JaoTomato'), local('เจ้ามะเขือเทศ'), local('เจ้ามะเขือเทศ Thin');
      font-weight: 100 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'JaoTomato';
      src: local('JaoTomato'), local('JaoTomato Thin'), local('เจ้ามะเขือเทศ');
      font-weight: 100 700;
      font-style: normal;
    }
    html { font-size: 18px; }
    * { font-family: 'JaoTomato Thin', 'JaoTomato', 'Jao Tomato', 'Mali', 'Itim', 'Gaegu', 'Patrick Hand', 'Charm', cursive, sans-serif; }
    body { font-family: 'JaoTomato Thin', 'JaoTomato', 'Jao Tomato', 'Mali', 'Itim', 'Gaegu', 'Patrick Hand', 'Charm', cursive, sans-serif; background-color: #FFFDF5; color: #18181b; font-size: 1rem; line-height: 1.6; }
    .sketch-border { border: 3px solid #18181b; box-shadow: 4px 4px 0px #18181b; }
    .sketch-btn { border: 2.5px solid #18181b; box-shadow: 3px 3px 0px #18181b; transition: all 0.15s ease; cursor: pointer; }
    .sketch-btn:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0px #18181b; }
    .washi-tape { position: absolute; height: 18px; width: 80px; background: rgba(253, 224, 71, 0.8); border: 1px dashed rgba(0,0,0,0.2); transform: rotate(-3deg); z-index: 10; }
  </style>
</head>
<body class="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
  <!-- Header -->
  <header class="bg-[#FEF08A] sketch-border rounded-[20px_12px_22px_14px] p-5 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="washi-tape -top-2 left-8"></div>
    <div class="flex items-center gap-3">
      <div class="w-14 h-14 bg-amber-300 sketch-border rounded-2xl flex items-center justify-center text-3xl">📦</div>
      <div>
        <h1 class="text-2xl md:text-3xl font-black">กล่องการบ้าน</h1>
        <p class="text-xs md:text-sm font-bold text-zinc-700">ระบบกล่องการบ้าน ม.3 สไตล์ภาพวาดการ์ตูน</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="bg-amber-100 px-4 py-2 sketch-border rounded-xl font-black text-amber-900 flex items-center gap-2">
        <span class="text-xl animate-bounce">⭐</span>
        <span id="star-counter">100 ดาว</span>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs: 4 requested tabs -->
  <div class="flex flex-wrap gap-2.5 mb-6">
    <button onclick="switchTab('homework')" id="tab-homework" class="px-4 py-2 bg-amber-300 sketch-btn rounded-xl font-black text-sm">📦 ส่งงาน</button>
    <button onclick="switchTab('quiz')" id="tab-quiz" class="px-4 py-2 bg-white sketch-btn rounded-xl font-bold text-sm">🧪 แบบทดสอบ</button>
    <button onclick="switchTab('scorebook')" id="tab-scorebook" class="px-4 py-2 bg-white sketch-btn rounded-xl font-bold text-sm">📖 สมุดคะแนน</button>
    <button onclick="switchTab('reflection')" id="tab-reflection" class="px-4 py-2 bg-white sketch-btn rounded-xl font-bold text-sm">💬 มุมสะท้อน</button>
  </div>

  <!-- Content Container -->
  <div id="tab-content" class="bg-white sketch-border rounded-[24px_16px_22px_18px] p-6 md:p-8">
    <!-- Tab contents dynamically injected by script -->
  </div>

  <script>
    let userStars = 100;
    let currentTab = 'homework';

    const evalRatings = [
      { text: "1/5 ⭐ (อยากให้ปรับปรุง)", emoji: "🥺" },
      { text: "2/5 ⭐ (พอใช้ได้)", emoji: "😐" },
      { text: "3/5 ⭐ (ปานกลาง สนุกดี)", emoji: "🙂" },
      { text: "4/5 ⭐ (สนุกมาก เข้าใจง่าย)", emoji: "😄" },
      { text: "5/5 ⭐ (สนุกมากที่สุด! เลิฟคาบนี้)", emoji: "🥳" }
    ];

    let selectedRating = 5;

    function renderHomework() {
      const container = document.getElementById('tab-content');
      container.innerHTML = \`
        <div class="space-y-6">
          <div class="bg-amber-100 sketch-border rounded-2xl p-5">
            <h2 class="text-xl font-black">📦 ส่งการบ้าน (Homework Box)</h2>
            <p class="text-xs font-bold text-zinc-600">กรอกข้อมูลการบ้านและรับ +50 ⭐</p>
          </div>
          <form onsubmit="submitHw(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-black mb-1">ชื่องานการบ้าน *</label>
              <input id="hw-title" required class="w-full bg-[#FFFDF5] p-3 rounded-xl border-2 border-zinc-900" placeholder="เช่น การบ้านมอเตอร์ไฟฟ้า EV ม.3" />
            </div>
            <div>
              <label class="block text-xs font-black mb-1">รายละเอียดการบ้าน</label>
              <textarea id="hw-desc" class="w-full bg-[#FFFDF5] p-3 rounded-xl border-2 border-zinc-900" rows="3" placeholder="ระบุเนื้อหาหรือข้อความถึงครู..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-black mb-1">แนบลิงก์ผลงาน</label>
              <input id="hw-link" type="url" class="w-full bg-[#FFFDF5] p-2.5 rounded-xl border-2 border-zinc-900" placeholder="https://drive.google.com/..." />
            </div>
            <button type="submit" class="w-full py-3 bg-amber-400 sketch-btn rounded-xl font-black text-sm">
              📬 ส่งการบ้านเข้ากล่อง (+50 ⭐)
            </button>
          </form>
        </div>
      \`;
    }

    function submitHw(e) {
      e.preventDefault();
      userStars += 50;
      document.getElementById('star-counter').innerText = userStars + ' ดาว';
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      alert('🎉 ส่งการบ้านสำเร็จ! ได้รับ +50 ⭐');
      document.getElementById('hw-title').value = '';
      document.getElementById('hw-desc').value = '';
      document.getElementById('hw-link').value = '';
    }

    function renderReflection() {
      const container = document.getElementById('tab-content');
      container.innerHTML = \`
        <div class="space-y-6">
          <div class="bg-pink-100 sketch-border rounded-2xl p-5">
            <h2 class="text-xl font-black">💬 มุมสะท้อน (Reflection Corner)</h2>
            <p class="text-xs font-bold text-zinc-600">ข้อคิดเห็นของนักเรียนทุกคนช่วยพัฒนาคาบเรียนให้ดียิ่งขึ้น</p>
          </div>
          <div class="p-5 bg-amber-50 rounded-2xl border-2 border-zinc-900 space-y-3">
            <label class="block text-base font-black">ข้อ 1: นักเรียนสนุกกับกิจกรรมที่ครูจัดไหม? (คลิกเลือกดาว 1-5)</label>
            <div class="flex items-center gap-2 py-2" id="star-group">
              \${[1,2,3,4,5].map(i => \`
                <button onclick="setRating(\${i})" class="w-12 h-12 text-2xl sketch-btn rounded-xl \${i <= selectedRating ? 'bg-amber-400' : 'bg-zinc-100'}">⭐</button>
              \`).join('')}
            </div>
            <div class="text-sm font-black text-amber-900 bg-amber-200/70 p-2.5 rounded-xl border border-amber-400 inline-block">
              \${evalRatings[selectedRating - 1].emoji} \${evalRatings[selectedRating - 1].text}
            </div>
          </div>
          <div class="p-5 bg-emerald-50 rounded-2xl border-2 border-zinc-900 space-y-2">
            <label class="block text-base font-black">ข้อ 2: สิ่งที่อยากให้ครูปรับปรุง (Textarea)</label>
            <textarea id="improve-text" class="w-full bg-white p-3 rounded-xl border-2 border-zinc-900" rows="3" placeholder="เช่น อยากให้มีคลิปจำลอง 3D เพิ่มเติม..."></textarea>
          </div>
          <div class="p-5 bg-sky-50 rounded-2xl border-2 border-zinc-900 space-y-2">
            <label class="block text-base font-black">ข้อ 3: สิ่งที่อยากแนะนำครู (Textarea)</label>
            <textarea id="recommend-text" class="w-full bg-white p-3 rounded-xl border-2 border-zinc-900" rows="3" placeholder="เช่น ชอบกิจกรรมทดลองมากครับ ครูสอนสนุกมาก..."></textarea>
          </div>
          <button onclick="submitEvaluation()" class="w-full py-3.5 bg-amber-400 sketch-btn rounded-xl font-black text-base">
            📮 ส่งมุมสะท้อนคุณครู (รับ +20 ⭐)
          </button>
        </div>
      \`;
    }

    function setRating(r) {
      selectedRating = r;
      renderReflection();
    }

    function submitEvaluation() {
      userStars += 20;
      document.getElementById('star-counter').innerText = userStars + ' ดาว';
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      alert('🎉 ส่งมุมสะท้อนสำเร็จ! ได้รับ +20 ดาวสะสม');
    }

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('#tab-homework, #tab-quiz, #tab-scorebook, #tab-reflection').forEach(b => {
        b.className = 'px-4 py-2 bg-white sketch-btn rounded-xl font-bold text-sm';
      });
      document.getElementById('tab-' + tab).className = 'px-4 py-2 bg-amber-300 sketch-btn rounded-xl font-black text-sm';
      if (tab === 'homework') renderHomework();
      else if (tab === 'reflection') renderReflection();
      else if (tab === 'quiz') {
        document.getElementById('tab-content').innerHTML = '<div class="text-center py-10 space-y-3"><div class="text-4xl">🧪</div><h3 class="text-xl font-black">แบบทดสอบ 2 บทเรียน</h3><p class="text-xs text-zinc-600 font-bold">1. เทคโนโลยียานยนต์ไฟฟ้า (EV)<br/>2. ฟิสิกส์พื้นฐาน (กลศาสตร์)</p><p class="text-xs text-amber-800 font-bold bg-amber-100 p-2 rounded-xl inline-block">เปิดใช้งานข้อสอบครบ 20 ข้อในระบบหลัก</p></div>';
      } else if (tab === 'scorebook') {
        document.getElementById('tab-content').innerHTML = '<div class="text-center py-10 space-y-3"><div class="text-4xl">📖</div><h3 class="text-xl font-black">สมุดคะแนน & สติกเกอร์เกียรติยศ 6 ชิ้น</h3><p class="text-xs text-zinc-600 font-bold">บันทึกผลสอบ คะแนนการบ้าน และดาวสะสมของนักเรียน ม.3</p></div>';
      }
    }

    // Init
    renderHomework();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Homework_Box_M3_Single_File.html');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

