/**
 * Stickers and Decoration module.
 * Provides custom SVG sticker definitions, drag-drop-scale-rotate mechanics,
 * and unified pointer event management for responsive desktop/mobile support.
 */

// Custom SVG Sticker Definitions grouped by Category
export const STICKER_TEMPLATES = {
  hearts: [
    {
      id: 'pink-heart',
      name: 'Cute Heart',
      svg: `<svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M50,88 C50,88 12,56 12,32 C12,12 30,8 50,28 C70,8 88,12 88,32 C88,56 50,88 50,88 Z" fill="#ff7ebb" stroke="#fff" stroke-width="4" stroke-linejoin="round" />
        <path d="M30,22 C22,22 18,28 18,36 C18,48 35,66 50,78 C45,74 38,62 38,50 C38,32 36,22 30,22 Z" fill="#ffb7c5" opacity="0.6"/>
      </svg>`
    },
    {
      id: 'double-hearts',
      name: 'Double Hearts',
      svg: `<svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M35,68 C35,68 10,48 10,30 C10,15 22,12 35,26 C48,12 60,15 60,30 C60,48 35,68 35,68 Z" fill="#ff5376" stroke="#fff" stroke-width="3" />
        <path d="M68,78 C68,78 48,62 48,48 C48,36 58,34 68,46 C78,34 88,36 88,48 C88,62 68,78 68,78 Z" fill="#ffb7c5" stroke="#fff" stroke-width="3" />
      </svg>`
    },
    {
      id: 'arrow-heart',
      name: 'Cupid Heart',
      svg: `<svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M50,75 C50,75 20,48 20,28 C20,11 35,8 50,25 C65,8 80,11 80,28 C80,48 50,75 50,75 Z" fill="#ff2e93" stroke="#fff" stroke-width="4" />
        <path d="M5,55 L35,45 M95,25 L65,35" stroke="#fff" stroke-width="6" stroke-linecap="round" />
        <path d="M5,55 L15,40 L20,60 Z M95,25 L85,15 L78,30 Z" fill="#fff" />
      </svg>`
    },
    {
      id: 'neon-heart',
      name: 'Neon Heart',
      svg: `<svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M50,80 C50,80 20,53 20,33 C20,16 33,13 50,29 C67,13 80,16 80,33 C80,53 50,80 50,80 Z" fill="none" stroke="#ff007f" stroke-width="8" stroke-linejoin="round" filter="drop-shadow(0 0 8px #ff007f)" />
        <path d="M50,75 C50,75 24,51 24,33 C24,19 35,17 50,30 C65,17 76,19 76,33 C76,51 50,75 50,75 Z" fill="none" stroke="#fff" stroke-width="2" />
      </svg>`
    }
  ],
  cute: [
    {
      id: 'star-sparkle',
      name: 'Sparkle Star',
      svg: `<svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M50,5 L62,38 L95,50 L62,62 L50,95 L38,62 L5,50 L38,38 Z" fill="#fff017" stroke="#fff" stroke-width="4" stroke-linejoin="round" />
        <circle cx="50" cy="50" r="10" fill="#fff" />
      </svg>`
    },
    {
      id: 'cat-ears',
      name: 'Cat Ears',
      svg: `<svg viewBox="0 0 120 60" width="120" height="60">
        <!-- Left Ear -->
        <path d="M10,50 L40,10 L55,42 Z" fill="#222" stroke="#fff" stroke-width="3" />
        <path d="M18,46 L38,18 L48,40 Z" fill="#ffb7c5" />
        <!-- Right Ear -->
        <path d="M110,50 L80,10 L65,42 Z" fill="#222" stroke="#fff" stroke-width="3" />
        <path d="M102,46 L82,18 L72,40 Z" fill="#ffb7c5" />
      </svg>`
    },
    {
      id: 'heart-glasses',
      name: 'Love Glasses',
      svg: `<svg viewBox="0 0 140 60" width="140" height="60">
        <!-- Frames -->
        <path d="M15,30 C15,12 45,10 45,30 C45,45 15,45 15,30 Z" fill="none" stroke="#ff7ebb" stroke-width="6" />
        <path d="M95,30 C95,12 125,10 125,30 C125,45 95,45 95,30 Z" fill="none" stroke="#ff7ebb" stroke-width="6" />
        <!-- Bridge -->
        <path d="M45,28 Q70,20 95,28" fill="none" stroke="#ff7ebb" stroke-width="5" />
        <!-- Glare -->
        <path d="M22,22 L30,22 M102,22 L110,22" stroke="#fff" stroke-width="3" stroke-linecap="round" />
      </svg>`
    },
    {
      id: 'angel-halo',
      name: 'Halo',
      svg: `<svg viewBox="0 0 100 50" width="100" height="50">
        <ellipse cx="50" cy="25" rx="35" ry="12" fill="none" stroke="#fff017" stroke-width="6" filter="drop-shadow(0 0 6px #fff017)" />
        <ellipse cx="50" cy="25" rx="31" ry="8" fill="none" stroke="#fff" stroke-width="1.5" />
      </svg>`
    }
  ],
  phrases: [
    {
      id: 'bubble-love',
      name: 'LOVE Bubble',
      svg: `<svg viewBox="0 0 100 60" width="100" height="60">
        <path d="M10,40 C10,45 5,55 5,55 C5,55 18,52 22,50 C30,53 40,55 50,55 C72,55 90,43 90,28 C90,13 72,1 50,1 C28,1 10,13 10,28 Z" fill="#fff" stroke="#ff7ebb" stroke-width="3" />
        <text x="50" y="34" font-family="'Fredoka', sans-serif" font-weight="900" font-size="16" fill="#ff7ebb" text-anchor="middle" letter-spacing="1">♥LOVE♥</text>
      </svg>`
    },
    {
      id: 'bubble-smile',
      name: 'SMILE Bubble',
      svg: `<svg viewBox="0 0 100 60" width="100" height="60">
        <rect x="5" y="5" width="90" height="40" rx="10" fill="#00f0ff" stroke="#fff" stroke-width="3" />
        <path d="M20,45 L15,55 L30,45 Z" fill="#00f0ff" stroke="#fff" stroke-width="3" stroke-linejoin="round" />
        <rect x="5" y="5" width="90" height="40" rx="10" fill="#00f0ff" />
        <text x="50" y="30" font-family="'Press Start 2P', monospace" font-size="9" fill="#fff" text-anchor="middle">SMILE!</text>
      </svg>`
    },
    {
      id: 'bubble-cute',
      name: 'CUTE Bubble',
      svg: `<svg viewBox="0 0 100 60" width="100" height="60">
        <path d="M10,40 C10,45 5,55 5,55 C5,55 18,52 22,50 C30,53 40,55 50,55 C72,55 90,43 90,28 C90,13 72,1 50,1 C28,1 10,13 10,28 Z" fill="#fff" stroke="#111" stroke-width="3" />
        <text x="50" y="34" font-family="'Fredoka', sans-serif" font-weight="900" font-size="18" fill="#111" text-anchor="middle">CUTE!</text>
      </svg>`
    },
    {
      id: 'bubble-omg',
      name: 'OMG Bubble',
      svg: `<svg viewBox="0 0 100 60" width="100" height="60">
        <polygon points="10,25 2,12 18,16 25,2 38,18 55,2 62,20 78,5 82,24 98,15 90,32 98,48 80,44 75,58 60,42 45,58 38,40 20,44 25,32 Z" fill="#fff017" stroke="#000" stroke-width="3" stroke-linejoin="round" />
        <text x="50" y="35" font-family="'Press Start 2P', monospace" font-size="12" fill="#000" text-anchor="middle">OMG!</text>
      </svg>`
    }
  ],
  retro: [
    {
      id: 'retro-gamepad',
      name: 'Gamepad',
      svg: `<svg viewBox="0 0 100 60" width="100" height="60">
        <rect x="5" y="10" width="90" height="40" rx="8" fill="#30303a" stroke="#fff" stroke-width="3" />
        <!-- D-Pad -->
        <path d="M20,25 H30 V35 H20 Z M15,30 H35" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        <!-- Action Buttons -->
        <circle cx="70" cy="35" r="4" fill="#ff7ebb" />
        <circle cx="80" cy="25" r="4" fill="#00f0ff" />
      </svg>`
    },
    {
      id: 'pixel-cherries',
      name: 'Cherries',
      svg: `<svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M60,10 C50,20 35,28 15,30" stroke="#00f0ff" stroke-width="6" stroke-linecap="round" fill="none" />
        <path d="M60,10 C55,25 50,35 45,60" stroke="#00f0ff" stroke-width="6" stroke-linecap="round" fill="none" />
        <!-- Cherry Left -->
        <rect x="5" y="50" width="30" height="30" rx="6" fill="#ff7ebb" stroke="#fff" stroke-width="3" />
        <rect x="10" y="55" width="8" height="8" fill="#fff" />
        <!-- Cherry Right -->
        <rect x="35" y="60" width="30" height="30" rx="6" fill="#ff7ebb" stroke="#fff" stroke-width="3" />
        <rect x="40" y="65" width="8" height="8" fill="#fff" />
      </svg>`
    },
    {
      id: 'retro-ufo',
      name: 'Retro UFO',
      svg: `<svg viewBox="0 0 100 70" width="100" height="70">
        <path d="M50,10 C30,10 20,25 20,35 C35,40 65,40 80,35 C80,25 70,10 50,10 Z" fill="#00f0ff" stroke="#fff" stroke-width="3"/>
        <ellipse cx="50" cy="42" rx="45" ry="12" fill="#ff7ebb" stroke="#fff" stroke-width="3" />
        <circle cx="25" cy="42" r="3" fill="#fff" />
        <circle cx="50" cy="42" r="3" fill="#fff" />
        <circle cx="75" cy="42" r="3" fill="#fff" />
      </svg>`
    },
    {
      id: 'insert-coin',
      name: 'Insert Coin',
      svg: `<svg viewBox="0 0 100 40" width="100" height="40">
        <rect x="2" y="2" width="96" height="36" rx="4" fill="#000" stroke="#fff" stroke-width="2" />
        <text x="50" y="25" font-family="'Press Start 2P', monospace" font-size="8" fill="#fff017" text-anchor="middle" filter="drop-shadow(0 0 4px #fff017)">INSERT COIN</text>
      </svg>`
    }
  ]
};

export class StickerManager {
  constructor(overlayElement, drawerElement) {
    this.overlay = overlayElement;
    this.drawer = drawerElement;
    this.placedStickers = [];
    this.activeSticker = null;
    this.stickerCounter = 0;
    
    // Bind interaction event listeners
    this.setupGlobalEvents();
  }

  /**
   * Initializes or updates the sticker selector drawer based on categories.
   */
  initDrawer(category = 'hearts') {
    this.drawer.innerHTML = '';
    const templates = STICKER_TEMPLATES[category] || [];

    templates.forEach(t => {
      const item = document.createElement('div');
      item.className = 'sticker-item';
      item.innerHTML = t.svg;
      item.dataset.stickerId = t.id;
      item.title = t.name;

      item.addEventListener('click', () => {
        this.addStickerToStrip(t);
      });

      this.drawer.appendChild(item);
    });
  }

  /**
   * Adds a sticker template to the active interactive overlay.
   */
  addStickerToStrip(template) {
    const id = `sticker-inst-${this.stickerCounter++}`;
    
    // Create DOM element wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'sticker-instance';
    wrapper.id = id;
    
    // Add raw SVG content
    wrapper.innerHTML = template.svg;

    // Add handle buttons
    const deleteHandle = document.createElement('div');
    deleteHandle.className = 'sticker-handle sticker-handle-delete';
    deleteHandle.innerHTML = '×';
    
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'sticker-handle sticker-handle-resize';

    wrapper.appendChild(deleteHandle);
    wrapper.appendChild(resizeHandle);
    this.overlay.appendChild(wrapper);

    // Initial properties (centered on the active photostrip overlay)
    const bounds = this.overlay.getBoundingClientRect();
    const width = wrapper.querySelector('svg').getAttribute('width') || 100;
    const height = wrapper.querySelector('svg').getAttribute('height') || 100;

    const stickerData = {
      id: id,
      templateId: template.id,
      svgString: template.svg,
      x: (bounds.width - width) / 2,
      y: (bounds.height - height) / 2,
      width: parseInt(width),
      height: parseInt(height),
      scale: 0.8, // Start slightly scaled down
      rotation: 0,
      element: wrapper
    };

    this.placedStickers.push(stickerData);
    this.updateStickerTransform(stickerData);
    this.setActiveSticker(stickerData);

    // Setup events for this specific sticker wrapper
    this.bindStickerEvents(stickerData);
  }

  /**
   * Updates CSS transforms based on current x, y, scale, rotation.
   */
  updateStickerTransform(sticker) {
    // Keep size consistent by scaling relative to original dimension
    sticker.element.style.width = `${sticker.width}px`;
    sticker.element.style.height = `${sticker.height}px`;
    
    sticker.element.style.transform = `translate(${sticker.x}px, ${sticker.y}px) rotate(${sticker.rotation}deg) scale(${sticker.scale})`;
  }

  /**
   * Sets the active editing sticker.
   */
  setActiveSticker(sticker) {
    if (this.activeSticker) {
      this.activeSticker.element.classList.remove('active');
    }

    this.activeSticker = sticker;
    
    if (sticker) {
      sticker.element.classList.add('active');
      // Bring active sticker to top layer
      this.overlay.appendChild(sticker.element);
    }
  }

  /**
   * Removes a sticker instance.
   */
  deleteSticker(sticker) {
    if (!sticker) return;
    
    if (this.activeSticker && this.activeSticker.id === sticker.id) {
      this.activeSticker = null;
    }

    if (sticker.element && sticker.element.parentNode) {
      sticker.element.parentNode.removeChild(sticker.element);
    }

    this.placedStickers = this.placedStickers.filter(s => s.id !== sticker.id);
  }

  /**
   * Resets all decorated stickers.
   */
  clear() {
    this.placedStickers.forEach(s => {
      if (s.element && s.element.parentNode) {
        s.element.parentNode.removeChild(s.element);
      }
    });
    this.placedStickers = [];
    this.activeSticker = null;
  }

  /**
   * Retrieves list of current stickers with positions normalized to target canvas scale.
   */
  getStickers() {
    return this.placedStickers.map(s => ({
      templateId: s.templateId,
      svgString: s.svgString,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
      scale: s.scale,
      rotation: s.rotation
    }));
  }

  /**
   * Binds pointer down actions to the sticker wrapper and its handles.
   */
  bindStickerEvents(sticker) {
    const el = sticker.element;
    const deleteBtn = el.querySelector('.sticker-handle-delete');
    const resizeBtn = el.querySelector('.sticker-handle-resize');

    // Select sticker on click/pointerdown
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.setActiveSticker(sticker);

      // Prevent dragging if handles are clicked
      if (e.target === deleteBtn || e.target === resizeBtn) return;

      const rect = this.overlay.getBoundingClientRect();
      const initialPointerX = e.clientX;
      const initialPointerY = e.clientY;
      const initialStickerX = sticker.x;
      const initialStickerY = sticker.y;

      const onPointerMove = (moveEvent) => {
        const dx = moveEvent.clientX - initialPointerX;
        const dy = moveEvent.clientY - initialPointerY;
        
        // Boundaries mapping
        let newX = initialStickerX + dx;
        let newY = initialStickerY + dy;

        // Keep sticker partially on the photo strip overlay
        const buffer = 40;
        newX = Math.max(-sticker.width + buffer, Math.min(rect.width - buffer, newX));
        newY = Math.max(-sticker.height + buffer, Math.min(rect.height - buffer, newY));

        sticker.x = newX;
        sticker.y = newY;
        this.updateStickerTransform(sticker);
      };

      const onPointerUp = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    });

    // Delete Handle Event
    deleteBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.deleteSticker(sticker);
    });

    // Resize and Rotate Handle Event
    resizeBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const rect = this.overlay.getBoundingClientRect();
      
      // Calculate center coordinates of sticker
      const stickerRect = el.getBoundingClientRect();
      const centerX = stickerRect.left + stickerRect.width / 2;
      const centerY = stickerRect.top + stickerRect.height / 2;

      // Base metrics before transformation
      const initialDistance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const initialScale = sticker.scale;
      const initialRotation = sticker.rotation;

      const onPointerMove = (moveEvent) => {
        const currentDistance = Math.hypot(moveEvent.clientX - centerX, moveEvent.clientY - centerY);
        const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);

        // Calculate updates
        const scaleChange = currentDistance / initialDistance;
        let newScale = initialScale * scaleChange;
        
        // Constrain scale bounds
        newScale = Math.max(0.3, Math.min(3.0, newScale));

        const angleChange = currentAngle - initialAngle;
        const newRotation = initialRotation + (angleChange * 180 / Math.PI);

        sticker.scale = newScale;
        sticker.rotation = newRotation;
        
        this.updateStickerTransform(sticker);
      };

      const onPointerUp = () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    });

    // Double-click/Double-tap to remove
    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.deleteSticker(sticker);
    });
  }

  /**
   * Sets up global pointer events to clear selection when clicking outside.
   */
  setupGlobalEvents() {
    document.addEventListener('pointerdown', (e) => {
      // If pointer is clicked outside active stickers and the overlay/drawer, deselect sticker
      if (this.activeSticker && !e.target.closest('.sticker-instance') && !e.target.closest('.sticker-item')) {
        this.setActiveSticker(null);
      }
    });
  }
}
