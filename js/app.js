/**
 * Aurelian Digsite — Main application controller
 */

import { ARTIFACTS, ACHIEVEMENTS, PUZZLES, STAGES, CIVILIZATION_INTRO } from './data.js';
import {
  loadState,
  saveState,
  resetProgress,
  getProgressPercentage,
  getReconstructionState,
  isStageUnlocked
} from './storage.js';
import { initSymbolMatching, initGlyphSequence } from './puzzles.js';
import { icon, refreshIcons } from './icons.js';

let state = loadState();
let currentView = 'landing';
let currentStage = 1;
let selectedArtifactId = null;
/** Session-only: true after "Begin Excavation" — not saved to localStorage */
let appVisible = false;

const els = {};

function artifactImageFallback(src) {
  return src.replace(/\.png(\?.*)?$/i, '.svg');
}

function setArtifactImage(img, src) {
  if (!img) return;
  img.onerror = () => {
    img.onerror = null;
    img.src = artifactImageFallback(src);
  };
  img.src = src;
}

export function initApp() {
  cacheElements();
  bindEvents();
  appVisible = false;
  showLandingPage();
  renderAll();
  refreshIcons();
}

function cacheElements() {
  els.app = document.getElementById('app');
  els.landing = document.getElementById('landing-page');
  els.main = document.getElementById('view-main');
  els.navLinks = document.querySelectorAll('[data-nav]');
  els.stageTabs = document.querySelectorAll('[data-stage]');
  els.layerDisplay = document.getElementById('layer-display');
  els.discoveriesDisplay = document.getElementById('discoveries-display');
  els.journalGrid = document.getElementById('journal-grid');
  els.journalProgress = document.getElementById('journal-progress');
  els.achievementsGrid = document.getElementById('achievements-grid');
  els.reconstructionView = document.getElementById('reconstruction-scene');
  els.reconstructionLabel = document.getElementById('reconstruction-label');
  els.reconstructionDesc = document.getElementById('reconstruction-desc');
  els.reconstructionCount = document.getElementById('reconstruction-artifact-count');
  els.reconstructionBadge = document.getElementById('recon-state-badge');
  els.reconstructionLegend = document.querySelectorAll('.legend-item[data-state]');
  els.discoveryModal = document.getElementById('discovery-modal');
  els.modalClose = document.getElementById('modal-close');
  els.mobileMenuBtn = document.getElementById('mobile-menu-btn');
  els.sidebar = document.getElementById('sidebar');
  els.sidebarOverlay = document.getElementById('sidebar-overlay');
  els.resetBtn = document.getElementById('reset-progress-btn');
  els.beginBtn = document.getElementById('begin-excavation');
  els.excavationNextWrap = document.getElementById('excavation-next-wrap');
  els.excavationNextBtn = document.getElementById('excavation-next-btn');
  els.excavationNextLabel = document.getElementById('excavation-next-label');
  els.artifactsGrid = document.getElementById('artifacts-grid');
  els.artifactDetailPanel = document.getElementById('artifact-detail-panel');
  els.archiveList = document.getElementById('archive-list');
  els.previewPanels = {
    1: document.getElementById('artifact-preview-1'),
    2: document.getElementById('artifact-preview-2'),
    3: document.getElementById('artifact-preview-3')
  };
  els.puzzleContainers = {
    'symbol-matching': document.getElementById('puzzle-symbol-matching'),
    'glyph-sequence': document.getElementById('puzzle-glyph-sequence')
  };
  els.stageContainers = {
    1: document.getElementById('excavation-stage-1'),
    2: document.getElementById('excavation-stage-2'),
    3: document.getElementById('excavation-stage-3')
  };
}

function bindEvents() {
  els.beginBtn?.addEventListener('click', startExcavation);

  els.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.nav;
      navigateTo(view);
      closeMobileMenu();
    });
  });

  els.stageTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const stage = parseInt(tab.dataset.stage, 10);
      if (isStageUnlocked(stage, state)) {
        switchStage(stage);
      } else {
        showStageLockedMessage(stage);
      }
    });
  });

  els.modalClose?.addEventListener('click', closeDiscoveryModal);
  els.discoveryModal?.addEventListener('click', (e) => {
    if (e.target === els.discoveryModal) closeDiscoveryModal();
  });

  els.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  els.sidebarOverlay?.addEventListener('click', closeMobileMenu);

  els.excavationNextBtn?.addEventListener('click', () => {
    navigateTo('puzzles');
    closeMobileMenu();
  });

  els.resetBtn?.addEventListener('click', () => {
    if (confirm('Reset all excavation progress? This cannot be undone.')) {
      state = resetProgress();
      currentStage = 1;
      currentView = 'landing';
      selectedArtifactId = null;
      appVisible = false;
      renderAll();
      showLandingPage();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDiscoveryModal();
      closeMobileMenu();
    }
  });
}

function startExcavation() {
  appVisible = true;
  showMainApp();
  switchStage(currentStage);
  navigateTo('dig-site');
  refreshIcons(els.main);
  animateEntrance();
}

/** Toggle landing vs main app — matches #landing-page + #view-main in HTML */
function showMainApp() {
  els.landing?.classList.add('hidden');
  els.main?.classList.remove('hidden');
  document.body.classList.remove('landing-active');
}

function showLandingPage() {
  els.landing?.classList.remove('hidden');
  els.main?.classList.add('hidden');
  document.body.classList.add('landing-active');
  closeMobileMenu();
  closeDiscoveryModal();
}

function syncLandingView() {
  if (appVisible) {
    showMainApp();
    if (currentView === 'landing') currentView = 'dig-site';
    navigateTo(currentView);
  } else {
    showLandingPage();
  }
}

function navigateTo(view) {
  currentView = view;
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.view === view);
  });
  els.navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.nav === view);
    link.setAttribute('aria-current', link.dataset.nav === view ? 'page' : 'false');
  });

  if (view === 'puzzles') initPuzzles();
  if (view === 'reconstruction') updateReconstruction();
  if (view === 'artifacts') renderArtifacts();
  if (view === 'archive') renderArchive();
  refreshIcons(els.main);
}

function switchStage(stage) {
  currentStage = stage;
  if (!state.visitedStages.includes(stage)) {
    state.visitedStages.push(stage);
    saveState(state);
  }
  els.stageTabs.forEach(tab => {
    tab.classList.toggle('active', parseInt(tab.dataset.stage, 10) === stage);
    tab.classList.toggle('locked', !isStageUnlocked(parseInt(tab.dataset.stage, 10), state));
  });
  Object.entries(els.stageContainers).forEach(([id, container]) => {
    if (container) container.classList.toggle('active', parseInt(id, 10) === stage);
  });
  if (els.layerDisplay) els.layerDisplay.textContent = stage;
  renderDigSpots(stage);
  updateExcavationNext();
}

function getStagePuzzleId(stage) {
  if (stage === 1) return 'symbol-matching';
  if (stage === 2) return 'glyph-sequence';
  return null;
}

function isStageFullyExcavated(stage) {
  return ARTIFACTS.filter(a => a.stage === stage).every(a => state.discoveredArtifacts.includes(a.id));
}

function updateExcavationNext() {
  const puzzleId = getStagePuzzleId(currentStage);
  const show = puzzleId
    && isStageFullyExcavated(currentStage)
    && !state.completedPuzzles.includes(puzzleId);

  els.excavationNextWrap?.classList.toggle('hidden', !show);

  if (!show || !els.excavationNextLabel) return;

  const labels = {
    'symbol-matching': 'Next — Symbol Matching Puzzle',
    'glyph-sequence': 'Next — Glyph Sequence Puzzle'
  };
  els.excavationNextLabel.textContent = labels[puzzleId] || 'Next — Solve Puzzle';
  refreshIcons(els.excavationNextWrap);
}

function showStageLockedMessage(stage) {
  const puzzle = stage === 2 ? 'Symbol Matching' : 'Glyph Sequence';
  alert(`Layer ${stage} is locked. Complete the ${puzzle} puzzle first.`);
  navigateTo('puzzles');
}

function discoverArtifact(artifactId) {
  if (state.discoveredArtifacts.includes(artifactId)) return;

  state.discoveredArtifacts.push(artifactId);
  checkAchievements();
  saveState(state);
  renderAll();

  const artifact = ARTIFACTS.find(a => a.id === artifactId);
  if (artifact) {
    showDiscoveryModal(artifact);
    updateStagePreview(artifact);
  }
}

function showDiscoveryModal(artifact) {
  document.getElementById('modal-artifact-name').textContent = artifact.name;
  document.getElementById('modal-artifact-category').textContent = artifact.category;
  setArtifactImage(document.getElementById('modal-artifact-image'), artifact.image);
  document.getElementById('modal-artifact-image').alt = artifact.name;
  document.getElementById('modal-discovery-note').textContent = artifact.discoveryNote;
  document.getElementById('modal-artifact-desc').textContent = artifact.description;
  els.discoveryModal?.classList.add('open');
  els.discoveryModal?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDiscoveryModal() {
  els.discoveryModal?.classList.remove('open');
  els.discoveryModal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(achievement => {
    if (!state.unlockedAchievements.includes(achievement.id) && achievement.check(state)) {
      state.unlockedAchievements.push(achievement.id);
    }
  });
}

function completePuzzle(puzzleId) {
  if (state.completedPuzzles.includes(puzzleId)) return;
  state.completedPuzzles.push(puzzleId);
  checkAchievements();
  saveState(state);
  renderAll();
  updatePuzzleStatus();
}

function initPuzzles() {
  const symbolDone = state.completedPuzzles.includes('symbol-matching');
  const glyphDone = state.completedPuzzles.includes('glyph-sequence');

  const symbolContainer = els.puzzleContainers['symbol-matching'];
  const glyphContainer = els.puzzleContainers['glyph-sequence'];

  if (symbolContainer) {
    if (symbolDone) {
      symbolContainer.innerHTML = `<p class="puzzle-complete-msg">${icon('circle-check')} Symbol Matching completed — Layer 2 unlocked.</p>`;
    } else if (state.discoveredArtifacts.length >= 4) {
      initSymbolMatching(symbolContainer, () => completePuzzle('symbol-matching'));
    } else {
      symbolContainer.innerHTML = `<p class="puzzle-locked-msg">${icon('lock')} Discover all 4 artifacts in Layer 1 to unlock this puzzle.</p>`;
    }
  }

  if (glyphContainer) {
    if (glyphDone) {
      glyphContainer.innerHTML = `<p class="puzzle-complete-msg">${icon('circle-check')} Glyph Sequence completed — Layer 3 unlocked.</p>`;
    } else if (state.completedPuzzles.includes('symbol-matching') && state.discoveredArtifacts.length >= 8) {
      initGlyphSequence(glyphContainer, () => completePuzzle('glyph-sequence'));
    } else if (!state.completedPuzzles.includes('symbol-matching')) {
      glyphContainer.innerHTML = `<p class="puzzle-locked-msg">${icon('lock')} Complete the Symbol Matching puzzle first.</p>`;
    } else {
      glyphContainer.innerHTML = `<p class="puzzle-locked-msg">${icon('lock')} Discover all 4 artifacts in Layer 2 to unlock this puzzle.</p>`;
    }
  }
  refreshIcons(els.main);
}

function updatePuzzleStatus() {
  document.querySelectorAll('[data-puzzle-status]').forEach(el => {
    const id = el.dataset.puzzleStatus;
    const done = state.completedPuzzles.includes(id);
    if (done) {
      el.innerHTML = `${icon('circle-check', 'icon--sm')} Completed`;
      el.classList.add('status--complete');
    } else if (id === 'symbol-matching' && state.discoveredArtifacts.length >= 4) {
      el.innerHTML = `${icon('unlock', 'icon--sm')} Available`;
      el.classList.remove('status--complete');
    } else if (id === 'glyph-sequence' && state.completedPuzzles.includes('symbol-matching') && state.discoveredArtifacts.length >= 8) {
      el.innerHTML = `${icon('unlock', 'icon--sm')} Available`;
      el.classList.remove('status--complete');
    } else {
      el.innerHTML = `${icon('lock', 'icon--sm')} Locked`;
      el.classList.remove('status--complete');
    }
  });
}

function renderDigSpots(stage) {
  const container = els.stageContainers[stage];
  if (!container) return;

  const grid = container.querySelector('.dig-grid');
  if (!grid) return;

  grid.querySelectorAll('.dig-spot').forEach(spot => spot.remove());

  ARTIFACTS.filter(a => a.stage === stage).forEach(artifact => {
    const found = state.discoveredArtifacts.includes(artifact.id);
    const spot = document.createElement('button');
    spot.type = 'button';
    spot.className = `dig-spot${found ? ' dig-spot--found' : ''}`;
    spot.style.left = `${artifact.digSpot.x}%`;
    spot.style.top = `${artifact.digSpot.y}%`;
    spot.setAttribute('aria-label', found ? `${artifact.name} (discovered)` : 'Unexcavated area — click to dig');
    spot.innerHTML = found
      ? `<span class="dig-spot-icon">${icon('check', 'icon--sm')}</span>`
      : `<span class="dig-spot-icon"><span class="dig-spot-mark">?</span></span>`;

    spot.addEventListener('click', () => {
      if (!found) {
        spot.classList.add('dig-spot--digging');
        setTimeout(() => discoverArtifact(artifact.id), 600);
      } else {
        showDiscoveryModal(artifact);
        updateStagePreview(artifact);
      }
    });
    grid.appendChild(spot);
  });
  refreshIcons(grid);
}

function renderArtifactPreviewHTML(artifact, found = true) {
  if (!artifact) {
    return `<p class="preview-placeholder">${icon('search')} Excavate a dig spot to preview artifacts.</p>`;
  }
  if (!found) {
    return `<p class="preview-placeholder">${icon('lock')} Artifact not yet discovered.</p>`;
  }
  return `
    <img src="${artifact.image}" alt="${artifact.name}" class="preview-image preview-image--photo" loading="lazy" data-fallback="${artifactImageFallback(artifact.image)}">
    <h4 class="preview-name">${artifact.name}</h4>
    <span class="preview-category">${artifact.category}</span>
    <p class="preview-desc">${artifact.description}</p>
  `;
}

function updateStagePreview(artifact) {
  const panel = els.previewPanels[artifact.stage];
  if (panel) {
    panel.innerHTML = renderArtifactPreviewHTML(artifact, true);
    panel.querySelectorAll('.preview-image[data-fallback]').forEach(img => {
      setArtifactImage(img, img.getAttribute('src') || artifact.image);
    });
    refreshIcons(panel);
  }
}

function renderStagePreviews() {
  [1, 2, 3].forEach(stage => {
    const panel = els.previewPanels[stage];
    if (!panel) return;
    const stageArtifacts = ARTIFACTS.filter(a => a.stage === stage);
    const lastFound = [...stageArtifacts].reverse().find(a => state.discoveredArtifacts.includes(a.id));
    panel.innerHTML = renderArtifactPreviewHTML(lastFound, Boolean(lastFound));
    panel.querySelectorAll('.preview-image[data-fallback]').forEach(img => {
      setArtifactImage(img, img.getAttribute('src') || lastFound?.image);
    });
    refreshIcons(panel);
  });
}

function renderArtifacts() {
  if (!els.artifactsGrid) return;
  els.artifactsGrid.innerHTML = '';

  ARTIFACTS.forEach(artifact => {
    const found = state.discoveredArtifacts.includes(artifact.id);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `artifact-card${found ? ' artifact-card--found' : ' artifact-card--locked'}${selectedArtifactId === artifact.id ? ' artifact-card--selected' : ''}`;
    card.innerHTML = `
      <img src="${artifact.image}" alt="${found ? artifact.name : 'Locked artifact'}" ${found ? '' : 'style="opacity:0.25"'} loading="lazy">
      <span class="artifact-card-name">${found ? artifact.name : '???'}</span>
      <span class="artifact-card-layer">Layer ${artifact.stage}</span>
    `;
    card.addEventListener('click', () => {
      selectedArtifactId = artifact.id;
      renderArtifacts();
      renderArtifactDetail(artifact, found);
    });
    els.artifactsGrid.appendChild(card);
  });

  if (selectedArtifactId) {
    const artifact = ARTIFACTS.find(a => a.id === selectedArtifactId);
    if (artifact) renderArtifactDetail(artifact, state.discoveredArtifacts.includes(artifact.id));
  }
}

function renderArtifactDetail(artifact, found) {
  if (!els.artifactDetailPanel) return;
  if (!found) {
    els.artifactDetailPanel.innerHTML = `
      <div class="detail-locked">
        <img src="${artifact.image}" alt="" style="opacity:0.2" aria-hidden="true">
        <h3>Undiscovered</h3>
        <p>Find this artifact in Layer ${artifact.stage} to unlock its record.</p>
      </div>
    `;
    return;
  }
  els.artifactDetailPanel.innerHTML = `
    <img src="${artifact.image}" alt="${artifact.name}" class="detail-image" loading="lazy">
    <h3>${artifact.name}</h3>
    <span class="detail-category">${artifact.category} · Layer ${artifact.stage}</span>
    <p class="detail-desc">${artifact.description}</p>
    <blockquote class="detail-note">${artifact.discoveryNote}</blockquote>
    <p class="detail-journal">${artifact.journalEntry}</p>
  `;
}

function renderArchive() {
  if (!els.archiveList) return;
  const discovered = ARTIFACTS.filter(a => state.discoveredArtifacts.includes(a.id));

  if (!discovered.length) {
    els.archiveList.innerHTML = `<p class="archive-empty">${icon('archive', 'icon--lg')} No artifacts archived yet. Begin excavating to build your collection.</p>`;
    refreshIcons(els.archiveList);
    return;
  }

  els.archiveList.innerHTML = discovered.map(artifact => `
    <article class="archive-entry">
      <img src="${artifact.image}" alt="${artifact.name}" class="archive-thumb" loading="lazy">
      <div class="archive-body">
        <h3>${artifact.name}</h3>
        <span class="archive-meta">${artifact.category} · Layer ${artifact.stage} · Sector A7</span>
        <p>${artifact.journalEntry}</p>
      </div>
    </article>
  `).join('');
}

function renderJournal() {
  if (!els.journalGrid) return;
  els.journalGrid.innerHTML = '';

  const pct = getProgressPercentage(state.discoveredArtifacts.length);
  if (els.journalProgress) els.journalProgress.textContent = `${pct}%`;

  ARTIFACTS.forEach(artifact => {
    const found = state.discoveredArtifacts.includes(artifact.id);
    const card = document.createElement('article');
    card.className = `journal-card${found ? ' journal-card--found' : ' journal-card--locked'}`;

    card.innerHTML = `
      <div class="journal-card-image">
        <img src="${artifact.image}" alt="${found ? artifact.name : 'Undiscovered artifact'}" ${found ? '' : 'style="opacity:0.3"'} loading="lazy">
      </div>
      <div class="journal-card-body">
        <h3>${found ? artifact.name : '???'}</h3>
        <span class="journal-category">${found ? artifact.category : 'Unknown'}</span>
        <p class="journal-note">${found ? artifact.journalEntry : 'Not yet discovered.'}</p>
        <span class="journal-status">${found ? `${icon('check', 'icon--sm')} Discovered` : `${icon('lock', 'icon--sm')} Locked`}</span>
      </div>
    `;
    els.journalGrid.appendChild(card);
  });
}

function renderAchievements() {
  if (!els.achievementsGrid) return;
  els.achievementsGrid.innerHTML = '';

  ACHIEVEMENTS.forEach(achievement => {
    const unlocked = state.unlockedAchievements.includes(achievement.id);
    const card = document.createElement('article');
    card.className = `achievement-card${unlocked ? ' achievement-card--unlocked' : ''}`;
    card.innerHTML = `
      <div class="achievement-icon">${icon(achievement.icon, 'icon--xl')}</div>
      <h3>${achievement.name}</h3>
      <p>${achievement.description}</p>
      <span class="achievement-status">${unlocked ? `${icon('award', 'icon--sm')} Earned` : `${icon('lock', 'icon--sm')} Locked`}</span>
    `;
    els.achievementsGrid.appendChild(card);
  });
}

function updateProgress() {
  const count = state.discoveredArtifacts.length;
  const total = ARTIFACTS.length;
  const pct = getProgressPercentage(count, total);
  if (els.discoveriesDisplay) els.discoveriesDisplay.textContent = `${count} / ${total}`;
  if (els.journalProgress) els.journalProgress.textContent = `${pct}%`;
}

function updateReconstruction() {
  const count = state.discoveredArtifacts.length;
  const total = ARTIFACTS.length;
  const reconState = getReconstructionState(count);
  const labels = {
    ruins: {
      title: 'Ruins',
      badge: 'State I — Ruins',
      desc: 'Collapsed temples and buried trenches — only fragments of Aurelian glory remain beneath the sand.'
    },
    partial: {
      title: 'Partial Reconstruction',
      badge: 'State II — Rebuilding',
      desc: 'Walls and ziggurats rise from the dust. Markets stir as the city begins to remember its golden age.'
    },
    restored: {
      title: 'Restored Civilization',
      badge: 'State III — Restored',
      desc: 'The Aurelian capital stands renewed — river cities, throne halls, and sun-lit ziggurats reborn through your discoveries.'
    }
  };

  const meta = labels[reconState];

  if (els.reconstructionView && els.reconstructionView.dataset.state !== reconState) {
    els.reconstructionView.dataset.state = reconState;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(els.reconstructionView,
        { scale: 0.985, opacity: 0.92 },
        { scale: 1, opacity: 1, duration: 0.85, ease: 'power2.out' }
      );
    }
  } else if (els.reconstructionView) {
    els.reconstructionView.dataset.state = reconState;
  }

  if (els.reconstructionLabel) els.reconstructionLabel.textContent = meta.title;
  if (els.reconstructionBadge) els.reconstructionBadge.textContent = meta.badge;
  if (els.reconstructionDesc) els.reconstructionDesc.textContent = meta.desc;
  if (els.reconstructionCount) els.reconstructionCount.textContent = `${count} / ${total}`;

  els.reconstructionLegend?.forEach(item => {
    item.classList.toggle('active', item.dataset.state === reconState);
  });
}

function renderStageTabs() {
  els.stageTabs.forEach(tab => {
    const stage = parseInt(tab.dataset.stage, 10);
    const locked = !isStageUnlocked(stage, state);
    tab.classList.toggle('locked', locked);
    tab.setAttribute('aria-disabled', locked ? 'true' : 'false');

    let lockEl = tab.querySelector('.tab-lock-icon');
    if (locked && !lockEl) {
      tab.insertAdjacentHTML('beforeend', `<span class="tab-lock-icon">${icon('lock', 'icon--sm')}</span>`);
    } else if (!locked && lockEl) {
      lockEl.remove();
    }
  });
  refreshIcons(els.main);
}

function renderAll() {
  updateProgress();
  renderJournal();
  renderArtifacts();
  renderArchive();
  renderStagePreviews();
  renderAchievements();
  updateReconstruction();
  renderStageTabs();
  updatePuzzleStatus();
  switchStage(currentStage);
  refreshIcons(appVisible ? els.main : document);
}

function toggleMobileMenu() {
  const isOpen = els.sidebar?.classList.toggle('open') ?? false;
  els.sidebarOverlay?.classList.toggle('visible', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  syncMobileMenuButton(isOpen);
}

function closeMobileMenu() {
  els.sidebar?.classList.remove('open');
  els.sidebarOverlay?.classList.remove('visible');
  document.body.classList.remove('menu-open');
  syncMobileMenuButton(false);
}

function syncMobileMenuButton(isOpen) {
  if (!els.mobileMenuBtn) return;
  els.mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  els.mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  const iconEl = els.mobileMenuBtn.querySelector('[data-lucide]');
  if (iconEl) {
    iconEl.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
    refreshIcons(els.mobileMenuBtn);
  }
}

function animateEntrance() {
  document.querySelectorAll('#view-main .dig-header, #view-main .view-panel').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = '';
  });

  const isCollapsibleNav = window.matchMedia('(max-width: 1024px)').matches;
  if (!isCollapsibleNav) {
    const sidebar = document.querySelector('#view-main .sidebar');
    if (sidebar) {
      sidebar.style.opacity = '1';
      sidebar.style.transform = '';
    }
  }

  if (typeof gsap === 'undefined') return;

  if (!isCollapsibleNav) {
    gsap.fromTo('#view-main .sidebar',
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.55, ease: 'power2.out', clearProps: 'opacity,transform' }
    );
  }
  gsap.fromTo('#view-main .dig-header',
    { y: -12, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity,transform' }
  );
  gsap.fromTo('#view-main .view-panel.active',
    { y: 12, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1, clearProps: 'opacity,transform' }
  );
}

document.addEventListener('DOMContentLoaded', initApp);
