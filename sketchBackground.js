const backgroundWordsSketch = (p) => {
  function getCanvasSize() {

  const area = document.querySelector(".mainCanvas") || document.getElementById("mainCanvas");

  if (!area) {
    return {
      w: window.innerWidth,
      h: window.innerHeight,
    };

  return {
    w: Math.max(1, area.clientWidth),
    h: Math.max(1, area.clientHeight),
  };
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

  let hasPackedOnce = false;
  let segmentationStarted = false;
  let videoReady = false;
  let growthStage = 0;
  let isCorrupted = false;

  const attributeWords = [
    "lovely", "clever", "silly", "lazy", "funny",
    "curious", "clumsy", "dreamer", "kind", "stubborn",
    "creative", "sleepy", "loyal", "weird", "hopeful",
    "playful", "moody", "gentle", "bold", "quiet",
    "restless", "cheerful", "awkward", "generous", "petty",
    "brave", "anxious", "witty", "clingy", "loving",
    "shy", "messy", "sweet", "serious", "soft",
    "dramatic", "impatient", "honest", "sensitive", "independent",
    "friendly", "chaotic", "careful", "romantic", "nervous",
    "optimistic", "pessimistic", "quiet", "loud", "awkward",
  ];

  const socialLabelWords = [
    "genius","richkid","nerd","loser","popular","outsider","leader","rebel","goldenchild","overachiever", "underachiever", "classclown", "workaholic", "hipster", "introvert", "extrovert", "influencer", "artist", "failure", "success", "snob", "geek", "weirdo", "slacker", "teacher'spet", "dropout", "professional","amateur", "celebrity", "nobody", "addict", "addict","addict","addict", "addict", "addict", "weak", "junkie", "drunk", "unstable", "reckless", "troublemaker", "loser","failure", "mess", "liability", "unreliable", "selfish", "pathetic", "wasted", "hopeless", "dangerous", "broken", "irresponsible", "untrustworthy",  "outcast","burden", "problem", "disgrace", "delinquent", "degenerate", "washout",  "deadbeat", "flawed", "damaged",
  ];

  p.setup = async function () {
  p.pixelDensity(1);

  const size = getCanvasSize();
  const canvas = p.createCanvas(size.w, size.h);

  // Attach canvas to the element with class "mainCanvas"
  const holder = document.querySelector(".mainCanvas");
  if (holder) {
    canvas.parent(holder);
  }

  p.textFont("Arial");
  p.textStyle(p.NORMAL);

    video = p.createCapture(
      {
        video: { facingMode: "user" },
        audio: false,
      },
      () => { console.log("Camera stream created"); }
    );

    video.hide();
    video.elt.setAttribute("playsinline", "");
    video.elt.muted = true;
    video.elt.autoplay = true;

    video.elt.addEventListener("loadeddata", waitForVideoDimensions);
    video.elt.addEventListener("canplay", waitForVideoDimensions);

    window.triggerBackgroundWordGrowth = () => {
      if (videoReady && segmentation && !isCorrupted) {
        growAllRuns();
      }
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
      console.warn("Camera play delayed:", err);
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
      await new Promise((resolve) => requestAnimationFrame(resolve));
      bodySegmentation.detectStart(video.elt, gotSegmentation);
    } catch (err) {
      console.error("Could not start body segmentation:", err);
      segmentationStarted = false;
    }
  }

  function gotSegmentation(result) {
    if (!result) return;
    segmentation = result;

    if (!hasPackedOnce && videoReady && video && video.elt && video.elt.videoWidth > 0 && video.elt.videoHeight > 0) {
      hasPackedOnce = true;
      requestAnimationFrame(() => {
        if (segmentation) packWords();
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

  // Scale down to contain the video fully inside the canvas
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

    video.loadPixels();
    const vPix = video.pixels && video.pixels.length ? video.pixels.slice() : [];
    const mData = segmentation && segmentation.maskImageData ? segmentation.maskImageData : null;
    const mPix = mData && mData.data && mData.width > 0 && mData.height > 0 ? mData.data.slice() : null;

    return {
      vPix,
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

  function snapBrightnessAt(snap, canvasX, canvasY) {
    const videoPoint = canvasToVideo(canvasX, canvasY);
    const w = snap.vW;
    const h = snap.vH;

    const x = Math.floor(p.constrain(videoPoint.x, 0, w - 1));
    const y = Math.floor(p.constrain(videoPoint.y, 0, h - 1));

    const i = (y * w + x) * 4;
    const r = snap.vPix[i] ?? 128;
    const g = snap.vPix[i + 1] ?? 128;
    const b = snap.vPix[i + 2] ?? 128;

    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function fitTextSize(str, targetWidth, maxSize, minSize = 5) {
    if (targetWidth <= 0) return 0;
    p.textSize(maxSize);

    if (p.textWidth(str) <= targetWidth) return maxSize;

    let lo = minSize;
    let hi = maxSize;

    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      p.textSize(mid);
      if (p.textWidth(str) <= targetWidth) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  function getRowSegments(snap, y) {
    const segments = [];
    let inSeg = false;
    let startX = 0;
    let currentSelfState = false;

    for (let x = 0; x < p.width; x += 3) {
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

  function chooseWord() {
    const attributes = p.shuffle([...attributeWords]);
    const labels = p.shuffle([...socialLabelWords]);

    if (growthStage === 0) {
      return { text: attributes[0], type: "attribute" };
    }

    const labelChance = p.constrain(0.25 + (growthStage - 1) * 0.2, 0, 0.8);
    if (p.random() < labelChance) {
      return { text: labels[0], type: "label" };
    }

    return { text: attributes[0], type: "attribute" };
  }

  function packWords() {
    if (!videoReady || !video || !video.elt || !segmentation) return;

    const snap = takeSnapshot();
    if (!snap.vPix || snap.vPix.length === 0 || !snap.mPix) return;

    const newWords = [];
    const newRuns = [];
    let y = 0;

    while (y < p.height) {
      const rowY = y + rowHeight / 2;
      const segments = getRowSegments(snap, rowY);

      for (const seg of segments) {
        const segW = seg[1] - seg[0];
        if (segW >= 12) {
          packSegment(snap, seg[0], seg[1], y, rowHeight, newWords, newRuns);
        }
      }
      y += rowHeight + GAP;
    }

    words = newWords;
    runs = newRuns;
  }

  function packSegment(snap, x0, x1, y0, rh, wordList, runList) {
    let cursorX = x0;
    const maxAttempts = 80;
    let attempts = 0;
    const runItems = [];

    while (cursorX < x1 - 4 && attempts < maxAttempts) {
      attempts++;
      const remaining = x1 - cursorX;
      if (remaining < 8) break;

      const chosen = chooseWord();
      const word = chosen.text;
      const maxTextSize = Math.min(rh - GAP, 13);
      const size = fitTextSize(word, remaining, maxTextSize, 5);

      if (size < 5) break;

      p.textFont("Arial");
      p.textStyle(p.NORMAL);
      p.textSize(size);

      const w = p.textWidth(word);
      const brightness = snapBrightnessAt(snap, cursorX + w / 2, y0 + rh / 2);

      const wordObj = {
        text: word,
        type: chosen.type,
        x: cursorX,
        y: y0 + rh / 2,
        w: w,
        size: size,
        weight: 100,
        growth: 0,
        brightness: brightness,
        progress: p.constrain(cursorX / p.width, 0, 1),
        labelGrowth: chosen.type === "label" ? 1 : 0,
      };

      wordList.push(wordObj);
      runItems.push(wordObj);
      cursorX += w + GAP;
    }

    if (runItems.length > 0) {
      runList.push({ endX: x1, items: runItems });
    }
  }

  function growAllRuns() {
    growthStage++;

    for (const run of runs) {
      if (run.items.length === 0) continue;
      const items = run.items;

      if (growthStage >= 1) {
        const labelAlreadyExists = items.some((item) => item.type === "label");
        if (!labelAlreadyExists && items.length >= 2 && p.random() < 0.45) {
          insertLabelIntoRun(run);
        }
      }

      for (const item of items) {
        if (item.type === "label") {
          item.growth += p.random(0.65, 1.05);
          item.size *= p.random(1.35, 1.65);
          item.weight = Math.min(900, item.weight + p.random(120, 240));
        } else {
          item.growth += p.random(0.15, 0.35);
          item.size *= p.random(1.03, 1.12);
          item.weight = Math.min(500, item.weight + p.random(15, 45));
        }
      }
      redistributeRun(run);
    }
  }

  function insertLabelIntoRun(run) {
    const items = run.items;
    const labels = p.shuffle([...socialLabelWords]);
    const label = labels[0];
    const index = Math.floor(p.random(0, items.length + 1));

    p.textFont("Arial");
    p.textStyle(p.NORMAL);
    p.textSize(8);

    const labelObj = {
      text: label,
      type: "label",
      x: 0,
      y: items[0] ? items[0].y : 0,
      w: p.textWidth(label),
      size: 8,
      weight: 100,
      growth: 0,
      brightness: items[0] ? items[0].brightness : 0.5,
      progress: items[0] ? items[0].progress : 0.5,
      labelGrowth: 1,
    };

    items.splice(index, 0, labelObj);
    words.push(labelObj);
  }

  function redistributeRun(run) {
    const items = run.items;
    if (items.length === 0) return;

    let totalWidth = 0;
    for (const item of items) {
      p.textFont("Arial");
      p.textStyle(getP5TextStyle(item.weight));
      p.textSize(item.size);
      item.w = p.textWidth(item.text);
      totalWidth += item.w;
    }

    totalWidth += GAP * Math.max(0, items.length - 1);
    const availableWidth = Math.max(10, run.endX - getRunStartX(run));

    if (totalWidth > availableWidth) {
      const scale = availableWidth / totalWidth;
      for (const item of items) item.size *= scale;

      totalWidth = 0;
      for (const item of items) {
        p.textFont("Arial");
        p.textStyle(getP5TextStyle(item.weight));
        p.textSize(item.size);
        item.w = p.textWidth(item.text);
        totalWidth += item.w;
      }
      totalWidth += GAP * Math.max(0, items.length - 1);
    }

    const startX = getRunStartX(run);
    const available = run.endX - startX;
    let cursorX = startX + Math.max(0, (available - totalWidth) / 2);

    for (const item of items) {
      item.x = cursorX;
      cursorX += item.w + GAP;
    }
  }

  function getRunStartX(run) {
    if (!run.items || run.items.length === 0) return 0;
    let minX = Infinity;
    for (const item of run.items) minX = Math.min(minX, item.x);
    return isFinite(minX) ? minX : 0;
  }

  function getP5TextStyle(weight) {
    return weight >= 500 ? p.BOLD : p.NORMAL;
  }

  function lerpColorRGB(c1, c2, amount) {
    const t = p.constrain(amount, 0, 1);
    return [
      p.lerp(c1[0], c2[0], t),
      p.lerp(c1[1], c2[1], t),
      p.lerp(c1[2], c2[2], t),
    ];
  }

  function getWordColor(progress) {
    const stops = [
      { pos: 0, color: [255, 238, 110] },
      { pos: 0.2, color: [240, 215, 255] },
      { pos: 0.45, color: [195, 135, 255] },
      { pos: 0.68, color: [120, 105, 255] },
      { pos: 1, color: [48, 38, 155] },
    ];

    if (progress <= stops[0].pos) return stops[0].color;

    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (progress >= a.pos && progress <= b.pos) {
        return lerpColorRGB(a.color, b.color, (progress - a.pos) / (b.pos - a.pos));
      }
    }
    return stops[stops.length - 1].color;
  }

  function drawStyledWord(wd) {
    const color = getWordColor(wd.progress);
    const x = wd.x;
    const y = wd.y;

    p.textFont("Arial");
    p.textStyle(getP5TextStyle(wd.weight));
    p.textSize(wd.size);
    p.textAlign(p.LEFT, p.CENTER);

    const weightT = p.constrain((wd.weight - 100) / 800, 0, 1);
    const outlineWeight = wd.size * p.lerp(0.015, 0.16, weightT);

    p.push();
    p.noStroke();
    p.fill(15, 5, 55, 145);
    p.text(wd.text, x + p.lerp(1, 4, weightT), y + p.lerp(1, 5, weightT));
    p.pop();

    p.push();
    p.fill(color[0], color[1], color[2]);
    p.stroke(20, 10, 70, 235);
    p.strokeWeight(outlineWeight);
    p.text(wd.text, x, y);
    p.pop();

    if (wd.weight >= 300) {
      p.push();
      p.noStroke();
      p.fill(255, 255, 255, p.map(weightT, 0, 1, 25, 65));
      p.text(wd.text, x, y - wd.size * 0.035);
      p.pop();
    }

    p.push();
    p.noStroke();
    p.fill(color[0], color[1], color[2], 255);
    p.text(wd.text, x, y);
    p.pop();

    if (wd.size >= 10 && wd.weight >= 300) {
      p.push();
      p.noStroke();
      p.fill(255, 255, 255, p.map(weightT, 0, 1, 15, 50));
      p.textSize(wd.size * 0.92);
      p.text(wd.text, x, y - wd.size * 0.09);
      p.pop();
    }
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
      drawStyledWord(wd);
    }
  };

  p.windowResized = function () {
    const size = getCanvasSize();
    p.resizeCanvas(size.w, size.h);
    hasPackedOnce = false;

    if (segmentation && videoReady) {
      requestAnimationFrame(() => {
        packWords();
        hasPackedOnce = true;
      });
    }
  };
};

new p5(backgroundWordsSketch);