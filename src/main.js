import './style.css';

// ============================================================
// DATA — 15 questions, 5 per style
// ============================================================
const questions = [
  // --- MODERN (5) ---
  { id: 1,  style: 'modern',        src: '/assets/modern_1.png',        alt: 'Sleek modern living room with floor-to-ceiling windows and concrete floors' },
  { id: 2,  style: 'modern',        src: '/assets/modern_2.png',        alt: 'Minimalist black handleless kitchen with marble waterfall island' },
  { id: 3,  style: 'modern',        src: '/assets/modern_3.png',        alt: 'Modern dark bedroom with floating beds and LED strip lighting' },
  { id: 4,  style: 'modern',        src: '/assets/modern_4.png',        alt: 'Minimalist home office with floating desk and city view' },
  { id: 5,  style: 'modern',        src: '/assets/modern_5.png',        alt: 'Modern spa bathroom with freestanding sculptural bathtub' },

  // --- CONTEMPORARY (5) ---
  { id: 6,  style: 'contemporary',  src: '/assets/contemporary_1.png',  alt: 'Contemporary living room with organic curved sofa and travertine coffee table' },
  { id: 7,  style: 'contemporary',  src: '/assets/contemporary_2.png',  alt: 'Contemporary dining room with walnut table and dramatic pendant light' },
  { id: 8,  style: 'contemporary',  src: '/assets/contemporary_3.png',  alt: 'Contemporary bedroom with layered linen textiles and live-edge shelving' },
  { id: 9,  style: 'contemporary',  src: '/assets/contemporary_4.png',  alt: 'Open-plan kitchen with warm oak cabinetry and sage green accents' },
  { id: 10, style: 'contemporary',  src: '/assets/contemporary_5.png',  alt: 'Sunlit reading nook with curved mustard armchair and brass bookshelves' },

  // --- CLASSIC (5) ---
  { id: 11, style: 'classic',       src: '/assets/classic_1.png',       alt: 'Grand traditional sitting room with marble fireplace and green velvet Chesterfield' },
  { id: 12, style: 'classic',       src: '/assets/classic_2.png',       alt: 'Classic library with mahogany bookshelves and leather tufted armchair' },
  { id: 13, style: 'classic',       src: '/assets/classic_3.png',       alt: 'Formal traditional dining room with crystal chandelier and navy wainscoting' },
  { id: 14, style: 'classic',       src: '/assets/classic_4.png',       alt: 'Traditional four-poster canopy bedroom with floral wallpaper and porcelain lamps' },
  { id: 15, style: 'classic',       src: '/assets/classic_5.png',       alt: 'Elegant hallway with marble tile floor, gilded mirror and grand staircase' },
];

// Shuffle so styles don't appear in blocks
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================
// RESULTS DATA
// ============================================================
const results = {
  modern: {
    title: 'Modern',
    titleClass: 'modern-title',
    description: 'Defined by architectural precision and a masterful use of raw materials. Your aesthetic is one of deliberate restraint—where clean lines, structural geometry, and curated minimalism create a space that is as bold as it is serene.',
    bg: '/assets/result_modern.png',
  },
  contemporary: {
    title: 'Contemporary',
    titleClass: 'contemporary-title',
    description: 'An effortless blend of soft organic forms and sophisticated warmth. You appreciate the harmony of the "now"—where natural textures meet curated curves and a subtle, layered palette to create environments that feel alive and inherently inviting.',
    bg: '/assets/result_contemporary.png',
  },
  classic: {
    title: 'Classic',
    titleClass: 'classic-title',
    description: 'A celebration of enduring elegance and refined craftsmanship. Your home is a narrative of heritage—where rich textures, grand proportions, and meticulous detail are woven together to create a timeless sanctuary of beauty and grace.',
    bg: '/assets/result_classic.png',
  },
};

// ============================================================
// STATE
// ============================================================
let deck = [];
let currentIndex = 0;
let scores = { modern: 0, contemporary: 0, classic: 0 };
let isAnimating = false;

// Touch state
let startX = 0;
let startY = 0;
let moveX = 0;
let moveY = 0;
let isDragging = false;

// ============================================================
// DOM REFS
// ============================================================
const welcomeScreen  = document.getElementById('welcome-screen');
const introScreen    = document.getElementById('intro-screen');
const quizScreen     = document.getElementById('quiz-screen');
const resultScreen   = document.getElementById('result-screen');
const startBtn       = document.getElementById('start-btn');
const introContinueBtn = document.getElementById('intro-continue-btn');
const restartBtn     = document.getElementById('restart-btn');
const noBtn          = document.getElementById('no-btn');
const yesBtn         = document.getElementById('yes-btn');
const card           = document.getElementById('card');
const cardImg        = document.getElementById('card-img');
const progressFill   = document.getElementById('progress-fill');
const progressLabel  = document.getElementById('progress-label');
const resultBg       = document.getElementById('result-bg');
const resultTitle    = document.getElementById('result-title');
const resultDesc     = document.getElementById('result-description');
const resultScores   = document.getElementById('result-scores');

// ============================================================
// HELPERS
// ============================================================
function showScreen(screen) {
  [welcomeScreen, introScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function setProgress(index) {
  const total = deck.length;
  const pct = (index / total) * 100;
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${index + 1} / ${total}`;
}

function loadCard(index) {
  const q = deck[index];
  cardImg.src = q.src;
  cardImg.alt = q.alt;
  setProgress(index);

  card.classList.remove('swipe-right', 'swipe-left', 'enter');
  card.style.opacity = '1';
  // Force reflow to restart animation
  void card.offsetWidth;
  card.classList.add('enter');
}

function vote(liked) {
  if (isAnimating) return;
  isAnimating = true;

  const q = deck[currentIndex];

  if (liked) {
    scores[q.style]++;
    card.classList.add('swipe-right');
  } else {
    card.classList.add('swipe-left');
  }

  setTimeout(() => {
    currentIndex++;
    isAnimating = false;

    // Reset card style for next card
    card.style.transform = '';
    card.style.transition = '';

    if (currentIndex >= deck.length) {
      showResult();
    } else {
      loadCard(currentIndex);
    }
  }, 420);
}

function showResult() {
  // Determine winner
  const winner = Object.entries(scores).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  const data = results[winner];

  // Update result background
  resultBg.style.backgroundImage = `url('${data.bg}')`;

  // Update text
  resultTitle.textContent = data.title;
  resultTitle.className = `result-title ${data.titleClass}`;
  resultDesc.textContent = data.description;

  // Score breakdown
  resultScores.innerHTML = Object.entries(scores).map(([style, count]) => `
    <div class="score-item">
      <span class="score-style ${style}">${style}</span>
      <span class="score-val">${count}</span>
      <span class="score-label">Selection${count !== 1 ? 's' : ''}</span>
    </div>
  `).join('');

  showScreen(resultScreen);
  progressLabel.textContent = `${deck.length} / ${deck.length}`;
  progressFill.style.width = '100%';
}

function initQuiz() {
  scores = { modern: 0, contemporary: 0, classic: 0 };
  currentIndex = 0;
  isAnimating = false;
  deck = shuffle(questions);
  loadCard(0);
  showScreen(quizScreen);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
startBtn.addEventListener('click', () => showScreen(introScreen));
introContinueBtn.addEventListener('click', initQuiz);
restartBtn.addEventListener('click', () => showScreen(introScreen));

noBtn.addEventListener('click', () => vote(false));
yesBtn.addEventListener('click', () => vote(true));

// Keyboard shortcuts
// TOUCH / SWIPE LOGIC
// ============================================================
card.addEventListener('touchstart', (e) => {
  if (isAnimating) return;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
  isDragging = true;
  card.style.transition = 'none';
}, { passive: true });

card.addEventListener('touchmove', (e) => {
  if (!isDragging || isAnimating) return;
  
  moveX = e.touches[0].clientX - startX;
  moveY = e.touches[0].clientY - startY;
  
  const rotation = moveX / 10;
  card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;
}, { passive: true });

card.addEventListener('touchend', () => {
  if (!isDragging || isAnimating) return;
  isDragging = false;

  const threshold = 120;
  if (Math.abs(moveX) > threshold) {
    // Fly away from current position
    const flyX = moveX > 0 ? 1000 : -1000;
    const flyY = moveY * 2;
    card.style.transition = 'transform 0.4s ease-in, opacity 0.4s';
    card.style.transform = `translate(${flyX}px, ${flyY}px) rotate(${moveX / 5}deg)`;
    card.style.opacity = '0';
    
    // Trigger vote logic without the class-based animation jump
    vote(moveX > 0);
  } else {
    // Snap back
    card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    card.style.transform = '';
    card.style.opacity = '1';
  }
  
  // Reset move state
  moveX = 0;
  moveY = 0;
});
