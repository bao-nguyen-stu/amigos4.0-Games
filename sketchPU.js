/* ==========================================================================
   sketchPU.js - ESCALATING POPUP SYSTEM
   ========================================================================== */

const HydraAdsSystem = {
  colors: ['#F7CD26', '#53A643', '#33FF58'],
  textStages: [
    "YOU ARE THE 1,000,000TH VISITOR?", 
    "CLICK HERE TO CLAIM YOUR FREE GIFT?", 
    "CLICK HERE TO CLAIM YOUR ADDICTION?"
  ],

  // Internal state tracking
  activePopupCount: 0,
  totalSpawnedInSequence: 0,
  totalClosedCount: 0,
  staticTriggered: false,
  maxSequencePopups: 30,
  sequenceActive: false,

  getRandomGradient: function() {
    let c1 = this.colors[Math.floor(Math.random() * this.colors.length)];
    let c2 = this.colors[Math.floor(Math.random() * this.colors.length)];
    while (c1 === c2) {
      c2 = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    return `linear-gradient(180deg, ${c1}, ${c2})`;
  },

  /**
   * Starts the initial sequence by spawning 1 center popup after 3 seconds.
   */
  startEscalationSequence: function() {
    if (this.sequenceActive) return;
    this.sequenceActive = true;
    this.totalSpawnedInSequence = 0;
    this.activePopupCount = 0;
    this.totalClosedCount = 0;
    this.staticTriggered = false;

    // Step 1: Spawn initial popup in the middle after 3 seconds
    setTimeout(() => {
      this.spawnCenterPopup();
    }, 3000);
  },

  spawnCenterPopup: function() {
    const popupWidth = 250;
    const popupHeight = 150;
    const x = (window.innerWidth - popupWidth) / 2;
    const y = (window.innerHeight - popupHeight) / 2;

    this.createSinglePopup(x, y);
  },

  spawnBatch: function(count) {
    for (let i = 0; i < count; i++) {
      if (this.totalSpawnedInSequence >= this.maxSequencePopups) {
        this.triggerGlitchIfMaxReached();
        break;
      }

      const popupWidth = 250;
      const popupHeight = 150;
      const x = Math.random() * Math.max(10, window.innerWidth - popupWidth);
      const y = Math.random() * Math.max(10, window.innerHeight - popupHeight);

      this.createSinglePopup(x, y);
    }
  },

  spawnStaticPopups: function(count) {
    for (let i = 0; i < count; i++) {
      const popupWidth = 250;
      const popupHeight = 150;
      const x = Math.random() * Math.max(10, window.innerWidth - popupWidth);
      const y = Math.random() * Math.max(10, window.innerHeight - popupHeight);

      this.createSinglePopup(x, y, true); // marked as static, won't escalate on close
    }
  },

  triggerGlitchIfMaxReached: function() {
    if (this.totalSpawnedInSequence >= this.maxSequencePopups) {
      setTimeout(() => {
        // Clears all active popups from the screen after 1.2 seconds
        this.clearAll();

        if (typeof window.triggerGlobalGlitch === 'function') {
          window.triggerGlobalGlitch();
        }
      }, 1200);
    }
  },

  createSinglePopup: function(x, y, isStatic = false) {
    this.totalSpawnedInSequence++;
    this.activePopupCount++;

    // Play sound immediately when popup appears without preloading
    new Audio('designed-sounds/COMM2754-2026-S2-A3w12-BeyondTheLabel-click10-2.wav').play().catch(() => {});

    const popup = document.createElement('div');
    popup.className = 'hydra-ad-popup';
    popup.style.background = this.getRandomGradient();

    popup.style.left = `${Math.max(0, Math.min(x, window.innerWidth - 250))}px`;
    popup.style.top = `${Math.max(0, Math.min(y, window.innerHeight - 150))}px`;

    const displayText = this.textStages[Math.floor(Math.random() * this.textStages.length)];

    popup.innerHTML = `
      <div class="hydra-topbar">
        <button class="hydra-close-btn">X</button>
      </div>
      <div class="hydra-content">
        <p>${displayText}</p>
      </div>
    `;

    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.hydra-close-btn');
    closeBtn.addEventListener('click', () => {
      // 1. Capture current popups on screen right BEFORE closing this one
      const currentOnScreen = this.activePopupCount;

      // 2. Remove popup and decrement active count
      popup.remove();
      this.activePopupCount--;
      this.totalClosedCount++;

      // 3. Trigger 2.5s timeout static popups after closing > 4 popups total
      if (this.totalClosedCount > 4 && !this.staticTriggered) {
        this.staticTriggered = true;
        setTimeout(() => {
          this.spawnStaticPopups(2);
        }, 2500);
      }

      // 4. Play audio chime
      if (typeof activeChimeSound !== 'undefined' && activeChimeSound) {
        activeChimeSound.currentTime = 0;
        activeChimeSound.play().catch(() => {});
      }

      // 5. Spawn new popups based on formula: (1 + currentOnScreen) * 2
      if (!isStatic) {
        const spawnAmount = (1 + currentOnScreen) * 2;
        this.spawnBatch(spawnAmount);
      }
    });
  },

  clearAll: function() {
    const allPopups = document.querySelectorAll('.hydra-ad-popup');
    allPopups.forEach(p => p.remove());
    this.activePopupCount = 0;
    this.totalClosedCount = 0;
    this.staticTriggered = false;
    this.sequenceActive = false;
  },

  injectStyles: function() {
    if (document.getElementById('hydra-styles')) return;
    const style = document.createElement('style');
    style.id = 'hydra-styles';
    style.innerHTML = `
      .hydra-ad-popup {
        position: fixed;
        width: 250px;
        min-height: 150px;
        z-index: 999999;
        border: 3px outset #eee;
        box-shadow: 4px 4px 0px rgba(0,0,0,1);
        display: flex;
        flex-direction: column;
        animation: popupShake 0.25s ease-out;
      }
      .hydra-topbar {
        width: 100%; height: 25px; background: #0000aa; 
        display: flex; justify-content: flex-end; align-items: center;
        padding: 2px; border-bottom: 2px solid #000;
        box-sizing: border-box;
      }
      .hydra-close-btn {
        background: #ccc; color: black; font-family: Arial, sans-serif; 
        font-weight: bold; border: 2px outset #fff; padding: 0 5px;
        cursor: pointer; font-size: 14px; height: 100%;
      }
      .hydra-close-btn:active { border: 2px inset #fff; }
      .hydra-close-btn:hover { background: #ff4444; color: white; }
      .hydra-content { 
        text-align: center; width: 100%; flex-grow: 1;
        display: flex; align-items: center; justify-content: center;
        padding: 15px; box-sizing: border-box;
      }
      .hydra-content p {
        font-family: Arial, Helvetica, sans-serif !important;
        font-weight: bold !important; font-size: 16px;
        color: #000; text-align: center; text-transform: uppercase; margin: 0;
      }
      @keyframes popupShake {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.08); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  HydraAdsSystem.injectStyles();
});
