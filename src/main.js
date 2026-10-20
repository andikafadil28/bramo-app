// BRAMO - Visor Engine, Animated Mouth & Interaction System

const bramoContainer = document.getElementById('bramoContainer');
const visorToggle = document.getElementById('visorToggle');
const visorScreen = document.getElementById('visorScreen');
const leftEye = document.getElementById('leftEye');
const rightEye = document.getElementById('rightEye');
const ledMouth = document.getElementById('ledMouth');

// --- 1. TOGGLE DROPDOWN & CLICK REACTION ---
visorToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      bramoContainer.classList.toggle('expanded');

      // Efek gembira mulut terbuka pas diklik!
      triggerHappyMouth();
});

// --- 2. ANIMATED MOUTH ENGINE ---
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

// Loop Animasi Mulut Idle (Bersiul, Ngomong Sendiri, Senyum)
function switchMouthIdle() {
      if (!isMouthBusy) {
            const mouthStates = ['', '', 'whistle', 'mumble'];
            const chosenState = mouthStates[Math.floor(Math.random() * mouthStates.length)];
            setMouthState(chosenState);
      }

      // Ganti bentuk mulut tiap 3 - 6 detik
      const nextChange = Math.random() * 3000 + 3000;
      setTimeout(switchMouthIdle, nextChange);
}

switchMouthIdle();

// --- 3. RANDOM GAZE ENGINE (MATA ISENG) ---
const MAX_OFFSET = 3;
let gazeState = 'FORWARD';
let mousePos = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
});

function switchGazeState() {
      const states = ['TRACKING', 'FORWARD', 'FORWARD', 'GLANCE'];
      gazeState = states[Math.floor(Math.random() * states.length)];

      if (gazeState === 'GLANCE') {
            const glanceDirections = [
                  { x: -MAX_OFFSET, y: 0 },
                  { x: MAX_OFFSET, y: 0 },
                  { x: 0, y: -MAX_OFFSET },
                  { x: MAX_OFFSET / 2, y: -MAX_OFFSET }
            ];
            const chosen = glanceDirections[Math.floor(Math.random() * glanceDirections.length)];
            applyEyePosition(chosen.x, chosen.y);
      } else if (gazeState === 'FORWARD') {
            applyEyePosition(0, 0);
      }

      const nextChange = Math.random() * 2500 + 2500;
      setTimeout(switchGazeState, nextChange);
}

function applyEyePosition(x, y) {
      leftEye.style.transform = `translate(${x}px, ${y}px)`;
      rightEye.style.transform = `translate(${x}px, ${y}px)`;
}

function updateEyeFrame() {
      if (gazeState === 'TRACKING') {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const normX = (mousePos.x - windowWidth / 2) / (windowWidth / 2);
            const normY = (mousePos.y - windowHeight / 2) / (windowHeight / 2);

            const moveX = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normX * MAX_OFFSET));
            const moveY = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normY * MAX_OFFSET));

            applyEyePosition(moveX, moveY);
      }
      requestAnimationFrame(updateEyeFrame);
}

switchGazeState();
requestAnimationFrame(updateEyeFrame);

// --- 4. AUTO-BLINK ---
function triggerBlink() {
      visorScreen.classList.add('blinking');

      setTimeout(() => {
            visorScreen.classList.remove('blinking');
      }, 150);

      const nextBlink = Math.random() * 3000 + 2500;
      setTimeout(triggerBlink, nextBlink);
}

setTimeout(triggerBlink, 2000);