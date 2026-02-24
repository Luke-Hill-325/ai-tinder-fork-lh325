// app.js
// Plain global JS, no modules.

// -------------------
// Data generator
// -------------------
const TAGS = [
  "Coffee","Hiking","Movies","Live Music","Board Games","Cats","Dogs","Traveler",
  "Foodie","Tech","Art","Runner","Climbing","Books","Yoga","Photography"
];
const FIRST_NAMES = [
  "Alex","Sam","Jordan","Taylor","Casey","Avery","Riley","Morgan","Quinn","Cameron",
  "Jamie","Drew","Parker","Reese","Emerson","Rowan","Shawn","Harper","Skyler","Devon"
];
const CITIES = [
  "Brooklyn","Manhattan","Queens","Jersey City","Hoboken","Astoria",
  "Williamsburg","Bushwick","Harlem","Lower East Side"
];
const JOBS = [
  "Product Designer","Software Engineer","Data Analyst","Barista","Teacher",
  "Photographer","Architect","Chef","Nurse","Marketing Manager","UX Researcher"
];
const BIOS = [
  "Weekend hikes and weekday lattes.",
  "Dog parent. Amateur chef. Karaoke enthusiast.",
  "Trying every taco in the city — for science.",
  "Bookstore browser and movie quote machine.",
  "Gym sometimes, Netflix always.",
  "Looking for the best slice in town.",
  "Will beat you at Mario Kart.",
  "Currently planning the next trip."
];

const UNSPLASH_SEEDS = [
  "1515462277126-2b47b9fa09e6",
  "1520975916090-3105956dac38",
  "1519340241574-2cec6aef0c01",
  "1554151228-14d9def656e4",
  "1548142813-c348350df52b",
  "1517841905240-472988babdf9",
  "1535713875002-d1d0cf377fde",
  "1545996124-0501ebae84d0",
  "1524504388940-b1c1722653e1",
  "1531123897727-8f129e1688ce",
];

function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickTags() { return Array.from(new Set(Array.from({length:4}, ()=>sample(TAGS)))); }
function imgFor(seed) {
  return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=80`;
}

function generateProfiles(count = 12) {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push({
      id: `p_${i}_${Date.now().toString(36)}`,
      name: sample(FIRST_NAMES),
      age: 18 + Math.floor(Math.random() * 22),
      city: sample(CITIES),
      title: sample(JOBS),
      bio: sample(BIOS),
      tags: pickTags(),
      img: imgFor(sample(UNSPLASH_SEEDS)),
    });
  }
  return profiles;
}

// -------------------
// UI rendering
// -------------------
const deckEl = document.getElementById("deck");
const shuffleBtn = document.getElementById("shuffleBtn");
const likeBtn = document.getElementById("likeBtn");
const nopeBtn = document.getElementById("nopeBtn");
const superLikeBtn = document.getElementById("superLikeBtn");

let profiles = [];

// -------------------
// Swipe Logic
// -------------------
const SWIPE_THRESHOLD = 100; // pixels to trigger swipe
const SUPER_LIKE_THRESHOLD = 120; // pixels upward to trigger super like
const SUPER_LIKE_HORIZONTAL_LIMIT = 80; // limit horizontal movement for super like

let currentCard = null;
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

function getTopCard() {
  const cards = deckEl.querySelectorAll('.card:not(.swipe-left):not(.swipe-right):not(.swipe-up)');
  return cards.length > 0 ? cards[cards.length - 1] : null;
}

function createBadge(card, type) {
  if (card.querySelector(`.card__badge--${type}`)) return;
  
  const badge = document.createElement('div');
  badge.className = `card__badge card__badge--${type}`;
  
  if (type === 'like') badge.textContent = 'LIKE';
  else if (type === 'nope') badge.textContent = 'NOPE';
  else if (type === 'super') badge.textContent = 'SUPER LIKE';
  
  card.appendChild(badge);
  return badge;
}

function removeBadges(card) {
  const badges = card.querySelectorAll('.card__badge');
  badges.forEach(badge => badge.remove());
}

function updateBadgeVisibility(card, x, y) {
  const likeBadge = card.querySelector('.card__badge--like') || createBadge(card, 'like');
  const nopeBadge = card.querySelector('.card__badge--nope') || createBadge(card, 'nope');
  const superBadge = card.querySelector('.card__badge--super') || createBadge(card, 'super');
  
  // Calculate visibility based on position
  const xProgress = Math.abs(x) / SWIPE_THRESHOLD;
  const yProgress = Math.abs(y) / SUPER_LIKE_THRESHOLD;
  
  // Show like badge when swiping right
  if (x > 0 && likeBadge) {
    likeBadge.style.opacity = Math.min(xProgress, 1);
    likeBadge.style.transform = `scale(${0.8 + Math.min(xProgress, 1) * 0.2}) rotate(15deg)`;
  } else if (likeBadge) {
    likeBadge.style.opacity = 0;
  }
  
  // Show nope badge when swiping left
  if (x < 0 && nopeBadge) {
    nopeBadge.style.opacity = Math.min(xProgress, 1);
    nopeBadge.style.transform = `scale(${0.8 + Math.min(xProgress, 1) * 0.2}) rotate(-15deg)`;
  } else if (nopeBadge) {
    nopeBadge.style.opacity = 0;
  }
  
  // Show super like badge when swiping up (with limited horizontal movement)
  if (y < 0 && Math.abs(x) < SUPER_LIKE_HORIZONTAL_LIMIT && superBadge) {
    superBadge.style.opacity = Math.min(yProgress, 1);
    superBadge.style.transform = `translateX(-50%) scale(${0.8 + Math.min(yProgress, 1) * 0.2})`;
  } else if (superBadge) {
    superBadge.style.opacity = 0;
  }
}

function onDragStart(e) {
  if (isDragging) return;
  
  currentCard = getTopCard();
  if (!currentCard) return;
  
  isDragging = true;
  currentCard.classList.add('swiping');
  
  const point = e.type.includes('touch') ? e.touches[0] : e;
  startX = point.clientX;
  startY = point.clientY;
  currentX = 0;
  currentY = 0;
  
  // Prevent default to stop scrolling while swiping
  if (e.type.includes('touch')) {
    e.preventDefault();
  }
}

function onDragMove(e) {
  if (!isDragging || !currentCard) return;
  
  const point = e.type.includes('touch') ? e.touches[0] : e;
  currentX = point.clientX - startX;
  currentY = point.clientY - startY;
  
  // Add rotation based on horizontal movement
  const rotation = currentX * 0.05;
  
  // Apply transform
  currentCard.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
  
  // Update badge visibility
  updateBadgeVisibility(currentCard, currentX, currentY);
  
  if (e.type.includes('touch')) {
    e.preventDefault();
  }
}

function onDragEnd(e) {
  if (!isDragging || !currentCard) return;
  
  isDragging = false;
  currentCard.classList.remove('swiping');
  
  // Determine swipe action
  let action = null;
  
  // Check for super like first (upward swipe with limited horizontal movement)
  if (currentY < -SUPER_LIKE_THRESHOLD && Math.abs(currentX) < SUPER_LIKE_HORIZONTAL_LIMIT) {
    action = 'super';
  }
  // Then check for regular swipes
  else if (currentX > SWIPE_THRESHOLD) {
    action = 'like';
  } else if (currentX < -SWIPE_THRESHOLD) {
    action = 'nope';
  }
  
  if (action) {
    performSwipeAction(currentCard, action);
  } else {
    // Snap back if threshold not met
    currentCard.style.transform = '';
    removeBadges(currentCard);
  }
  
  currentCard = null;
}

function performSwipeAction(card, action) {
  // Remove badges before animation
  removeBadges(card);
  
  // Add animation class
  card.classList.add(`swipe-${action === 'super' ? 'up' : action === 'like' ? 'right' : 'left'}`);
  
  // Log action
  const profileName = card.querySelector('.card__title')?.textContent || 'Unknown';
  console.log(`${action === 'like' ? 'Like' : action === 'super' ? 'Super Like' : 'Nope'} on ${profileName}`);
  
  // Remove card from DOM after animation
  setTimeout(() => {
    card.remove();
    checkEmptyDeck();
  }, 500);
}

function checkEmptyDeck() {
  const remainingCards = deckEl.querySelectorAll('.card');
  if (remainingCards.length === 0) {
    showEmptyDeck();
  }
}

function showEmptyDeck() {
  const emptyMsg = document.createElement('div');
  emptyMsg.className = 'deck__empty';
  emptyMsg.innerHTML = `
    <div class="deck__empty-icon">🔥</div>
    <div class="deck__empty-text">No more profiles!</div>
    <div class="deck__empty-subtext">Click shuffle to see new people</div>
  `;
  deckEl.appendChild(emptyMsg);
}

function removeEmptyDeckMessage() {
  const emptyMsg = deckEl.querySelector('.deck__empty');
  if (emptyMsg) {
    emptyMsg.remove();
  }
}

// Attach swipe handlers to deck
deckEl.addEventListener('mousedown', onDragStart);
deckEl.addEventListener('touchstart', onDragStart, { passive: false });

document.addEventListener('mousemove', onDragMove);
document.addEventListener('touchmove', onDragMove, { passive: false });

document.addEventListener('mouseup', onDragEnd);
document.addEventListener('touchend', onDragEnd);

// Button handlers
likeBtn.addEventListener('click', () => {
  const card = getTopCard();
  if (card) performSwipeAction(card, 'like');
});

nopeBtn.addEventListener('click', () => {
  const card = getTopCard();
  if (card) performSwipeAction(card, 'nope');
});

superLikeBtn.addEventListener('click', () => {
  const card = getTopCard();
  if (card) performSwipeAction(card, 'super');
});

function renderDeck() {
  deckEl.setAttribute("aria-busy", "true");
  deckEl.innerHTML = "";

  profiles.forEach((p, idx) => {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "card__media";
    img.src = p.img;
    img.alt = `${p.name} — profile photo`;

    const body = document.createElement("div");
    body.className = "card__body";

    const titleRow = document.createElement("div");
    titleRow.className = "title-row";
    titleRow.innerHTML = `
      <h2 class="card__title">${p.name}</h2>
      <span class="card__age">${p.age}</span>
    `;

    const meta = document.createElement("div");
    meta.className = "card__meta";
    meta.textContent = `${p.title} • ${p.city}`;

    const chips = document.createElement("div");
    chips.className = "card__chips";
    p.tags.forEach((t) => {
      const c = document.createElement("span");
      c.className = "chip";
      c.textContent = t;
      chips.appendChild(c);
    });

    body.appendChild(titleRow);
    body.appendChild(meta);
    body.appendChild(chips);

    card.appendChild(img);
    card.appendChild(body);

    deckEl.appendChild(card);
  });

  deckEl.removeAttribute("aria-busy");
}

function resetDeck() {
  removeEmptyDeckMessage();
  profiles = generateProfiles(12);
  renderDeck();
}

shuffleBtn.addEventListener("click", resetDeck);

// Boot
resetDeck();
