import { CameraHandler } from './camera.js';
import { StickerManager } from './stickers.js';
import { generateHighResStrip } from './canvas.js';
import './style.css'; // Vite automatically injects styles

// ==========================================================================
// Web Audio API Retro 8-bit Sound Effects Synthesizer
// ==========================================================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playCoinSound() {
  initAudio();
  if (!audioCtx) return;
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  // Retro coin sound: 2 quick pitches
  osc.frequency.setValueAtTime(987.77, now); // B5
  osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
  
  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
  
  osc.start(now);
  osc.stop(now + 0.35);
}

function playTickSound() {
  initAudio();
  if (!audioCtx) return;
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.frequency.setValueAtTime(880, now); // A5
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  osc.start(now);
  osc.stop(now + 0.1);
}

function playShutterSound() {
  initAudio();
  if (!audioCtx) return;

  const bufferSize = audioCtx.sampleRate * 0.15; // 0.15s
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Fill buffer with white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  
  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  
  noiseNode.start();
}

function playBeepSound(freq = 440, duration = 0.15) {
  initAudio();
  if (!audioCtx) return;
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.frequency.setValueAtTime(freq, now);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  osc.start(now);
  osc.stop(now + duration);
}

// ==========================================================================
// Application State & Controller
// ==========================================================================

// Global state variables
let state = 'welcome'; // welcome, setup, capture, review, decorate, download
let photos = [];
let selectedLayout = '4-strip';
let selectedFrame = 'pink-hearts';
let customText = '';

let isCaptureLoopRunning = false;
let currentCaptureIndex = 0;
let isRetakeMode = false;
let retakeIndex = -1;
let countdownTimer = null;
let swapStartIndex = -1;

// Modules instances
let camera = null;
let stickerManager = null;

// DOM Elements
const screens = {
  welcome: document.getElementById('screen-welcome'),
  setup: document.getElementById('screen-setup'),
  capture: document.getElementById('screen-capture'),
  review: document.getElementById('screen-review'),
  decorate: document.getElementById('screen-decorate'),
  download: document.getElementById('screen-download')
};

const frameThemes = {
  'pink-hearts': { bg: '#ffb7c5', text: '#ffffff' },
  'neon-grid': { bg: '#121214', text: '#00f0ff' },
  'pastel-yellow': { bg: '#fff5cc', text: '#5c3d2e' },
  'classic-white': { bg: '#ffffff', text: '#111111' },
  'gothic-black': { bg: '#111111', text: '#ff7ebb' }
};

// Initialize listeners on page load
window.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  initApplication();
});

function initDOMElements() {
  // Welcome View
  document.getElementById('btn-start-session').addEventListener('click', () => {
    playCoinSound();
    switchScreen('setup');
  });

  // Setup View Cards
  document.querySelectorAll('.layout-card').forEach(card => {
    card.addEventListener('click', () => {
      playBeepSound(523.25, 0.1); // C5
      document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedLayout = card.dataset.layout;
    });
  });

  // Setup View Frame Buttons
  document.querySelectorAll('.frame-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playBeepSound(587.33, 0.1); // D5
      document.querySelectorAll('.frame-thumb-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFrame = btn.dataset.frame;
    });
  });

  // Setup Next
  document.getElementById('btn-setup-next').addEventListener('click', () => {
    playBeepSound(659.25, 0.12); // E5
    customText = document.getElementById('input-custom-text').value || '♥ LOVE ♥';
    
    // Switch to capture and initialize camera stream
    switchScreen('capture');
    startCameraCaptureSession();
  });

  // Capture Trigger
  document.getElementById('btn-trigger-capture').addEventListener('click', () => {
    triggerSnapshotSequence();
  });

  // Review View Buttons
  document.getElementById('btn-review-back').addEventListener('click', () => {
    playBeepSound(440, 0.15); // A4
    switchScreen('setup');
  });

  document.getElementById('btn-review-next').addEventListener('click', () => {
    playBeepSound(880, 0.15); // A5
    switchScreen('decorate');
    initDecorationSession();
  });

  // Decorate View Buttons
  document.getElementById('btn-decorate-back').addEventListener('click', () => {
    playBeepSound(440, 0.15);
    switchScreen('review');
    renderReviewPhotos();
  });

  document.getElementById('btn-decorate-next').addEventListener('click', () => {
    playBeepSound(880, 0.15);
    switchScreen('download');
    exportFinalPhotoStrip();
  });

  // Restart Button
  document.getElementById('btn-restart-session').addEventListener('click', () => {
    playCoinSound();
    resetSession();
    switchScreen('welcome');
  });

  // Category Tabs for Stickers
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      playBeepSound(523.25, 0.08);
      document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (stickerManager) {
        stickerManager.initDrawer(tab.dataset.category);
      }
    });
  });

  // Console Physical Buttons triggers (Mapping arcade look clicks)
  document.getElementById('console-btn-1').addEventListener('click', () => {
    // Snap button
    if (state === 'capture') {
      triggerSnapshotSequence();
    } else if (state === 'welcome') {
      playCoinSound();
      switchScreen('setup');
    }
  });

  document.getElementById('console-btn-2').addEventListener('click', () => {
    // Retake / Back button
    if (state === 'review') {
      playBeepSound(440, 0.15);
      switchScreen('setup');
    } else if (state === 'decorate') {
      playBeepSound(440, 0.15);
      switchScreen('review');
      renderReviewPhotos();
    }
  });

  document.getElementById('console-btn-3').addEventListener('click', () => {
    // Finish button
    if (state === 'review') {
      playBeepSound(880, 0.15);
      switchScreen('decorate');
      initDecorationSession();
    } else if (state === 'decorate') {
      playBeepSound(880, 0.15);
      switchScreen('download');
      exportFinalPhotoStrip();
    }
  });
}

function initApplication() {
  // Initialize Camera Handler
  const video = document.getElementById('webcam-feed');
  const fallback = document.getElementById('camera-fallback-msg');
  const flash = document.getElementById('shutter-flash');
  camera = new CameraHandler(video, fallback, flash);

  // Initialize Sticker Manager
  const overlay = document.getElementById('sticker-overlay');
  const drawer = document.getElementById('sticker-drawer');
  stickerManager = new StickerManager(overlay, drawer);
}

/**
 * Screen navigation routing.
 */
function switchScreen(newScreenId) {
  state = newScreenId;
  
  // Hide all screens
  Object.keys(screens).forEach(key => {
    screens[key].classList.remove('active');
    screens[key].style.display = 'none';
  });

  // Show active screen
  const target = screens[newScreenId];
  target.style.display = 'flex';
  // Trigger reflow before adding opacity transition
  void target.offsetWidth;
  target.classList.add('active');

  // Stop camera if leaving capture screen, except in retake setup
  if (newScreenId !== 'capture' && camera) {
    camera.stop();
    isCaptureLoopRunning = false;
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
  }
}

/**
 * Capture Session logic.
 */
function startCameraCaptureSession() {
  photos = isRetakeMode ? photos : [];
  currentCaptureIndex = isRetakeMode ? retakeIndex : 0;
  
  const total = selectedLayout === '3-strip' ? 3 : 4;
  document.getElementById('total-photo-count').textContent = total;
  document.getElementById('current-photo-index').textContent = currentCaptureIndex + 1;

  // Change action buttons text depending on mode
  const triggerBtn = document.getElementById('btn-trigger-capture');
  if (isRetakeMode) {
    triggerBtn.textContent = 'RETAKE SNAPSHOT';
  } else {
    triggerBtn.textContent = 'START CAPTURE SESSION';
  }

  // Connect webcam stream
  camera.start();
}

/**
 * Launches the 3, 2, 1 snapshot count sequence.
 */
function triggerSnapshotSequence() {
  if (isCaptureLoopRunning) return;
  isCaptureLoopRunning = true;
  
  const triggerBtn = document.getElementById('btn-trigger-capture');
  triggerBtn.disabled = true;
  triggerBtn.style.opacity = 0.5;

  let countdown = 3;
  const overlay = document.getElementById('countdown-overlay');
  const countNum = document.getElementById('countdown-number');
  const timerBadge = document.getElementById('capture-timer-container');

  overlay.style.display = 'flex';
  countNum.textContent = countdown;
  timerBadge.textContent = `COUNTDOWN: ${countdown}`;
  playTickSound();

  countdownTimer = setInterval(async () => {
    countdown--;
    if (countdown > 0) {
      countNum.textContent = countdown;
      timerBadge.textContent = `COUNTDOWN: ${countdown}`;
      playTickSound();
    } else {
      clearInterval(countdownTimer);
      overlay.style.display = 'none';
      timerBadge.textContent = 'SNAP!';
      
      // Perform flash animation & snap
      playShutterSound();
      const snapUrl = await camera.capture();
      
      // Save snap
      photos[currentCaptureIndex] = snapUrl;
      
      // Move to next photo
      const total = selectedLayout === '3-strip' ? 3 : 4;
      
      if (isRetakeMode) {
        // Just retaking one photo
        isRetakeMode = false;
        retakeIndex = -1;
        triggerBtn.disabled = false;
        triggerBtn.style.opacity = 1;
        isCaptureLoopRunning = false;
        
        // Return to review
        switchScreen('review');
        renderReviewPhotos();
      } else {
        currentCaptureIndex++;
        if (currentCaptureIndex < total) {
          // Prepare next countdown
          document.getElementById('current-photo-index').textContent = currentCaptureIndex + 1;
          triggerBtn.disabled = false;
          triggerBtn.style.opacity = 1;
          isCaptureLoopRunning = false;
          
          // Small delay before starting next shot
          setTimeout(() => {
            triggerSnapshotSequence();
          }, 800);
        } else {
          // Finished taking all photos!
          triggerBtn.disabled = false;
          triggerBtn.style.opacity = 1;
          isCaptureLoopRunning = false;
          
          setTimeout(() => {
            switchScreen('review');
            renderReviewPhotos();
          }, 600);
        }
      }
    }
  }, 1000);
}

/**
 * Reviews & Retakes View compiler.
 */
function renderReviewPhotos() {
  const grid = document.getElementById('review-grid');
  grid.innerHTML = '';

  // Apply layout CSS class to the review grid
  grid.className = 'captured-photos-grid';
  grid.classList.add(`layout-${selectedLayout}`);

  photos.forEach((src, index) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.index = index;

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${index + 1}`;

    const retakeBtn = document.createElement('button');
    retakeBtn.className = 'btn-retake';
    retakeBtn.textContent = 'RETAKE';
    
    retakeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playBeepSound(493.88, 0.1); // B4
      isRetakeMode = true;
      retakeIndex = index;
      switchScreen('capture');
      startCameraCaptureSession();
    });

    card.appendChild(img);
    card.appendChild(retakeBtn);
    grid.appendChild(card);
  });
}

/**
 * Setup decoration view layouts.
 */
function initDecorationSession() {
  const strip = document.getElementById('decorating-strip');
  
  // Set theme properties
  const theme = frameThemes[selectedFrame] || frameThemes['pink-hearts'];
  strip.style.setProperty('--frame-bg', theme.bg);
  strip.style.setProperty('--frame-text', theme.text);

  // Set layout class
  strip.className = 'photo-strip-container';
  strip.classList.add(`layout-${selectedLayout}`);

  // Header/Footer text labels
  document.getElementById('strip-custom-text').textContent = customText || '♥ LOVE ♥';
  
  const dateStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '.').replace(/\.$/, ''); // "2026.06.24"
  document.getElementById('strip-date-text').textContent = dateStr;

  // Render images inside physical strip preview with swap and retake actions
  swapStartIndex = -1;
  renderDecoratePhotos();

  // Load stickers drawer
  if (stickerManager) {
    // Keep existing stickers, just reset drawer
    stickerManager.initDrawer('hearts');
  }
}

/**
 * Renders photos in the decorate screen strip preview with swap and retake hover buttons.
 */
function renderDecoratePhotos() {
  const photosContainer = document.getElementById('strip-photos-container');
  photosContainer.innerHTML = '';

  photos.forEach((src, index) => {
    const frame = document.createElement('div');
    frame.className = 'strip-photo-frame';
    frame.dataset.index = index;

    if (swapStartIndex === index) {
      frame.classList.add('swap-pending');
    }

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${index + 1}`;
    frame.appendChild(img);

    // Action buttons overlay
    const overlay = document.createElement('div');
    overlay.className = 'photo-action-overlay';

    // Swap position button
    const swapBtn = document.createElement('button');
    swapBtn.className = 'photo-action-btn btn-swap-photo';
    swapBtn.innerHTML = '🔄';
    swapBtn.title = 'Swap with another photo';
    swapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handlePhotoSwapClick(index);
    });

    // Retake button
    const retakeBtn = document.createElement('button');
    retakeBtn.className = 'photo-action-btn btn-retake-photo';
    retakeBtn.innerHTML = '📷';
    retakeBtn.title = 'Retake this photo';
    retakeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playBeepSound(493.88, 0.1);
      isRetakeMode = true;
      retakeIndex = index;
      switchScreen('capture');
      startCameraCaptureSession();
    });

    overlay.appendChild(swapBtn);
    overlay.appendChild(retakeBtn);
    frame.appendChild(overlay);

    // Touch device support: tap to open/toggle overlay or complete swap
    frame.addEventListener('click', (e) => {
      e.stopPropagation();

      if (swapStartIndex !== -1) {
        if (swapStartIndex === index) {
          // Cancel swap
          swapStartIndex = -1;
          playBeepSound(330, 0.1);
          renderDecoratePhotos();
        } else {
          // Swap positions in photos list
          playBeepSound(523.25, 0.15); // High pitch coin swap beep
          const temp = photos[swapStartIndex];
          photos[swapStartIndex] = photos[index];
          photos[index] = temp;
          swapStartIndex = -1;
          renderDecoratePhotos();
        }
        return;
      }

      // Toggle action-active class for touch states
      const activeFrames = photosContainer.querySelectorAll('.strip-photo-frame.action-active');
      activeFrames.forEach(f => {
        if (f !== frame) f.classList.remove('action-active');
      });
      frame.classList.toggle('action-active');
    });

    photosContainer.appendChild(frame);
  });
}

function handlePhotoSwapClick(index) {
  playBeepSound(440, 0.1);
  swapStartIndex = index;
  renderDecoratePhotos();
}

/**
 * Builds the high-resolution composite canvas.
 */
async function exportFinalPhotoStrip() {
  const loader = document.getElementById('export-loader');
  const finalImg = document.getElementById('final-strip-image');
  const downloadLink = document.getElementById('link-download-strip');

  loader.style.display = 'flex';
  finalImg.style.display = 'none';

  try {
    const placedStickers = stickerManager ? stickerManager.getStickers() : [];
    
    // Photostrip container width is 160px (defined in CSS layout)
    const previewWidth = 160;

    // Generate Composite
    const compositeDataUrl = await generateHighResStrip(
      photos,
      selectedLayout,
      selectedFrame,
      customText,
      placedStickers,
      previewWidth
    );

    // Apply composite to download elements
    finalImg.src = compositeDataUrl;
    finalImg.style.display = 'block';
    loader.style.display = 'none';

    downloadLink.href = compositeDataUrl;
    downloadLink.download = `photobooth-${selectedLayout}-${Date.now()}.png`;

  } catch (err) {
    console.error("Compositing photostrip compilation failed:", err);
    loader.innerHTML = `<p style="color: #ff5555">Export failed! Please try again.</p>`;
  }
}

/**
 * Resets all session parameters.
 */
function resetSession() {
  photos = [];
  isRetakeMode = false;
  retakeIndex = -1;
  swapStartIndex = -1;
  isCaptureLoopRunning = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  document.getElementById('input-custom-text').value = '';
  
  if (stickerManager) {
    stickerManager.clear();
  }
}
