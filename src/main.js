// BRAMO - Visor Engine, Custom Drag, Anti-Teleport & Dual-Mode Height Awareness

const capsuleWrapper = document.getElementById('capsuleWrapper');
const bramoContainer = document.getElementById('bramoContainer');
const bramoCapsule = document.getElementById('bramoCapsule');
const dropdownToggle = document.getElementById('dropdownToggle');
const hatTrigger = document.getElementById('hatTrigger');
const visorScreen = document.getElementById('visorScreen');
const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const ledMouth = document.getElementById('ledMouth');
const speechBubble = document.getElementById('speechBubble');
const speechText = document.getElementById('speechText');
const bioBubbleActions = document.getElementById('bioBubbleActions');
const bioBubbleDone = document.getElementById('bioBubbleDone');
const bioBubbleSnooze = document.getElementById('bioBubbleSnooze');
const cpuValue = document.getElementById('cpuValue');
const memoryValue = document.getElementById('memoryValue');
const batteryValue = document.getElementById('batteryValue');
const utilityTabs = document.querySelectorAll('.utility-tab');
const utilityPanels = document.querySelectorAll('.utility-panel');
const prayerNext = document.getElementById('prayerNext');
const prayerLocation = document.getElementById('prayerLocation');
const prayerToggle = document.getElementById('prayerToggle');
const prayerTest = document.getElementById('prayerTest');
const adhanAudio = document.getElementById('adhanAudio');
const audioToggle = document.getElementById('audioToggle');
const prayerMute = document.getElementById('prayerMute');
const fileDropZone = document.getElementById('fileDropZone');
const dropStatus = document.getElementById('dropStatus');
const dropActions = document.getElementById('dropActions');
const openDroppedFile = document.getElementById('openDroppedFile');
const revealDroppedFile = document.getElementById('revealDroppedFile');
const dropHistory = document.getElementById('dropHistory');
const clipboardToggle = document.getElementById('clipboardToggle');
const typingToggle = document.getElementById('typingToggle');
const musicStatus = document.getElementById('musicStatus');
const musicPanel = document.getElementById('musicPanel');
const mediaButtons = document.querySelectorAll('[data-media-action]');
const nowPlayingBar = document.getElementById('nowPlayingBar');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');
const themePicker = document.getElementById('themePicker');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const launcherName = document.getElementById('launcherName');
const launcherTarget = document.getElementById('launcherTarget');
const launcherAdd = document.getElementById('launcherAdd');
const launcherList = document.getElementById('launcherList');
const sleepBramo = document.getElementById('sleepBramo');
const quitBramo = document.getElementById('quitBramo');
const pomodoroMode = document.getElementById('pomodoroMode');
const pomodoroTime = document.getElementById('pomodoroTime');
const pomodoroProgress = document.getElementById('pomodoroProgress');
const pomodoroStart = document.getElementById('pomodoroStart');
const pomodoroReset = document.getElementById('pomodoroReset');
const pomodoroFocusSetting = document.getElementById('pomodoroFocusSetting');
const pomodoroBreakSetting = document.getElementById('pomodoroBreakSetting');
const pomodoroMiniBar = document.getElementById('pomodoroMiniBar');
const pomodoroMiniMode = document.getElementById('pomodoroMiniMode');
const pomodoroMiniTime = document.getElementById('pomodoroMiniTime');
const pomodoroMiniToggle = document.getElementById('pomodoroMiniToggle');
const autostartToggle = document.getElementById('autostartToggle');
const bioRhythmToggle = document.getElementById('bioRhythmToggle');
const bioRhythmInterval = document.getElementById('bioRhythmInterval');
const bioRhythmStatus = document.getElementById('bioRhythmStatus');
const bioRhythmReset = document.getElementById('bioRhythmReset');
const bioRhythmTest = document.getElementById('bioRhythmTest');
const bioRhythmFollowup = document.getElementById('bioRhythmFollowup');
const bioRhythmDone = document.getElementById('bioRhythmDone');
const bioRhythmSnooze = document.getElementById('bioRhythmSnooze');
const bramoLevel = document.getElementById('bramoLevel');
const bramoXp = document.getElementById('bramoXp');
const bramoNextLevel = document.getElementById('bramoNextLevel');
const bramoXpBar = document.getElementById('bramoXpBar');
const bramoAccessory = document.getElementById('bramoAccessory');
const bramoAccessoryIcon = document.getElementById('bramoAccessoryIcon');
const xpPopup = document.getElementById('xpPopup');
const journeyHistory = document.getElementById('journeyHistory');
const journeyTabs = document.querySelectorAll('.journey-tab');
const journeyViews = document.querySelectorAll('.journey-view');
const cosmeticGroups = document.getElementById('cosmeticGroups');
const collectionSummary = document.getElementById('collectionSummary');

let isActivelyDragging = false;
let isDragCandidate = false;
let dragStartClientX = 0;
let dragStartClientY = 0;
let nativeDragPromise = Promise.resolve();
let nativeDragMode = false;
let statsTimer = null;
let batteryManager = null;
let prayerSchedule = null;
let prayerReminderTimer = null;
let lastPrayerAlert = '';
let isMusicVibing = false;
let suppressMediaUntil = 0;
let adhanSessionActive = false;
let mediaPausedByAdhan = false;
let adhanResumeTimer = null;
const ADHAN_SUPPRESS_MS = 5 * 60 * 1000;
let lastMediaState = { active: false, playing: false };
let quitArmed = false;
let quitArmTimer = null;
let testPrayerIndex = 0;
let typingCuriousTimeout = null;
let typingEyeTarget = null;
let lastBramoInteractionAt = Date.now();
let idleAnimationTimeout = null;
let idleAnimationResetTimer = null;
let clipboardTimer = null;
let lastClipboardSignature = null;
let clipboardWatcherEnabled = localStorage.getItem('bramo.clipboard.watcher') === 'true';
let typingCuriosityEnabled = localStorage.getItem('bramo.typing.curiosity') === 'true';
let prayerEnabled = localStorage.getItem('bramo.prayer.enabled') !== 'false';
let audioEnabled = localStorage.getItem('bramo.prayer.audio') !== 'false';
let hideInFullscreen = localStorage.getItem('bramo.hide.fullscreen') === 'true';
let fullscreenMonitorTimer = null;
let hiddenByFullscreen = false;
let launcherItems = JSON.parse(localStorage.getItem('bramo.launcher.items') || '[]');
let bioRhythmEnabled = localStorage.getItem('bramo.bio.enabled') === 'true';
let bioRhythmMinutes = [30, 45, 60, 90].includes(Number(localStorage.getItem('bramo.bio.interval')))
  ? Number(localStorage.getItem('bramo.bio.interval'))
  : 60;
let bioRhythmNextAt = Number(localStorage.getItem('bramo.bio.nextAt')) || 0;
let bioRhythmDue = localStorage.getItem('bramo.bio.due') === 'true';
let bioRhythmTimer = null;

// Local gamification: reward varied, intentional use and cap repeat farming.
const BRAMO_LEVEL_XP = [0, 100, 250, 450, 700, 1000];
const COSMETICS = [
  { id: 'head-cowboy', category: 'head', name: 'Topi Koboi', icon: '🤠', xp: 0 },
  { id: 'eye-classic', category: 'eyes', name: 'Mata Klasik', icon: '◉', xp: 0 },
  { id: 'mouth-smile', category: 'mouth', name: 'Senyum LED', icon: '⌣', xp: 0 },
  { id: 'glow-cyan', category: 'glow', name: 'Cyan', icon: '🔹', xp: 0 },
  { id: 'theme-cyan', category: 'theme', name: 'Cyberpunk Cyan', icon: '🟦', xp: 0 },
  { id: 'head-peci', category: 'head', name: 'Peci Cyber', icon: '🧢', xp: 100 },
  { id: 'eye-star', category: 'eyes', name: 'Mata Bintang', icon: '✦', xp: 100 },
  { id: 'glow-green', category: 'glow', name: 'Matrix Green', icon: '🟩', xp: 100 },
  { id: 'theme-matrix', category: 'theme', name: 'Matrix Green', icon: '🟩', xp: 150 },
  { id: 'mouth-pixel', category: 'mouth', name: 'Pixel Grin', icon: '▰', xp: 180 },
  { id: 'head-halo', category: 'head', name: 'Halo Neon', icon: '😇', xp: 250 },
  { id: 'eye-sharp', category: 'eyes', name: 'Mata Fokus', icon: '◢', xp: 250 },
  { id: 'glow-pink', category: 'glow', name: 'Neon Pink', icon: '🩷', xp: 250 },
  { id: 'theme-pink', category: 'theme', name: 'Neon Pink', icon: '🩷', xp: 350 },
  { id: 'mouth-fang', category: 'mouth', name: 'Taring Pixel', icon: '牙', xp: 400 },
  { id: 'head-crown', category: 'head', name: 'Mahkota Pixel', icon: '👑', xp: 450 },
  { id: 'eye-sleepy', category: 'eyes', name: 'Mata Santai', icon: '﹏', xp: 450 },
  { id: 'glow-amber', category: 'glow', name: 'Amber Orange', icon: '🟠', xp: 450 },
  { id: 'theme-amber', category: 'theme', name: 'Amber Orange', icon: '🟠', xp: 600 }
];
const COSMETIC_CATEGORIES = { head: 'Aksesori kepala', eyes: 'Bentuk mata', mouth: 'Bentuk mulut', glow: 'Warna glow', theme: 'Tema visor' };
let bramoProgress = (() => {
  try {
    const parsed = JSON.parse(localStorage.getItem('bramo.progress') || '{}');
    return {
      xp: Math.max(0, Number(parsed.xp) || 0),
      lastAward: parsed.lastAward && typeof parsed.lastAward === 'object' ? parsed.lastAward : {},
      milestones: parsed.milestones && typeof parsed.milestones === 'object' ? parsed.milestones : {},
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 8) : []
    };
  } catch { return { xp: 0, lastAward: {}, milestones: {}, history: [] }; }
})();
let equippedCosmetics = (() => {
  try { return JSON.parse(localStorage.getItem('bramo.cosmetics') || '{}'); }
  catch { return {}; }
})();
// Normalize IDs from the first collection draft (`eyes-*`) to CSS style IDs (`eye-*`).
if (equippedCosmetics.eyes?.startsWith('eyes-')) {
  equippedCosmetics.eyes = equippedCosmetics.eyes.replace(/^eyes-/, 'eye-');
}
const categoryDefaults = { head: 'head-cowboy', eyes: 'eye-classic', mouth: 'mouth-smile', glow: 'glow-cyan', theme: 'theme-cyan' };

function currentBramoLevel(xp = bramoProgress.xp) {
  let level = 1;
  BRAMO_LEVEL_XP.forEach((threshold, index) => { if (xp >= threshold) level = index + 1; });
  if (xp >= BRAMO_LEVEL_XP.at(-1)) level += Math.floor((xp - BRAMO_LEVEL_XP.at(-1)) / 300);
  return level;
}

function bramoLevelThreshold(level) {
  if (level <= BRAMO_LEVEL_XP.length) return BRAMO_LEVEL_XP[level - 1] || 0;
  return BRAMO_LEVEL_XP.at(-1) + (level - BRAMO_LEVEL_XP.length) * 300;
}

function renderBramoProgress() {
  if (!bramoLevel) return;
  const level = currentBramoLevel();
  const currentThreshold = bramoLevelThreshold(level);
  const nextThreshold = bramoLevelThreshold(level + 1);
  const progress = Math.min(100, ((bramoProgress.xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  bramoLevel.textContent = `LV ${level}`;
  bramoXp.textContent = `${bramoProgress.xp} XP`;
  bramoNextLevel.textContent = `${Math.max(0, nextThreshold - bramoProgress.xp)} XP ke LV ${level + 1}`;
  bramoXpBar.style.width = `${progress}%`;
  const equippedHead = COSMETICS.find(item => item.id === equippedCosmetics.head) || COSMETICS[0];
  bramoAccessory.textContent = equippedHead.name;
  if (bramoAccessoryIcon) bramoAccessoryIcon.textContent = equippedHead.icon;
  const unlockedCount = COSMETICS.filter(item => bramoProgress.xp >= item.xp).length;
  collectionSummary.textContent = `${unlockedCount} / ${COSMETICS.length} kosmetik terbuka`;
  journeyHistory.innerHTML = bramoProgress.history.length
    ? bramoProgress.history.slice(0, 4).map(item => `<div class="history-entry"><span>${item.label}</span><strong>+${item.amount} XP</strong></div>`).join('')
    : '<span>Belum ada XP terkumpul</span>';
  renderCosmeticCollection();
  applyEquippedCosmetics();
}

function renderCosmeticCollection() {
  if (!cosmeticGroups) return;
  cosmeticGroups.innerHTML = Object.entries(COSMETIC_CATEGORIES).map(([category, title]) => {
    const items = COSMETICS.filter(item => item.category === category);
    return `<section class="cosmetic-group"><h3>${title}</h3><div class="cosmetic-grid">${items.map(item => {
      const unlocked = bramoProgress.xp >= item.xp;
      const selected = equippedCosmetics[category] === item.id;
      return `<button class="cosmetic-item interactive${unlocked ? '' : ' locked'}${selected ? ' selected' : ''}" data-cosmetic-id="${item.id}" type="button" ${unlocked ? '' : 'disabled'} aria-label="${item.name}${unlocked ? '' : `, terkunci, perlu ${item.xp} XP`}"><span>${unlocked ? item.icon : '🔒'}</span><small>${item.name}</small><em>${unlocked ? (selected ? 'Dipakai' : 'Pilih') : `${item.xp} XP`}</em></button>`;
    }).join('')}</div></section>`;
  }).join('');
}

function applyEquippedCosmetics() {
  const head = equippedCosmetics.head || categoryDefaults.head;
  const eyes = equippedCosmetics.eyes || categoryDefaults.eyes;
  const mouth = equippedCosmetics.mouth || categoryDefaults.mouth;
  const glow = equippedCosmetics.glow || categoryDefaults.glow;
  const theme = equippedCosmetics.theme || categoryDefaults.theme;
  hatTrigger?.classList.toggle('accessory-peci', head === 'head-peci');
  hatTrigger?.classList.toggle('accessory-halo', head === 'head-halo');
  hatTrigger?.classList.toggle('accessory-crown', head === 'head-crown');
  bramoContainer.dataset.eyeStyle = eyes.replace('eye-', '');
  bramoContainer.dataset.mouthStyle = mouth.replace('mouth-', '');
  bramoContainer.dataset.glowStyle = glow.replace('glow-', '');
  const themeName = theme.replace('theme-', '');
  bramoContainer.dataset.theme = themeName;
  const glowColors = { cyan: '#00f0ff', green: '#65ff9a', pink: '#ff5aa5', amber: '#ffbd59' };
  bramoContainer.style.setProperty('--cosmetic-glow', glowColors[glow.replace('glow-', '')] || glowColors.cyan);
  localStorage.setItem('bramo.theme', themeName);
  themePicker?.querySelectorAll('[data-theme]').forEach(button => {
    const unlocked = bramoProgress.xp >= (COSMETICS.find(item => item.id === `theme-${button.dataset.theme}`)?.xp ?? Infinity);
    button.disabled = !unlocked;
    button.classList.toggle('locked', !unlocked);
    button.classList.toggle('selected', button.dataset.theme === themeName);
  });
}

cosmeticGroups?.addEventListener('click', event => {
  const button = event.target.closest('[data-cosmetic-id]');
  if (!button || button.disabled) return;
  const item = COSMETICS.find(cosmetic => cosmetic.id === button.dataset.cosmeticId);
  if (!item) return;
  equippedCosmetics[item.category] = item.id;
  localStorage.setItem('bramo.cosmetics', JSON.stringify(equippedCosmetics));
  renderBramoProgress();
});

journeyTabs.forEach(tab => tab.addEventListener('click', () => {
  const view = tab.dataset.journeyView;
  journeyTabs.forEach(item => item.classList.toggle('active', item === tab));
  journeyViews.forEach(section => {
    const active = section.id === (view === 'collection' ? 'collectionView' : 'journeyView');
    section.classList.toggle('active', active);
    section.hidden = !active;
  });
}));

const buddyDailyKey = 'bramo.buddy.daily.v1';
function readBuddyDaily() {
  try {
    const saved = JSON.parse(localStorage.getItem(buddyDailyKey) || '{}');
    const today = new Date().toLocaleDateString('en-CA');
    return saved.date === today ? saved : { date: today, focusSessions: 0, claimedTargets: {} };
  } catch { return { date: new Date().toLocaleDateString('en-CA'), focusSessions: 0, claimedTargets: {} }; }
}
let buddyDaily = readBuddyDaily();
function saveBuddyDaily() { localStorage.setItem(buddyDailyKey, JSON.stringify(buddyDaily)); }
function awardBramoXp(action, amount, cooldownMs = 0, label = action) {
  amount = Math.max(0, Math.round(amount));
  if (!amount) return false;
  const now = Date.now();
  if (cooldownMs && now - (bramoProgress.lastAward[action] || 0) < cooldownMs) return false;
  const oldLevel = currentBramoLevel();
  bramoProgress.xp += amount;
  bramoProgress.lastAward[action] = now;
  bramoProgress.history.unshift({ label, amount, at: now });
  bramoProgress.history = bramoProgress.history.slice(0, 8);
  const unlockedNow = COSMETICS.filter(item => item.xp > 0 && item.xp > bramoProgress.xp - amount && item.xp <= bramoProgress.xp);
  unlockedNow.forEach(item => { equippedCosmetics[item.category] = item.id; });
  if (unlockedNow.length) localStorage.setItem('bramo.cosmetics', JSON.stringify(equippedCosmetics));
  localStorage.setItem('bramo.progress', JSON.stringify(bramoProgress));
  renderBramoProgress();
  showXpPopup(amount);
  const leveledUp = currentBramoLevel() > oldLevel;
  if (leveledUp) triggerBramoReaction('level-up', 1700);
  else if (amount >= 5) triggerBramoReaction('xp', 900);
  if (unlockedNow.length || leveledUp) {
    const reward = unlockedNow[unlockedNow.length - 1];
    triggerHappyMouth();
    const rewardText = reward ? `${reward.icon} ${reward.name} terbuka dan langsung dipakai!` : '';
    const levelText = leveledUp ? `Level ${currentBramoLevel()}!` : '';
    showBramoMessage([rewardText, levelText].filter(Boolean).join(' '), 3500);
  }
  return true;
}

const buddyReactionTimers = new Map();
function triggerBramoReaction(name, duration = 1200) {
  const className = `reaction-${name}`;
  const previous = buddyReactionTimers.get(className);
  if (previous) clearTimeout(previous);
  bramoContainer.classList.remove(className);
  void bramoContainer.offsetWidth;
  bramoContainer.classList.add(className);
  buddyReactionTimers.set(className, setTimeout(() => {
    bramoContainer.classList.remove(className);
    buddyReactionTimers.delete(className);
  }, duration));
}

function awardFeatureMilestone(feature, label = feature) {
  if (bramoProgress.milestones[feature]) return;
  bramoProgress.milestones[feature] = true;
  localStorage.setItem('bramo.progress', JSON.stringify(bramoProgress));
  awardBramoXp(`milestone-${feature}`, 12, 0, `Pertama kali: ${label}`);
}

const xpPopupQueue = [];
let xpPopupBusy = false;

function showXpPopup(amount) {
  if (!xpPopup) return;
  xpPopupQueue.push(amount);
  if (xpPopupBusy) return;
  xpPopupBusy = true;
  const displayNext = () => {
    const next = xpPopupQueue.shift();
    if (next === undefined) { xpPopupBusy = false; return; }
    xpPopup.textContent = `+${next} XP`;
    xpPopup.classList.remove('show');
    void xpPopup.offsetWidth;
    xpPopup.classList.add('show');
    setTimeout(() => {
      xpPopup.classList.remove('show');
      setTimeout(displayNext, 120);
    }, 1250);
  };
  displayNext();
}

Object.entries(categoryDefaults).forEach(([category, id]) => {
  if (!equippedCosmetics[category]) equippedCosmetics[category] = id;
  const selected = COSMETICS.find(item => item.id === equippedCosmetics[category]);
  if (!selected || selected.category !== category || selected.xp > bramoProgress.xp) equippedCosmetics[category] = id;
});
localStorage.setItem('bramo.cosmetics', JSON.stringify(equippedCosmetics));

renderBramoProgress();

async function launchTarget(target) {
  try {
    await window.__TAURI__?.core?.invoke('open_launcher_target', { target });
    awardFeatureMilestone('launcher-open', 'membuka shortcut');
    triggerBramoReaction('success', 950);
    showBramoMessage('Membuka shortcut 🚀', 1800);
  } catch (error) {
    console.warn('Launcher error:', error);
    showBramoMessage('Shortcut gagal dibuka 😕', 2200);
  }
}

function renderLauncher() {
  if (!launcherList) return;
  launcherList.innerHTML = launcherItems.map((item, index) => `
    <div class="launcher-item">
      <button class="launcher-open interactive" data-launcher-index="${index}" type="button">${item.name}</button>
      <button class="launcher-remove interactive" data-remove-launcher="${index}" type="button" aria-label="Remove shortcut">×</button>
    </div>
  `).join('');
  launcherList.querySelectorAll('[data-launcher-index]').forEach(button => {
    button.addEventListener('click', () => launchTarget(launcherItems[Number(button.dataset.launcherIndex)].target));
  });
  launcherList.querySelectorAll('[data-remove-launcher]').forEach(button => {
    button.addEventListener('click', () => {
      launcherItems.splice(Number(button.dataset.removeLauncher), 1);
      localStorage.setItem('bramo.launcher.items', JSON.stringify(launcherItems));
      renderLauncher();
    });
  });
}

launcherAdd?.addEventListener('click', () => {
  const name = launcherName.value.trim();
  const target = launcherTarget.value.trim();
  if (!name || !target) return;
  launcherItems = [...launcherItems, { name, target }].slice(-8);
  awardFeatureMilestone('launcher-add', 'menambahkan shortcut');
  localStorage.setItem('bramo.launcher.items', JSON.stringify(launcherItems));
  launcherName.value = '';
  launcherTarget.value = '';
  renderLauncher();
});

renderLauncher();
let mediaCandidate = null;
let mediaCandidateCount = 0;
let isBramoSleeping = false;
let blinkTimeout = null;
let nativeResizeQueue = Promise.resolve();
const POSITION_STORAGE_KEY = 'bramo.window.position.v1';
let windowPositionRevision = 0;
const COMPACT_WINDOW_SIZE = { width: 220, height: 90 };
const MEDIA_WINDOW_SIZE = { width: 220, height: 162 };
const EXPANDED_WINDOW_SIZE = { width: 280, height: 470 };
let mediaWindowActive = false;
let bubbleBasePosition = null;
let shakeSamples = [];
let dizzyUntil = 0;
let dizzyResetTimer = null;
let pomodoroTimer = null;
const savedFocusMinutes = Number(localStorage.getItem('bramo.pomodoro.focus')) || 25;
const savedBreakMinutes = Number(localStorage.getItem('bramo.pomodoro.break')) || 5;
let pomodoroSeconds = savedFocusMinutes * 60;
let pomodoroDuration = savedFocusMinutes * 60;
let pomodoroFocusMode = true;

pomodoroFocusSetting.value = String(savedFocusMinutes);
pomodoroBreakSetting.value = String(savedBreakMinutes);

function renderPomodoro() {
  if (!pomodoroTime) return;
  const minutes = Math.floor(pomodoroSeconds / 60).toString().padStart(2, '0');
  const seconds = (pomodoroSeconds % 60).toString().padStart(2, '0');
  pomodoroTime.textContent = `${minutes}:${seconds}`;
  pomodoroMode.textContent = pomodoroFocusMode ? 'FOCUS SESSION' : 'BREAK SESSION';
  pomodoroProgress.style.width = `${Math.max(0, Math.min(100, ((pomodoroDuration - pomodoroSeconds) / pomodoroDuration) * 100))}%`;
  pomodoroStart.textContent = pomodoroTimer ? 'Pause' : 'Start';
  pomodoroMiniMode.textContent = pomodoroFocusMode ? 'FOCUS' : 'BREAK';
  pomodoroMiniTime.textContent = `${minutes}:${seconds}`;
  pomodoroMiniToggle.textContent = pomodoroTimer ? 'Pause' : 'Start';
  const pomodoroVisible = pomodoroTimer || pomodoroSeconds !== pomodoroDuration;
  pomodoroMiniBar.classList.toggle('visible', pomodoroVisible);
  bramoContainer.classList.toggle('pomodoro-active', pomodoroVisible);
  applyWindowLayout();
}

function finishPomodoroSession() {
  if (pomodoroTimer) clearInterval(pomodoroTimer);
  pomodoroTimer = null;
  if (focusEncouragementTimer) clearTimeout(focusEncouragementTimer);
  focusEncouragementTimer = null;
  const completedFocus = pomodoroFocusMode;
  const completedMinutes = Math.round(pomodoroDuration / 60);
  const earnedXp = completedFocus ? completedMinutes : Math.round(completedMinutes * 0.3);
  awardBramoXp('pomodoro', earnedXp, 0, `${completedFocus ? 'Fokus' : 'Istirahat'} ${completedMinutes} menit`);
  awardFeatureMilestone('pomodoro-complete', 'menyelesaikan Pomodoro');
  pomodoroFocusMode = !pomodoroFocusMode;
  const minutes = pomodoroFocusMode ? Number(pomodoroFocusSetting.value) : Number(pomodoroBreakSetting.value);
  pomodoroDuration = minutes * 60;
  pomodoroSeconds = pomodoroDuration;
  renderPomodoro();
  triggerBramoReaction(completedFocus ? 'agree' : (pomodoroFocusMode ? 'focus' : 'break'), 2200);
  showBramoMessage(pomodoroFocusMode ? 'Waktu fokus dimulai! Semangat 🔥' : 'Saatnya istirahat sebentar ☕', 4000);
  triggerHappyMouth();
}

function togglePomodoro() {
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    if (focusEncouragementTimer) clearTimeout(focusEncouragementTimer);
    focusEncouragementTimer = null;
    renderPomodoro();
    return;
  }
  pomodoroTimer = setInterval(() => {
    pomodoroSeconds -= 1;
    if (pomodoroSeconds <= 0) finishPomodoroSession();
    else renderPomodoro();
  }, 1000);
  renderPomodoro();
  scheduleFocusEncouragement();
  triggerBramoReaction('think', 1600);
  triggerBramoReaction(pomodoroFocusMode ? 'focus' : 'break', 1800);
  showBramoMessage(pomodoroFocusMode ? 'Fokus dimulai. BRAMO jagain 😎' : 'Break dimulai, tarik napas dulu ☕', 3000);
}

pomodoroStart?.addEventListener('click', togglePomodoro);
pomodoroMiniToggle?.addEventListener('click', togglePomodoro);
let focusEncouragementTimer = null;
function scheduleFocusEncouragement() {
  if (focusEncouragementTimer) clearTimeout(focusEncouragementTimer);
  focusEncouragementTimer = setTimeout(() => {
    focusEncouragementTimer = null;
    if (pomodoroTimer && pomodoroFocusMode && !isBramoSleeping && !document.hidden) {
      triggerBramoReaction('cheer', 1500);
      showBramoMessage('Kamu fokus, aku temenin ya ✨', 2200);
    }
    if (pomodoroTimer && pomodoroFocusMode) scheduleFocusEncouragement();
  }, 8 * 60_000);
}

let moodResetTimer = null;
function setBuddyMood(mood) {
  bramoContainer.dataset.mood = mood;
}
function setUpbeatMood() {
  setBuddyMood('upbeat');
  if (moodResetTimer) clearTimeout(moodResetTimer);
  moodResetTimer = setTimeout(() => setBuddyMood('calm'), 90_000);
}
function updateBuddyMoodFromIdle() {
  const idleFor = Date.now() - lastBramoInteractionAt;
  setBuddyMood(idleFor >= 180_000 ? 'sleepy' : idleFor >= 90_000 ? 'calm' : 'upbeat');
  if (idleFor < 90_000 && !moodResetTimer) {
    moodResetTimer = setTimeout(() => { moodResetTimer = null; updateBuddyMoodFromIdle(); }, 90_000 - idleFor);
  } else if (idleFor >= 90_000) moodResetTimer = null;
}

function greetByTimeOfDay() {
  const now = new Date();
  const hour = now.getHours();
  const part = hour < 11 ? 'morning' : hour >= 19 ? 'night' : null;
  const key = `bramo.buddy.greeting.${now.toLocaleDateString('en-CA')}`;
  if (!part || localStorage.getItem(key)) return;
  localStorage.setItem(key, part);
  setTimeout(() => {
    if (isBramoSleeping || document.hidden) return;
    triggerBramoReaction('greet', 1000);
    showBramoMessage(part === 'morning' ? 'Pagi! Semoga harimu lancar ☀️' : 'Sudah malam, jangan lupa istirahat 🌙', 3000);
  }, 3500);
}

setInterval(updateBuddyMoodFromIdle, 30_000);
greetByTimeOfDay();
pomodoroReset?.addEventListener('click', () => {
  if (pomodoroTimer) clearInterval(pomodoroTimer);
  if (focusEncouragementTimer) clearTimeout(focusEncouragementTimer);
  focusEncouragementTimer = null;
  pomodoroTimer = null;
  pomodoroFocusMode = true;
  pomodoroDuration = Number(pomodoroFocusSetting.value) * 60;
  pomodoroSeconds = pomodoroDuration;
  renderPomodoro();
});
function updatePomodoroSetting() {
  localStorage.setItem('bramo.pomodoro.focus', pomodoroFocusSetting.value);
  localStorage.setItem('bramo.pomodoro.break', pomodoroBreakSetting.value);
  if (!pomodoroTimer) {
    pomodoroFocusMode = true;
    pomodoroDuration = Number(pomodoroFocusSetting.value) * 60;
    pomodoroSeconds = pomodoroDuration;
    renderPomodoro();
  }
}
pomodoroFocusSetting?.addEventListener('change', updatePomodoroSetting);
pomodoroBreakSetting?.addEventListener('change', updatePomodoroSetting);
renderPomodoro();
let sleepRestorePosition = null;

async function wakeBramo() {
  if (!isBramoSleeping) return;
  isBramoSleeping = false;
  bramoContainer.classList.remove('sleeping');
  scheduleNextBlink(500);
  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();
      // Pertahankan anchor posisi mini-window saat wake agar tidak ada
      // loncatan vertikal sebelum event drag mengambil alih.
      const restore = { x: pos.x, y: pos.y };
      await applyWindowLayout({ anchor: restore });
      sleepRestorePosition = null;
      await updateAdaptivePositioning();
    } catch (error) {
      console.warn('Wake BRAMO error:', error);
    }
  }
  triggerBramoReaction('wake', 1600);
  showBramoMessage('Bangun lagi! ⚡', 1800);
}

async function enterSleepMode() {
  if (isBramoSleeping) return;
  isBramoSleeping = true;
  visorScreen.classList.remove('blinking');
  if (blinkTimeout) {
    clearTimeout(blinkTimeout);
    blinkTimeout = null;
  }
  if (bramoContainer.classList.contains('expanded')) {
    // Tutup dropdown langsung (bukan lewat click) supaya tidak ada resize
    // asynchronous yang berebut dengan layout tidur.
    bramoContainer.classList.remove('expanded');
    capsuleWrapper.classList.remove('is-expanded');
    if (dropdownIdleTimer) {
      clearTimeout(dropdownIdleTimer);
      dropdownIdleTimer = null;
    }
    stopStatsPolling();
  }
  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const [pos, size] = await Promise.all([win.outerPosition(), win.outerSize()]);
      // Lebar tetap agar mini-player tidak ikut mengecil; tinggi dipadatkan
      // untuk memberi ruang kapsul mini dan player yang tetap normal.
      const sleepSize = computeSleepWindowSize();
      // Keep the top edge fixed when sleeping near the top; preserve the bottom
      // edge only for the bottom-docked layout.
      const keepBottom = capsuleWrapper.classList.contains('align-bottom');
      sleepRestorePosition = {
        x: pos.x,
        y: keepBottom ? pos.y + size.height - sleepSize.height : pos.y
      };
      bramoContainer.classList.add('sleeping');
      await applyWindowLayout({ anchor: sleepRestorePosition });
    } catch (error) {
      isBramoSleeping = false;
      console.warn('Sleep BRAMO error:', error);
    }
  } else {
    bramoContainer.classList.add('sleeping');
  }
  dropStatus && (dropStatus.textContent = 'BRAMO sedang tidur • goyang untuk bangun');
}

sleepBramo?.addEventListener('click', enterSleepMode);

function resetQuitArm() {
  quitArmed = false;
  if (quitArmTimer) {
    clearTimeout(quitArmTimer);
    quitArmTimer = null;
  }
}

async function confirmQuit() {
  if (!quitArmed) {
    quitArmed = true;
    showBramoMessage('Klik Quit lagi untuk menutup BRAMO ✋', 3000);
    if (quitBramo) quitBramo.textContent = 'Confirm?';
    quitArmTimer = setTimeout(() => {
      resetQuitArm();
      if (quitBramo) quitBramo.textContent = 'Quit';
    }, 3000);
    return;
  }
  resetQuitArm();
  if (quitBramo) quitBramo.textContent = 'Quit';
  try {
    await window.__TAURI__?.core?.invoke('quit_bramo');
  } catch (error) {
    console.warn('Quit BRAMO error:', error);
  }
}

quitBramo?.addEventListener('click', confirmQuit);
const savedTheme = localStorage.getItem('bramo.theme') || 'cyan';

function applyTheme(theme) {
  const validThemes = ['cyan', 'matrix', 'pink', 'amber'];
  const nextTheme = validThemes.includes(theme) ? theme : 'cyan';
  const themeCosmetic = COSMETICS.find(item => item.id === `theme-${nextTheme}`);
  if (themeCosmetic && bramoProgress.xp < themeCosmetic.xp) return;
  equippedCosmetics.theme = `theme-${nextTheme}`;
  localStorage.setItem('bramo.cosmetics', JSON.stringify(equippedCosmetics));
  bramoContainer.dataset.theme = nextTheme;
  localStorage.setItem('bramo.theme', nextTheme);
  themePicker?.querySelectorAll('[data-theme]').forEach(button => {
    button.classList.toggle('selected', button.dataset.theme === nextTheme);
  });
}

applyTheme(savedTheme);
renderBramoProgress();
themePicker?.addEventListener('click', event => {
  const button = event.target.closest('[data-theme]');
  if (button) {
    applyTheme(button.dataset.theme);
    renderBramoProgress();
  }
});

fullscreenToggle.checked = hideInFullscreen;

async function syncFullscreenVisibility() {
  if (!hideInFullscreen || !window.__TAURI__?.window) return;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    if (document.fullscreenElement) await win.hide();
    else await win.show();
  } catch (error) {
    console.warn('Fullscreen visibility error:', error);
  }
}

fullscreenToggle.addEventListener('change', () => {
  hideInFullscreen = fullscreenToggle.checked;
  localStorage.setItem('bramo.hide.fullscreen', String(hideInFullscreen));
  syncFullscreenVisibility();
updateFullscreenMonitor();

const autostartPreference = localStorage.getItem('bramo.autostart.enabled') === 'true';

async function syncAutostartState() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke || !autostartToggle) return;
  try {
    const enabled = await invoke('plugin:autostart|is_enabled');
    autostartToggle.checked = Boolean(enabled);
  } catch (error) {
    console.warn('Autostart state error:', error);
    autostartToggle.checked = autostartPreference;
  }
}

autostartToggle?.addEventListener('change', async () => {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;
  const enabled = autostartToggle.checked;
  try {
    await invoke(enabled ? 'plugin:autostart|enable' : 'plugin:autostart|disable');
    localStorage.setItem('bramo.autostart.enabled', String(enabled));
    showBramoMessage(enabled ? 'Auto-start aktif ✅' : 'Auto-start mati', 2200);
  } catch (error) {
    console.warn('Autostart toggle error:', error);
    autostartToggle.checked = !enabled;
    showBramoMessage('Gagal mengubah auto-start 😕', 2500);
  }
});

syncAutostartState();

});
document.addEventListener('fullscreenchange', syncFullscreenVisibility);

async function pollWindowsFullscreen() {
  if (!hideInFullscreen || !window.__TAURI__?.core?.invoke) return;
  try {
    const active = await window.__TAURI__.core.invoke('is_other_window_fullscreen');
    const win = window.__TAURI__.window.getCurrentWindow();
    if (active && !hiddenByFullscreen) {
      hiddenByFullscreen = true;
      await win.hide();
    } else if (!active && hiddenByFullscreen) {
      hiddenByFullscreen = false;
      await win.show();
    }
  } catch (error) {
    console.warn('Windows fullscreen detection error:', error);
  }
}

function updateFullscreenMonitor() {
  if (fullscreenMonitorTimer) clearInterval(fullscreenMonitorTimer);
  fullscreenMonitorTimer = hideInFullscreen ? setInterval(pollWindowsFullscreen, 700) : null;
  if (hideInFullscreen) pollWindowsFullscreen();
}

updateFullscreenMonitor();
let lastDroppedPath = null;
let droppedHistory = JSON.parse(localStorage.getItem('bramo.file.history') || '[]');

function renderDropHistory() {
  if (!dropHistory) return;
  dropHistory.innerHTML = droppedHistory.slice(0, 5).map((item, index) =>
    `<button class="drop-history-item interactive" data-history-index="${index}" type="button">${item.name}</button>`
  ).join('');
  dropHistory.querySelectorAll('[data-history-index]').forEach(button => {
    button.addEventListener('click', () => selectDroppedFile(droppedHistory[Number(button.dataset.historyIndex)]));
  });
}

function selectDroppedFile(file) {
  if (!file) return;
  lastDroppedPath = file.path;
  dropStatus.textContent = file.name;
  if (dropActions) dropActions.hidden = false;
}

function rememberDroppedFile(path) {
  const name = path.split(/[\\/]/).pop() || path;
  droppedHistory = [{ name, path }, ...droppedHistory.filter(item => item.path !== path)].slice(0, 5);
  localStorage.setItem('bramo.file.history', JSON.stringify(droppedHistory));
  selectDroppedFile(droppedHistory[0]);
  renderDropHistory();
}

renderDropHistory();

openDroppedFile?.addEventListener('click', async () => {
  if (!lastDroppedPath) return;
  try { await window.__TAURI__.core.invoke('open_dropped_file', { path: lastDroppedPath }); }
  catch (error) { showBramoMessage('File tidak bisa dibuka 😕', 2500); }
});

revealDroppedFile?.addEventListener('click', async () => {
  if (!lastDroppedPath) return;
  try { await window.__TAURI__.core.invoke('reveal_dropped_file', { path: lastDroppedPath }); }
  catch (error) { showBramoMessage('Folder tidak bisa dibuka 😕', 2500); }
});

function setStableMediaState(active) {
  if (mediaCandidate === active) mediaCandidateCount += 1;
  else {
    mediaCandidate = active;
    mediaCandidateCount = 1;
  }
  return mediaCandidateCount >= 2;
}

function applyMusicVibe(media) {
  const isVibing = Boolean(media.active && media.playing);
  bramoContainer.classList.toggle('music-vibing', isVibing);
  if (!isVibing) return;

  const source = `${media.title || ''}:${media.artist || ''}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(index);
    hash |= 0;
  }
  const palettes = [
    ['#00f0ff', '#1683ff'],
    ['#ff6b35', '#ffbd59'],
    ['#d66bff', '#7b61ff'],
    ['#65ff9a', '#00c878'],
    ['#ff5aa5', '#ff8a3d']
  ];
  const [primary, secondary] = palettes[Math.abs(hash) % palettes.length];
  bramoContainer.style.setProperty('--music-primary', primary);
  bramoContainer.style.setProperty('--music-secondary', secondary);
}

function clearMusicMode() {
  isMusicVibing = false;
  mediaWindowActive = false;
  bramoContainer.classList.remove('music-vibing', 'media-playing-layout');
  musicPanel?.classList.remove('media-active');
  nowPlayingBar?.classList.remove('media-active');
}

async function applyMediaSnapshot(media) {
  if (!media || !musicPanel) return;

  lastMediaState = { active: Boolean(media.active), playing: Boolean(media.playing) };

  if (adhanSessionActive || Date.now() < suppressMediaUntil) {
    clearMusicMode();
    return;
  }

  const sessionLabel = `${media.title || ''} ${media.artist || ''}`;
  const adhanSession = /adhan|adzan|azan/i.test(sessionLabel);
  const bramoSession = /^bramo$/i.test((media.title || '').trim());
  if (adhanSession || bramoSession) {
    clearMusicMode();
    return;
  }

  applyMusicVibe(media);
  const nextVibingState = Boolean(media.active && media.playing);
  if (nextVibingState && !isMusicVibing) {
    const trackLabel = media.title || 'lagu ini';
    showBramoMessage(`Lagi vibing: ${trackLabel} 🎵`, 4500);
  }
  isMusicVibing = nextVibingState;

  const stateStable = setStableMediaState(media.active);
  if (stateStable) {
    const stateChanged = mediaWindowActive !== media.active;
    mediaWindowActive = media.active;
    await applyWindowLayout();
    if (stateChanged && speechBubble.classList.contains('show')) await syncBubbleWindow(true);
  }

  musicPanel.classList.toggle('media-active', mediaWindowActive);
  nowPlayingBar.classList.toggle('media-active', mediaWindowActive);
  bramoContainer.classList.toggle('media-playing-layout', mediaWindowActive);

  if (!mediaWindowActive) {
    musicStatus.textContent = 'No media active';
    nowPlayingTitle.textContent = 'No media';
    nowPlayingArtist.textContent = '';
    return;
  }

  const title = media.title || 'Media aktif';
  musicStatus.textContent = media.artist ? `${title} — ${media.artist}` : title;
  nowPlayingTitle.textContent = title;
  nowPlayingArtist.textContent = media.artist || media.source || '';
  document.querySelectorAll('[data-media-action="play-pause"]').forEach(button => {
    button.textContent = media.playing ? '⏸' : '▶';
  });
}

async function updateMediaInfo() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke || !musicPanel) return;

  try {
    const media = await invoke('get_media_info');
    await applyMediaSnapshot(media);
  } catch (error) {
    // Jangan langsung menyembunyikan mini-player hanya karena satu refresh
    // gagal; Windows Media Session kadang menjawab sementara saat track berubah.
    musicPanel.classList.toggle('media-active', mediaWindowActive);
    nowPlayingBar.classList.toggle('media-active', mediaWindowActive);
    bramoContainer.classList.toggle('media-playing-layout', mediaWindowActive);
    isMusicVibing = false;
  }
}

updateMediaInfo();

mediaButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const action = button.dataset.mediaAction;
    const invoke = window.__TAURI__?.core?.invoke;
    if (!invoke) return;

    try {
      await invoke('control_media', { action });
      awardFeatureMilestone('media-control', 'mengontrol musik');
      const labels = {
        previous: 'Previous track',
        'play-pause': 'Play / Pause',
        next: 'Next track'
      };
      musicStatus.textContent = labels[action] || 'Media command sent';
      showBramoMessage(`${labels[action]} 🎵`, 1800);
      setTimeout(updateMediaInfo, 250);
    } catch (error) {
      console.warn('Media control error:', error);
      musicStatus.textContent = 'Media control gagal';
      showBramoMessage('Kontrol media gagal 😕', 2200);
    }
  });
});

prayerToggle.checked = prayerEnabled;
prayerToggle.nextElementSibling.textContent = prayerEnabled ? 'Reminder ON' : 'Reminder OFF';
audioToggle.checked = audioEnabled;
audioToggle.nextElementSibling.textContent = audioEnabled ? 'Audio ON' : 'Audio OFF';
clipboardToggle.checked = clipboardWatcherEnabled;
typingToggle.checked = typingCuriosityEnabled;
prayerToggle.addEventListener('change', () => {
  prayerEnabled = prayerToggle.checked;
  localStorage.setItem('bramo.prayer.enabled', String(prayerEnabled));
  prayerToggle.nextElementSibling.textContent = prayerEnabled ? 'Reminder ON' : 'Reminder OFF';
  if (prayerEnabled) loadPrayerSchedule();
  else prayerNext.textContent = 'Reminder dimatikan';
});

prayerTest.addEventListener('click', () => {
  awardFeatureMilestone('prayer-test', 'mencoba Prayer Reminder');
  const testPrayers = prayerSchedule?.prayers || [
    { name: 'Subuh' },
    { name: 'Zuhur' },
    { name: 'Asar' },
    { name: 'Magrib' },
    { name: 'Isya' }
  ];
  const prayer = testPrayers[testPrayerIndex % testPrayers.length];
  testPrayerIndex += 1;
  beginAdhanSession(prayer.name, audioEnabled);
});

audioToggle.addEventListener('change', () => {
  audioEnabled = audioToggle.checked;
  localStorage.setItem('bramo.prayer.audio', String(audioEnabled));
  audioToggle.nextElementSibling.textContent = audioEnabled ? 'Audio ON' : 'Audio OFF';
  if (!audioEnabled) stopAdhan();
});

prayerMute.addEventListener('click', () => {
  stopAdhan();
  prayerMute.textContent = 'Muted';
  setTimeout(() => { prayerMute.textContent = 'Mute Audio'; }, 1500);
});

clipboardToggle.addEventListener('change', () => {
  awardFeatureMilestone('clipboard-watcher', 'mengaktifkan Clipboard Watcher');
  clipboardWatcherEnabled = clipboardToggle.checked;
  localStorage.setItem('bramo.clipboard.watcher', String(clipboardWatcherEnabled));
  if (clipboardWatcherEnabled) startClipboardWatcher();
  else stopClipboardWatcher();
});

typingToggle.addEventListener('change', () => {
  awardFeatureMilestone('typing-curiosity', 'mengaktifkan Typing Curiosity');
  typingCuriosityEnabled = typingToggle.checked;
  localStorage.setItem('bramo.typing.curiosity', String(typingCuriosityEnabled));
  window.__TAURI__?.core?.invoke('set_typing_watcher', { enabled: typingCuriosityEnabled })
    .catch(err => console.warn('Typing watcher error:', err));
});

function playAdhan() {
  if (!audioEnabled || !adhanAudio) return;
  adhanAudio.currentTime = 0;
  adhanAudio.play().catch(err => {
    console.warn('Adhan playback blocked:', err);
    endAdhanSession();
  });
}

function stopAdhan() {
  if (!adhanAudio) return;
  adhanAudio.pause();
  adhanAudio.currentTime = 0;
}

function setAdhanVisualMode(active) {
  bramoContainer.classList.toggle('adhan-speaking', active);
  hatTrigger.classList.toggle('adhan-mode', active);
}

async function pauseMediaForAdhan() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;
  try {
    const media = await invoke('get_media_info');
    if (media?.active && media.playing) {
      await invoke('control_media', { action: 'play-pause' });
      mediaPausedByAdhan = true;
    }
  } catch (error) {
    console.warn('Pause media for adhan error:', error);
    // Fallback: kalau status media tidak terbaca, pakai state terakhir dari
    // event media Rust (atau state vibe frontend).
    if ((lastMediaState.active && lastMediaState.playing) || isMusicVibing) {
      try {
        await invoke('control_media', { action: 'play-pause' });
        mediaPausedByAdhan = true;
      } catch (fallbackError) {
        console.warn('Fallback pause media error:', fallbackError);
      }
    }
  }
}

async function resumeMediaAfterAdhan() {
  if (!mediaPausedByAdhan) return;
  mediaPausedByAdhan = false;
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke) return;
  try {
    const media = await invoke('get_media_info');
    if (media?.active && !media.playing) {
      await invoke('control_media', { action: 'play-pause' });
    }
  } catch (error) {
    console.warn('Resume media after adhan error:', error);
  }
}

async function beginAdhanSession(prayerName, withAudio) {
  if (adhanSessionActive) return;
  adhanSessionActive = true;
  if (adhanResumeTimer) {
    clearTimeout(adhanResumeTimer);
    adhanResumeTimer = null;
  }
  clearMusicMode();
  await pauseMediaForAdhan();
  suppressMediaUntil = Date.now() + ADHAN_SUPPRESS_MS;
  showBramoMessage(`Saatnya menunaikan sholat ${prayerName} 🤲`, null, true);
  if (withAudio) playAdhan();
  else adhanResumeTimer = setTimeout(endAdhanSession, 15000);
}

async function endAdhanSession() {
  if (!adhanSessionActive) return;
  adhanSessionActive = false;
  if (adhanResumeTimer) {
    clearTimeout(adhanResumeTimer);
    adhanResumeTimer = null;
  }
  await resumeMediaAfterAdhan();
  suppressMediaUntil = Date.now() + 3000;
  hideBramoMessage();
}

adhanAudio.addEventListener('play', () => setAdhanVisualMode(true));
adhanAudio.addEventListener('pause', () => {
  setAdhanVisualMode(false);
  endAdhanSession();
});
adhanAudio.addEventListener('ended', () => {
  setAdhanVisualMode(false);
  endAdhanSession();
});

let recentPanelSwitches = [];
utilityTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const panelId = tab.dataset.panel;
    utilityTabs.forEach(item => item.classList.toggle('active', item === tab));
    const now = Date.now();
    recentPanelSwitches = recentPanelSwitches.filter(item => now - item.at < 45_000);
    recentPanelSwitches.push({ id: panelId, at: now });
    if (new Set(recentPanelSwitches.map(item => item.id)).size >= 4) {
      recentPanelSwitches = [];
      triggerBramoReaction('busy', 1100);
    }
    utilityPanels.forEach(panel => panel.classList.toggle('active', panel.id === panelId));
    awardBramoXp('panel', 3, 20_000);
    const featureNames = {
      musicPanel: 'Music', statsPanel: 'System Stats', filePanel: 'File Drop',
      powerPanel: 'Power dan tema', prayerPanel: 'Prayer Reminder',
      pomodoroPanel: 'Pomodoro', bioRhythmPanel: 'Bio-rhythm Reminder', launcherPanel: 'Quick Launcher'
    };
    if (featureNames[panelId]) awardFeatureMilestone(panelId, featureNames[panelId]);
    if (panelId === 'statsPanel') updateSystemStats();
    if (panelId === 'prayerPanel') loadPrayerSchedule();
  });
});

function getDeviceLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve({ latitude: -6.2088, longitude: 106.8456, label: 'Jakarta (fallback)' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'Lokasi perangkat'
      }),
      () => resolve({ latitude: -6.2088, longitude: 106.8456, label: 'Jakarta (fallback)' }),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 86400000 }
    );
  });
}

function formatPrayerTime(value) {
  return value?.split(' ')[0] || '--:--';
}

async function loadPrayerSchedule() {
  if (!prayerEnabled) return;
  if (prayerSchedule?.date === new Date().toDateString()) return;
  prayerNext.textContent = 'Memuat jadwal...';

  try {
    const location = await getDeviceLocation();
    const date = new Date();
    const dateParam = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateParam}?latitude=${location.latitude}&longitude=${location.longitude}&method=20`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Prayer API ${response.status}`);
    const payload = await response.json();
    const timings = payload.data.timings;
    const prayers = [
      ['Subuh', timings.Fajr],
      ['Zuhur', timings.Dhuhr],
      ['Asr', timings.Asr],
      ['Magrib', timings.Maghrib],
      ['Isha', timings.Isha]
    ].map(([name, time]) => ({
      name: name === 'Asr' ? 'Asar' : name === 'Isha' ? 'Isya' : name,
      time: formatPrayerTime(time)
    }));

    prayerSchedule = { date: date.toDateString(), prayers };
    prayerLocation.textContent = `Lokasi: ${location.label}`;
    updateNextPrayer();
  } catch (err) {
    prayerNext.textContent = 'Jadwal belum tersedia';
    prayerLocation.textContent = 'Periksa koneksi internet';
    console.warn('Prayer schedule error:', err);
  }
}

function updateNextPrayer() {
  if (!prayerEnabled || !prayerSchedule) return;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let next = prayerSchedule.prayers.find(prayer => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    return hours * 60 + minutes > currentMinutes;
  });
  if (!next) next = prayerSchedule.prayers[0];
  prayerNext.textContent = `Berikutnya: ${next.name} • ${next.time}`;

  const currentKey = `${now.toDateString()}-${now.getHours()}:${now.getMinutes()}`;
  const due = prayerSchedule.prayers.find(prayer => prayer.time === `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  if (due && lastPrayerAlert !== currentKey) {
    lastPrayerAlert = currentKey;
    beginAdhanSession(due.name, audioEnabled);
  }
}

loadPrayerSchedule();
prayerReminderTimer = setInterval(() => {
  if (prayerEnabled) {
    if (!prayerSchedule || prayerSchedule.date !== new Date().toDateString()) loadPrayerSchedule();
    updateNextPrayer();
  }
}, 30000);

const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

async function registerFileDropHandler() {
  if (!window.__TAURI__?.window || !fileDropZone) return;

  function celebrateFiles(fileNames) {
    if (!fileNames.length) return;
    awardFeatureMilestone('file-drop', 'menerima file');
    dropStatus.textContent = fileNames.length === 1
      ? fileNames[0]
      : `${fileNames.length} item diterima`;
    bramoContainer.classList.add('file-drop-success');
    triggerHappyMouth();
    showBramoMessage(`File diterima: ${fileNames[0]}`, 4000);
    setTimeout(() => bramoContainer.classList.remove('file-drop-success'), 1200);
  }

  window.addEventListener('paste', event => {
    const files = Array.from(event.clipboardData?.files || []);
    const hasText = event.clipboardData?.types?.includes('text/plain');
    if (!files.length && !hasText) return;
    awardFeatureMilestone('clipboard-paste', 'memakai clipboard');
    event.preventDefault();
    const pastedLabel = files.length === 1
      ? files[0].name
      : files.length > 1
        ? `${files.length} file`
        : 'teks';
    dropStatus.textContent = `Paste: ${pastedLabel}`;
    bramoContainer.classList.add('clipboard-paste-success');
    triggerHappyMouth();
    showBramoMessage('Clipboard telah di-paste! 📋', 3500);
    setTimeout(() => bramoContainer.classList.remove('clipboard-paste-success'), 1400);
  });

  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    await win.onDragDropEvent(event => {
      const payload = event.payload;

      if (payload.type === 'over' || payload.type === 'enter') {
        fileDropZone.classList.add('is-drag-over');
        dropStatus.textContent = 'Lepaskan file di sini';
        return;
      }

      if (payload.type === 'leave') {
        fileDropZone.classList.remove('is-drag-over');
        dropStatus.textContent = 'Belum ada file';
        return;
      }

      if (payload.type === 'drop') {
        const files = payload.paths || [];
        fileDropZone.classList.remove('is-drag-over');
        if (!files.length) return;

        const fileNames = files.map(path => path.split(/[\\/]/).pop());
        dropStatus.textContent = fileNames.length === 1
          ? fileNames[0]
          : `${fileNames.length} file diterima`;
        celebrateFiles(fileNames);
        rememberDroppedFile(files[0]);
      }
    });
  } catch (err) {
    console.warn('File drop handler error:', err);
  }
}

registerFileDropHandler();

async function readClipboardSignature() {
  if (!navigator.clipboard) return null;
  try {
    if (navigator.clipboard.read) {
      const items = await navigator.clipboard.read();
      const signatures = [];
      for (const item of items) {
        const types = [...item.types].sort();
        let detail = '';
        if (types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const value = await blob.text();
          detail = `${value.length}:${clipboardChecksum(value)}`;
        } else if (types.includes('text/uri-list')) {
          const blob = await item.getType('text/uri-list');
          const value = await blob.text();
          detail = `${value.length}:${clipboardChecksum(value)}`;
        }
        signatures.push(`${types.join(',')}:${detail}`);
      }
      return signatures.join('|');
    }
    const text = await navigator.clipboard.readText();
    return `text:${text.length}:${text.slice(0, 32)}`;
  } catch (err) {
    return null;
  }
}

function clipboardChecksum(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return hash >>> 0;
}

async function pollClipboard() {
  if (!clipboardWatcherEnabled || adhanSessionActive) return;
  const signature = await readClipboardSignature();
  if (!signature) return;
  if (lastClipboardSignature === null) {
    lastClipboardSignature = signature;
    return;
  }
  if (signature !== lastClipboardSignature) {
    lastClipboardSignature = signature;
    dropStatus.textContent = 'Clipboard baru terdeteksi';
    bramoContainer.classList.add('file-drop-success');
    triggerHappyMouth();
    showBramoMessage('Clipboard diterima! 😋', 3500);
    setTimeout(() => bramoContainer.classList.remove('file-drop-success'), 1200);
  }
}

function startClipboardWatcher() {
  stopClipboardWatcher();
  const invoke = window.__TAURI__?.core?.invoke;
  if (invoke) {
    // Rust jadi sumber tunggal deteksi clipboard; frontend hanya menampilkan
    // isi clipboard yang dikirim Rust.
    invoke('set_clipboard_watcher', { enabled: true }).catch(err => {
      console.warn('Clipboard watcher enable error:', err);
    });
    return;
  }
  // Fallback untuk preview di browser (tanpa Tauri).
  lastClipboardSignature = null;
  pollClipboard();
  clipboardTimer = setInterval(pollClipboard, 1500);
}

function stopClipboardWatcher() {
  if (clipboardTimer) clearInterval(clipboardTimer);
  clipboardTimer = null;
  lastClipboardSignature = null;
  const invoke = window.__TAURI__?.core?.invoke;
  if (invoke) {
    invoke('set_clipboard_watcher', { enabled: false }).catch(err => {
      console.warn('Clipboard watcher disable error:', err);
    });
  }
}

if (clipboardWatcherEnabled) startClipboardWatcher();

// Sinkronkan gate watcher Rust dengan preferensi tersimpan.
window.__TAURI__?.core?.invoke('set_typing_watcher', { enabled: typingCuriosityEnabled })
  .catch(err => console.warn('Typing watcher sync error:', err));

async function registerNativeActivityListeners() {
  const listen = window.__TAURI__?.event?.listen;
  if (!listen) return;

  const win = window.__TAURI__?.window?.getCurrentWindow();
  if (win?.onMoved) {
    await win.onMoved(({ payload }) => {
      // Keep persisted coordinates in sync with OS-level moves too, including
      // Win+Shift+Arrow. This prevents startup restore from resurrecting an
      // old monitor position later.
      windowPositionRevision += 1;
      saveWindowPosition(payload);
    });
  }

  await listen('bramo://media', async (event) => {
    try {
      await applyMediaSnapshot(event.payload);
    } catch (error) {
      console.warn('Media event error:', error);
    }
  });

  await listen('bramo://tray-action', (event) => {
    const action = event.payload;
    if (action === 'sleep') enterSleepMode();
    if (action === 'quit') {
      // Buka panel Power supaya tombol Quit bisa diklik lagi untuk konfirmasi.
      if (!bramoContainer.classList.contains('expanded')) dropdownToggle.click();
      confirmQuit();
    }
  });

  await listen('bramo://drag-ended', () => {
    handleDragRelease();
  });

  await listen('bramo://drag-motion', (event) => {
    registerDragShake(event.payload);
  });

  await listen('bramo://typing', async (event) => {
    noteBramoActivity();
    if (!typingCuriosityEnabled || adhanSessionActive) return;
    if (typingCuriousTimeout) clearTimeout(typingCuriousTimeout);
    bramoContainer.classList.add('typing-curious');
    typingEyeTarget = event.payload || null;
    await updateTypingEyeTarget();
    typingCuriousTimeout = setTimeout(() => {
      bramoContainer.classList.remove('typing-curious');
      typingEyeTarget = null;
      typingCuriousTimeout = null;
    }, 5500);
  });

  await listen('bramo://clipboard-pasted', () => {
    // Ctrl+V adalah aksi eksplisit dari user, jadi tetap tampil walaupun
    // clipboard watcher sedang OFF. Toggle hanya mengatur deteksi clipboard
    // baru di background, bukan feedback untuk paste yang dilakukan user.
    if (adhanSessionActive) return;
    dropStatus.textContent = 'Clipboard telah di-paste';
    bramoContainer.classList.add('clipboard-paste-success');
    triggerHappyMouth();
    showBramoMessage('Clipboard telah di-paste! 📋', 3500);
    setTimeout(() => bramoContainer.classList.remove('clipboard-paste-success'), 1400);
  });

  await listen('bramo://clipboard-changed', async (event) => {
    if (!clipboardWatcherEnabled || adhanSessionActive) return;
    const text = event.payload || await window.__TAURI__?.core?.invoke('get_clipboard_text');
    dropStatus.textContent = 'Clipboard baru terdeteksi';
    bramoContainer.classList.add('file-drop-success');
    triggerHappyMouth();
    const preview = typeof text === 'string' ? text.trim() : '';
    showBramoMessage(preview ? `Clipboard: ${preview.slice(0, 80)}` : 'Clipboard diterima! 😋', 3500);
    setTimeout(() => bramoContainer.classList.remove('file-drop-success'), 1200);
  });
}

registerNativeActivityListeners().catch(err => console.warn('Native activity listener error:', err));

async function updateSystemStats() {
  if (!bramoContainer.classList.contains('expanded')) return;

  try {
    const invoke = window.__TAURI__?.core?.invoke;
    if (invoke) {
      const stats = await invoke('get_system_stats');
      const memoryPercent = stats.memory_total
        ? (stats.memory_used / stats.memory_total) * 100
        : 0;
      cpuValue.textContent = `${Math.round(stats.cpu)}%`;
      memoryValue.textContent = `${Math.round(memoryPercent)}%`;
    }

    if (!batteryManager && navigator.getBattery) {
      batteryManager = await navigator.getBattery();
    }
    batteryValue.textContent = batteryManager
      ? `${Math.round(batteryManager.level * 100)}%`
      : 'N/A';

    const cpu = Number.parseFloat(cpuValue.textContent);
    const memory = Number.parseFloat(memoryValue.textContent);
    const stressed = cpu >= 85 || memory >= 90;
    bramoContainer.classList.toggle('system-stressed', stressed);
  } catch (err) {
    console.warn('System stats error:', err);
  }
}

function startStatsPolling() {
  if (statsTimer) clearInterval(statsTimer);
  updateSystemStats();
  statsTimer = setInterval(updateSystemStats, 3000);
}

function stopStatsPolling() {
  if (statsTimer) {
    clearInterval(statsTimer);
    statsTimer = null;
  }
}

async function resizeNativeWindow(win, size) {
  let release;
  const previous = nativeResizeQueue;
  nativeResizeQueue = new Promise(resolve => { release = resolve; });
  await previous;

  try {
    const scale = await win.scaleFactor();
    const physicalSize = {
      width: Math.round(size.width * scale),
      height: Math.round(size.height * scale)
    };
    const target = new window.__TAURI__.window.PhysicalSize(physicalSize.width, physicalSize.height);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await win.setSize(target);
      await nextFrame();
      const actual = await win.outerSize();
      if (actual.width === physicalSize.width && actual.height === physicalSize.height) return actual;
    }

    const actual = await win.outerSize();
    console.warn('Native window resize mismatch:', { expected: physicalSize, actual, scale });
    return actual;
  } finally {
    release();
  }
}

function isPomodoroVisible() {
  return Boolean(pomodoroTimer || pomodoroSeconds !== pomodoroDuration);
}

function computeSleepWindowSize() {
  const hasMedia = bramoContainer.classList.contains('media-playing-layout');
  const hasPomodoro = bramoContainer.classList.contains('pomodoro-active');
  if (hasMedia && hasPomodoro) return { width: 220, height: 150 };
  if (hasMedia) return { width: 220, height: 110 };
  if (hasPomodoro) return { width: 220, height: 105 };
  return { width: 220, height: 76 };
}

// Satu sumber ukuran window: expanded > media+pomodoro > media > pomodoro > compact.
function computeTargetWindowSize(options = {}) {
  if (!options.ignoreSleep && isBramoSleeping) return computeSleepWindowSize();
  if (bramoContainer.classList.contains('expanded')) return { ...EXPANDED_WINDOW_SIZE };

  const hasMedia = mediaWindowActive;
  const hasPomodoro = isPomodoroVisible();
  if (hasMedia && hasPomodoro) return { width: 220, height: 210 };
  if (hasMedia) return { ...MEDIA_WINDOW_SIZE };
  if (hasPomodoro) return { width: 220, height: 140 };
  return { ...COMPACT_WINDOW_SIZE };
}

async function applyWindowLayout({ anchor, size } = {}) {
  if (isActivelyDragging || isDragCandidate || !window.__TAURI__?.window) return;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const target = { ...(size || computeTargetWindowSize()) };
    const scale = await win.scaleFactor();
    const current = await win.outerSize();
    // Layout refreshes (for example, each Pomodoro tick) must not collapse the
    // native window while a persistent reminder bubble is still visible.
    if (speechBubble.classList.contains('show') && !bramoContainer.classList.contains('expanded')) {
      target.height = Math.max(target.height, Math.ceil(current.height / scale));
    }
    const targetPhysical = {
      width: Math.round(target.width * scale),
      height: Math.round(target.height * scale)
    };
    const sizeChanged = current.width !== targetPhysical.width || current.height !== targetPhysical.height;
    if (isActivelyDragging || isDragCandidate) return;

    if (!sizeChanged && !anchor) return;

    if (sizeChanged) await resizeNativeWindow(win, target);
    if (isActivelyDragging || isDragCandidate) return;
    if (anchor) {
      await win.setPosition({ type: 'Physical', x: anchor.x, y: anchor.y });
    }
    await updateAdaptivePositioning();
  } catch (error) {
    console.warn('Window layout error:', error);
  }
}

async function syncBubbleWindow(isVisible) {
  // Speech-bubble timeouts can fire while dragging. Resizing or restoring the
  // saved pre-drag anchor here would pull the widget back to its old monitor.
  if (isActivelyDragging || isDragCandidate || !window.__TAURI__?.window || bramoContainer.classList.contains('expanded')) return;

  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    let pos = await win.outerPosition();
    if (isActivelyDragging || isDragCandidate) return;

    if (!isVisible) {
      await resizeNativeWindow(win, computeTargetWindowSize());
      if (isActivelyDragging || isDragCandidate) return;
      if (bubbleBasePosition) {
        await win.setPosition({
          type: 'Physical',
          x: bubbleBasePosition.x,
          y: bubbleBasePosition.y
        });
      }
      bubbleBasePosition = null;
      await updateAdaptivePositioning();
      return;
    }

    // Keep the original compact anchor if a new message replaces a visible
    // bubble. Replacing it with the expanded-window position makes each
    // message shift the widget again and can clip the bubble intermittently.
    if (!bubbleBasePosition) bubbleBasePosition = { x: pos.x, y: pos.y };
    await nextFrame();
    if (isActivelyDragging || isDragCandidate) return;

    // Measure after the scale-in finishes. Measuring on the first frame sees
    // the bubble at 80% scale, so longer messages can outgrow the native window.
    await new Promise(resolve => setTimeout(resolve, 340));
    if (!speechBubble.classList.contains('show') || isActivelyDragging || isDragCandidate) return;
    pos = { ...bubbleBasePosition };
    const bubbleAbove = bramoContainer.classList.contains('flip-bubble');

    const elements = [bramoContainer, speechBubble, hatTrigger, mediaWindowActive ? nowPlayingBar : null]
      .filter(element => element && (element === bramoContainer || element.offsetParent !== null));
    const rects = elements.map(element => element.getBoundingClientRect());
    const minTop = Math.min(...rects.map(rect => rect.top));
    const maxBottom = Math.max(...rects.map(rect => rect.bottom));
    const baseWindowSize = computeTargetWindowSize();
    const requiredHeight = Math.max(
      baseWindowSize.height,
      Math.ceil(maxBottom - minTop + 8)
    );

    await resizeNativeWindow(win, {
      width: COMPACT_WINDOW_SIZE.width,
      height: requiredHeight
    });
    if (isActivelyDragging || isDragCandidate) return;

    // Keep the capsule anchored. If the bubble is above the capsule, grow the
    // native window upward by the added height instead of teleporting the base.
    const addedHeight = Math.max(0, requiredHeight - baseWindowSize.height);
    const targetY = bubbleAbove
      ? Math.round(pos.y - addedHeight)
      : pos.y;
    await win.setPosition({ type: 'Physical', x: pos.x, y: targetY });
  } catch (err) {
    console.warn('Bubble window resize error:', err);
  }
}

function saveWindowPosition(pos) {
  if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify({ x: pos.x, y: pos.y }));
  } catch (err) {
    console.warn('Position save error:', err);
  }
}

function loadWindowPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY) || 'null');
    if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)) return saved;
  } catch (err) {
    console.warn('Position load error:', err);
  }
  return null;
}

async function restoreWindowPosition() {
  if (!window.__TAURI__?.window) return;
  const saved = loadWindowPosition();
  const revisionAtStart = windowPositionRevision;

  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    // Set ukuran compact lebih dulu agar area transparan tidak menyentuh
    // aplikasi di belakang sebelum dropdown benar-benar dibuka.
    await resizeNativeWindow(win, COMPACT_WINDOW_SIZE);
    bramoContainer.classList.remove('expanded');
    if (saved && revisionAtStart === windowPositionRevision) {
      await win.setPosition({ type: 'Physical', x: saved.x, y: saved.y });
    }
    await updateAdaptivePositioning();
  } catch (err) {
    console.warn('Position restore error:', err);
  }
}

// --- SPEECH BUBBLE & CONTEXTUAL QUOTES ---
const bramoQuotes = [
  "Sistem stabil, Bos! ⚡",
  "Lagi mikirin project apa nih?",
  "Jangan lupa ngopi dulu ☕",
  "Waktunya istirahat sebentar!",
  "Siap tempur, Bro! 🤖",
  "Kode aman, hati senang.",
  "Double-click topi buat snap!"
];

const interactiveQuotes = {
  drag_start: ["Waduh, mau dibawa kemana?", "Awas tumpah!"],
  drag_end: ["Pendaratan mulus! 🛬", "Udah nyampe?"],
  idle_click: ["Jangan dicolok-colok!", "Heh, geli!"]
};

const contextualQuotes = {
  snapped_top: [
    "Mode pemantauan satelit aktif 🛰️",
    "Nyaman banget nangkring di atas sini.",
    "Keliatan semua dari puncak, Bro!"
  ],
  edge_left: [
    "Wih, mepet banget ke kiri!",
    "Mau ngumpet di balik layar ya?",
    "Gelap euy di pinggir sini."
  ],
  edge_right: [
    "Kenapa dibuang ke pojok kanan?",
    "Hati-hati jatuh, Bro!",
    "Minggir sikit..."
  ],
  dropdown_open: [
    "Membuka panel rahasia... 📂",
    "Silakan dipilih menunya, Bos!",
    "Sistem utilitas siap diakses."
  ]
};

let bubbleTimeout = null;

function showBramoMessage(text, duration = 3000, attention = false) {
  if (!speechBubble || !speechText) return;
  if (bioRhythmDue && !attention) return;
  if (bramoContainer.classList.contains('dizzy') && !attention) return;
  if (adhanSessionActive && !attention) return;
  
  speechText.textContent = text;
  bramoContainer.classList.toggle('attention-reminder', attention);
  speechBubble.classList.add('show');

  syncBubbleWindow(true);

  if (bubbleTimeout) clearTimeout(bubbleTimeout);

  if (duration !== null) bubbleTimeout = setTimeout(hideBramoMessage, duration);
}

function hideBramoMessage(force = false) {
  if (bioRhythmDue && !force) return;
  if (bubbleTimeout) {
    clearTimeout(bubbleTimeout);
    bubbleTimeout = null;
  }
  speechBubble.classList.remove('show');
  bramoContainer.classList.remove('attention-reminder');
  syncBubbleWindow(false);
}

function showContextualMessage(category, duration = 3000) {
  const quotes = contextualQuotes[category];
  if (!quotes) return;
  const chosenQuote = quotes[Math.floor(Math.random() * quotes.length)];
  showBramoMessage(chosenQuote, duration);
}

function persistBioRhythmDeadline() {
  if (bioRhythmNextAt) localStorage.setItem('bramo.bio.nextAt', String(bioRhythmNextAt));
  else localStorage.removeItem('bramo.bio.nextAt');
}

function renderBioRhythmStatus() {
  if (!bioRhythmStatus) return;
  bioRhythmToggle.checked = bioRhythmEnabled;
  bioRhythmInterval.value = String(bioRhythmMinutes);
  bioRhythmInterval.disabled = !bioRhythmEnabled;
  bioRhythmReset.disabled = !bioRhythmEnabled;
  bioRhythmFollowup.hidden = !bioRhythmDue;
  bioBubbleActions.hidden = !bioRhythmDue;
  bioRhythmStatus.classList.toggle('is-due', bioRhythmDue && bioRhythmEnabled);
  if (!bioRhythmEnabled) {
    bioRhythmStatus.textContent = 'Pengingat mati';
    return;
  }
  const remaining = Math.max(0, bioRhythmNextAt - Date.now());
  const minutes = Math.ceil(remaining / 60_000);
  bioRhythmStatus.textContent = bioRhythmDue
    ? 'Waktunya jeda 🌿'
    : remaining <= 0
      ? 'Pengingat menunggu waktu yang pas…'
    : `Jeda berikutnya sekitar ${minutes} menit lagi`;
}

function startBioRhythmReminder(resetDeadline = false) {
  if (!bioRhythmEnabled) {
    bioRhythmNextAt = 0;
    bioRhythmDue = false;
    localStorage.removeItem('bramo.bio.due');
    persistBioRhythmDeadline();
    renderBioRhythmStatus();
    return;
  }
  if (resetDeadline || !bioRhythmNextAt) {
    bioRhythmNextAt = Date.now() + bioRhythmMinutes * 60_000;
    persistBioRhythmDeadline();
  }
  renderBioRhythmStatus();
}

function checkBioRhythmReminder() {
  if (!bioRhythmEnabled || !bioRhythmNextAt) return;
  if (Date.now() < bioRhythmNextAt) {
    renderBioRhythmStatus();
    return;
  }
  if (bioRhythmDue) {
    renderBioRhythmStatus();
    return;
  }
  const canRemind = !adhanSessionActive
    && !isBramoSleeping
    && !hiddenByFullscreen
    && !document.hidden
    && !bramoContainer.classList.contains('expanded')
    && !speechBubble.classList.contains('show')
    && !isActivelyDragging
    && !isDragCandidate;
  if (!canRemind) {
    bioRhythmStatus.textContent = 'Pengingat menunggu waktu yang pas…';
    return;
  }
  bioRhythmDue = true;
  localStorage.setItem('bramo.bio.due', 'true');
  showBramoMessage('Waktunya jeda sebentar 🌿 Regangkan badan, ya!', null, true);
  persistBioRhythmDeadline();
  renderBioRhythmStatus();
}

function completeBioRhythmBreak() {
  bioRhythmDue = false;
  localStorage.removeItem('bramo.bio.due');
  startBioRhythmReminder(true);
  hideBramoMessage(true);
}

function snoozeBioRhythmBreak() {
  bioRhythmDue = false;
  localStorage.removeItem('bramo.bio.due');
  bioRhythmNextAt = Date.now() + 10 * 60_000;
  persistBioRhythmDeadline();
  renderBioRhythmStatus();
  hideBramoMessage(true);
}

bioRhythmToggle.addEventListener('change', () => {
  bioRhythmEnabled = bioRhythmToggle.checked;
  localStorage.setItem('bramo.bio.enabled', String(bioRhythmEnabled));
  if (bioRhythmEnabled) awardFeatureMilestone('bio-rhythm', 'mengaktifkan pengingat jeda');
  startBioRhythmReminder(true);
});

bioRhythmInterval.addEventListener('change', () => {
  bioRhythmMinutes = Number(bioRhythmInterval.value);
  localStorage.setItem('bramo.bio.interval', String(bioRhythmMinutes));
  startBioRhythmReminder(true);
});

bioRhythmReset.addEventListener('click', () => {
  startBioRhythmReminder(true);
  bioRhythmStatus.textContent = `Timer jeda diulang · ${bioRhythmMinutes} menit`;
});

bioRhythmTest.addEventListener('click', () => {
  bioRhythmDue = true;
  localStorage.setItem('bramo.bio.due', 'true');
  showBramoMessage('Tes pengingat 🌿 Regangkan badan sebentar, ya!', null, true);
  renderBioRhythmStatus();
});

bioRhythmDone.addEventListener('click', completeBioRhythmBreak);
bioRhythmSnooze.addEventListener('click', snoozeBioRhythmBreak);
bioBubbleDone.addEventListener('click', completeBioRhythmBreak);
bioBubbleSnooze.addEventListener('click', snoozeBioRhythmBreak);

startBioRhythmReminder();
if (bioRhythmEnabled && bioRhythmDue) {
  showBramoMessage('Waktunya jeda sebentar 🌿 Regangkan badan, ya!', null, true);
}
bioRhythmTimer = setInterval(checkBioRhythmReminder, 15_000);

// Work area monitor yang paling relevan dengan posisi window (physical pixels).
// Memilih dari seluruh monitor mencegah clamp memakai monitor sumber setelah drag.
async function getWorkArea(win, position, size) {
  let monitors = [];
  if (position && size) {
    try {
      monitors = await win.availableMonitors();
    } catch (err) {}
  }
  if (!monitors.length) {
    try {
      const monitor = await win.currentMonitor();
      if (monitor) monitors = [monitor];
    } catch (err) {}
  }

  const dpi = window.devicePixelRatio || 1;
  const screenHeightCss = window.screen?.availHeight || window.screen?.height || 0;
  if (!monitors.length) {
    const width = Math.round((window.screen?.width || 0) * dpi);
    return {
      left: 0,
      top: 0,
      width,
      height: Math.round(screenHeightCss * dpi)
    };
  }

  const centerX = position && size ? position.x + size.width / 2 : null;
  const centerY = position && size ? position.y + size.height / 2 : null;
  const distanceToMonitor = monitor => {
    if (centerX === null) return 0;
    const left = monitor.position.x;
    const top = monitor.position.y;
    const right = left + monitor.size.width;
    const bottom = top + monitor.size.height;
    const dx = Math.max(left - centerX, 0, centerX - right);
    const dy = Math.max(top - centerY, 0, centerY - bottom);
    return dx * dx + dy * dy;
  };
  const monitor = [...monitors].sort((a, b) => distanceToMonitor(a) - distanceToMonitor(b))[0];
  const scale = monitor.scaleFactor || dpi;
  const taskbar = Math.max(0, Math.round(((window.screen?.height || screenHeightCss) - screenHeightCss) * scale));
  return {
    left: monitor.position.x,
    top: monitor.position.y,
    width: monitor.size.width,
    height: Math.max(0, monitor.size.height - taskbar)
  };
}

// --- SAFE DUAL-MODE ADAPTIVE POSITIONING ---
async function updateAdaptivePositioning() {
  if (isActivelyDragging || isDragCandidate || !window.__TAURI__?.window) return;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const pos = await win.outerPosition();
    const size = await win.outerSize();
    if (isActivelyDragging || isDragCandidate) return;
    const workArea = await getWorkArea(win, pos, size);
    if (isActivelyDragging || isDragCandidate) return;

    const maxY = Math.max(workArea.top, workArea.top + workArea.height - size.height);
    let newY = pos.y;
    let needsUpdate = false;

    // Top safety lock
    if (newY < workArea.top) {
      newY = workArea.top;
      needsUpdate = true;
    }

    // Bottom safety lock (disesuaikan dengan tinggi window aktual agar tidak kelewatan taskbar)
    if (newY > maxY) {
      newY = maxY;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await win.setPosition({
        type: 'Physical',
        x: pos.x,
        y: newY
      });
    }

    // Flip UI states
    const isLow = newY > workArea.top + workArea.height * 0.45;
    bramoContainer.classList.toggle('flip-dropdown', isLow);
    capsuleWrapper.classList.toggle('align-bottom', isLow);
    bramoContainer.classList.toggle('flip-bubble', isLow);
  } catch (err) {
    console.warn("Adaptive position error:", err);
  }
}

// Random chat acak berkala
function triggerRandomChat() {
  const canChat = !isActivelyDragging
    && !isDragCandidate
    && !adhanSessionActive
    && !isBramoSleeping
    && !bramoContainer.classList.contains('expanded')
    && !speechBubble.classList.contains('show')
    && !document.hidden;

  if (canChat) {
    const musicQuotes = [
      'Beat-nya enak banget, Bro 🎵',
      'BRAMO ikut hanyut sama lagunya ✨',
      'Vibes-nya dapet banget nih 😎',
      'Santai dulu, nikmati musiknya 🎶',
      'Lampu LED nyala, mood juga naik 🔥',
      'Lagu ini cocok buat nemenin kerja 💿'
    ];
    const quotePool = isMusicVibing ? musicQuotes : bramoQuotes;
    const randomQuote = quotePool[Math.floor(Math.random() * quotePool.length)];
    showBramoMessage(randomQuote, 3500);
  }
  const nextChatInterval = Math.random() * 60_000 + 60_000;
  setTimeout(triggerRandomChat, nextChatInterval);
}

setTimeout(triggerRandomChat, 25_000);

// Pulihkan posisi terakhir setelah window Tauri siap.
setTimeout(restoreWindowPosition, 0);

// --- 1. MOUSE DOWN ---
bramoCapsule.addEventListener('mousedown', async (e) => {
  if (e.button !== 0) return;
  if (e.target.closest('#dropdownToggle') || e.target.closest('.dropdown-panel')) return;
  if (isBramoSleeping) {
    // Bangun dulu, lalu lanjutkan event yang sama sebagai awal drag.
    // Dengan begitu wake + drag tidak dianggap sebagai klik yang memindahkan
    // window ke posisi lain.
    await wakeBramo();
  }

  windowPositionRevision += 1;
  isDragCandidate = true;
  dragStartClientX = e.clientX;
  dragStartClientY = e.clientY;
});

// --- 2. MOUSE MOVE ---
function beginNativeDrag() {
  if (!isDragCandidate) return;
  isDragCandidate = false;
  isActivelyDragging = true;
  if (dizzyResetTimer) {
    clearTimeout(dizzyResetTimer);
    dizzyResetTimer = null;
  }
  draggedWhileExpanded = bramoContainer.classList.contains('expanded');
  // The bubble anchor belongs to the old position and must not be restored
  // after the widget has been moved.
  bubbleBasePosition = null;

  bramoContainer.classList.add('is-dragging');
  bramoContainer.classList.remove('just-landed');
  setMouthState('whistle');
  if (Math.random() > 0.5) {
    const quotes = interactiveQuotes.drag_start;
    showBramoMessage(quotes[Math.floor(Math.random() * quotes.length)], 2000);
  }

  const win = window.__TAURI__?.window?.getCurrentWindow();
  if (win && typeof win.startDragging === 'function') {
    // Let the OS own the move loop so monitor transitions and mixed-DPI
    // coordinate changes cannot race our JavaScript setPosition calls.
    nativeDragMode = true;
    const invoke = window.__TAURI__?.core?.invoke;
    nativeDragPromise = (async () => {
      if (invoke) await invoke('set_drag_watcher', { enabled: true });
      await win.startDragging();
    })().catch(error => {
      nativeDragMode = false;
      invoke?.('set_drag_watcher', { enabled: false }).catch(() => {});
      console.warn('Native window drag failed:', error);
    });
  }
}

function registerDragShake(position) {
  if (adhanSessionActive || bioRhythmDue) {
    shakeSamples = [];
    return false;
  }
  if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return false;
  const now = Date.now();
  shakeSamples = shakeSamples.filter(sample => now - sample.time < 2000);
  const previous = shakeSamples.at(-1);
  shakeSamples.push({ x: position.x, y: position.y, time: now });
  if (shakeSamples.length > 32) shakeSamples.shift();
  if (previous && bramoContainer.classList.contains('dizzy') && isActivelyDragging) {
    const dx = position.x - previous.x;
    const dy = position.y - previous.y;
    const angle = Math.max(-18, Math.min(18, dx * 0.75));
    const lift = Math.max(-4, Math.min(4, dy * 0.2));
    visorScreen.style.setProperty('--dizzy-angle', `${angle}deg`);
    visorScreen.style.setProperty('--dizzy-lift', `${lift}px`);
  }
  if (now < dizzyUntil || shakeSamples.length < 5) return false;

  let reversals = 0;
  let lastDirection = 0;
  let travel = 0;
  for (let index = 1; index < shakeSamples.length; index += 1) {
    const dx = shakeSamples[index].x - shakeSamples[index - 1].x;
    const dy = shakeSamples[index].y - shakeSamples[index - 1].y;
    const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    if (Math.abs(delta) < 14) continue;
    const direction = Math.sign(delta);
    travel += Math.abs(delta);
    if (lastDirection && direction !== lastDirection) reversals += 1;
    lastDirection = direction;
  }
  if (reversals < 3 || travel < 260) return false;

  shakeSamples = [];
  dizzyUntil = now + 5000;
  showBramoMessage('Aduh, pusing! Jangan goyang-goyangin aku terus 😵‍💫', null);
  bramoContainer.classList.add('dizzy');
  return true;
}

function scheduleDizzyRecovery() {
  if (!bramoContainer.classList.contains('dizzy')) return;
  if (dizzyResetTimer) clearTimeout(dizzyResetTimer);
  dizzyResetTimer = setTimeout(() => {
    dizzyResetTimer = null;
    if (isActivelyDragging || isDragCandidate) return;
    bramoContainer.classList.remove('dizzy');
    visorScreen.style.removeProperty('--dizzy-angle');
    visorScreen.style.removeProperty('--dizzy-lift');
    hideBramoMessage();
  }, 4200);
}

window.addEventListener('mousemove', (e) => {
  if (isDragCandidate) {
    const dx = e.clientX - dragStartClientX;
    const dy = e.clientY - dragStartClientY;
    if (Math.hypot(dx, dy) < 5) return;
    beginNativeDrag();
  }
});

// --- 3. MOUSE UP ---
async function handleDragRelease() {
  if (isDragCandidate) {
    isDragCandidate = false;
    return;
  }
  if (!isActivelyDragging) return;
  isActivelyDragging = false;
  if (nativeDragMode) await nativeDragPromise;
  nativeDragMode = false;
  window.__TAURI__?.core?.invoke('set_drag_watcher', { enabled: false }).catch(() => {});

  bramoContainer.classList.remove('is-dragging');
  bramoCapsule.style.removeProperty('transform');
  if (bramoContainer.classList.contains('dizzy')) {
    visorScreen.style.setProperty('--dizzy-angle', '0deg');
    visorScreen.style.setProperty('--dizzy-lift', '0px');
    scheduleDizzyRecovery();
  }

  bramoContainer.classList.add('just-landed');
  awardBramoXp('drag', 5, 30_000, 'Drag BRAMO');
  setMouthState('');

  await updateAdaptivePositioning();
  await syncBubbleWindow(speechBubble.classList.contains('show'));

  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();
      const size = await win.outerSize();
      const workArea = await getWorkArea(win, pos, size);
      saveWindowPosition(pos);
      if (pos.x < workArea.left + 100) {
        showContextualMessage('edge_left', 3000);
      } else if (pos.x > workArea.left + workArea.width - 300) {
        showContextualMessage('edge_right', 3000);
      } else {
        if (Math.random() > 0.5) {
          const quotes = interactiveQuotes.drag_end;
          showBramoMessage(quotes[Math.floor(Math.random() * quotes.length)], 2500);
        }
      }
    } catch (err) {
      if (Math.random() > 0.5) {
        const quotes = interactiveQuotes.drag_end;
        showBramoMessage(quotes[Math.floor(Math.random() * quotes.length)], 2500);
      }
    }
  }

  setTimeout(() => {
    bramoContainer.classList.remove('just-landed');
  }, 450);
}

window.addEventListener('mouseup', handleDragRelease);
window.addEventListener('pointerup', handleDragRelease);

// --- IDLE CLICK ---
bramoCapsule.addEventListener('click', (e) => {
  if (isActivelyDragging) return;
  if (e.target.closest('.dropdown-panel') || e.target.closest('.dropdown-handle-bar')) return;
  
  const idleFor = Date.now() - lastBramoInteractionAt;
  triggerHappyMouth();
  if (idleFor >= 90_000) triggerBramoReaction('reunion', 1800);
  else if (idleFor >= 15_000 && Math.random() < 0.35) triggerBramoReaction('surprise', 700);
  else triggerBramoReaction('greet', 900);
  awardBramoXp('click', 2, 60_000, 'Menyapa BRAMO');
  const quotes = interactiveQuotes.idle_click;
  showBramoMessage(quotes[Math.floor(Math.random() * quotes.length)], 2000);
});

// --- 4. DOUBLE-CLICK TOPI (SNAP) ---
if (hatTrigger) {
  let lastHatClickTime = 0;

  hatTrigger.addEventListener('click', async (e) => {
    e.stopPropagation();
    const currentTime = new Date().getTime();

    if (currentTime - lastHatClickTime < 300) {
      triggerHappyMouth();

      if (window.__TAURI__?.window) {
        try {
          const win = window.__TAURI__.window.getCurrentWindow();
          const [currentPos, currentSize] = await Promise.all([
            win.outerPosition(),
            win.outerSize()
          ]);
          let workArea;
          const invoke = window.__TAURI__?.core?.invoke;
          if (invoke) {
            try {
              // Minta Windows menentukan monitor dari HWND BRAMO yang aktual;
              // ini menghindari pilihan monitor utama dari WebView/currentMonitor.
              workArea = await invoke('get_current_monitor_work_area');
            } catch (error) {
              console.warn('Native monitor lookup failed, using window bounds:', error);
            }
          }
          if (!workArea) workArea = await getWorkArea(win, currentPos, currentSize);

          bramoContainer.classList.remove('expanded');
          capsuleWrapper.classList.remove('is-expanded');
          await resizeNativeWindow(win, COMPACT_WINDOW_SIZE);
          const compactSize = await win.outerSize();
          const targetX = Math.round(workArea.left + (workArea.width - compactSize.width) / 2);
          const targetY = Math.round(workArea.top + 20);
          await win.setPosition({ type: 'Physical', x: targetX, y: targetY });
          saveWindowPosition({ x: targetX, y: targetY });
          await updateAdaptivePositioning();
          if (speechBubble.classList.contains('show')) {
            await syncBubbleWindow(true);
          }
          showContextualMessage('snapped_top', 3000);
        } catch (err) {
          console.warn("Auto-snap error:", err);
        }
      } else {
        showContextualMessage('snapped_top', 3000);
      }
    }

    lastHatClickTime = currentTime;
  });
}

// --- 5. PULL-TAB DROPDOWN (PRECISE DUAL-MODE TOGGLE) ---
let savedCompactY = null;
let wasFlipped = false;
let draggedWhileExpanded = false;
let dropdownIdleTimer = null;

function armDropdownIdleClose() {
  if (dropdownIdleTimer) clearTimeout(dropdownIdleTimer);
  if (!bramoContainer.classList.contains('expanded')) return;

  dropdownIdleTimer = setTimeout(() => {
    if (bramoContainer.classList.contains('expanded')) dropdownToggle.click();
    dropdownIdleTimer = null;
  }, 12000);
}

function closeDropdownWhenUnfocused() {
  if (bramoContainer.classList.contains('expanded')) dropdownToggle.click();
}

window.addEventListener('blur', closeDropdownWhenUnfocused);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) closeDropdownWhenUnfocused();
});
dropdownToggle.addEventListener('mouseenter', armDropdownIdleClose);
document.querySelectorAll('.dropdown-panel, .utility-tab, .dropdown-panel button, .dropdown-panel input')
  .forEach(element => element.addEventListener('pointerdown', armDropdownIdleClose));

dropdownToggle.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (isBramoSleeping) return;

  await updateAdaptivePositioning();

  const isExpanding = bramoContainer.classList.toggle('expanded');
  if (isExpanding) awardBramoXp('dropdown', 3, 20_000);
  capsuleWrapper.classList.toggle('is-expanded', isExpanding);
  if (isExpanding) armDropdownIdleClose();
  else if (dropdownIdleTimer) {
    clearTimeout(dropdownIdleTimer);
    dropdownIdleTimer = null;
  }
  if (isExpanding) startStatsPolling();
  else stopStatsPolling();
  triggerHappyMouth();
  if (isExpanding) triggerBramoReaction('think', 1500);

  if (isExpanding) {
    showContextualMessage('dropdown_open', 2500);
  }

  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();

      const COMPACT_H = COMPACT_WINDOW_SIZE.height;
      const EXPANDED_H = EXPANDED_WINDOW_SIZE.height;
      const scale = await win.scaleFactor();
      const heightDiff = Math.round((EXPANDED_H - COMPACT_H) * scale);
      const widthDiff = Math.round((EXPANDED_WINDOW_SIZE.width - COMPACT_WINDOW_SIZE.width) * scale);

      if (isExpanding) {
        wasFlipped = bramoContainer.classList.contains('flip-dropdown');
        savedCompactY = pos.y;

        let targetY = pos.y;
        if (wasFlipped) {
          // Sisakan ruang aman agar sisi atas panel yang di-flip tidak
          // menempel/terpotong oleh batas viewport.
          targetY = pos.y - heightDiff + 8;
        }

        const targetX = Math.round(pos.x - widthDiff / 2);
        await applyWindowLayout({
          size: { ...EXPANDED_WINDOW_SIZE },
          anchor: { x: targetX, y: targetY }
        });
        saveWindowPosition({ x: targetX, y: targetY });
      } else {
        const currentFlip = bramoContainer.classList.contains('flip-dropdown');
        const restoreY = draggedWhileExpanded
          ? (currentFlip ? pos.y + heightDiff : pos.y - 20)
          : (savedCompactY !== null ? savedCompactY : (wasFlipped ? pos.y + heightDiff : pos.y - 20));

        const restoreX = Math.round(pos.x + widthDiff / 2);
        await applyWindowLayout({
          size: computeTargetWindowSize({ ignoreSleep: true }),
          anchor: { x: restoreX, y: restoreY }
        });
        saveWindowPosition({ x: restoreX, y: restoreY });
        if (speechBubble.classList.contains('show')) {
          await syncBubbleWindow(true);
        }

        savedCompactY = null;
        draggedWhileExpanded = false;
      }
    } catch (err) {
      console.warn("Resize window error:", err);
    }
  }
});

// --- 6. MOUTH ENGINE ---
let isMouthBusy = false;

function setMouthState(stateClass) {
  if (isMouthBusy) return;
  ledMouth.className = 'led-mouth ' + stateClass;
}

function triggerHappyMouth() {
  isMouthBusy = true;
  ledMouth.className = 'led-mouth happy-open';
  
  setTimeout(() => {
    isMouthBusy = false;
    setMouthState('');
  }, 800);
}

function switchMouthIdle() {
  if (!isMouthBusy && !isActivelyDragging) {
    const mouthStates = ['', '', 'whistle', 'mumble'];
    const chosenState = mouthStates[Math.floor(Math.random() * mouthStates.length)];
    setMouthState(chosenState);
  }

  const nextChange = Math.random() * 3000 + 3000;
  setTimeout(switchMouthIdle, nextChange);
}

switchMouthIdle();

// --- 7. GAZE ENGINE ---
const MAX_OFFSET = 3;
let gazeState = 'FORWARD';
let mousePos = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
  if (!isActivelyDragging) {
    noteBramoActivity();
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  }
});

window.addEventListener('pointerdown', noteBramoActivity);

function noteBramoActivity() {
  lastBramoInteractionAt = Date.now();
  setUpbeatMood();
  bramoContainer.classList.remove('idle-stretch', 'idle-peek', 'idle-sigh', 'idle-yawn');
  if (idleAnimationResetTimer) {
    clearTimeout(idleAnimationResetTimer);
    idleAnimationResetTimer = null;
  }
}

function switchGazeState() {
  if (!isActivelyDragging
    && !bramoContainer.classList.contains('typing-curious')
    && !bramoContainer.classList.contains('idle-peek')) {
    const states = ['TRACKING', 'FORWARD', 'FORWARD', 'GLANCE'];
    gazeState = states[Math.floor(Math.random() * states.length)];

    if (gazeState === 'GLANCE') {
      const glanceDirections = [
        { x: -MAX_OFFSET, y: 0 },
        { x: MAX_OFFSET, y: 0 },
        { x: 0, y: -MAX_OFFSET },
        { x: Math.round(MAX_OFFSET / 2), y: -MAX_OFFSET }
      ];
      const chosen = glanceDirections[Math.floor(Math.random() * glanceDirections.length)];
      applyEyePosition(chosen.x, chosen.y);
    } else if (gazeState === 'FORWARD') {
      applyEyePosition(0, 0);
    }
  }

  const nextChange = Math.random() * 2500 + 2500;
  setTimeout(switchGazeState, nextChange);
}

function applyEyePosition(x, y) {
  leftEye.style.transform = `translate(${x}px, ${y}px)`;
  rightEye.style.transform = `translate(${x}px, ${y}px)`;
}

async function updateTypingEyeTarget() {
  if (!typingEyeTarget || !window.__TAURI__?.window) return;
  const target = { ...typingEyeTarget };

  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const [position, size] = await Promise.all([win.outerPosition(), win.outerSize()]);
    const centerX = position.x + size.width / 2;
    const centerY = position.y + size.height / 2;
    const normX = (target.x - centerX) / Math.max(1, size.width / 2);
    const normY = (target.y - centerY) / Math.max(1, size.height / 2);
    const eyeX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normX * MAX_OFFSET));
    const eyeY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normY * MAX_OFFSET));
    applyEyePosition(eyeX, eyeY);
  } catch (error) {
    console.warn('Typing gaze position error:', error);
  }
}

function updateEyeFrame() {
  if (gazeState === 'TRACKING'
    && !isActivelyDragging
    && !bramoContainer.classList.contains('typing-curious')
    && !bramoContainer.classList.contains('idle-peek')) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const normX = (mousePos.x - windowWidth / 2) / (windowWidth / 2);
    const normY = (mousePos.y - windowHeight / 2) / (windowHeight / 2);

    const normMoveX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normX * MAX_OFFSET));
    const normMoveY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normY * MAX_OFFSET));

    applyEyePosition(normMoveX, normMoveY);
  }
  requestAnimationFrame(updateEyeFrame);
}

switchGazeState();
requestAnimationFrame(updateEyeFrame);

function scheduleIdleAnimation() {
  const delay = 15_000 + Math.random() * 10_000;
  idleAnimationTimeout = setTimeout(() => {
    const canAnimate = Date.now() - lastBramoInteractionAt >= 20_000
      && !isActivelyDragging
      && !isDragCandidate
      && !isBramoSleeping
      && !document.hidden
      && !adhanSessionActive
      && !bramoContainer.classList.contains('expanded')
      && !bramoContainer.classList.contains('dizzy')
      && !bramoContainer.classList.contains('typing-curious')
      && !bramoContainer.classList.contains('idle-stretch')
      && !bramoContainer.classList.contains('idle-peek')
      && !visorScreen.classList.contains('blinking')
      && !bramoContainer.classList.contains('music-vibing')
      && !speechBubble.classList.contains('show');

    if (canAnimate) {
      const idleFor = Date.now() - lastBramoInteractionAt;
      const idleRoll = Math.random();
      const action = idleFor >= 90_000 && idleRoll < 0.24
        ? 'idle-yawn'
        : idleFor >= 60_000 && idleRoll < 0.48
          ? 'idle-sigh'
          : idleRoll < 0.72 ? 'idle-peek' : 'idle-stretch';
      bramoContainer.classList.add(action);
      if (action === 'idle-peek') {
        applyEyePosition(Math.random() < 0.5 ? -2 : 2, -2);
      }
      idleAnimationResetTimer = setTimeout(() => {
        bramoContainer.classList.remove('idle-peek', 'idle-stretch', 'idle-sigh', 'idle-yawn');
        idleAnimationResetTimer = null;
      }, action === 'idle-yawn' ? 1850 : 1500);
    }
    scheduleIdleAnimation();
  }, delay);
}

scheduleIdleAnimation();

// --- 8. AUTO-BLINK ---
function scheduleNextBlink(delay = Math.random() * 3000 + 2500) {
  if (blinkTimeout) clearTimeout(blinkTimeout);
  blinkTimeout = setTimeout(triggerBlink, delay);
}

function triggerBlink() {
  blinkTimeout = null;
  if (isBramoSleeping) return;

  if (!isActivelyDragging
    && !bramoContainer.classList.contains('typing-curious')
    && !bramoContainer.classList.contains('idle-stretch')
    && !bramoContainer.classList.contains('idle-peek')
    && !bramoContainer.classList.contains('idle-sigh')) {
    visorScreen.classList.add('blinking');

    setTimeout(() => {
      visorScreen.classList.remove('blinking');
    }, 150);
  }

  scheduleNextBlink();
}

scheduleNextBlink(2000);
