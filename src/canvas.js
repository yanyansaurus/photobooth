/**
 * High-Resolution Canvas compiler.
 * Composites the photos, frame borders, custom texts, and SVG stickers
 * into a single high-quality PNG.
 */

// Helper to load an Image object from a URL (Promise-based)
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

// Helper to convert an SVG string to a loaded Image object (Promise-based)
function loadSvgImage(svgString) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render sticker SVG on canvas"));
    };
    img.src = url;
  });
}

/**
 * Composites photos, frames, texts, and stickers into a high-res image strip.
 * @param {Array<string>} photos - List of snapshot data URLs.
 * @param {string} layout - '4-strip', '3-strip', or '2x2'.
 * @param {string} frameTheme - Theme ID ('pink-hearts', 'neon-grid', etc.).
 * @param {string} customText - Bottom custom banner text.
 * @param {Array<Object>} stickers - Placed sticker configurations.
 * @param {number} previewWidth - Width of the HTML DOM strip in pixels (usually 200).
 * @returns {Promise<string>} - Resolves to PNG Data URL.
 */
export async function generateHighResStrip(photos, layout, frameTheme, customText, stickers, previewWidth = 200) {
  // Load all snapshot images first
  const photoImages = await Promise.all(photos.map(p => loadImage(p)));

  // Setup Canvas Dimensions based on layout
  let canvasWidth, canvasHeight;
  let photoWidth, photoHeight;
  let photoPositions = [];
  
  let headerHeight = 60;
  let footerHeight = 70;
  let gap = 30;
  let paddingX = 40;

  if (layout === '4-strip') {
    canvasWidth = 600;
    photoWidth = canvasWidth - (paddingX * 2); // 520px
    photoHeight = Math.round(photoWidth * 3 / 4); // 390px
    headerHeight = 80;
    footerHeight = 90;
    gap = 24;

    canvasHeight = headerHeight + footerHeight + (4 * photoHeight) + (3 * gap);

    // Calculate vertical layout Y coordinates
    let currentY = headerHeight;
    for (let i = 0; i < 4; i++) {
      photoPositions.push({ x: paddingX, y: currentY, w: photoWidth, h: photoHeight });
      currentY += photoHeight + gap;
    }
  } else if (layout === '3-strip') {
    canvasWidth = 600;
    photoWidth = canvasWidth - (paddingX * 2); // 520px
    photoHeight = Math.round(photoWidth * 3 / 4); // 390px
    headerHeight = 80;
    footerHeight = 90;
    gap = 24;

    canvasHeight = headerHeight + footerHeight + (3 * photoHeight) + (2 * gap);

    let currentY = headerHeight;
    for (let i = 0; i < 3; i++) {
      photoPositions.push({ x: paddingX, y: currentY, w: photoWidth, h: photoHeight });
      currentY += photoHeight + gap;
    }
  } else {
    // 2x2 Grid Layout
    canvasWidth = 800;
    photoWidth = 345;
    photoHeight = Math.round(photoWidth * 3 / 4); // 258.75 px -> ~259
    headerHeight = 90;
    footerHeight = 100;
    gap = 24;
    paddingX = 43;

    canvasHeight = headerHeight + footerHeight + (2 * photoHeight) + gap;

    // 2x2 positions
    photoPositions = [
      { x: paddingX, y: headerHeight, w: photoWidth, h: photoHeight },
      { x: paddingX + photoWidth + gap, y: headerHeight, w: photoWidth, h: photoHeight },
      { x: paddingX, y: headerHeight + photoHeight + gap, w: photoWidth, h: photoHeight },
      { x: paddingX + photoWidth + gap, y: headerHeight + photoHeight + gap, w: photoWidth, h: photoHeight }
    ];
  }

  // Create high-resolution canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // Scale multiplier between DOM preview and export canvas
  const scaleMultiplier = canvasWidth / previewWidth;

  // 1. Draw Frame Background based on Theme
  ctx.save();
  let textThemeColor = '#ffffff';

  if (frameTheme === 'pink-hearts') {
    ctx.fillStyle = '#ffb7c5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw cute decorative hearts on borders
    ctx.fillStyle = '#ff99b0';
    drawDecorativeHearts(ctx, canvasWidth, canvasHeight);
    textThemeColor = '#ffffff';

  } else if (frameTheme === 'neon-grid') {
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw neon grid background
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 2;
    const size = 30;
    for (let x = 0; x < canvasWidth; x += size) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += size) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
    }
    
    // Neon borders
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f0ff';
    ctx.strokeRect(3, 3, canvasWidth - 6, canvasHeight - 6);
    textThemeColor = '#00f0ff';

  } else if (frameTheme === 'pastel-yellow') {
    ctx.fillStyle = '#fff5cc';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw sweet dots
    ctx.fillStyle = '#ffe082';
    drawDecorativeDots(ctx, canvasWidth, canvasHeight);
    textThemeColor = '#5c3d2e';

  } else if (frameTheme === 'classic-white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Elegant border
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
    textThemeColor = '#111111';

  } else {
    // Gothic Black
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Dark cyberpunk border
    ctx.strokeStyle = '#ff7ebb';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
    textThemeColor = '#ff7ebb';
  }
  ctx.restore();

  // 2. Draw Captured Photos inside layout frames
  photoPositions.forEach((pos, index) => {
    ctx.save();
    // Shadow for photos
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    
    // Fill photo black backing first
    ctx.fillStyle = '#000000';
    ctx.fillRect(pos.x, pos.y, pos.w, pos.h);
    ctx.restore();

    // Draw the image
    const img = photoImages[index];
    if (img) {
      ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
    }

    // Outer photo thin frame lines for premium design
    ctx.strokeStyle = frameTheme === 'neon-grid' ? '#ff7ebb' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = frameTheme === 'neon-grid' ? 3 : 1.5;
    if (frameTheme === 'neon-grid') {
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ff7ebb';
      ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
      ctx.restore();
    } else {
      ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
    }
  });

  // 3. Render header text (e.g. Love Custom Labels)
  ctx.save();
  ctx.fillStyle = textThemeColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (frameTheme === 'neon-grid') {
    ctx.shadowColor = textThemeColor;
    ctx.shadowBlur = 8;
  }

  // Draw header text
  const cleanHeader = customText.trim() ? customText : '♥ TOGETHER ♥';
  ctx.font = `bold 32px "Fredoka", sans-serif`;
  if (frameTheme === 'neon-grid' || frameTheme === 'gothic-black') {
    ctx.font = `18px "Press Start 2P", monospace`;
  }
  ctx.fillText(cleanHeader.toUpperCase(), canvasWidth / 2, headerHeight / 2 + 5);

  // 4. Draw footer date
  const dateStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '.').replace(/\.$/, ''); // "2026.06.24"

  ctx.font = `bold 24px "Fredoka", sans-serif`;
  if (frameTheme === 'neon-grid' || frameTheme === 'gothic-black') {
    ctx.font = `12px "Press Start 2P", monospace`;
  }
  ctx.fillText(dateStr, canvasWidth / 2, canvasHeight - (footerHeight / 2));
  ctx.restore();

  // 5. Draw Stickers overlaying the canvas
  for (const s of stickers) {
    try {
      const img = await loadSvgImage(s.svgString);
      
      ctx.save();
      // Map coordinates to canvas space
      const scaleFactorX = scaleMultiplier;
      const scaleFactorY = scaleMultiplier;

      // Calculate relative position based on the strip's coordinate system
      // s.x and s.y are the absolute positioning within 200px width container
      const targetWidth = s.width * s.scale * scaleMultiplier;
      const targetHeight = s.height * s.scale * scaleMultiplier;

      // Calculate target center of the sticker on canvas
      const centerX = (s.x + s.width / 2) * scaleMultiplier;
      const centerY = (s.y + s.height / 2) * scaleMultiplier;

      ctx.translate(centerX, centerY);
      ctx.rotate(s.rotation * Math.PI / 180);
      
      // Draw image centered on origin
      ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
      ctx.restore();
    } catch (e) {
      console.warn("Failed drawing sticker to high-res canvas: ", e);
    }
  }

  return canvas.toDataURL('image/png');
}

/**
 * Draws cute heart accents scattered on the pink frame.
 */
function drawDecorativeHearts(ctx, w, h) {
  const drawHeart = (x, y, size) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size / 4);
    ctx.bezierCurveTo(x - size / 2, y - size * 0.7, x - size, y - size / 3, x - size, y + size / 4);
    ctx.bezierCurveTo(x - size, y + size * 0.7, x, y + size * 1.1, x, y + size * 1.2);
    ctx.bezierCurveTo(x, y + size * 1.1, x + size, y + size * 0.7, x + size, y + size / 4);
    ctx.bezierCurveTo(x + size, y - size / 3, x + size / 2, y - size * 0.7, x, y - size / 4);
    ctx.fill();
  };

  // Border coordinates
  const hearts = [
    { x: 40, y: 35, s: 15 },
    { x: w - 40, y: 120, s: 12 },
    { x: 30, y: h - 140, s: 18 },
    { x: w - 30, y: h - 60, s: 14 },
    { x: 50, y: h / 2, s: 10 },
    { x: w - 50, y: h / 2 - 100, s: 15 }
  ];

  hearts.forEach(h => drawHeart(h.x, h.y, h.s));
}

/**
 * Draws cute retro dots on the yellow theme.
 */
function drawDecorativeDots(ctx, w, h) {
  const dots = [
    { x: 30, y: 40, r: 8 },
    { x: w - 35, y: 150, r: 6 },
    { x: 40, y: h - 120, r: 10 },
    { x: w - 30, y: h - 50, r: 7 },
    { x: w - 40, y: h / 2, r: 8 }
  ];

  dots.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });
}
