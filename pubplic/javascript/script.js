const API_BASE = 'http://localhost:4000';
let lanternMessages = [];
let lastXPositions = []; 

function formatTextByWords(text, wordsPerLine = 2) {
  const words = text.trim().split(/\s+/);
  let lines = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }

  return lines.join("\n");
}

function spawnLantern(text) {
  const layer = document.getElementById('lantern-layer');
  if (!layer) return;

  const lantern = document.createElement('div');
  lantern.className = 'lantern';

  const msgBox = document.createElement('div');
  msgBox.className = 'lantern-text';
  msgBox.textContent = formatTextByWords(text, 3);

  lantern.appendChild(msgBox);
  layer.appendChild(lantern);


  let candidateX = Math.random() * 100;

  const MIN_DISTANCE = 12;
  let tries = 0;

  while (tries < 10) {
    const tooClose = lastXPositions.some(
      (x) => Math.abs(x - candidateX) < MIN_DISTANCE
    );
    if (!tooClose) break;
    candidateX = Math.random() * 100;
    tries++;
  }

  lantern.style.left = candidateX + 'vw';

  // เก็บตำแหน่งล่าสุด (จำแค่ 4 อันพอ)
  lastXPositions.push(candidateX);
  if (lastXPositions.length > 4) {
    lastXPositions.shift();
  }

  // ------- animation timing -------
  const duration = 14 + Math.random() * 10; // 14–24 วินาที
  const delay = Math.random() * 1;          // ดีเลย์เล็กน้อย 0–1 วินาที
  const drift = (Math.random() - 0.5) * 80; // ซ้ายขวาเบา ๆ

  lantern.style.setProperty('--duration', duration + 's');
  lantern.style.setProperty('--delay', delay + 's');
  lantern.style.setProperty('--drift', drift + 'px');

  requestAnimationFrame(() => {
    lantern.classList.add('float-up');
  });

  lantern.addEventListener('animationend', () => {
    lantern.remove();
  });
}

// ส่งข้อความ + เซฟ DB + spawn โคมใหม่ทันที
async function submitLantern(event) {
  event.preventDefault();

  const input = document.getElementById('wish-input');
  const text = input.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_BASE}/api/lanterns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    if (!res.ok) {
      console.error('Error from API:', await res.text());
      return;
    }

    const data = await res.json();
    console.log('saved:', data);

    // ปล่อยโคมใบใหม่
    spawnLantern(data.message);

    // เก็บข้อความไว้ใช้ในลูปอนาคต
    lanternMessages.push(data.message);

    input.value = '';
  } catch (err) {
    console.error('failed to post lantern:', err);
  }
}

async function initLanterns() {
  try {
    const res = await fetch(`${API_BASE}/api/lanterns`);
    if (!res.ok) {
      console.error('Error fetching lanterns:', await res.text());
      return;
    }

    const items = await res.json();
    lanternMessages = items.map((item) => item.message);

    console.log('loaded messages:', lanternMessages);

    // ปล่อยโคมชุดแรก 3–5 อันแบบเรียง ๆ ก่อน
    lanternMessages.slice(0, 5).forEach((msg, index) => {
      setTimeout(() => spawnLantern(msg), index * 700);
    });

    // จากนั้นเริ่มลูปปล่อยเรื่อย ๆ
    if (lanternMessages.length > 0) {
      startLanternLoop();
    }
  } catch (err) {
    console.error('failed to load lanterns:', err);
  }
}

// ลูปสุ่มปล่อยโคมเรื่อย ๆ
function startLanternLoop() {
  function loop() {
    if (lanternMessages.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * lanternMessages.length);
    const msg = lanternMessages[randomIndex];

    spawnLantern(msg);

    const delay = 2000 + Math.random() * 1000; // 2000–3000 ms
    setTimeout(loop, delay);
  }

  loop();
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('wish-form');
  if (form) {
    form.addEventListener('submit', submitLantern);
  }

  initLanterns();
});
