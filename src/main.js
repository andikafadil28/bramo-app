// BRAMO - Visor Engine, Throttled rAnimationFrame Custom Drag with Position Lock (Anti-Teleport)

const bramoContainer = document.getElementById('bramoContainer');
const bramoCapsule = document.getElementById('bramoCapsule');
const dropdownToggle = document.getElementById('dropdownToggle');
const visorScreen = document.getElementById('visorScreen');
const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const ledMouth = document.getElementById('ledMouth');

let isActivelyDragging = false;
let isPositionReady = false; // <-- Kunci pengaman anti-teleport
let startScreenX = 0;
let startScreenY = 0;
let windowStartX = 0;
let windowStartY = 0;

let isTicking = false;
let latestMouseEvent = null;

// --- 1. MOUSE DOWN (SIMPAN POSISI & KUNCI ANTI-TELEPORT) ---
bramoCapsule.addEventListener('mousedown', async (e) => {
      if (e.button !== 0) return; // Hanya klik kiri
      if (e.target.closest('#dropdownToggle') || e.target.closest('.dropdown-panel')) return;

      isActivelyDragging = true;
      isPositionReady = false; // Kunci dulu sampai posisi awal selesai diambil
      startScreenX = e.screenX;
      startScreenY = e.screenY;

      // Nyalakan animasi goyang (wiggle) & mulut kaget
      bramoContainer.classList.add('is-dragging');
      bramoContainer.classList.remove('just-landed');
      setMouthState('whistle'); // Mulut kaget 'o'

      // Ambil posisi awal window Tauri di layar secara async
      if (window.__TAURI__?.window) {
            try {
                  const win = window.__TAURI__.window.getCurrentWindow();
                  const pos = await win.outerPosition();
                  windowStartX = pos.x;
                  windowStartY = pos.y;
                  isPositionReady = true; // Buka kunci setelah posisi siap!
            } catch (err) {
                  console.warn("Pos error:", err);
                  isActivelyDragging = false;
            }
      } else {
            isPositionReady = true;
      }
});

// --- 2. MOUSE MOVE (CEK POSISI SIAP SEBELUM GESER) ---
window.addEventListener('mousemove', (e) => {
      if (!isActivelyDragging || !isPositionReady) return; // Jangan geser kalau posisi belum siap!
      latestMouseEvent = e;

      if (!isTicking) {
            window.requestAnimationFrame(async () => {
                  if (!isActivelyDragging || !isPositionReady || !latestMouseEvent) {
                        isTicking = false;
                        return;
                  }

                  const deltaX = latestMouseEvent.screenX - startScreenX;
                  const deltaY = latestMouseEvent.screenY - startScreenY;

                  // Efek miring (tilt/wiggle) instan
                  const tiltAngle = Math.max(-16, Math.min(16, (latestMouseEvent.movementX || 0) * 3.5));
                  bramoCapsule.style.transform = `scale(1.08) translateY(-4px) rotate(${tiltAngle}deg)`;

                  // Pindahkan window Tauri dengan aman
                  if (window.__TAURI__?.window) {
                        try {
                              const win = window.__TAURI__.window.getCurrentWindow();
                              await win.setPosition({
                                    type: 'Physical',
                                    x: windowStartX + deltaX,
                                    y: windowStartY + deltaY
                              });
                        } catch (err) { }
                  }

                  isTicking = false;
            });

            isTicking = true;
      }
});

// --- 3. MOUSE UP / BLUR (LEPAS DRAG -> RESET & LANDING BOUNCE) ---
function handleDragRelease() {
      if (!isActivelyDragging) return;
      isActivelyDragging = false;
      isPositionReady = false;
      latestMouseEvent = null;

      // Matikan animasi goyang & reset rotasi transform
      bramoContainer.classList.remove('is-dragging');
      bramoCapsule.style.transform = 'scale(1) translateY(0) rotate(0deg)';

      // Picu animasi membal (landing bounce) yang empuk pas mendarat
      bramoContainer.classList.add('just-landed');
      setMouthState(''); // Kembalikan ke mulut normal

      setTimeout(() => {
            bramoContainer.classList.remove('just-landed');
      }, 450);
}

window.addEventListener('mouseup', handleDragRelease);
window.addEventListener('blur', handleDragRelease);

// --- 4. PULL-TAB BAWAH: Murni untuk Klik Buka/Tutup Dropdown ---
dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      bramoContainer.classList.toggle('expanded');
      triggerHappyMouth();
});

// --- 5. ANIMATED MOUTH ENGINE ---
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

// --- 6. RANDOM GAZE ENGINE (MATA ISENG) ---
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

// --- 7. AUTO-BLINK ---
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