/* ==========================================================================
   sketchPU.js - POPUP SYSTEM (Static 1-2 popups, no spam interval)
   ========================================================================== */

const HydraAdsSystem = {
  colors: ['#F7CD26', '#53A643', '#33FF58'],
  textStages: [
    "YOU ARE THE 1,000,000TH VISITOR?", 
    "CLICK HERE TO CLAIM YOUR FREE GIFT?", 
    "CLICK HERE TO CLAIM YOUR ADDICTION?"
  ],

  getRandomGradient: function() {
    let c1 = this.colors[Math.floor(Math.random() * this.colors.length)];
    let c2 = this.colors[Math.floor(Math.random() * this.colors.length)];
    while (c1 === c2) {
      c2 = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    return `linear-gradient(180deg, ${c1},${c2})`;
  },

  spawnStaticPopups: function(count = 2) {
    for (let i = 0; i < count; i++) {
      this.createSinglePopup();
    }
  },

  createSinglePopup: function() {
    const popup = document.createElement('div');
    popup.className = 'hydra-ad-popup';
    popup.style.background = this.getRandomGradient();

    const popupWidth = 250;
    const popupHeight = 150; 
    const x = Math.random() * (window.innerWidth - popupWidth);
    const y = Math.random() * (window.innerHeight - popupHeight);

    popup.style.left = `${Math.max(0, Math.min(x, window.innerWidth - popupWidth))}px`;
    popup.style.top = `${Math.max(0, Math.min(y, window.innerHeight - popupHeight))}px`;

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
      popup.remove();
      if (typeof activeChimeSound !== 'undefined' && activeChimeSound) {
        activeChimeSound.currentTime = 0;
        activeChimeSound.play().catch(()=> {});
      }
    });
  },

  clearAll: function() {
    const allPopups = document.querySelectorAll('.hydra-ad-popup');
    allPopups.forEach(p => p.remove());
  },

  injectStyles: function() {
    const style = document.createElement('style');
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
        animation: popupShake 0.3s ease-out;
      }
      .hydra-topbar {
        width: 100%; height: 25px; background: #0000aa; 
        display: flex; justify-content: flex-end; align-items: center;
        padding: 2px; border-bottom: 2px solid #000;
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
        padding: 15px;
      }
      .hydra-content p {
        font-family: Arial, Helvetica, sans-serif !important;
        font-weight: bold !important; font-size: 18px;
        color: #000; text-align: center; text-transform: uppercase; margin: 0;
      }
      @keyframes popupShake {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  HydraAdsSystem.injectStyles();
});

// [UPDATED] Just spawn 2 on load and leave it at that.
setTimeout(() => {
  HydraAdsSystem.spawnStaticPopups(2);
}, 2500); // 2.5 seconds in so they notice it
