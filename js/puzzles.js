/**
 * Aurelian Digsite — Puzzle interactions
 * Symbol matching + Glyph sequence (Lucide icons)
 */

import { icon, refreshIcons } from './icons.js';

const SYMBOL_PAIRS = [
  { id: 'sun', lucide: 'sun', label: 'Sun' },
  { id: 'moon', lucide: 'moon', label: 'Moon' },
  { id: 'star', lucide: 'star', label: 'Star' },
  { id: 'wave', lucide: 'waves', label: 'River' }
];

const GLYPH_ORDER = ['sun', 'river', 'star', 'moon', 'sun'];

const GLYPH_ICONS = {
  sun: 'sun',
  moon: 'moon',
  star: 'star',
  river: 'waves'
};

let symbolSelected = null;
let symbolMatched = new Set();
let glyphSequence = [];

export function initSymbolMatching(container, onComplete) {
  symbolSelected = null;
  symbolMatched = new Set();
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'puzzle-symbol-grid';
  grid.setAttribute('role', 'group');
  grid.setAttribute('aria-label', 'Symbol matching puzzle');

  const cards = [];
  SYMBOL_PAIRS.forEach(({ id, lucide, label }) => {
    [0, 1].forEach(() => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'puzzle-symbol-card';
      card.dataset.pairId = id;
      card.dataset.matched = 'false';
      card.innerHTML = `<span class="puzzle-symbol">${icon(lucide)}</span><span class="sr-only">${label}</span>`;
      card.addEventListener('click', () => handleSymbolClick(card, onComplete));
      cards.push(card);
    });
  });

  shuffleArray(cards).forEach((card, i) => {
    grid.appendChild(card);
    card.style.order = i;
  });

  container.appendChild(grid);

  const feedback = document.createElement('p');
  feedback.className = 'puzzle-feedback';
  feedback.id = 'symbol-feedback';
  feedback.textContent = 'Find matching pairs of Aurelian symbols.';
  container.appendChild(feedback);

  refreshIcons(container);
}

function handleSymbolClick(card, onComplete) {
  if (card.dataset.matched === 'true' || card.classList.contains('puzzle-flipped')) return;

  card.classList.add('puzzle-flipped');

  if (!symbolSelected) {
    symbolSelected = card;
    return;
  }

  if (symbolSelected === card) {
    card.classList.remove('puzzle-flipped');
    symbolSelected = null;
    return;
  }

  const feedback = document.getElementById('symbol-feedback');

  if (symbolSelected.dataset.pairId === card.dataset.pairId) {
    symbolSelected.dataset.matched = 'true';
    card.dataset.matched = 'true';
    symbolSelected.classList.add('puzzle-matched');
    card.classList.add('puzzle-matched');
    symbolMatched.add(card.dataset.pairId);
    feedback.textContent = 'Match found! Continue searching for pairs.';
    feedback.className = 'puzzle-feedback puzzle-feedback--success';

    if (symbolMatched.size === SYMBOL_PAIRS.length) {
      feedback.textContent = 'All symbols matched! Layer 2 is now accessible.';
      setTimeout(() => onComplete(), 800);
    }
  } else {
    feedback.textContent = 'Those symbols do not match. Try again.';
    feedback.className = 'puzzle-feedback puzzle-feedback--error';
    const first = symbolSelected;
    symbolSelected = null;
    setTimeout(() => {
      first.classList.remove('puzzle-flipped');
      card.classList.remove('puzzle-flipped');
    }, 700);
  }

  symbolSelected = null;
}

export function initGlyphSequence(container, onComplete) {
  glyphSequence = [];
  container.innerHTML = '';

  const instruction = document.createElement('p');
  instruction.className = 'puzzle-instruction';
  instruction.innerHTML = `${icon('info', 'icon--sm')} Tap the glyphs in ritual order: Sun → River → Star → Moon → Sun`;
  container.appendChild(instruction);

  const slots = document.createElement('div');
  slots.className = 'puzzle-glyph-slots';
  slots.setAttribute('aria-label', 'Glyph sequence slots');

  for (let i = 0; i < GLYPH_ORDER.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'puzzle-glyph-slot';
    slot.dataset.index = i;
    slots.appendChild(slot);
  }
  container.appendChild(slots);

  const options = document.createElement('div');
  options.className = 'puzzle-glyph-options';
  options.setAttribute('role', 'group');
  options.setAttribute('aria-label', 'Available glyphs');

  Object.entries(GLYPH_ICONS).forEach(([id, lucideName]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'puzzle-glyph-btn';
    btn.dataset.glyphId = id;
    btn.innerHTML = `${icon(lucideName)}<span class="sr-only">${id}</span>`;
    btn.addEventListener('click', () => handleGlyphClick(btn, slots, container, onComplete));
    options.appendChild(btn);
  });
  container.appendChild(options);

  const feedback = document.createElement('p');
  feedback.className = 'puzzle-feedback';
  feedback.id = 'glyph-feedback';
  feedback.textContent = 'Enter the sacred sequence to unlock the temple chamber.';
  container.appendChild(feedback);

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn btn--secondary puzzle-reset-btn';
  resetBtn.innerHTML = `${icon('rotate-ccw', 'icon--sm')} Reset Sequence`;
  resetBtn.addEventListener('click', () => {
    glyphSequence = [];
    slots.querySelectorAll('.puzzle-glyph-slot').forEach(s => {
      s.innerHTML = '';
      s.classList.remove('filled');
    });
    feedback.textContent = 'Sequence reset. Try again.';
    feedback.className = 'puzzle-feedback';
  });
  container.appendChild(resetBtn);

  refreshIcons(container);
}

function handleGlyphClick(btn, slots, container, onComplete) {
  if (glyphSequence.length >= GLYPH_ORDER.length) return;

  const expected = GLYPH_ORDER[glyphSequence.length];
  const chosen = btn.dataset.glyphId;
  const feedback = container.querySelector('#glyph-feedback');
  const slotEls = slots.querySelectorAll('.puzzle-glyph-slot');
  const currentSlot = slotEls[glyphSequence.length];

  if (chosen !== expected) {
    feedback.textContent = 'Incorrect glyph. The ritual sequence must restart.';
    feedback.className = 'puzzle-feedback puzzle-feedback--error';
    glyphSequence = [];
    slotEls.forEach(s => {
      s.innerHTML = '';
      s.classList.remove('filled');
    });
    return;
  }

  glyphSequence.push(chosen);
  currentSlot.innerHTML = icon(GLYPH_ICONS[chosen]);
  currentSlot.classList.add('filled');
  refreshIcons(currentSlot);
  feedback.textContent = `Correct! ${glyphSequence.length} of ${GLYPH_ORDER.length} glyphs entered.`;
  feedback.className = 'puzzle-feedback puzzle-feedback--success';

  if (glyphSequence.length === GLYPH_ORDER.length) {
    feedback.textContent = 'The temple chamber opens! Layer 3 is now accessible.';
    setTimeout(() => onComplete(), 800);
  }
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
