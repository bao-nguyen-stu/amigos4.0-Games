const backgroundWordsSketch = (p) => {
  function getCanvasSize() {
    const area = document.querySelector(".mainCanvas") || document.getElementById("mainCanvas");
    if (!area) {
      return { w: window.innerWidth, h: window.innerHeight };
    }
    return {
      w: Math.max(1, area.clientWidth),
      h: Math.max(1, area.clientHeight),
    };
  }

  let video;
  let bodySegmentation;
  let segmentation = null;

  let words = [];
  let runs = [];

  const maskThreshold = 128;
  const GAP = 2;
  const rowHeight = 22;

  let segmentationStarted = false;
  let videoReady = false;
  let isDetecting = false;

  // --------------------------------------------------------------------------
  // STAGE 1, STAGE 2, AND STAGE 3 MAP FROM PDF SECTION 1
  // --------------------------------------------------------------------------
  const STAGE1_WORDS = [
    "ambitious", "hard-working", "determined", "grown-up", "responsible",
    "cooperative", "accountable", "careful", "cautious", "pretty",
    "clearheaded", "handsome", "independent", "successful", "obedient",
    "social", "recovering", "lazy", "ignorant", "careless",
    "reckless", "stubborn", "frustrated", "intelligent", "struggling",
    "desperate", "wasteful", "distant", "isolated", "secretive",
    "suspicious", "influenced", "dependent", "gangster", "dishonest",
    "ill-manner", "ill-tempered", "humble", "clever", "steady",
    "affectionate", "honest", "gentle"
  ];

  const LABEL_MAP = {
    "ambitious": { stage2: "accomplished", stage3: "" },
    "hard-working": { stage2: "accomplished", stage3: "" },
    "determined": { stage2: "reliable", stage3: "" },
    "grown-up": { stage2: "mature", stage3: "" },
    "responsible": { stage2: "reliable", stage3: "" },
    "cooperative": { stage2: "mature", stage3: "" },
    "accountable": { stage2: "mature", stage3: "" },
    "careful": { stage2: "reliable", stage3: "" },
    "cautious": { stage2: "sensible", stage3: "" },
    "pretty": { stage2: "outgoing", stage3: "addict" },
    "clearheaded": { stage2: "reliable", stage3: "" },
    "handsome": { stage2: "outgoing", stage3: "addict" },
    "independent": { stage2: "sensible", stage3: "" },
    "successful": { stage2: "accomplished", stage3: "" },
    "obedient": { stage2: "sensible", stage3: "hopeless" },
    "social": { stage2: "outgoing", stage3: "hopeless" },
    "recovering": { stage2: "mature", stage3: "" },
    "lazy": { stage2: "distrustful", stage3: "hopeless" },
    "ignorant": { stage2: "distrustful", stage3: "dangerous" },
    "careless": { stage2: "incompetent", stage3: "addict" },
    "reckless": { stage2: "distrustful", stage3: "dangerous" },
    "stubborn": { stage2: "aggressive", stage3: "addict" },
    "frustrated": { stage2: "incompetent", stage3: "addict" },
    "intelligent": { stage2: "accomplished", stage3: "wasted potential" },
    "struggling": { stage2: "incompetent", stage3: "addict" },
    "desperate": { stage2: "incompetent", stage3: "addict" },
    "wasteful": { stage2: "incompetent", stage3: "addict" },
    "distant": { stage2: "deceptive", stage3: "criminal" },
    "isolated": { stage2: "deceptive", stage3: "criminal" },
    "secretive": { stage2: "deceptive", stage3: "dangerous" },
    "suspicious": { stage2: "deceptive", stage3: "dangerous" },
    "influenced": { stage2: "incompetent", stage3: "weak" },
    "dependent": { stage2: "incompetent", stage3: "hopeless" },
    "gangster": { stage2: "aggressive", stage3: "criminal" },
    "dishonest": { stage2: "deceptive", stage3: "criminal" },
    "ill-manner": { stage2: "hostile", stage3: "dangerous" },
    "ill-tempered": { stage2: "hostile", stage3: "dangerous" },
    "humble": { stage2: "mature", stage3: "" },
    "clever": { stage2: "accomplished", stage3: "" },
    "steady": { stage2: "mature", stage3: "" },
    "affectionate": { stage2: "reliable", stage3: "" },
    "honest": { stage2: "reliable", stage3: "" },
    "gentle": { stage2: "sensible", stage3: "" }
  };

  let activeProfileWords = [];

  p.setup = async function () {
    p.pixelDensity(1);

    const size = getCanvasSize();
    const canvas = p.createCanvas(size.w, size.h);

    const holder = document.querySelector(".mainCanvas");
    if (holder) {
      canvas.parent(holder);
    }

    p.textFont("Arial");
    p.textStyle(p.BOLD);

    video = p.createCapture(
      { video: { facingMode: "user" }, audio: false },
      () => { console.log("Camera stream active"); }
    );

    video.hide();
    video.elt.setAttribute("playsinline", "");
    video.elt.muted = true;
    video.elt.autoplay = true;

    video.elt.addEventListener("loadeddata", waitForVideoDimensions);
    video.elt.addEventListener("canplay", waitForVideoDimensions);

    // ------------------------------------------------------------------------
    // TRIGGER 1: "CREATE YOUR PROFILE" CLICK
    // ------------------------------------------------------------------------
    window.initProfileSilhouette = () => {
      activeProfileWords = [];
      for (let i = 0; i < 8; i++) {
        const rand = STAGE1_WORDS[Math.floor(p.random(STAGE1_WORDS.length))];
        activeProfileWords.push(rand);
      }
      if (videoReady && segmentation) {
        packWords(false);
      }
    };

    // ------------------------------------------------------------------------
    // TRIGGER 2: CARD SWIPE / ANSWER LABEL TRIGGER
    // ------------------------------------------------------------------------
    window.processCardLabels = (incomingLabels = []) => {
      if (!incomingLabels || incomingLabels.length === 0) return;

      incomingLabels.forEach((incomingLabel) => {
        const cleanIncoming = String(incomingLabel).toLowerCase().trim();

        // 1. Upgrade existing matching words
        let foundMatch = false;
        words.forEach((wd) => {
          const cleanBase = String(wd.baseStage1).toLowerCase().trim();
          const cleanCurrent = String(wd.currentText).toLowerCase().trim();

          if (cleanBase === cleanIncoming || cleanCurrent === cleanIncoming) {
            foundMatch = true;
            wd.matchCount = (wd.matchCount || 1) + 1;

            const mapEntry = LABEL_MAP[wd.baseStage1] || {};

            if (wd.matchCount >= 6) {
              wd.currentText = mapEntry.stage3 || mapEntry.stage2 || wd.currentText;
              wd.stage = mapEntry.stage3 ? 3 : 2;
              wd.size = mapEntry.stage3 ? 74 : 58;
            } else if (wd.matchCount >= 4) {
              wd.currentText = mapEntry.stage3 || mapEntry.stage2 || wd.currentText;
              wd.stage = mapEntry.stage3 ? 3 : 2;
              wd.size = mapEntry.stage3 ? 64 : 48;
            } else if (wd.matchCount >= 2) {
              wd.currentText = mapEntry.stage2 || wd.currentText;
              wd.stage = 2;
              wd.size = 48;
            }
          }
        });

        // 2. If new label was not on screen, push to pool
        if (!foundMatch) {
          activeProfileWords.push(cleanIncoming);
        }
      });
    };
  };

  async function waitForVideoDimensions() {
    if (!video || !video.elt) return;
    const el = video.elt;
    if (!el.videoWidth || !el.videoHeight) {
      requestAnimationFrame(waitForVideoDimensions);
      return;
    }
    if (videoReady) return;

    try {
      if (el.paused) await el.play();
    } catch (err) {
      requestAnimationFrame(waitForVideoDimensions);
      return;
    }

    videoReady = true;
    await startSegmentation();
  }

  async function startSegmentation() {
    if (segmentationStarted) return;
    if (!video || !video.elt || !video.elt.videoWidth || !video.elt.videoHeight) return;

    segmentationStarted = true;

    try {
      bodySegmentation = await ml5.bodySegmentation("SelfieSegmentation", { maskType: "person" });
      runContinuousDetection();
    } catch (err) {
      console.error("Could not start body segmentation:", err);
      segmentationStarted = false;
    }
  }

  // Continuously detects body position frame by frame
  function runContinuousDetection() {
    if (!bodySegmentation || !video || !video.elt || !videoReady) return;

    if (!isDetecting) {
      isDetecting = true;
      bodySegmentation.detect(video.elt, (result) => {
        isDetecting = false;
        if (result) {
          segmentation = result;
          // Live repack: re-position existing text to current live body position
          packWords(true);
        }
        // Loop detection on next frame
        requestAnimationFrame(runContinuousDetection);
      });
    }
  }

  function getVideoWidth() {
    return video && video.elt && video.elt.videoWidth > 0 ? video.elt.videoWidth : 0;
  }

  function getVideoHeight() {
    return video && video.elt && video.elt.videoHeight > 0 ? video.elt.videoHeight : 0;
  }

  function getVideoDrawRect() {
    const vw = getVideoWidth();
    const vh = getVideoHeight();
    if (!vw || !vh) return { x: 0, y: 0, w: p.width, h: p.height };

    const videoRatio = vw / vh;
    const canvasRatio = p.width / p.height;
    let w, h;

    if (videoRatio > canvasRatio) {
      w = p.width;
      h = w / videoRatio;
    } else {
      h = p.height;
      w = h * videoRatio;
    }

    return { x: (p.width - w) / 2, y: (p.height - h) / 2, w, h };
  }

  function canvasToVideo(x, y) {
    const rect = getVideoDrawRect();
    const displayX = p.width - x;

    const vx = ((displayX - rect.x) * getVideoWidth()) / rect.w;
    const vy = ((y - rect.y) * getVideoHeight()) / rect.h;

    return { x: vx, y: vy };
  }

  function drawVideoCover() {
    if (!video || !videoReady) return;
    const rect = getVideoDrawRect();

    p.push();
    p.translate(p.width, 0);
    p.scale(-1, 1);
    p.image(video, p.width - rect.x - rect.w, rect.y, rect.w, rect.h);
    p.pop();
  }

  function takeSnapshot() {
    const videoW = getVideoWidth();
    const videoH = getVideoHeight();

    if (!video || !videoReady || videoW <= 0 || videoH <= 0) {
      return { vPix: [], vW: 0, vH: 0, mPix: null, mW: 0, mH: 0 };
    }

    const mData = segmentation && segmentation.maskImageData ? segmentation.maskImageData : null;
    const mPix = mData && mData.data && mData.width > 0 && mData.height > 0 ? mData.data.slice() : null;

    return {
      vW: video.width || videoW,
      vH: video.height || videoH,
      mPix,
      mW: mData && mData.width > 0 ? mData.width : 0,
      mH: mData && mData.height > 0 ? mData.height : 0,
    };
  }

  function snapIsSelfAt(snap, canvasX, canvasY) {
    if (!snap.mPix || snap.mW <= 0 || snap.mH <= 0) return false;

    const videoPoint = canvasToVideo(canvasX, canvasY);
    const mx = Math.floor((videoPoint.x * snap.mW) / snap.vW);
    const my = Math.floor((videoPoint.y * snap.mH) / snap.vH);

    if (mx < 0 || my < 0 || mx >= snap.mW || my >= snap.mH) return false;

    const i = (my * snap.mW + mx) * 4;
    return snap.mPix[i + 3] > maskThreshold;
  }

  function getRowSegments(snap, y) {
    const segments = [];
    let inSeg = false;
    let startX = 0;
    let currentSelfState = false;

    for (let x = 0; x < p.width; x += 4) {
      const selfState = snapIsSelfAt(snap, x, y);

      if (!inSeg) {
        inSeg = true;
        startX = x;
        currentSelfState = selfState;
      } else if (selfState !== currentSelfState) {
        if (!currentSelfState) {
          segments.push([startX, x]);
        }
        startX = x;
        currentSelfState = selfState;
      }
    }

    if (inSeg && !currentSelfState) {
      segments.push([startX, p.width]);
    }

    return segments;
  }

  function getWordPool() {
    if (activeProfileWords.length > 0) {
      return activeProfileWords;
    }
    return STAGE1_WORDS;
  }

  function packWords(preserveState = false) {
    if (!videoReady || !video || !video.elt || !segmentation) return;

    const snap = takeSnapshot();
    if (!snap.mPix) return;

    const newWords = [];
    const newRuns = [];
    let y = 0;
    let existingIndex = 0;

    while (y < p.height) {
      const rowY = y + rowHeight / 2;
      const segments = getRowSegments(snap, rowY);

      for (const seg of segments) {
        const segW = seg[1] - seg[0];
        if (segW >= 12) {
          existingIndex = packSegment(
            snap, seg[0], seg[1], y, rowHeight, newWords, newRuns, preserveState, existingIndex
          );
        }
      }
      y += rowHeight + GAP;
    }

    words = newWords;
    runs = newRuns;
  }

  function packSegment(snap, x0, x1, y0, rh, wordList, runList, preserveState, existingIndex) {
    let cursorX = x0;
    const maxAttempts = 80;
    let attempts = 0;
    const runItems = [];
    const pool = getWordPool();

    while (cursorX < x1 - 4 && attempts < maxAttempts) {
      attempts++;
      const remaining = x1 - cursorX;
      if (remaining < 8) break;

      let baseWord = pool[Math.floor(p.random(pool.length))];
      let currentText = baseWord;
      let stage = 1;
      let fontSize = 13;
      let matchCount = 1;

      // Retain active word properties (stage, font size, text changes) when updating live position
      if (preserveState && words[existingIndex]) {
        const prev = words[existingIndex];
        baseWord = prev.baseStage1;
        currentText = prev.currentText;
        stage = prev.stage;
        fontSize = prev.size;
        matchCount = prev.matchCount;
        existingIndex++;
      }

      p.textFont("Arial");
      p.textStyle(p.BOLD);
      p.textSize(fontSize);

      let w = p.textWidth(currentText);

      const wordObj = {
        baseStage1: baseWord,
        currentText: currentText,
        stage: stage,
        matchCount: matchCount,
        x: cursorX,
        y: y0 + rh / 2,
        w: w,
        size: fontSize,
        progress: p.constrain(cursorX / p.width, 0, 1),
      };

      wordList.push(wordObj);
      runItems.push(wordObj);
      cursorX += w + GAP;
    }

    if (runItems.length > 0) {
      runList.push({ endX: x1, items: runItems });
    }

    return existingIndex;
  }

  function getFlashGameGradientColor(progress) {
    const colors = [
      [255, 235, 59],  // Yellow
      [118, 255, 3,],  // Bright Green
      [0, 230, 118],   // Green
      [255, 64, 129],  // Pink
      [213, 0, 249]    // Magenta
    ];

    const scaled = progress * (colors.length - 1);
    const idx = Math.floor(scaled);
    const nextIdx = Math.min(idx + 1, colors.length - 1);
    const factor = scaled - idx;

    const c1 = colors[idx];
    const c2 = colors[nextIdx];

    return [
      p.lerp(c1[0], c2[0], factor),
      p.lerp(c1[1], c2[1], factor),
      p.lerp(c1[2], c2[2], factor)
    ];
  }

  function drawFlashStyleText(wd) {
    const x = wd.x;
    const y = wd.y;
    const txt = wd.currentText;

    p.textFont("Arial");
    p.textStyle(p.BOLD);
    p.textSize(wd.size);
    p.textAlign(p.LEFT, p.CENTER);

    const fillColor = getFlashGameGradientColor(wd.progress);

    // 1. Shadow Offset
    p.push();
    p.noStroke();
    p.fill(10, 5, 25, 200);
    p.text(txt, x + 3, y + 3);
    p.pop();

    // 2. Thick Outer Stroke
    p.push();
    p.stroke(15, 0, 45);
    p.strokeWeight(Math.max(3, wd.size * 0.1));
    p.fill(fillColor[0], fillColor[1], fillColor[2]);
    p.text(txt, x, y);
    p.pop();

    // 3. Inner White Highlight
    p.push();
    p.noStroke();
    p.fill(255, 255, 255, 120);
    p.textSize(wd.size * 0.95);
    p.text(txt, x, y - wd.size * 0.04);
    p.pop();
  }

  p.draw = function () {
    p.background(0);

    if (!videoReady) {
      p.fill(230);
      p.textAlign(p.CENTER, p.CENTER);
      p.textFont("Arial");
      p.textStyle(p.NORMAL);
      p.textSize(18);
      p.text("loading camera...", p.width / 2, p.height / 2);
      return;
    }

    drawVideoCover();

    for (const wd of words) {
      drawFlashStyleText(wd);
    }
  };

  p.windowResized = function () {
    const size = getCanvasSize();
    p.resizeCanvas(size.w, size.h);

    if (segmentation && videoReady) {
      requestAnimationFrame(() => {
        packWords(true);
      });
    }
  };
};

new p5(backgroundWordsSketch);
