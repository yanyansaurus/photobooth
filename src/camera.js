/**
 * Camera Integration module.
 * Manages webcam streams, permissions, snapping frames, and provides a mock camera fallback.
 */

export class CameraHandler {
  constructor(videoElement, fallbackContainer, flashElement) {
    this.video = videoElement;
    this.fallback = fallbackContainer;
    this.flash = flashElement;
    this.stream = null;
    this.isMockMode = false;
    this.mockCanvas = null;
    this.mockCtx = null;
    this.mockAnimId = null;
    this.mockParticles = [];
  }

  /**
   * Initializes the camera. If it fails, starts mock camera mode.
   */
  async start() {
    this.stop(); // Clean up first
    this.isMockMode = false;
    this.fallback.style.display = 'flex';
    this.fallback.querySelector('p').textContent = 'Connecting webcam...';
    this.video.style.display = 'none';

    try {
      // Request media stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      this.video.srcObject = this.stream;
      this.video.style.display = 'block';
      this.fallback.style.display = 'none';
      
      // Wait for metadata to load
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve);
        };
      });

    } catch (err) {
      console.warn("Webcam access failed, entering Mock Camera Mode:", err);
      this.startMockCamera();
    }
  }

  /**
   * Cleans up running stream or mock animation loop.
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.video.srcObject = null;
    this.video.style.display = 'none';

    if (this.mockAnimId) {
      cancelAnimationFrame(this.mockAnimId);
      this.mockAnimId = null;
    }
    if (this.mockCanvas && this.mockCanvas.parentNode) {
      this.mockCanvas.parentNode.removeChild(this.mockCanvas);
    }
    this.mockCanvas = null;
    this.mockCtx = null;
  }

  /**
   * Snaps a photo of the current viewport and returns a Data URL.
   */
  async capture() {
    // Shutter flash animation trigger
    if (this.flash) {
      this.flash.classList.remove('flash-active');
      void this.flash.offsetWidth; // Reflow to restart animation
      this.flash.classList.add('flash-active');
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (this.isMockMode) {
      // Draw mock canvas stream
      ctx.drawImage(this.mockCanvas, 0, 0, 640, 480);
    } else {
      // Mirror the actual video frame when saving
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(this.video, 0, 0, 640, 480);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    }

    return canvas.toDataURL('image/png');
  }

  /**
   * Activates interactive mock canvas simulation.
   */
  startMockCamera() {
    this.isMockMode = true;
    this.fallback.style.display = 'none';

    // Create a dynamic canvas overlaying the video
    this.mockCanvas = document.createElement('canvas');
    this.mockCanvas.width = 640;
    this.mockCanvas.height = 480;
    this.mockCanvas.style.width = '100%';
    this.mockCanvas.style.height = '100%';
    this.mockCanvas.style.objectFit = 'cover';
    this.mockCanvas.style.display = 'block';
    
    // Insert mock canvas in the parent container
    this.video.parentNode.insertBefore(this.mockCanvas, this.video);
    this.mockCtx = this.mockCanvas.getContext('2d');

    // Create particles for the arcade effect
    this.mockParticles = [];
    for (let i = 0; i < 15; i++) {
      this.mockParticles.push({
        x: Math.random() * 640,
        y: Math.random() * 480,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 15 + Math.random() * 20,
        color: Math.random() > 0.5 ? '#ff7ebb' : '#00f0ff',
        type: Math.random() > 0.5 ? 'heart' : 'star'
      });
    }

    this.runMockLoop();
  }

  /**
   * Render loop for the mock camera.
   */
  runMockLoop() {
    if (!this.isMockMode || !this.mockCtx) return;

    const ctx = this.mockCtx;
    const w = this.mockCanvas.width;
    const h = this.mockCanvas.height;

    // Clear with dark purple retro background
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(0, 0, w, h);

    // Draw retro neon scan grids
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1.5;
    const gridSize = 40;
    
    // Vertical lines
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Horizontal lines
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Update and draw particles
    this.mockParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce bounds
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      
      if (p.type === 'heart') {
        // Draw Heart Shape
        ctx.beginPath();
        const d = p.size;
        ctx.moveTo(p.x, p.y - d / 4);
        ctx.bezierCurveTo(p.x - d / 2, p.y - d * 0.7, p.x - d, p.y - d / 3, p.x - d, p.y + d / 4);
        ctx.bezierCurveTo(p.x - d, p.y + d * 0.7, p.x, p.y + d * 1.1, p.x, p.y + d * 1.2);
        ctx.bezierCurveTo(p.x, p.y + d * 1.1, p.x + d, p.y + d * 0.7, p.x + d, p.y + d / 4);
        ctx.bezierCurveTo(p.x + d, p.y - d / 3, p.x + d / 2, p.y - d * 0.7, p.x, p.y - d / 4);
        ctx.closePath();
        ctx.fill();
      } else {
        // Draw Star Shape
        ctx.beginPath();
        const spikes = 5;
        const outerRadius = p.size / 2;
        const innerRadius = p.size / 4;
        let rot = Math.PI / 2 * 3;
        let x = p.x;
        let y = p.y;
        let step = Math.PI / spikes;

        ctx.moveTo(p.x, p.y - outerRadius);
        for (let i = 0; i < spikes; i++) {
          x = p.x + Math.cos(rot) * outerRadius;
          y = p.y + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = p.x + Math.cos(rot) * innerRadius;
          y = p.y + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(p.x, p.y - outerRadius);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // Draw arcade text overlay
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#fff017';
    ctx.fillStyle = '#fff017';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CAMERA SIMULATOR', w / 2, h / 2 - 15);

    ctx.shadowColor = '#00f0ff';
    ctx.fillStyle = '#00f0ff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillText('SMILE & SNAP! :)', w / 2, h / 2 + 25);
    
    ctx.shadowBlur = 0;

    // Pulse red rec indicator
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.beginPath();
      ctx.arc(35, 35, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3333';
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('REC', 55, 39);
    }

    this.mockAnimId = requestAnimationFrame(() => this.runMockLoop());
  }
}
