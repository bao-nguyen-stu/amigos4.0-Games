// =========================================================
// 1. AD RINGTONE DOWNLOAD
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const ringtoneBtn = document.querySelector(".ad.box button");

  if (ringtoneBtn) {
    ringtoneBtn.addEventListener("click", () => {
      const audioPath = "COMM2754-2026-S2-A3w12-4Amigos-Music.mp3";

      const link = document.createElement("a");
      link.href = audioPath;
      link.download = "COMM2754-2026-S2-A3w12-4Amigos-Music.mp3";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});

// =========================================================
// 2. PROMO ADVERTISEMENTS ROTATOR (WITH HOVER INTERACTION)
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const quangcaoDiv = document.querySelector(".promo .quangcao");

  if (quangcaoDiv) {
    const promoImages = [
      "edited-media/COMM2754-2026-S2-A3w12-Amigos4-quangcao1.png",
      "edited-media/COMM2754-2026-S2-A3w12-Amigos4-quangcao2.png",
      "edited-media/COMM2754-2026-S2-A3w12-Amigos4-quangcao3.png",
      "edited-media/COMM2754-2026-S2-A3w12-Amigos4-quangcao4.png"
    ];

    const imgElement = document.createElement("img");
    
    // Smooth transition settings for scaling & filters
    imgElement.style.transition = "transform 0.2s ease-in-out, filter 0.2s ease-in-out";
    quangcaoDiv.appendChild(imgElement);

    // Inject shake keyframes into document header automatically
    if (!document.getElementById("promo-shake-style")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "promo-shake-style";
      styleSheet.innerText = `
        @keyframes promoShake {
          0% { transform: scale(1.04) rotate(0deg); }
          25% { transform: scale(1.04) rotate(-2deg); }
          50% { transform: scale(1.04) rotate(2deg); }
          75% { transform: scale(1.04) rotate(-1deg); }
          100% { transform: scale(1.04) rotate(0deg); }
        }
        .promo-hover-shake {
          animation: promoShake 0.4s ease-in-out infinite alternate;
          filter: brightness(1.15) contrast(1.05);
          cursor: pointer;
        }
      `;
      document.head.appendChild(styleSheet);
    }

    // Hover Interaction Handlers
    quangcaoDiv.addEventListener("mouseenter", () => {
      imgElement.classList.add("promo-hover-shake");
    });

    quangcaoDiv.addEventListener("mouseleave", () => {
      imgElement.classList.remove("promo-hover-shake");
    });

    let currentIndex = -1;

    function changePromoImage() {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * promoImages.length);
      } while (randomIndex === currentIndex && promoImages.length > 1);

      currentIndex = randomIndex;
      imgElement.src = promoImages[currentIndex];
    }

    // Set initial image and start 3-second interval
    changePromoImage();
    setInterval(changePromoImage, 3000);
  }
});

// =========================================================
// 3. SCROLLING AD SKETCH
// =========================================================

const cloverImageFile =
  "edited-media/COMM2754-2026-S2-A3w12-Amigos4-clover.gif";

const maxClovers = 12; // Enough pairs to cover ultra-wide screens
const cloverPreloads = [];
for (let i = 0; i < maxClovers; i++) {
  const img = new Image();
  img.src = cloverImageFile;
  cloverPreloads.push(img);
}

const scrollingAdSketch = (p) => {
  let adText = "You saw the addiction. Did you see the person?";

  let textXPos = 0;
  let scrollSpeed = 1.5;
  let textWidthValue = 0;

  // Space between each complete message
  let gap = 400;

  // Banner container
  let container = null;

  // CLOVERS
  let cloverPool = [];
  let cloverImageReady = false;

  let cloverImageWidth = 32;
  let cloverImageHeight = 32;

  // Small distance between clover and sentence
  const iconGap = 3;

  // CANDIES
  let candies = [];
  let loadedSounds = [];
  let isHovering = false;

  const candyImageFiles = [
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element1.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element2.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element3.png",
  ];

  let candyImages = [];
  let candyImagesReady = false;
  let loadedCandyCount = 0;

  let pendingCandyHover = false;
  let pendingHoverX = 0;
  let pendingHoverY = 0;

  // =======================================================
  // SOUNDS
  // =======================================================

  const soundFiles = [
    "designed-sounds/COMM2754-2026-S2-A3w12-blip2-anim.wav",
    "designed-sounds/COMM2754-2026-S2-A3w12-BeyondTheLabel-melody6.wav",
    "designed-sounds/COMM2754-2026-S2-A3w12-blip-anim.wav",
  ];

  // =======================================================
  // SETUP CLOVER ELEMENT POOL
  // =======================================================

  function setupCloverPool() {
    if (!container) return;

    cloverPreloads.forEach((preloadImg) => {
      preloadImg.style.position = "absolute";
      preloadImg.style.pointerEvents = "none";
      preloadImg.style.display = "none";
      preloadImg.style.objectFit = "contain";
      preloadImg.style.zIndex = "2";

      container.appendChild(preloadImg);
      cloverPool.push(preloadImg);
    });
  }

  // =======================================================
  // SET CLOVER SIZE
  // =======================================================

  function setupCloverSize() {
    const sampleImg = cloverPool[0];
    if (!sampleImg) return;

    const originalWidth = sampleImg.naturalWidth;
    const originalHeight = sampleImg.naturalHeight;

    if (originalWidth > 0 && originalHeight > 0) {
      cloverImageHeight = 32;
      cloverImageWidth = (originalWidth / originalHeight) * cloverImageHeight;

      // Apply size to all preloaded clovers in the pool
      cloverPool.forEach((img) => {
        img.style.width = `${cloverImageWidth}px`;
        img.style.height = `${cloverImageHeight}px`;
      });
    }

    cloverImageReady = true;
  }

  // =======================================================
  // TRIGGER INTERACTION (Sound + Particles)
  // =======================================================

  function triggerInteraction(x, y) {
    // Play random sound
    if (loadedSounds.length > 0) {
      const snd = p.random(loadedSounds);
      snd.currentTime = 0;
      snd.play().catch((error) => {
        console.log("Audio blocked:", error);
      });
    }

    // Spawn candy
    if (candyImagesReady) {
      spawnCandyParticles(x, y);
    } else {
      pendingCandyHover = true;
      pendingHoverX = x;
      pendingHoverY = y;
    }
  }

  // =======================================================
  // SETUP
  // =======================================================

  p.setup = () => {
    container = document.querySelector(".banner");

    const w = container?.clientWidth || 300;
    const h = container?.clientHeight || 40;

    const canvas = p.createCanvas(w, h);

    if (container) {
      canvas.parent(container);
      container.style.position = "relative";
      container.style.overflow = "hidden";
    }

    // Initialize and append preloaded clover elements
    setupCloverPool();

    // Check sizing
    if (cloverPool[0] && cloverPool[0].complete) {
      setupCloverSize();
    } else if (cloverPool[0]) {
      cloverPool[0].onload = setupCloverSize;
    }

    // TEXT
    p.textSize(24);
    p.textFont("Georgia");
    p.textStyle(p.BOLD);
    p.textAlign(p.LEFT, p.CENTER);

    textWidthValue = p.textWidth(adText);
    textXPos = p.width;

    // SOUNDS
    loadedSounds = soundFiles.map((path) => {
      const snd = new Audio(path);
      snd.volume = 0.5;
      return snd;
    });

    // CANDY IMAGES
    candyImageFiles.forEach((path) => {
      const img = new Image();
      img.src = path;

      img.onload = () => {
        loadedCandyCount++;
        candyImages.push(img);

        if (loadedCandyCount === candyImageFiles.length) {
          candyImagesReady = true;
          if (pendingCandyHover) {
            spawnCandyParticles(pendingHoverX, pendingHoverY);
            pendingCandyHover = false;
          }
        }
      };

      img.onerror = () => {
        loadedCandyCount++;
        if (loadedCandyCount === candyImageFiles.length) {
          candyImagesReady = true;
          if (pendingCandyHover) {
            spawnCandyParticles(pendingHoverX, pendingHoverY);
            pendingCandyHover = false;
          }
        }
      };
    });
  };

  // =======================================================
  // MOUSE / TOUCH CLICK HANDLER (Mobile & Tablet)
  // =======================================================

  p.mousePressed = () => {
    const isMobileOrTablet = window.matchMedia("(max-width: 760px)").matches;

    if (isMobileOrTablet) {
      const mouseInCanvas =
        p.mouseX > 0 &&
        p.mouseX <= p.width &&
        p.mouseY > 0 &&
        p.mouseY <= p.height;

      if (mouseInCanvas) {
        triggerInteraction(p.mouseX, p.mouseY);
      }
    }
  };

  // =======================================================
  // SPAWN CANDY PARTICLES
  // =======================================================

  function spawnCandyParticles(x, y) {
    if (!candyImagesReady) {
      pendingCandyHover = true;
      pendingHoverX = x;
      pendingHoverY = y;
      return;
    }

    const usableImages = candyImages.filter(
      (img) => img.complete && img.naturalWidth > 0
    );

    if (usableImages.length === 0) {
      return;
    }

    const particleCount = p.floor(p.random(15, 30));

    for (let i = 0; i < particleCount; i++) {
      const selectedImage = p.random(usableImages);
      candies.push(new CandyParticle(p, selectedImage, x, y));
    }
  }

  // =======================================================
  // DRAW
  // =======================================================

  p.draw = () => {
    p.clear();

    p.fill("#FFFFFF");
    p.noStroke();

    // =====================================================
    // INTERACTION DETECTION (Desktop Hover vs Mobile/Tablet Click)
    // =====================================================

    const isMobileOrTablet = window.matchMedia("(max-width: 760px)").matches;
    const mouseInCanvas =
      p.mouseX > 0 &&
      p.mouseX <= p.width &&
      p.mouseY > 0 &&
      p.mouseY <= p.height;

    // Desktop hover behavior only runs if NOT on mobile/tablet view
    if (!isMobileOrTablet) {
      if (mouseInCanvas && !isHovering) {
        isHovering = true;
        triggerInteraction(p.mouseX, p.mouseY);
      }

      if (!mouseInCanvas) {
        isHovering = false;
      }
    }

    // =====================================================
    // UPDATE CANDIES
    // =====================================================

    candies = candies.filter((candy) => {
      candy.update();
      candy.display();

      return !candy.isDead();
    });

    // =====================================================
    // CALCULATE COMPLETE MESSAGE WIDTH
    // =====================================================

    const textWithCloversWidth =
      cloverImageWidth + iconGap + textWidthValue + iconGap + cloverImageWidth;

    const fullLength = textWithCloversWidth + gap;

    // =====================================================
    // HIDE ALL CLOVERS IN POOL INITIALLY EACH FRAME
    // =====================================================

    cloverPool.forEach((img) => {
      if (img) img.style.display = "none";
    });

    // =====================================================
    // DRAW REPEATING MESSAGES & DYNAMIC CLOVER PAIRS
    // =====================================================

    let cloverIndexCounter = 0;

    for (let currentX = textXPos; currentX < p.width; currentX += fullLength) {
      // ---------------------------------------------------
      // 1. FRONT CLOVER (Before Sentence)
      // ---------------------------------------------------
      if (cloverImageReady) {
        const firstCloverX = currentX;
        const firstCloverY = p.height / 2 - cloverImageHeight / 2;

        if (firstCloverX + cloverImageWidth > 0 && firstCloverX < p.width) {
          if (cloverIndexCounter < cloverPool.length) {
            const activeClover = cloverPool[cloverIndexCounter];
            activeClover.style.display = "block";
            activeClover.style.left = `${firstCloverX}px`;
            activeClover.style.top = `${firstCloverY}px`;
          }
        }
      }
      cloverIndexCounter++;

      // ---------------------------------------------------
      // TEXT
      // ---------------------------------------------------
      const textX = currentX + cloverImageWidth + iconGap;
      p.text(adText, textX, p.height / 2);

      // ---------------------------------------------------
      // 2. BACK CLOVER (Behind Sentence)
      // ---------------------------------------------------
      if (cloverImageReady) {
        const secondCloverX = textX + textWidthValue + iconGap;
        const secondCloverY = p.height / 2 - cloverImageHeight / 2;

        if (secondCloverX + cloverImageWidth > 0 && secondCloverX < p.width) {
          if (cloverIndexCounter < cloverPool.length) {
            const activeClover = cloverPool[cloverIndexCounter];
            activeClover.style.display = "block";
            activeClover.style.left = `${secondCloverX}px`;
            activeClover.style.top = `${secondCloverY}px`;
          }
        }
      }
      cloverIndexCounter++;
    }

    // =====================================================
    // SCROLL
    // =====================================================

    textXPos -= scrollSpeed;

    if (textXPos <= -textWithCloversWidth) {
      textXPos += fullLength;
    }
  };

  // =========================================================
  // WINDOW RESIZE
  // =========================================================

  p.windowResized = () => {
    const currentContainer = document.querySelector(".banner");

    if (currentContainer) {
      p.resizeCanvas(
        currentContainer.clientWidth,
        currentContainer.clientHeight
      );

      textWidthValue = p.textWidth(adText);
    }
  };
};

// =========================================================
// 4. CANDY PARTICLE CLASS
// =========================================================

class CandyParticle {
  constructor(p, image, x, y) {
    this.p = p;
    this.image = image;

    this.x = x;
    this.y = y;

    this.vx = p.random(-3.5, 3.5);
    this.vy = p.random(-4.5, 0.5);

    this.gravity = 0.1;

    this.alpha = 1.0;
    this.lifespan = 180;

    this.size = p.random(12, 20);

    this.rotation = p.random(p.TWO_PI);
    this.rotationSpeed = p.random(-0.04, 0.04);
  }

  update() {
    this.x += this.vx;

    this.vy += this.gravity;
    this.y += this.vy;

    this.rotation += this.rotationSpeed;

    this.lifespan--;
    this.alpha = this.p.map(this.lifespan, 0, 180, 0, 1.0);
  }

  display() {
    if (!this.image || !this.image.complete || this.image.naturalWidth === 0) {
      return;
    }

    const ctx = this.p.drawingContext;
    const imgRatio = this.image.naturalWidth / this.image.naturalHeight;

    let drawWidth = this.size;
    let drawHeight = this.size;

    if (imgRatio >= 1) {
      drawHeight = this.size / imgRatio;
    } else {
      drawWidth = this.size * imgRatio;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    ctx.drawImage(
      this.image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

new p5(scrollingAdSketch);

// =========================================================
// 5. BACKGROUND PIXEL ARTWORK SKETCH
// =========================================================

const backgroundSketch = (p) => {
  let aspectRatio;
  let stars = [];
  let waveSeeds = [];
  let orbs = [];

  let timeAccumulator = 0;
  let p5Colors = [];

  const rawColors = [
    [105, 0, 125],
    [25, 0, 85],
    [50, 0, 105],
    [135, 0, 170]
  ];

  const LOW_RES_WIDTH = 400;

  p.setup = () => {
    let container = document.getElementById("bg-canvas-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "bg-canvas-container";
      document.body.prepend(container);
    }

    aspectRatio = window.innerHeight / window.innerWidth;

    const lowResHeight = p.floor(LOW_RES_WIDTH * aspectRatio);

    p.pixelDensity(1);
    p.frameRate(30);

    const canvas = p.createCanvas(LOW_RES_WIDTH, lowResHeight);
    canvas.parent(container);

    p5Colors = rawColors.map((colorValue) => {
      return p.color(colorValue[0], colorValue[1], colorValue[2]);
    });

    orbs = [
      { x: 0.2, y: 0.25, baseR: 110, phase: 0.0, colorShiftSpeed: 0.15 },
      { x: 0.8, y: 0.2, baseR: 120, phase: 1.5, colorShiftSpeed: 0.12 },
      { x: 0.5, y: 0.5, baseR: 100, phase: 3.0, colorShiftSpeed: 0.18 },
      { x: 0.15, y: 0.75, baseR: 115, phase: 4.2, colorShiftSpeed: 0.14 },
      { x: 0.85, y: 0.8, baseR: 125, phase: 2.1, colorShiftSpeed: 0.16 },
      { x: 0.5, y: 0.85, baseR: 95, phase: 5.5, colorShiftSpeed: 0.11 }
    ];

    stars = Array.from({ length: 6 }, () => ({
      x: p.random(p.width),
      y: p.random(p.height),
      vx: p.random(-0.3, 0.3),
      vy: p.random(-0.2, 0.2),
      phase: p.random(p.TWO_PI)
    }));

    waveSeeds = [p.random(100), p.random(100)];
  };

  p.draw = () => {
    const dt = p.min(p.deltaTime * 0.001, 0.05);

    timeAccumulator += dt;
    const t = timeAccumulator * 0.6;
    const bgSpeed = 0.4;
    const bgProgress = (timeAccumulator * bgSpeed) % p5Colors.length;

    const bgIdx1 = p.floor(bgProgress);
    const bgIdx2 = (bgIdx1 + 1) % p5Colors.length;
    const bgAmt = bgProgress - bgIdx1;

    const bgColor = p.lerpColor(p5Colors[bgIdx1], p5Colors[bgIdx2], bgAmt);

    p.background(bgColor);
    p.noStroke();

    orbs.forEach((orb) => {
      const cx = p.width * orb.x;
      const cy = p.height * orb.y;
      const pulse = p.sin(timeAccumulator * 1.2 + orb.phase);
      const currentRadius = orb.baseR + pulse * 14;

      const colorProgress =
        (timeAccumulator * orb.colorShiftSpeed + orb.phase) % p5Colors.length;

      const idx1 = p.floor(colorProgress);
      const idx2 = (idx1 + 1) % p5Colors.length;
      const amt = colorProgress - idx1;

      const activeColor = p.lerpColor(p5Colors[idx1], p5Colors[idx2], amt);
      const layers = 4;

      for (let i = layers; i > 0; i--) {
        const currentR = p.map(
          i,
          1,
          layers,
          currentRadius,
          currentRadius * 0.15
        );

        const alphaVal = p.map(i, 1, layers, 35, 140);

        p.fill(
          p.red(activeColor),
          p.green(activeColor),
          p.blue(activeColor),
          alphaVal
        );

        p.ellipse(cx, cy, currentR);
      }
    });

    p.fill(255, 255, 255, 100);
    p.noStroke();

    const spacing = 6;

    for (let x = 0; x < p.width; x += spacing) {
      for (let y = 0; y < p.height; y += spacing) {
        const dTL = p.dist(x, y, 0, 0);
        const dBR = p.dist(x, y, p.width, p.height);

        if (dTL < p.width * 0.35 || dBR < p.width * 0.35) {
          p.rect(x, y, 1, 1);
        }
      }
    }

    p.noFill();
    p.stroke(255, 255, 255, 160);
    p.strokeWeight(1);

    waveSeeds.forEach((seed, index) => {
      p.beginShape();
      const yOffset = index === 0 ? p.height * 0.22 : p.height * 0.78;

      for (let x = 0; x <= p.width; x += 3) {
        const y =
          yOffset +
          p.sin(x * 0.03 + t * 1.5 + seed) * 4 +
          p.cos(x * 0.02 - t) * 2;

        p.vertex(x, y);
      }

      p.endShape();
    });

    stars.forEach((star) => {
      star.x = (star.x + star.vx * (dt * 30) + p.width) % p.width;
      star.y = (star.y + star.vy * (dt * 30) + p.height) % p.height;

      p.fill(255, 255, 255);
      p.noStroke();

      p.rect(star.x, star.y, 1, 1);
      p.rect(star.x - 1, star.y, 3, 1);
      p.rect(star.x, star.y - 1, 1, 3);
    });
  };

  p.windowResized = () => {
    aspectRatio = window.innerHeight / window.innerWidth;
    p.resizeCanvas(LOW_RES_WIDTH, p.floor(LOW_RES_WIDTH * aspectRatio));
  };
};

new p5(backgroundSketch);

// =========================================================
// 6. SDG 3.5 BANNER AD SKETCH 
// =========================================================

const sdgBannerSketch = (p) => {
  const fullText = "Strengthen the prevention and treatment of substance abuse, including narcotic drug abuse and harmful use of alcohol.";

  // Essential Palette Definitions Only
  const COLOR_MAIN_DARK = "#3700C0";
  const COLOR_MAIN_MID = "#7355BD";
  const COLOR_TEXT_LIGHT = "#d2cdf3";
  const COLOR_MUTED = "#b9acd0";
  const COLOR_ACCENT_YELLOW = "#F7CD26";

  // Timing settings
  const VISIBLE_DURATION = 6000;
  const FADE_DURATION = 2000;
  const CYCLE_DURATION = VISIBLE_DURATION + FADE_DURATION;

  // Text Styling Constants (Matched in both height calc & draw)
  const TEXT_FONT_SIZE = 16;
  const PADDING_SIDE = 12; 
  const PADDING_BOX_VERTICAL = 10;

  // Asset handling for floating elements
  const elementPaths = [
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element1.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element2.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element3.png"
  ];
  let elementImages = [];
  let floatingElements = [];
  let currentCanvasHeight = 100;

  p.setup = () => {
    const container = document.querySelector(".sdg.box") || document.querySelector(".sdg");
    const w = container?.clientWidth || 300;
    
    const canvas = p.createCanvas(w, currentCanvasHeight);

    if (container) {
      canvas.parent(container);
    }

    elementPaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        elementImages.push(img);
        floatingElements.push(createFloatingElement(img));
      };
    });

    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (elementImages.length > 0) {
          const randomImg = p.random(elementImages);
          floatingElements.push(createFloatingElement(randomImg));
        }
      }, i * 200);
    }

    p.adjustHeightToFit();
  };

  function createFloatingElement(img) {
    return {
      image: img,
      x: p.random(110, p.width),
      y: p.random(p.height),
      size: p.random(14, 22),
      speedX: p.random(-0.3, 0.3),
      speedY: p.random(-0.2, 0.2),
      rotation: p.random(p.TWO_PI),
      rotSpeed: p.random(-0.02, 0.02),
      alpha: p.random(60, 180)
    };
  }

  p.adjustHeightToFit = () => {
    const container = document.querySelector(".sdg.box") || document.querySelector(".sdg");
    const w = container?.clientWidth || p.width || 300;
    
    const badgeWidth = p.min(105, w * 0.3);
    const paddingLeft = badgeWidth + PADDING_SIDE;
    const textWidthLimit = w - paddingLeft - PADDING_SIDE;

    if (textWidthLimit > 50) {
      // 1. Set identical font properties to measure line wrap accurately
      p.textSize(TEXT_FONT_SIZE);
      p.textFont("Arial");
      p.textStyle(p.BOLD);

      // 2. Average width per character for 16px Arial Bold
      const charWidth = p.textWidth("a");
      const maxCharsPerLine = p.max(1, p.floor(textWidthLimit / charWidth));
      const words = fullText.split(" ");
      
      let lineCount = 1;
      let currentLineLength = 0;

      words.forEach(word => {
        if (currentLineLength + word.length + 1 > maxCharsPerLine) {
          lineCount++;
          currentLineLength = word.length;
        } else {
          currentLineLength += word.length + 1;
        }
      });

      // 3. Line height scaling for 16px text
      const leading = TEXT_FONT_SIZE * 1.4;
      const textHeight = lineCount * leading;
      
      // Ensure badge height can accommodate 4 vertical lines of text in side panel
      const minBadgeHeight = 110;
      const requiredHeight = p.max(minBadgeHeight, textHeight + (PADDING_BOX_VERTICAL * 2));

      if (Math.abs(currentCanvasHeight - requiredHeight) > 2) {
        currentCanvasHeight = requiredHeight;
        p.resizeCanvas(w, currentCanvasHeight);
        
        if (container) {
          container.style.height = `${currentCanvasHeight}px`;
          container.style.minHeight = `${currentCanvasHeight}px`;
        }
      }
    }
  };

  p.draw = () => {
    const ctx = p.drawingContext;

    // 1. Draw Linear Gradient Background
    const gradient = ctx.createLinearGradient(0, 0, p.width, p.height);
    gradient.addColorStop(0, COLOR_MAIN_DARK);
    gradient.addColorStop(1, COLOR_MAIN_MID);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, p.width, p.height);

    const badgeWidth = p.min(105, p.width * 0.3);

    // 2. Floating Background Elements
    floatingElements.forEach((el) => {
      el.x += el.speedX;
      el.y += el.speedY;
      el.rotation += el.rotSpeed;

      if (el.x < badgeWidth) el.x = p.width;
      if (el.x > p.width) el.x = badgeWidth;
      if (el.y < 0) el.y = p.height;
      if (el.y > p.height) el.y = 0;

      if (el.image && el.image.complete && el.image.naturalWidth > 0) {
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.globalAlpha = el.alpha / 255;
        ctx.drawImage(el.image, -el.size / 2, -el.size / 2, el.size, el.size);
        ctx.restore();
      }
    });

    // 3. Opacity Timing Loop (6s visible / 1s fade-out)
    const currentTime = p.millis() % CYCLE_DURATION;
    let textAlpha = 255;

    if (currentTime > VISIBLE_DURATION) {
      const fadeProgress = (currentTime - VISIBLE_DURATION) / FADE_DURATION;
      textAlpha = p.map(p.cos(fadeProgress * p.TWO_PI), -1, 1, 0, 255);
    }

    // 4. Render Text (Large 16px BOLD with proper bounds)
    const paddingLeft = badgeWidth + PADDING_SIDE;
    const textWidthLimit = p.width - paddingLeft - PADDING_SIDE;

    if (textWidthLimit > 50) {
      p.textFont("Arial");
      p.textStyle(p.BOLD);
      p.textSize(TEXT_FONT_SIZE);

      const textColor = p.color(COLOR_TEXT_LIGHT);
      textColor.setAlpha(textAlpha);
      p.fill(textColor);
      p.textAlign(p.LEFT, p.CENTER);

      p.text(fullText, paddingLeft, PADDING_BOX_VERTICAL, textWidthLimit, p.height - (PADDING_BOX_VERTICAL * 2));
    }

    // 5. Static SDG 3.5 Side Badge
    p.fill(COLOR_MAIN_DARK);
    p.noStroke();
    p.rect(0, 0, badgeWidth, p.height);

    p.stroke(255, 255, 255, 30);
    p.strokeWeight(1);
    p.line(badgeWidth, 0, badgeWidth, p.height);

    // --- 1. ADJUST "TARGET 3.5" TEXT SIZE & POSITION ---
    p.noStroke();
    p.fill(COLOR_ACCENT_YELLOW);
    // Increased scale multiplier and max size (from 13 to 16)
    p.textSize(p.constrain(badgeWidth * 0.15, 12, 16)); 
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text("TARGET 3.5", badgeWidth / 2, p.height / 2 - 24);

    // --- 2. ADJUST "SDG GOAL 3..." SUBTITLE TEXT SIZE & POSITION ---
    // Increased scale multiplier and max size (from 9.5 to 11.5)
    p.textSize(p.constrain(badgeWidth * 0.09, 8.5, 11.5));
    p.textStyle(p.BOLD);
    p.fill(COLOR_MUTED);
    p.text("SDG GOAL 3:", badgeWidth / 2, p.height / 2 - 4);
    p.text("GOOD HEALTH", badgeWidth / 2, p.height / 2 + 10);
    p.text("AND WELLBEING", badgeWidth / 2, p.height / 2 + 24);
  };

  p.windowResized = () => {
    p.adjustHeightToFit();
  };
};

new p5(sdgBannerSketch);

// =========================================================
// 7. RATINGS HOVER POPUP
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const ratingsArticle = document.getElementById("ratings");
  if (!ratingsArticle) return;

  if (!document.getElementById("flash-ratings-style")) {
    const style = document.createElement("style");
    style.id = "flash-ratings-style";

    style.innerText = `
      #ratings {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .flash-popup-panel {
        position: absolute;
        width: 440px;
        display: flex;
        gap: 12px;
        padding: 12px;
        z-index: 999999;

        background: linear-gradient(
          180deg,
          #c7ad66 0%,
          #c7ad66 10.13%,
          #3700C0 73.7%,
          #6b005d 100%
        );

        border: 3px solid #F7CD26;
        outline: 2px solid #db00ac;

        box-shadow:
          0 0 20px rgba(78, 38, 175, 0.8),
          inset 0 1px 1px rgba(255, 255, 255, 0.3);

        box-sizing: border-box;

        opacity: 0;
        visibility: hidden;

        transform: translateY(8px) scale(0.96);

        transition:
          opacity 0.2s ease,
          transform 0.2s cubic-bezier(
            0.175,
            0.885,
            0.32,
            1.275
          ),
          visibility 0.2s;

        pointer-events: none;
      }

      .flash-popup-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .popup-left {
        flex: 0 0 115px;
      }

      .image-frame {
        position: relative;
        width: 115px;
        height: 115px;
        border: 2px solid #db00ac;
        overflow: hidden;
        background: #000;
      }

      .image-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .flash-badge {
        position: absolute;
        bottom: 3px;
        right: 3px;
        background: #F7CD26;
        color: #3700C0;
        font-size: 8px;
        font-weight: 900;
        padding: 1px 4px;
        letter-spacing: 0.5px;
        font-family: Georgia, serif;
      }

      .popup-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .rating-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        padding-bottom: 4px;
        border-bottom: 1px dashed rgba(210, 205, 243, 0.3);
      }

      .rating-header .stars {
        color: #F7CD26;
        font-size: 15px;
        text-shadow: 0 0 4px rgba(247, 205, 38, 0.8);
      }

      .rating-header .score {
        color: #FFF;
        font-weight: bold;
        font-size: 14px;
        font-family: Arial, sans-serif;
      }

      .rating-header .count {
        color: #33ff58;
        font-size: 10.5px;
        font-family: Arial, sans-serif;
      }

      .popup-content p {
        margin: 0 0 4px 0;
        font-family: Arial, sans-serif;
        line-height: 1.3;
      }

      /* MAIN INFORMATION */
      .popup-content .tagline {
        color: #f9e6f1;
        font-size: 15px;
        font-weight: 600;
      }

      /* OTHER */
      .popup-content .callout {
        color: #F7CD26;
        font-size: 12px;
        font-weight: bold;
      }

      /* ITALIC */
      .popup-content .question {
        color: #d5c2df;
        font-size: 11.5px;
        font-style: italic;
        margin-bottom: 0;
        font-family: Georgia, serif;
      }
    `;

    document.head.appendChild(style);
  }

  const minVotes = 50000;
  const maxVotes = 350000;

  const randomVotes = (
    Math.floor(
      Math.random() * (maxVotes - minVotes + 1)
    ) + minVotes
  ).toLocaleString();

  const popup = document.createElement("div");
  popup.className = "flash-popup-panel";

  popup.innerHTML = `
    <div class="popup-left">
      <div class="image-frame">
        <img
          src="edited-media/COMM2754-2026-S2-A3w12-Amigos4-element1.png"
          alt="Preview"
        />
        <span class="flash-badge">✦ LIFE RUSH! ✦</span>
      </div>
    </div>

    <div class="popup-right">
      <div class="rating-header">
        <span class="stars">★★★★★</span>
        <span class="score">4.9</span>
        <span class="count">(${randomVotes} votes)</span>
      </div>

      <div class="popup-content">
        <p class="tagline">
          Make money, meet friends, fall in love, chase your dreams, or try something crazy!
        </p>

        <p class="callout">
          Your choices shape your story, so play your way and claim your prizes! 🏆
        </p>

        <p class="question">
          But when the world sees you through labels… who do you think you really are? 💭
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  ratingsArticle.addEventListener("mouseenter", () => {
    const rect = ratingsArticle.getBoundingClientRect();

    popup.style.top =
      `${rect.top + window.scrollY - popup.offsetHeight - 10}px`;

    popup.style.left =
      `${rect.left + window.scrollX}px`;

    popup.classList.add("active");
  });

  ratingsArticle.addEventListener("mouseleave", () => {
    popup.classList.remove("active");
  });
});


// =========================================================
// 8. PRODUCER HOVER POPUP
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const producerArticle = document.getElementById("producer");
  if (!producerArticle) return;

  if (!document.getElementById("flash-producer-style")) {
    const style = document.createElement("style");
    style.id = "flash-producer-style";

    style.innerText = `
      #producer {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .producer-popup-panel {
        position: absolute;
        width: 440px;
        padding: 12px;
        z-index: 999999;

        background: linear-gradient(
          180deg,
          #c7ad66 0%,
          #c7ad66 10.13%,
          #3700C0 73.7%,
          #6b005d 100%
        );

        border: 3px solid #F7CD26;
        outline: 2px solid #db00ac;

        box-shadow:
          0 0 20px rgba(78, 38, 175, 0.8),
          inset 0 1px 1px rgba(255, 255, 255, 0.3);

        box-sizing: border-box;

        opacity: 0;
        visibility: hidden;

        transform: translateY(8px) scale(0.96);

        transition:
          opacity 0.2s ease,
          transform 0.2s cubic-bezier(
            0.175,
            0.885,
            0.32,
            1.275
          ),
          visibility 0.2s;

        pointer-events: none;
      }

      .producer-popup-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .producer-popup-panel p {
        margin: 0 0 6px 0;
        line-height: 1.4;
      }

      /* HEADER */
      .producer-header-text {
        color: #3700C0;
        font-weight: bold;
        font-size: 14px;
        font-family: Arial, sans-serif;
        text-transform: uppercase;

        padding-bottom: 4px;
        border-bottom: 1px dashed rgba(210, 205, 243, 0.3);
        margin-bottom: 8px;
      }

      /* MAIN INTRO */
      .producer-sub-text {
        color: #f9e6f1;
        font-size: 15px;
        font-weight: bold;
        font-family: Arial, sans-serif;
      }

      /* MAIN INFORMATION */
      .producer-body-text {
        color: #f9e6f1;
        font-size: 15px;
        font-family: Arial, sans-serif;
      }

      /* LIFE RUSH REMAINS YELLOW */
      .producer-title-inline {
        color: #F7CD26;
        font-weight: bold;
      }

      /* OTHER, ORIGINAL YELLOW */
      .producer-motto-text {
        color: #F7CD26;
        font-size: 12px;
        font-weight: bold;
        font-family: Arial, sans-serif;
      }

      .producer-divider {
        border: none;
        border-top: 1px dashed rgba(210, 205, 243, 0.3);
        margin: 6px 0 8px 0;
      }

      /* ITALIC */
      .producer-ps-text {
        color: #d5c2df;
        font-size: 11.5px;
        font-style: italic;
        font-family: Georgia, serif;
        padding-bottom: 6px;
      }

      /* OTHER */
      .producer-shoutout-text {
        color: #FFF;
        font-size: 12px;
        font-family: Arial, sans-serif;
        letter-spacing: 1px;
      }
    `;

    document.head.appendChild(style);
  }

  const producerPopup = document.createElement("div");
  producerPopup.className = "producer-popup-panel";

  producerPopup.innerHTML = `
    <p class="producer-header-text">HEY THERE! 👋</p>

    <p class="producer-sub-text">
      I'm Bao, a.k.a. Nguyen Duc Bao Ngoc, from the Indie Game Department of 4 AMIGOS!
    </p>

    <p class="producer-body-text">
      <span class="producer-title-inline">✦ LIFE RUSH ✦</span>
      is my very own game, made with love, trial and errors, and a little bit of chaos (maybe not that little tehee). 💖
    </p>

    <p class="producer-body-text">
      Thanks for playing, and let's look beyond the label together! ✨
    </p>

    <p class="producer-motto-text">
      Behind the labels, there's a person.
    </p>

    <div class="producer-divider"></div>

    <p class="producer-ps-text">
      P.S. Shoutout to my fellow AMIGOS! 💖
    </p>

    <p class="producer-shoutout-text">
      Le Nguyen Thuy Dan • Tran Thi Thuy Hang • Vu Hai Nam
    </p>
  `;

  document.body.appendChild(producerPopup);

  producerArticle.addEventListener("mouseenter", () => {
    const rect = producerArticle.getBoundingClientRect();

    producerPopup.style.top =
      `${rect.top + window.scrollY - producerPopup.offsetHeight - 10}px`;

    producerPopup.style.left =
      `${rect.left + window.scrollX}px`;

    producerPopup.classList.add("active");
  });

  producerArticle.addEventListener("mouseleave", () => {
    producerPopup.classList.remove("active");
  });
});


// =========================================================
// 9. TUTORIAL HOVER POPUP
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const tutorialArticle = document.getElementById("tutorial");
  if (!tutorialArticle) return;

  if (!document.getElementById("flash-tutorial-style")) {
    const style = document.createElement("style");
    style.id = "flash-tutorial-style";

    style.innerText = `
      #tutorial {
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tutorial-popup-panel {
        position: absolute;
        width: 440px;
        padding: 12px;
        z-index: 999999;

        background: linear-gradient(
          180deg,
          #c7ad66 0%,
          #c7ad66 10.13%,
          #3700C0 73.7%,
          #6b005d 100%
        );

        border: 3px solid #F7CD26;
        outline: 2px solid #db00ac;

        box-shadow:
          0 0 20px rgba(78, 38, 175, 0.8),
          inset 0 1px 1px rgba(255, 255, 255, 0.3);

        box-sizing: border-box;

        opacity: 0;
        visibility: hidden;

        transform: translateY(8px) scale(0.96);

        transition:
          opacity 0.2s ease,
          transform 0.2s cubic-bezier(
            0.175,
            0.885,
            0.32,
            1.275
          ),
          visibility 0.2s;

        pointer-events: none;
      }

      .tutorial-popup-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .tutorial-popup-panel p {
        margin: 0 0 6px 0;
        line-height: 1.4;
      }

      /* HEADER */
      .tutorial-header-text {
        color: #3700C0;
        font-weight: bold;
        font-size: 14px;
        font-family: Arial, sans-serif;
        text-transform: uppercase;

        padding-bottom: 4px;
        border-bottom: 1px dashed rgba(210, 205, 243, 0.3);
        margin-bottom: 8px;
      }

      /* MAIN INFORMATION */
      .tutorial-body-text {
        color: #f9e6f1;
        font-size: 15px;
        font-family: Arial, sans-serif;
        line-height: 1.4;
      }

      /* STEP TITLES */
      .tutorial-step-title {
        color: #F7CD26;
        font-weight: bold;
        font-size: 15px;
        font-family: Arial, sans-serif;
      }

      /* ITALIC */
      .tutorial-footer-text {
        color: #d5c2df;
        font-size: 11.5px;
        font-style: italic;
        font-family: Georgia, serif;

        margin-top: 8px;
        padding-top: 6px;

        border-top: 1px dashed rgba(210, 205, 243, 0.3);
      }
    `;

    document.head.appendChild(style);
  }

  const tutorialPopup = document.createElement("div");
  tutorialPopup.className = "tutorial-popup-panel";

  tutorialPopup.innerHTML = `
    <p class="tutorial-header-text">
      HOW TO PLAY ✦ LIFE RUSH ✦
    </p>

    <p class="tutorial-body-text">
      <span class="tutorial-step-title">START YOUR GAME!</span>
      Your attributes and values are randomized. Every life is a surprise!
    </p>

    <p class="tutorial-body-text">
      <span class="tutorial-step-title">READ THE EVENT, SWIPE TO DECIDE!</span>
      Left to accept, right to decline.
    </p>

    <p class="tutorial-body-text">
      <span class="tutorial-step-title">BALANCE YOUR VALUES, STRIKE FOR PRIZES!</span>
      Keep your life on track and claim your rewards! 🏆
    </p>

    <p class="tutorial-footer-text">
      Good luck, amigo! 💖
    </p>
  `;

  document.body.appendChild(tutorialPopup);

  tutorialArticle.addEventListener("mouseenter", () => {
    const rect = tutorialArticle.getBoundingClientRect();

    tutorialPopup.style.top =
      `${rect.top + window.scrollY - tutorialPopup.offsetHeight - 10}px`;

    tutorialPopup.style.left =
      `${rect.left + window.scrollX}px`;

    tutorialPopup.classList.add("active");
  });

  tutorialArticle.addEventListener("mouseleave", () => {
    tutorialPopup.classList.remove("active");
  });
});


// =========================================================
// 10. ALL HOVER POPUP
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const allArticle =
    document.getElementById("All") ||
    document.getElementById("all");

  if (!allArticle) return;

  allArticle.style.cursor = "pointer";

  if (!document.getElementById("flash-all-style")) {
    const style = document.createElement("style");
    style.id = "flash-all-style";

    style.innerText = `
      #All, #all {
        cursor: pointer !important;
        transition: all 0.2s ease;
      }

      .all-popup-panel {
        position: absolute;
        width: 440px;
        padding: 12px;
        z-index: 999999;

        background: linear-gradient(
          180deg,
          #c7ad66 0%,
          #c7ad66 10.13%,
          #3700C0 73.7%,
          #6b005d 100%
        );

        border: 3px solid #F7CD26;
        outline: 2px solid #db00ac;

        box-shadow:
          0 0 20px rgba(78, 38, 175, 0.8),
          inset 0 1px 1px rgba(255, 255, 255, 0.3);

        box-sizing: border-box;

        opacity: 0;
        visibility: hidden;

        transform: translateY(8px) scale(0.96);

        transition:
          opacity 0.2s ease,
          transform 0.2s cubic-bezier(
            0.175,
            0.885,
            0.32,
            1.275
          ),
          visibility 0.2s;

        pointer-events: none;
      }

      .all-popup-panel.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .all-popup-panel p {
        margin: 0 0 6px 0;
        line-height: 1.4;
        font-family: Arial, sans-serif;
      }

      /* HEADER */
      .all-header-text {
        color: #3700C0;
        font-weight: bold;
        font-size: 14px;
        font-family: Arial, sans-serif;
        text-transform: uppercase;

        padding-bottom: 4px;

        border-bottom:
          1px dashed
          rgba(210, 205, 243, 0.3);

        margin-bottom: 8px !important;
      }

      /* OTHER, ORIGINAL PINK */
      .all-subtitle-text {
        color: #db00ac;
        font-weight: bold;
        font-size: 12px;
        font-family: Arial, sans-serif;

        line-height: 1.4;

        margin-bottom: 9px !important;
      }

      /* MAIN INFORMATION */
      .all-body-text {
        color: #f9e6f1;
        font-size: 15px;
        font-family: Arial, sans-serif;
        line-height: 1.4;
      }

      /* LIFE RUSH */
      .all-project-name {
        color: #F7CD26;
        font-weight: bold;
        font-size: 15px;
      }

      /* FINAL SENTENCE / ITALIC */
      .all-footer-text {
        color: #d5c2df;
        font-size: 11.5px;
        font-style: italic;
        font-family: Georgia, serif;

        margin-top: 8px !important;
        padding-top: 6px;

        border-top:
          1px dashed
          rgba(210, 205, 243, 0.3);
      }
    `;

    document.head.appendChild(style);
  }

  const allPopup = document.createElement("div");
  allPopup.className = "all-popup-panel";

  allPopup.innerHTML = `
    <p class="all-header-text">
      BEYOND THE LABEL
    </p>

    <p class="all-subtitle-text">
      You saw the addiction. Did you see the person?
    </p>

    <p class="all-body-text">
      Nguyen et al. (2025) highlight that substance use affects
      both people who use drugs (PWUD) and their families through
      financial strain, damaged relationships, emotional exhaustion,
      and stigma. In Vietnam, where families play an important role
      in recovery, stigma can further isolate both PWUD and their families.
    </p>

    <p class="all-body-text">
      <span class="all-project-name">✦ LIFE RUSH ✦</span>
      is my very own game, made with love, trial and errors, and a little bit of chaos (maybe not that little tehee). 💖
    </p>

    <p class="all-body-text">
      Players make choices in different situations, shaping their
      character's path towards recovery and stability, or addiction
      and isolation.
    </p>

    <p class="all-footer-text">
      Look beyond the label. See the person. 💖
    </p>
  `;

  document.body.appendChild(allPopup);

  allArticle.addEventListener("mouseenter", () => {
    const rect = allArticle.getBoundingClientRect();

    allPopup.style.top =
      `${rect.top + window.scrollY - allPopup.offsetHeight - 10}px`;

    allPopup.style.left =
      `${rect.left + window.scrollX}px`;

    allPopup.classList.add("active");
  });

  allArticle.addEventListener("mouseleave", () => {
    allPopup.classList.remove("active");
  });
});

// =========================================================
// 11. COPY GMAIL
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  const gmailBtn = document.querySelector('.social-btn.gmail');
  
  if (gmailBtn) {
    gmailBtn.addEventListener('click', () => {
      const email = "s4067283@rmit.edu.vn"; 
      
      const textArea = document.createElement("textarea");
      textArea.value = email;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          const oldText = gmailBtn.innerHTML;
          const oldTitle = gmailBtn.getAttribute("title") || "";

          gmailBtn.innerHTML = "✓";
          gmailBtn.title = "Email copied!";

          setTimeout(() => {
            gmailBtn.innerHTML = oldText;
            gmailBtn.title = oldTitle;
          }, 1200);
        } else {
          console.error("Fallback copy failed");
        }
      } catch (err) {
        console.error("Unable to copy", err);
      }

      document.body.removeChild(textArea);
    });
  }
});



// =========================================================
// 12. TOP COMMENTS
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const commentsPool = [
    { 
      main: "lag j ma lag du z, dag hay caj dug hjh =.=", 
      sub: "Why is it lagging so hard? It was just getting good and then it froze =.=" 
    },
    { 
      main: "v4`0 t3st g4m3 xj'u 4j ])3` t0'j 3h s4'ng =))))))))))", 
      sub: "Just hopped in to test the game for a bit, didn't expect to stay up until 3 AM =))))))))))" 
    },
    { 
      main: "g4` q4' h0k |3jk ch0j :((", 
      sub: "I'm such a noob, I don't know how to play :(" 
    },
    { 
      main: "du do hoa qe vl", 
      sub: "Damn, the graphics look so outdated lol" 
    },
    { 
      main: "c0' 4j ch0j chung h3mmm", 
      sub: "Anyone down to play together?" 
    },
    { 
      main: "aj rah noj chjen zoj tuj hok, bun vaj o", 
      sub: "Is anyone free to chat with me? I'm so bored" 
    },
    { 
      main: "4j g4n thj` jn|30x, t0'j n4ij c0' k3`0 :))", 
      sub: "PM me if you're brave enough, something fun is happening tonight :))" 
    },
    { 
      main: "thu di, phe lam do =]] hok thu sao bik", 
      sub: "Give it a try, it's awesome =]] How would you know if you don't try?" 
    },
    { 
      main: "c0' 1 |_4`n th0j m4`, m4't m4't gj` +)4u", 
      sub: "It's just one time anyway, what do you have to lose?" 
    }
  ];

  // Updated custom avatar paths
  const avatarsPool = [
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-ava1.jpg",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-ava2.jpg",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-ava3.jpg",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element1.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element2.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-element3.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-greyeElement1.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-greyeElement2.png",
    "edited-media/COMM2754-2026-S2-A3w12-Amigos4-greyeElement3.png"
  ];

  const femaleNames = ["b3' d4u cut3 ng0c ngh3ch", "c0ng chUa' m1t u0t", "t13u thu d0ng d4nh"];
  const maleNames = ["l4ng tu c0 d0n", "h13p s1 b0ng d3m", "y3u 3m 4000 n4m", "h4n d0i v0 d0i"];
  const allNamesPool = [...femaleNames, ...maleNames];

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const commentsBox = document.querySelector(".comments.box");
  if (!commentsBox) return;

  let commentsListContainer = commentsBox.querySelector("#comments-list");
  if (!commentsListContainer) {
    commentsListContainer = document.createElement("div");
    commentsListContainer.id = "comments-list";
    commentsBox.appendChild(commentsListContainer);
  }

  commentsListContainer.innerHTML = "";

  // 1. Shuffle pools to guarantee NO REPEATS for avatars, names, and comments
  const shuffledAvatars = shuffleArray(avatarsPool);
  const shuffledNames = shuffleArray(allNamesPool);
  const selectedComments = shuffleArray(commentsPool).slice(0, 6);

  selectedComments.forEach((comment, index) => {
    // Pick unique author name and avatar by index
    const authorName = shuffledNames[index % shuffledNames.length];
    const avatarSrc = shuffledAvatars[index % shuffledAvatars.length];
    const votes = getRandomInt(50, 999);

    const commentHTML = `
      <div class="comment-item">
        <div class="comment-avatar">
          <img src="${avatarSrc}" alt="avatar" />
        </div>
        <div class="comment-content">
          <div class="comment-meta">
            <span class="comment-author">${authorName}</span>
            <span class="comment-votes">▲ ${votes} votes</span>
          </div>
          <div class="comment-text-main">${comment.main}</div>
          <div class="comment-text-sub">[${comment.sub}]</div>
        </div>
      </div>
    `;

    commentsListContainer.insertAdjacentHTML("beforeend", commentHTML);
  });
});

// =========================================================
// 13. WHAT'S NEW MODAL
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const whatsNewBtn = document.getElementById("whats-new-btn");
  const whatsNewModal = document.getElementById("whats-new-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");

  // Make sure all elements exist before adding events
  if (!whatsNewBtn || !whatsNewModal || !closeModalBtn) {
    console.warn("What's New modal elements not found.");
    return;
  }

  // OPEN MODAL
  whatsNewBtn.addEventListener("click", (event) => {
    event.preventDefault();
    whatsNewModal.classList.remove("hidden");
  });

  // CLOSE MODAL WITH X BUTTON
  closeModalBtn.addEventListener("click", () => {
    whatsNewModal.classList.add("hidden");
  });

  // CLOSE MODAL WHEN CLICKING OUTSIDE THE BOX
  whatsNewModal.addEventListener("click", (event) => {
    if (event.target === whatsNewModal) {
      whatsNewModal.classList.add("hidden");
    }
  });

  // CLOSE MODAL WITH ESC KEY
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      whatsNewModal.classList.add("hidden");
    }
  });
});

// =========================================================
// 14. QUOTE HOVER SOUND
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  const quoteBox = document.querySelector(".quote.box");

  if (!quoteBox) {
    console.warn("Quote box not found.");
    return;
  }

  const quoteHoverSound = new Audio(
    "designed-sounds/COMM2754-2026-S2-A3w12-beat-anim.wav"
  );

  quoteBox.addEventListener("mouseenter", () => {
    quoteHoverSound.currentTime = 0;
    quoteHoverSound.play();
  });

  quoteBox.addEventListener("mouseleave", () => {
    quoteHoverSound.pause();
    quoteHoverSound.currentTime = 0;
  });
});
