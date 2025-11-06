// Smooth scroll to invitation
document.getElementById('scrollBtn').addEventListener('click', () => {
  document.getElementById('invitation').scrollIntoView({ behavior: 'smooth' });
});

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Parallax effect for hero background
window.addEventListener('scroll', () => {
  const y = window.scrollY * 0.3;
  document.querySelector('.parallax')?.style.setProperty('background-position', `center ${-y}px`);
});

// Music player với playlist
const music = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');
const musicTitle = document.getElementById('musicTitle');
const musicIndex = document.getElementById('musicIndex');

// Playlist - thêm các bài hát vào đây
const playlist = [
  { title: 'Cưới Anh Đi', src: './sounds/cuoi_anh_di.mp3' },
  { title: 'Đoạn kết', src: './sounds/doan_ket_happy_ending.mp3' },
  { title: 'Lễ Đường', src: './sounds/le_duong.mp3' },
  { title: 'Vạn vật như muốn ta bên nhau', src: './sounds/van_vat_nhu_muon_ta_ben_nhau.mp3' },
  { title: 'Một Nhà', src: './sounds/mot_nha.mp3' },
  // Thêm các bài hát khác vào đây, ví dụ:
  // { title: 'Bài Hát 3', src: './sounds/bai_hat_3.mp3' },
];

let currentTrack = 0;
let musicOn = false;

// Load bài hát vào audio element
function loadTrack(index) {
  if (playlist.length === 0) return;
  currentTrack = (index + playlist.length) % playlist.length;
  const track = playlist[currentTrack];
  music.src = track.src;
  musicTitle.textContent = track.title;
  musicIndex.textContent = `${currentTrack + 1} / ${playlist.length}`;
  
  // Nếu đang phát, tiếp tục phát bài mới
  if (musicOn) {
    music.play().catch(err => console.warn('Auto-play prevented:', err));
  }
}

// Toggle expanded state
const musicPlayer = document.querySelector('.music-player');
let isExpanded = false;

// Click vào nền của player để expand/collapse
musicPlayer.addEventListener('click', (e) => {
  // Nếu click vào các nút điều khiển, không toggle expand
  if (e.target.closest('.music-btn')) {
    return;
  }
  // Toggle expand state
  isExpanded = !isExpanded;
  musicPlayer.classList.toggle('expanded', isExpanded);
});

// Đóng khi click outside
document.addEventListener('click', (e) => {
  if (isExpanded && !musicPlayer.contains(e.target)) {
    isExpanded = false;
    musicPlayer.classList.remove('expanded');
  }
});

// Cập nhật UI
function setMusicUI() {
  if (musicOn) {
    musicToggle.classList.add('playing');
    musicToggle.classList.remove('paused');
  } else {
    musicToggle.classList.remove('playing');
    musicToggle.classList.add('paused');
  }
}

// Khởi tạo
if (playlist.length > 0) {
  loadTrack(0);
  setMusicUI();
} else {
  musicTitle.textContent = 'Chưa có nhạc';
  musicIndex.textContent = '0 / 0';
  musicPrev.disabled = true;
  musicNext.disabled = true;
  musicToggle.disabled = true;
}

// Xử lý khi bài hát kết thúc, tự chuyển bài tiếp
music.addEventListener('ended', () => {
  if (playlist.length > 1) {
    nextTrack();
  }
});

// Toggle play/pause
musicToggle.addEventListener('click', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (playlist.length === 0) return;
  
  // Nếu chưa expand, expand player trước
  if (!isExpanded) {
    isExpanded = true;
    musicPlayer.classList.add('expanded');
  }
  
  musicOn = !musicOn;
  setMusicUI();
  try {
    if (musicOn) {
      await music.play();
    } else {
      music.pause();
    }
  } catch (err) {
    console.warn('Music toggle error:', err);
    musicOn = !musicOn;
    setMusicUI();
  }
});

// Previous track
function prevTrack() {
  if (playlist.length === 0) return;
  loadTrack(currentTrack - 1);
  setMusicUI();
}

musicPrev.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  prevTrack();
});

// Next track
function nextTrack() {
  if (playlist.length === 0) return;
  loadTrack(currentTrack + 1);
  setMusicUI();
}

musicNext.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  nextTrack();
});

// Wishes (localStorage)
const wishForm = document.getElementById('wishForm');
const wishList = document.getElementById('wishList');

function loadWishes() {
  const raw = localStorage.getItem('wishes') || '[]';
  try { return JSON.parse(raw); } catch { return []; }
}

function saveWishes(items) {
  localStorage.setItem('wishes', JSON.stringify(items));
}

function renderWishes() {
  const items = loadWishes();
  wishList.innerHTML = '';
  items.forEach((w, idx) => {
    const li = document.createElement('li');
    li.className = 'wish-item card';
    li.innerHTML = `
      <div class="meta"><strong>${escapeHtml(w.name)}</strong>
      <button class="remove" data-idx="${idx}">Xóa</button></div>
      <div>${escapeHtml(w.message)}</div>
    `;
    wishList.appendChild(li);
  });
}

wishList.addEventListener('click', (e) => {
  const btn = e.target.closest('.remove');
  if (!btn) return;
  const idx = parseInt(btn.dataset.idx, 10);
  const items = loadWishes();
  items.splice(idx, 1);
  saveWishes(items);
  renderWishes();
});

wishForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();
  if (!name || !message) return;
  const items = loadWishes();
  items.unshift({ name, message, at: Date.now() });
  saveWishes(items);
  wishForm.reset();
  renderWishes();
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

renderWishes();

// Countdown
const targetDate = new Date('2025-12-21T10:30:00+07:00'); // chỉnh theo lịch của bạn
function tick() {
  const now = new Date();
  let diff = Math.max(0, targetDate - now);
  const d = Math.floor(diff / (1000*60*60*24)); diff -= d*24*60*60*1000;
  const h = Math.floor(diff / (1000*60*60)); diff -= h*60*60*1000;
  const m = Math.floor(diff / (1000*60)); diff -= m*60*1000;
  const s = Math.floor(diff / 1000);
  setText('cdDays', d);
  setText('cdHours', h);
  setText('cdMinutes', m);
  setText('cdSeconds', s);
}
function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2,'0'); }
tick();
setInterval(tick, 1000);

// Falling hearts effect
(function hearts() {
  const canvas = document.getElementById('hearts-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  }
  resize(); window.addEventListener('resize', resize);

  function createParticle() {
    const size = Math.random() * 10 + 6;
    return {
      x: Math.random() * canvas.width,
      y: -20,
      size,
      speed: Math.random() * 0.8 + 0.6,
      sway: Math.random() * 0.6 + 0.2,
      swayDir: Math.random() > 0.5 ? 1 : -1,
      rot: Math.random() * Math.PI,
      // xoay nhẹ hơn
      rotSpeed: (Math.random() - 0.5) * 0.1,
      color: `rgba(220, 80, 120, ${Math.random()*0.6+0.4})`
    };
  }

  function drawHeart(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s/20, s/20);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.bezierCurveTo(8, -16, 22, -4, 0, 14);
    ctx.bezierCurveTo(-22, -4, -8, -16, 0, -6);
    ctx.fillStyle = color; ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // thưa hơn: giảm số lượng tối đa xuống 40
    if (particles.length < 120) {
      particles.push(createParticle());
    }
    particles = particles.filter(p => {
      p.y += p.speed;
      p.x += Math.sin(p.y * 0.02) * p.sway * p.swayDir;
      p.rot += p.rotSpeed;
      drawHeart(p.x, p.y, p.size, p.rot, p.color);
      return p.y < canvas.height + 20;
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// Music initialized - user clicks to play

// Masonry gallery + lightbox
(function gallery() {
  // Danh sách ảnh: đặt file vào ./images/gallery/ và cập nhật mảng này
  const images = [
    'images/gallery/1.jpg',
    'images/gallery/2.jpg',
    'images/gallery/3.jpg',
    'images/gallery/4.jpg',
    'images/gallery/5.jpg',
    'images/gallery/6.jpg',
    'images/gallery/7.jpg',
    'images/gallery/8.jpg',
    'images/gallery/9.jpg',
    'images/gallery/10.jpg'
  ];

  const wrap = document.getElementById('masonry');
  if (!wrap) return;
  let current = 0;

  function render() {
    wrap.innerHTML = '';
    images.forEach((src, idx) => {
      const a = document.createElement('a');
      a.href = src; a.className = 'masonry-item'; a.dataset.idx = idx;
      const img = document.createElement('img'); img.src = src; img.alt = `Ảnh ${idx+1}`;
      a.appendChild(img);
      wrap.appendChild(a);
    });
  }

  // Lightbox handlers
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImage');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  function open(idx) { current = idx; lbImg.src = images[current]; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); }
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); }
  function prev() { current = (current - 1 + images.length) % images.length; lbImg.src = images[current]; }
  function next() { current = (current + 1) % images.length; lbImg.src = images[current]; }

  wrap.addEventListener('click', (e) => {
    const a = e.target.closest('a.masonry-item');
    if (!a) return;
    e.preventDefault();
    open(parseInt(a.dataset.idx, 10));
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  render();
})();

// Copy helpers for QR section
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const sel = btn.getAttribute('data-copy');
  const el = document.querySelector(sel);
  if (!el) return;
  try {
    await navigator.clipboard.writeText(el.textContent.trim());
    btn.textContent = 'Đã copy!';
    setTimeout(() => (btn.textContent = 'Copy Số TK'), 1400);
  } catch (_) {
    // fallback
    const rng = document.createRange(); rng.selectNodeContents(el);
    const selObj = window.getSelection(); selObj.removeAllRanges(); selObj.addRange(rng);
    document.execCommand('copy'); selObj.removeAllRanges();
    btn.textContent = 'Đã copy!'; setTimeout(() => (btn.textContent = 'Copy Số TK'), 1400);
  }
});


