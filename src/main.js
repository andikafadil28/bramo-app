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

let isActivelyDragging = false;
let isPositionReady = false;
let startScreenX = 0;
let startScreenY = 0;
let windowStartX = 0;
let windowStartY = 0;

let isTicking = false;
let latestMouseEvent = null;
let statsTimer = null;
let batteryManager = null;
let prayerSchedule = null;
let prayerReminderTimer = null;
let lastPrayerAlert = '';
let isAdhanPlaying = false;
let isMusicVibing = false;
let suppressMediaUntil = 0;
let testPrayerIndex = 0;
let typingCuriousTimeout = null;
let typingEyeTarget = null;
let clipboardTimer = null;
let lastClipboardSignature = null;
let clipboardWatcherEnabled = localStorage.getItem('bramo.clipboard.watcher') === 'true';
let typingCuriosityEnabled = localStorage.getItem('bramo.typing.curiosity') === 'true';
let prayerEnabled = localStorage.getItem('bramo.prayer.enabled') !== 'false';
let audioEnabled = localStorage.getItem('bramo.prayer.audio') !== 'false';
let mediaCandidate = null;
let mediaCandidateCount = 0;
let pomodoroLayoutSyncing = false;
let isBramoSleeping = false;
let nativeResizeQueue = Promise.resolve();
const POSITION_STORAGE_KEY = 'bramo.window.position.v1';
const COMPACT_WINDOW_SIZE = { width: 220, height: 90 };
const MEDIA_WINDOW_SIZE = { width: 220, height: 162 };
const EXPANDED_WINDOW_SIZE = { width: 280, height: 360 };
let mediaWindowActive = false;
let bubbleBasePosition = null;
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
  syncPomodoroLayout(pomodoroVisible);
}

function finishPomodoroSession() {
  if (pomodoroTimer) clearInterval(pomodoroTimer);
  pomodoroTimer = null;
  pomodoroFocusMode = !pomodoroFocusMode;
  const minutes = pomodoroFocusMode ? Number(pomodoroFocusSetting.value) : Number(pomodoroBreakSetting.value);
  pomodoroDuration = minutes * 60;
  pomodoroSeconds = pomodoroDuration;
  renderPomodoro();
  showBramoMessage(pomodoroFocusMode ? 'Waktu fokus dimulai! Semangat 🔥' : 'Saatnya istirahat sebentar ☕', 4000);
  triggerHappyMouth();
}

function togglePomodoro() {
  if (pomodoroTimer) {
    clearInterval(pomodoroTimer);
    pomodoroTimer = null;
    renderPomodoro();
    return;
  }
  pomodoroTimer = setInterval(() => {
    pomodoroSeconds -= 1;
    if (pomodoroSeconds <= 0) finishPomodoroSession();
    else renderPomodoro();
  }, 1000);
  renderPomodoro();
  showBramoMessage(pomodoroFocusMode ? 'Fokus dimulai. BRAMO jagain 😎' : 'Break dimulai, tarik napas dulu ☕', 3000);
}

pomodoroStart?.addEventListener('click', togglePomodoro);
pomodoroMiniToggle?.addEventListener('click', togglePomodoro);
pomodoroReset?.addEventListener('click', () => {
  if (pomodoroTimer) clearInterval(pomodoroTimer);
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
  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();
      // Pertahankan anchor posisi mini-window saat wake agar tidak ada
      // loncatan vertikal sebelum event drag mengambil alih.
      const restore = { x: pos.x, y: pos.y };
      const restoreSize = bramoContainer.classList.contains('pomodoro-active')
        ? (mediaWindowActive ? { width: 220, height: 210 } : { width: 220, height: 140 })
        : (mediaWindowActive ? MEDIA_WINDOW_SIZE : COMPACT_WINDOW_SIZE);
      await resizeNativeWindow(win, restoreSize);
      await win.setPosition({ type: 'Physical', x: restore.x, y: restore.y });
      sleepRestorePosition = null;
      await updateAdaptivePositioning();
    } catch (error) {
      console.warn('Wake BRAMO error:', error);
    }
  }
  showBramoMessage('Bangun lagi! ⚡', 1800);
}

sleepBramo?.addEventListener('click', async () => {
  if (isBramoSleeping) return;
  isBramoSleeping = true;
  if (bramoContainer.classList.contains('expanded')) dropdownToggle.click();
  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const [pos, size] = await Promise.all([win.outerPosition(), win.outerSize()]);
      // Lebar tetap agar mini-player tidak ikut mengecil; tinggi dipadatkan
      // untuk memberi ruang kapsul mini dan player yang tetap normal.
      const sleepHeight = bramoContainer.classList.contains('media-playing-layout')
        ? (bramoContainer.classList.contains('pomodoro-active') ? 150 : 110)
        : (bramoContainer.classList.contains('pomodoro-active') ? 105 : 76);
      const sleepSize = { width: 220, height: sleepHeight };
      sleepRestorePosition = { x: pos.x, y: pos.y + size.height - sleepSize.height };
      bramoContainer.classList.add('sleeping');
      await resizeNativeWindow(win, sleepSize);
      await win.setPosition({ type: 'Physical', x: sleepRestorePosition.x, y: sleepRestorePosition.y });
    } catch (error) {
      isBramoSleeping = false;
      console.warn('Sleep BRAMO error:', error);
    }
  } else {
    bramoContainer.classList.add('sleeping');
  }
  dropStatus && (dropStatus.textContent = 'BRAMO sedang tidur • goyang untuk bangun');
});

quitBramo?.addEventListener('click', async () => {
  if (!window.confirm('Tutup BRAMO sekarang?')) return;
  try {
    await window.__TAURI__?.core?.invoke('quit_bramo');
  } catch (error) {
    console.warn('Quit BRAMO error:', error);
  }
});
const savedTheme = localStorage.getItem('bramo.theme') || 'cyan';

function applyTheme(theme) {
  const validThemes = ['cyan', 'matrix', 'pink', 'amber'];
  const nextTheme = validThemes.includes(theme) ? theme : 'cyan';
  bramoContainer.dataset.theme = nextTheme;
  localStorage.setItem('bramo.theme', nextTheme);
  themePicker?.querySelectorAll('[data-theme]').forEach(button => {
    button.classList.toggle('selected', button.dataset.theme === nextTheme);
  });
}

applyTheme(savedTheme);
themePicker?.addEventListener('click', event => {
  const button = event.target.closest('[data-theme]');
  if (button) applyTheme(button.dataset.theme);
});
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

async function updateMediaInfo() {
  const invoke = window.__TAURI__?.core?.invoke;
  if (!invoke || !musicPanel) return;
  if (isAdhanPlaying || Date.now() < suppressMediaUntil) {
    clearMusicMode();
    return;
  }
  try {
    const media = await invoke('get_media_info');
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
      if (bramoContainer.classList.contains('pomodoro-active')) {
        await syncPomodoroLayout(true);
      } else {
        await syncMediaWindow(media.active);
      }
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
  } catch (error) {
    // Jangan langsung menyembunyikan mini-player hanya karena satu polling
    // gagal; Windows Media Session kadang menjawab sementara saat track berubah.
    musicPanel.classList.toggle('media-active', mediaWindowActive);
    nowPlayingBar.classList.toggle('media-active', mediaWindowActive);
    bramoContainer.classList.toggle('media-playing-layout', mediaWindowActive);
    isMusicVibing = false;
  }
}

setInterval(updateMediaInfo, 2500);
updateMediaInfo();

mediaButtons.forEach(button => {
  button.addEventListener('click', async () => {
    const action = button.dataset.mediaAction;
    const invoke = window.__TAURI__?.core?.invoke;
    if (!invoke) return;

    try {
      await invoke('control_media', { action });
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
  const testPrayers = prayerSchedule?.prayers || [
    { name: 'Subuh' },
    { name: 'Zuhur' },
    { name: 'Asar' },
    { name: 'Magrib' },
    { name: 'Isya' }
  ];
  const prayer = testPrayers[testPrayerIndex % testPrayers.length];
  testPrayerIndex += 1;
  showBramoMessage(`Saatnya menunaikan sholat ${prayer.name} 🤲`, audioEnabled ? null : 9000, true);
  playAdhan();
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
  clipboardWatcherEnabled = clipboardToggle.checked;
  localStorage.setItem('bramo.clipboard.watcher', String(clipboardWatcherEnabled));
  if (clipboardWatcherEnabled) startClipboardWatcher();
  else stopClipboardWatcher();
});

typingToggle.addEventListener('change', () => {
  typingCuriosityEnabled = typingToggle.checked;
  localStorage.setItem('bramo.typing.curiosity', String(typingCuriosityEnabled));
});

function playAdhan() {
  if (!audioEnabled || !adhanAudio) return;
  adhanAudio.currentTime = 0;
  adhanAudio.play().catch(err => {
    console.warn('Adhan playback blocked:', err);
    hideBramoMessage();
  });
}

function stopAdhan() {
  if (!adhanAudio) return;
  adhanAudio.pause();
  adhanAudio.currentTime = 0;
  suppressMediaUntil = Date.now() + 8000;
  clearMusicMode();
}

function setAdhanVisualMode(active) {
  isAdhanPlaying = active;
  if (active) clearMusicMode();
  bramoContainer.classList.toggle('adhan-speaking', active);
  hatTrigger.classList.toggle('adhan-mode', active);
}

adhanAudio.addEventListener('play', () => setAdhanVisualMode(true));
adhanAudio.addEventListener('pause', () => {
  setAdhanVisualMode(false);
  hideBramoMessage();
});
adhanAudio.addEventListener('ended', () => {
  setAdhanVisualMode(false);
  hideBramoMessage();
});

utilityTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const panelId = tab.dataset.panel;
    utilityTabs.forEach(item => item.classList.toggle('active', item === tab));
    utilityPanels.forEach(panel => panel.classList.toggle('active', panel.id === panelId));
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
    showBramoMessage(`Saatnya menunaikan sholat ${due.name} 🤲`, audioEnabled ? null : 9000, true);
    playAdhan();
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
  if (!clipboardWatcherEnabled || isAdhanPlaying) return;
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
  lastClipboardSignature = null;
  pollClipboard();
  clipboardTimer = setInterval(pollClipboard, 1500);
}

function stopClipboardWatcher() {
  if (clipboardTimer) clearInterval(clipboardTimer);
  clipboardTimer = null;
  lastClipboardSignature = null;
}

if (clipboardWatcherEnabled) startClipboardWatcher();

async function registerNativeActivityListeners() {
  const listen = window.__TAURI__?.event?.listen;
  if (!listen) return;

  await listen('bramo://typing', async (event) => {
    if (!typingCuriosityEnabled || isAdhanPlaying) return;
    if (typingCuriousTimeout) clearTimeout(typingCuriousTimeout);
    bramoContainer.classList.add('typing-curious');
    typingEyeTarget = event.payload || null;
    await updateTypingEyeTarget();
    typingCuriousTimeout = setTimeout(() => {
      bramoContainer.classList.remove('typing-curious');
      typingEyeTarget = null;
      typingCuriousTimeout = null;
    }, 1800);
  });

  await listen('bramo://clipboard-pasted', () => {
    // Ctrl+V adalah aksi eksplisit dari user, jadi tetap tampil walaupun
    // clipboard watcher sedang OFF. Toggle hanya mengatur deteksi clipboard
    // baru di background, bukan feedback untuk paste yang dilakukan user.
    if (isAdhanPlaying) return;
    dropStatus.textContent = 'Clipboard telah di-paste';
    bramoContainer.classList.add('clipboard-paste-success');
    triggerHappyMouth();
    showBramoMessage('Clipboard telah di-paste! 📋', 3500);
    setTimeout(() => bramoContainer.classList.remove('clipboard-paste-success'), 1400);
  });

  await listen('bramo://clipboard-changed', () => {
    if (!clipboardWatcherEnabled || isAdhanPlaying) return;
    dropStatus.textContent = 'Clipboard baru terdeteksi';
    bramoContainer.classList.add('file-drop-success');
    triggerHappyMouth();
    showBramoMessage('Clipboard diterima! 😋', 3500);
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
    const target = new window.__TAURI__.window.PhysicalSize(size.width, size.height);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await win.setSize(target);
      await nextFrame();
      const actual = await win.outerSize();
      if (actual.width === size.width && actual.height === size.height) return actual;
    }

    const actual = await win.outerSize();
    console.warn('Native window resize mismatch:', { expected: size, actual });
    return actual;
  } finally {
    release();
  }
}

async function syncPomodoroLayout(isVisible = pomodoroTimer || pomodoroSeconds !== pomodoroDuration) {
  if (!window.__TAURI__?.window || bramoContainer.classList.contains('expanded') || isBramoSleeping || pomodoroLayoutSyncing) return;
  pomodoroLayoutSyncing = true;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const target = isVisible
      ? (mediaWindowActive ? { width: 220, height: 210 } : { width: 220, height: 140 })
      : (mediaWindowActive ? MEDIA_WINDOW_SIZE : COMPACT_WINDOW_SIZE);
    const current = await win.outerSize();
    if (current.height !== target.height || current.width !== target.width) {
      await resizeNativeWindow(win, target);
      await updateAdaptivePositioning();
    }
  } catch (error) {
    console.warn('Pomodoro layout error:', error);
  } finally {
    pomodoroLayoutSyncing = false;
  }
}

async function syncMediaWindow(isVisible) {
  if (!window.__TAURI__?.window || bramoContainer.classList.contains('expanded')) return;
  if (bramoContainer.classList.contains('pomodoro-active')) {
    await syncPomodoroLayout(true);
    return;
  }
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const targetSize = isVisible
      ? (bramoContainer.classList.contains('pomodoro-active') ? { width: 220, height: 210 } : MEDIA_WINDOW_SIZE)
      : (bramoContainer.classList.contains('pomodoro-active') ? { width: 220, height: 140 } : COMPACT_WINDOW_SIZE);
    const currentSize = await win.outerSize();
    if (currentSize.height !== targetSize.height) {
      await resizeNativeWindow(win, targetSize);
      await updateAdaptivePositioning();
    }
  } catch (error) {
    console.warn('Media window resize error:', error);
  }
}

async function syncBubbleWindow(isVisible) {
  if (!window.__TAURI__?.window || bramoContainer.classList.contains('expanded')) return;

  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const pos = await win.outerPosition();

    if (!isVisible) {
      await resizeNativeWindow(win, mediaWindowActive ? MEDIA_WINDOW_SIZE : COMPACT_WINDOW_SIZE);
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

    bubbleBasePosition = { x: pos.x, y: pos.y };
    await nextFrame();

    const elements = [bramoContainer, speechBubble, hatTrigger, mediaWindowActive ? nowPlayingBar : null]
      .filter(element => element && (element === bramoContainer || element.offsetParent !== null));
    const rects = elements.map(element => element.getBoundingClientRect());
    const minTop = Math.min(...rects.map(rect => rect.top));
    const maxBottom = Math.max(...rects.map(rect => rect.bottom));
    const baseWindowSize = mediaWindowActive ? MEDIA_WINDOW_SIZE : COMPACT_WINDOW_SIZE;
    const requiredHeight = Math.max(
      baseWindowSize.height,
      Math.ceil(maxBottom - minTop + 8)
    );

    await resizeNativeWindow(win, {
      width: COMPACT_WINDOW_SIZE.width,
      height: requiredHeight
    });

    // Keep the capsule anchored. If the bubble is above the capsule, grow the
    // native window upward by the added height instead of teleporting the base.
    const bubbleAbove = bramoContainer.classList.contains('flip-bubble');
    const addedHeight = Math.max(0, requiredHeight - baseWindowSize.height);
    const targetY = bubbleAbove
      ? Math.round(pos.y - addedHeight)
      : pos.y;
    await win.setPosition({ type: 'Physical', x: pos.x, y: targetY });
    await updateAdaptivePositioning();
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

  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    // Set ukuran compact lebih dulu agar area transparan tidak menyentuh
    // aplikasi di belakang sebelum dropdown benar-benar dibuka.
    await resizeNativeWindow(win, COMPACT_WINDOW_SIZE);
    bramoContainer.classList.remove('expanded');
    if (saved) {
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
  if (isAdhanPlaying && !attention) return;
  
  speechText.textContent = text;
  bramoContainer.classList.toggle('attention-reminder', attention);
  speechBubble.classList.add('show');

  syncBubbleWindow(true);

  if (bubbleTimeout) clearTimeout(bubbleTimeout);

  if (duration !== null) bubbleTimeout = setTimeout(hideBramoMessage, duration);
}

function hideBramoMessage() {
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

// --- SAFE DUAL-MODE ADAPTIVE POSITIONING ---
async function updateAdaptivePositioning() {
  if (!window.__TAURI__?.window) return;
  try {
    const win = window.__TAURI__.window.getCurrentWindow();
    const pos = await win.outerPosition();
    const size = await win.outerSize();
    // Tauri memakai physical pixels, sedangkan Screen API memakai CSS pixels.
    const dpi = window.devicePixelRatio || 1;
    const screenHeight = Math.round((window.screen.availHeight || window.screen.height) * dpi);
    const screenWidth = Math.round(window.screen.width * dpi);
    const currentWindowHeight = size.height;

    let newY = pos.y;
    let needsUpdate = false;

    // Top safety lock
    if (newY < 0) {
      newY = 0;
      needsUpdate = true;
    }

    // Bottom safety lock (disesuaikan dengan tinggi window aktual agar tidak kelewatan taskbar)
    const maxAllowedY = Math.max(0, screenHeight - currentWindowHeight);
    if (newY > maxAllowedY) {
      newY = maxAllowedY;
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
    if (newY > screenHeight * 0.45) {
      bramoContainer.classList.add('flip-dropdown');
      capsuleWrapper.classList.add('align-bottom');
    } else {
      bramoContainer.classList.remove('flip-dropdown');
      capsuleWrapper.classList.remove('align-bottom');
    }

    if (newY > screenHeight * 0.45) {
      bramoContainer.classList.add('flip-bubble');
    } else {
      bramoContainer.classList.remove('flip-bubble');
    }
  } catch (err) {
    console.warn("Adaptive position error:", err);
  }
}

// Random chat acak berkala
function triggerRandomChat() {
  if (!isActivelyDragging && !isAdhanPlaying) {
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
    showBramoMessage(randomQuote, 4000);
  }
  const nextChatInterval = Math.random() * 20000 + 20000;
  setTimeout(triggerRandomChat, nextChatInterval);
}

setTimeout(triggerRandomChat, 5000);

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

  isActivelyDragging = true;
  draggedWhileExpanded = bramoContainer.classList.contains('expanded');
  isPositionReady = false;
  startScreenX = e.screenX;
  startScreenY = e.screenY;

  bramoContainer.classList.add('is-dragging');
  bramoContainer.classList.remove('just-landed');
  setMouthState('whistle');

  if (Math.random() > 0.5) {
    const quotes = interactiveQuotes.drag_start;
    showBramoMessage(quotes[Math.floor(Math.random() * quotes.length)], 2000);
  }

  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();
      windowStartX = pos.x;
      windowStartY = pos.y;
      isPositionReady = true;
    } catch (err) {
      isActivelyDragging = false;
    }
  } else {
    isPositionReady = true;
  }
});

// --- 2. MOUSE MOVE ---
window.addEventListener('mousemove', (e) => {
  if (!isActivelyDragging || !isPositionReady) return;
  latestMouseEvent = e;

  if (!isTicking) {
    window.requestAnimationFrame(async () => {
      if (!isActivelyDragging || !isPositionReady || !latestMouseEvent) {
        isTicking = false;
        return;
      }

      const deltaX = latestMouseEvent.screenX - startScreenX;
      const deltaY = latestMouseEvent.screenY - startScreenY;

      const tiltAngle = Math.max(-16, Math.min(16, (latestMouseEvent.movementX || 0) * 3.5));
      bramoCapsule.style.transform = `scale(1.08) translateY(-4px) rotate(${tiltAngle}deg)`;

      if (window.__TAURI__?.window) {
        try {
          const win = window.__TAURI__.window.getCurrentWindow();
          await win.setPosition({
            type: 'Physical',
            x: windowStartX + deltaX,
            y: windowStartY + deltaY
          });
        } catch (err) {}
      }

      isTicking = false;
    });

    isTicking = true;
  }
});

// --- 3. MOUSE UP ---
async function handleDragRelease() {
  if (!isActivelyDragging) return;
  isActivelyDragging = false;
  isPositionReady = false;
  latestMouseEvent = null;

  bramoContainer.classList.remove('is-dragging');
  bramoCapsule.style.transform = 'scale(1) translateY(0) rotate(0deg)';

  bramoContainer.classList.add('just-landed');
  setMouthState('');

  await updateAdaptivePositioning();

  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();
      saveWindowPosition(pos);
      const screenWidth = Math.round(window.screen.width * (window.devicePixelRatio || 1));

      if (pos.x < 100) {
        showContextualMessage('edge_left', 3000);
      } else if (pos.x > screenWidth - 300) {
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
window.addEventListener('blur', handleDragRelease);

// --- IDLE CLICK ---
bramoCapsule.addEventListener('click', (e) => {
  if (isActivelyDragging) return;
  if (e.target.closest('.dropdown-panel') || e.target.closest('.dropdown-handle-bar')) return;
  
  triggerHappyMouth();
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
          const screenWidth = Math.round(window.screen.width * (window.devicePixelRatio || 1));
          const windowWidth = 220;
          
          const targetX = Math.round((screenWidth - windowWidth) / 2);
          const targetY = 20;

          bramoContainer.classList.remove('expanded');
          capsuleWrapper.classList.remove('is-expanded');
          await resizeNativeWindow(win, COMPACT_WINDOW_SIZE);
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

  await updateAdaptivePositioning();

  const isExpanding = bramoContainer.classList.toggle('expanded');
  capsuleWrapper.classList.toggle('is-expanded', isExpanding);
  if (isExpanding) armDropdownIdleClose();
  else if (dropdownIdleTimer) {
    clearTimeout(dropdownIdleTimer);
    dropdownIdleTimer = null;
  }
  if (isExpanding) startStatsPolling();
  else stopStatsPolling();
  triggerHappyMouth();

  if (isExpanding) {
    showContextualMessage('dropdown_open', 2500);
  }

  if (window.__TAURI__?.window) {
    try {
      const win = window.__TAURI__.window.getCurrentWindow();
      const pos = await win.outerPosition();
      
      const COMPACT_H = COMPACT_WINDOW_SIZE.height;
      const EXPANDED_H = EXPANDED_WINDOW_SIZE.height;
      const heightDiff = EXPANDED_H - COMPACT_H; // 175px

      if (isExpanding) {
        wasFlipped = bramoContainer.classList.contains('flip-dropdown');
        savedCompactY = pos.y;

        let targetY = pos.y;
        if (wasFlipped) {
          targetY = pos.y - heightDiff;
        } else if (pos.y < 60) {
          targetY = pos.y + 20;
        }

        await resizeNativeWindow(win, EXPANDED_WINDOW_SIZE);
        await win.setPosition({
          type: 'Physical',
          x: pos.x,
          y: targetY
        });
        saveWindowPosition({ x: pos.x, y: targetY });
        // Resize dapat membuat sisi bawah melewati work area, terutama pada DPI > 100%.
        await updateAdaptivePositioning();
      } else {
        const currentFlip = bramoContainer.classList.contains('flip-dropdown');
        const restoreY = draggedWhileExpanded
          ? (currentFlip ? pos.y + heightDiff : pos.y - 20)
          : (savedCompactY !== null ? savedCompactY : (wasFlipped ? pos.y + heightDiff : pos.y - 20));

        await resizeNativeWindow(win, mediaWindowActive ? MEDIA_WINDOW_SIZE : COMPACT_WINDOW_SIZE);
        await win.setPosition({
          type: 'Physical',
          x: pos.x,
          y: restoreY
        });
        saveWindowPosition({ x: pos.x, y: restoreY });
        if (speechBubble.classList.contains('show')) {
          await syncBubbleWindow(true);
        } else {
          await updateAdaptivePositioning();
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
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
  }
});

function switchGazeState() {
  if (!isActivelyDragging) {
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
  if (gazeState === 'TRACKING' && !isActivelyDragging) {
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

// --- 8. AUTO-BLINK ---
function triggerBlink() {
  if (!isActivelyDragging) {
    visorScreen.classList.add('blinking');

    setTimeout(() => {
      visorScreen.classList.remove('blinking');
    }, 150);
  }

  const nextBlink = Math.random() * 3000 + 2500;
  setTimeout(triggerBlink, nextBlink);
}

setTimeout(triggerBlink, 2000);
