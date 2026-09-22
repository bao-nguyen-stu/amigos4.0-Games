const myMainCanvasSketch = (p) => {
  let aspectRatio;
  const DESIGN_W = 960, DESIGN_H = 720;
  const CONTENT_H = 640;
  const CONTENT_OFFSET_Y = 40;

  //
  // SOUND
  //
  let swipeSound;
  let achievementSound;
  const SWIPE_SOUND_PATH = 'designed-sounds/COMM2754-2026-S2-A3w12-airleak-1-anim.wav';
  const ACHIEVEMENT_SOUND_PATH = 'designed-sounds/COMM2754-2026-S2-A3w12-blip2-anim.wav';

  let colBg, colInk, colInkFaint, colPanel, colPanelBorder;
  let colFitness, colMood, colMoney, colRelationship;
  let colAccept, colReject, colPurple, colPurpleDark, colGold;

  const STAT_KEYS = ['Fitness', 'Mood', 'Money', 'Relationship'];
  const STAT_LABEL = {
    Fitness: 'FITNESS',
    Mood: 'MOOD',
    Money: 'MONEY',
    Relationship: 'RELATIONSHIP'
  };

  let stats = {
    Fitness: 50,
    Mood: 50,
    Money: 50,
    Relationship: 50
  };
  let displayStats = { ...stats };
  let lastDelta = {
    Fitness: 0,
    Mood: 0,
    Money: 0,
    Relationship: 0
  };

  let totalDays = 0;
  let age = 18;

  const cardsData = [
    {
      prompt: "Your friends invite you on a spontaneous road trip.",
      accept: { Money: -8, Relationship: 7, Mood: 5 },
      reject: { Money: 3, Relationship: -4 }
    },
    {
      prompt: "It's your anniversary, but a big deadline is due tomorrow.",
      accept: { Money: -3, Relationship: 8, Mood: 3 },
      reject: { Money: 6, Relationship: -10, Mood: [-5, -1] }
    },
    {
      prompt: "Should you start jogging every morning?",
      accept: { Fitness: 8, Mood: 4, Money: -2 },
      reject: { Fitness: -3, Mood: [-2, 0] }
    },
    {
      prompt: "A coworker asks you to cover their shift, unpaid.",
      accept: { Money: -2, Mood: -4, Relationship: 5 },
      reject: { Relationship: -3, Mood: 2 }
    },
    {
      prompt: "You're offered a risky stock tip.",
      accept: { Money: [-15, 25], Mood: [-6, 4] },
      reject: {}
    },
    {
      prompt: "Your therapist has a session booked this week.",
      accept: { Money: -6, Mood: 9, Fitness: 2 },
      reject: { Money: 2, Mood: -6 }
    },
    {
      prompt: "An old friend calls you haven't talked in years.",
      accept: { Relationship: 6, Mood: 3 },
      reject: { Relationship: -2 }
    },
    {
      prompt: "Your boss offers overtime for the whole month.",
      accept: { Money: 12, Relationship: -6, Mood: -5, Fitness: -4 },
      reject: { Money: -3, Relationship: 2, Mood: 2 }
    },
    {
      prompt: "A charity asks for a donation.",
      accept: { Money: -6, Mood: 6, Relationship: 2 },
      reject: { Money: 2, Mood: -1 }
    },
    {
      prompt: "You catch a cold. The doctor suggests rest.",
      accept: { Money: -4, Fitness: 7, Mood: 2 },
      reject: { Money: 3, Fitness: -8, Mood: -3 }
    },
    {
      prompt: "Your gym membership renewal is due.",
      accept: { Money: -5, Fitness: 6, Mood: 2 },
      reject: { Fitness: -6 }
    },
    {
      prompt: "Your partner wants a serious talk about the future.",
      accept: { Relationship: 8, Mood: [-3, 4] },
      reject: { Relationship: -6, Mood: -2 }
    },
    {
      prompt: "Three sleepless nights of overtime. A coworker offers you a pill to 'stay sharp'.",
      accept: { Mood: [6, 10], Fitness: -8 },
      reject: { Fitness: -4, Mood: -4 }
    },
    {
      prompt: "After a rough breakup, a friend says trying something new will help you forget.",
      accept: { Mood: [8, 12], Relationship: -3 },
      reject: { Mood: -3 }
    }
  ];

  const ALL_ACHIEVEMENTS = [
    {
      id: 'm_high',
      label: 'Fat Wallet',
      congrats: 'You made bank!',
      reward: '+Money Boost',
      check: s => s.Money >= 70
    },
    {
      id: 'm_low',
      label: 'Broke Again',
      congrats: 'Empty pockets, strong spirit.',
      reward: '-Money Drain',
      check: s => s.Money <= 20
    },
    {
      id: 'r_high',
      label: 'Social Butterfly',
      congrats: 'Everyone loves you!',
      reward: '+Relationship',
      check: s => s.Relationship >= 75
    },
    {
      id: 'r_low',
      label: 'Lone Wolf',
      congrats: 'Standing on your own.',
      reward: '-Relationship',
      check: s => s.Relationship <= 20
    },
    {
      id: 'f_high',
      label: 'Peak Shape',
      congrats: 'Looking incredibly fit!',
      reward: '+Fitness Boost',
      check: s => s.Fitness >= 75
    },
    {
      id: 'f_low',
      label: 'Couch Potato',
      congrats: 'Time to stretch those legs.',
      reward: '-Fitness Drain',
      check: s => s.Fitness <= 20
    },
    {
      id: 'o_high',
      label: 'Pure Bliss',
      congrats: 'On top of the world!',
      reward: '+Mood Boost',
      check: s => s.Mood >= 75
    },
    {
      id: 'o_low',
      label: 'Rock Bottom',
      congrats: 'Hang in there, it gets better.',
      reward: '-Mood Drain',
      check: s => s.Mood <= 20
    },
    {
      id: 'd_10',
      label: 'Getting Started',
      congrats: 'Survived your first 10 days!',
      reward: '+Life Exp',
      check: (_, d) => d >= 10
    },
    {
      id: 'd_50',
      label: 'Routine Master',
      congrats: '50 days of choices down.',
      reward: '+Life Exp',
      check: (_, d) => d >= 50
    },
    {
      id: 'd_100',
      label: 'Centurion',
      congrats: '100 days survived!',
      reward: '+Perseverance',
      check: (_, d) => d >= 100
    },
    {
      id: 'd_180',
      label: 'Half Year Mark',
      congrats: 'Six months under your belt.',
      reward: '+Wisdom',
      check: (_, d) => d >= 180
    },
    {
      id: 'd_365',
      label: 'Full Year',
      congrats: 'A whole year lived fully!',
      reward: '+Mastery',
      check: (_, d) => d >= 365
    },
    {
      id: 'bal_1',
      label: 'Balanced Life',
      congrats: 'All stats above 40!',
      reward: '+All Stats',
      check: s => s.Fitness > 40 && s.Mood > 40 && s.Money > 40 && s.Relationship > 40
    },
    {
      id: 'bal_2',
      label: 'Harmonious Being',
      congrats: 'All stats above 60!',
      reward: '+All Stats Large',
      check: s => s.Fitness > 60 && s.Mood > 60 && s.Money > 60 && s.Relationship > 60
    },
    {
      id: 'extreme',
      label: 'Living Dangerously',
      congrats: 'Any stat below 10!',
      reward: '+Adrenaline',
      check: s => s.Fitness < 10 || s.Mood < 10 || s.Money < 10 || s.Relationship < 10
    },
    {
      id: 'tycoon',
      label: 'Rich & Healthy',
      congrats: 'High Money & Fitness!',
      reward: '+Vitality',
      check: s => s.Money >= 70 && s.Fitness >= 70
    },
    {
      id: 'loved',
      label: 'Rich & Loved',
      congrats: 'High Money & Relationship!',
      reward: '+Charisma',
      check: s => s.Money >= 70 && s.Relationship >= 70
    },
    {
      id: 'zen',
      label: 'Inner Peace',
      congrats: 'High Mood & Fitness!',
      reward: '+Zen State',
      check: s => s.Mood >= 70 && s.Fitness >= 70
    },
    {
      id: 'legend',
      label: 'Living Legend',
      congrats: 'Reached age 25!',
      reward: '+Ultimate Pride',
      check: (_, d) => (18 + Math.floor(d / 365)) >= 25
    }
  ];

  let achievementCounts = {};
  let achievementLog = [];
  let achievementPopupQueue = [];
  let achievementPopup = null;
  let achScrollY = 0;
  
  // Sorted list reference for switching unlocked to top
  let currentAchievementList = [...ALL_ACHIEVEMENTS];

  const PANEL_W = 250, PANEL_H = 562, HEADER_H = 36;
  // Achievement panel sits flush with the left and bottom edges.
  const PANEL_X = 0, PANEL_Y = DESIGN_H - PANEL_H;
  const CONTAINER_Y = PANEL_Y + HEADER_H;
  const CONTAINER_H = PANEL_H - HEADER_H;
  const ITEM_H = 64, ITEM_GAP = 4;

  const nameList = ['FreshGrad99', 'JamieTries', 'QuinnOnTheGrind', 'xX_NewStart_Xx'];
  let nickname = '', vipNumber = 0, topScoreDays = 0, avatarHue = 0;

  let drawPile = [], discardPile = [];
  let currentCard = null, cardState = 'entering';
  let cardOffset = { x: 0, y: 0 };
  let resolveDir = 0, resolveProgress = 0, resolveSpin = 1, enterProgress = 0;
  let entranceType = 'flip', slideFrom = 'left';
  let particles = [], shakeAmount = 0;
  let gameOver = false, endReason = '';
  let lastDaysAdded = 0;

  const CARD_W = 170, CARD_H = 260;
  const CARD_X = 840;
  // The card is vertically centred between the two swipe controls,
  // with a 3px gap above and below.
  const SWIPE_LEFT_Y = 166;
  const SWIPE_RIGHT_Y = SWIPE_LEFT_Y + 18 + 9 + CARD_H + 9 + 18;
  const CARD_Y = (SWIPE_LEFT_Y + SWIPE_RIGHT_Y) / 2;
  const DRAG_THRESHOLD = 90;

  p.setup = async () => {
    const container = document.querySelector('.mainCanvas');
    const currentWidth = container ? container.clientWidth : 960;
    aspectRatio = DESIGN_H / DESIGN_W;
    const canvas = p.createCanvas(currentWidth, currentWidth * aspectRatio);
    if (container) canvas.parent(container);
    p.textAlign(p.CENTER, p.CENTER);

    colBg = p.color(255, 255, 255, 0);
    colInk = p.color(30, 28, 35);
    colInkFaint = p.color(30, 28, 35, 130);
    colPanel = p.color(210, 205, 243);
    colPanelBorder = p.color(55, 0, 192);
    colFitness = p.color(160, 150, 235);
    colMood = p.color(240, 165, 55);
    colMoney = p.color(60, 175, 95);
    colRelationship = p.color(225, 75, 120);
    colAccept = p.color('#33ff58');
    colReject = p.color('#db00ac');
    colPurple = p.color(110, 65, 220);
    colPurpleDark = p.color(55, 0, 192);
    colGold = p.color(240, 195, 60);

    try {
      [swipeSound, achievementSound] = await Promise.all([
        p.loadSound(SWIPE_SOUND_PATH),
        p.loadSound(ACHIEVEMENT_SOUND_PATH)
      ]);
    } catch (error) {
      console.error('Sound loading failed:', error);
    }

    randomizeCosmetics();
    startNewGame();
  };

  p.draw = () => {
    p.clear();
    p.scale(p.width / DESIGN_W);
    p.translate(0, CONTENT_OFFSET_Y);

    let shakeX = 0, shakeY = 0;
    if (shakeAmount > 0.3) {
      shakeX = p.random(-shakeAmount, shakeAmount);
      shakeY = p.random(-shakeAmount, shakeAmount);
      shakeAmount *= 0.88;
    } else {
      shakeAmount = 0;
    }

    p.push();
    p.translate(shakeX, shakeY);
    p.rectMode(p.CORNER);

    drawMeters();
    drawAvatarPanel();
    drawAchievementBoard();
    drawEventPanel();
    drawEncouragementAndCard();
    drawDaysAgeBox();
    drawAchievementPopup();

    if (!gameOver) {
      updateCard();
      drawCardOnTop();
    } else {
      drawGameOver();
    }

    updateParticles();
    drawParticles();
    p.pop();
  };

  p.mouseWheel = (event) => {
    const mx = p.mouseX * (DESIGN_W / p.width);
    const my = p.mouseY * (DESIGN_H / p.height);
    if (
      mx >= PANEL_X &&
      mx <= PANEL_X + PANEL_W &&
      my >= CONTAINER_Y &&
      my <= CONTAINER_Y + CONTAINER_H
    ) {
      const maxScroll = Math.max(
        0,
        currentAchievementList.length * (ITEM_H + ITEM_GAP) - CONTAINER_H
      );
      achScrollY = p.constrain(achScrollY + event.delta * 0.5, 0, maxScroll);
    }
    return false;
  };

  function randomizeCosmetics() {
    nickname = p.random(nameList);
    vipNumber = Math.floor(p.random(1, 999));
    topScoreDays = Math.floor(p.random(40, 400));
    avatarHue = p.random(360);
  }

  function startNewGame() {
    stats = {
      Fitness: Math.floor(p.random(35, 66)),
      Mood: Math.floor(p.random(35, 66)),
      Money: Math.floor(p.random(35, 66)),
      Relationship: Math.floor(p.random(35, 66))
    };
    displayStats = { ...stats };
    lastDelta = { Fitness: 0, Mood: 0, Money: 0, Relationship: 0 };
    totalDays = 0;
    age = 18;
    drawPile = p.shuffle([...Array(cardsData.length).keys()]);
    discardPile = [];
    particles = [];
    achievementCounts = {};
    achievementLog = [];
    achievementPopupQueue = [];
    achievementPopup = null;
    gameOver = false;
    endReason = '';
    cardOffset = { x: 0, y: 0 };
    achScrollY = 0;
    currentAchievementList = [...ALL_ACHIEVEMENTS];
    drawNextCard();
  }

  function drawNextCard() {
    if (drawPile.length === 0) {
      drawPile = p.shuffle(discardPile);
      discardPile = [];
    }
    const idx = drawPile.pop();
    currentCard = { ...cardsData[idx], idx };
    cardState = 'entering';
    enterProgress = 0;
    cardOffset = { x: 0, y: 0 };
    entranceType = p.random(['flip', 'bounce', 'spin', 'slide']);
    slideFrom = p.random(['left', 'right', 'top']);
  }

  function rollDelta(v) {
    if (v === undefined) return 0;
    if (Array.isArray(v)) {
      return Math.round(p.random(v[0], v[1]));
    }
    return v;
  }

  function applyEffects(effects) {
    for (const statKey of STAT_KEYS) {
      const delta = rollDelta(effects[statKey]);
      lastDelta[statKey] = delta !== 0 ? delta : lastDelta[statKey];
      if (delta !== 0) {
        stats[statKey] = p.constrain(stats[statKey] + delta, 0, 100);
        if (Math.abs(delta) >= 8) {
          shakeAmount = p.max(shakeAmount, 6);
        }
      }
    }
  }

  function checkGameOver() {
    for (const statKey of STAT_KEYS) {
      if (stats[statKey] <= 0) {
        gameOver = true;
        endReason = `Your ${STAT_LABEL[statKey]} hit rock bottom.`;
        return;
      }
      if (stats[statKey] >= 100) {
        gameOver = true;
        endReason = `Your ${STAT_LABEL[statKey]} maxed out -- and it consumed you.`;
        return;
      }
    }
  }

  function checkAchievements(prevStats) {
    for (const def of ALL_ACHIEVEMENTS) {
      if (
        def.check(stats, totalDays) &&
        !def.check(prevStats, totalDays - lastDaysAdded)
      ) {
        queueAchievement(def.id, def.label);
      }
    }
  }

  function queueAchievement(id, label) {
    achievementCounts[id] = (achievementCounts[id] || 0) + 1;
    const entry = {
      id,
      label,
      day: totalDays,
      count: achievementCounts[id]
    };
    achievementLog.unshift(entry);
    achievementPopupQueue.push(entry);

    // Reorder list: move newly unlocked achievement to the top
    const index = currentAchievementList.findIndex(a => a.id === id);
    if (index !== -1) {
      const [achItem] = currentAchievementList.splice(index, 1);
      currentAchievementList.unshift(achItem);
    }
    achScrollY = 0; // Return player to the top list
  }

  function resolveCard(direction) {
    if (cardState !== 'idle' && cardState !== 'dragging') {
      return;
    }
    resolveDir = direction;
    resolveProgress = 0;
    resolveSpin = p.random(0.7, 1.4);
    cardState = 'resolving';

    if (swipeSound) {
      if (swipeSound.isPlaying()) {
        swipeSound.stop();
      }
      swipeSound.play();
    }

    const prevStats = { ...stats };
    const accepted = direction < 0;
    const effects = accepted ? currentCard.accept : currentCard.reject;
    applyEffects(effects);
    lastDaysAdded = Math.floor(p.random(17, 30));
    totalDays += lastDaysAdded;
    age = 18 + Math.floor(totalDays / 365);
    checkAchievements(prevStats);

    const burstCol = accepted ? colAccept : colReject;
    spawnParticles(CARD_X + cardOffset.x, CARD_Y + cardOffset.y, burstCol);
  }

  function spawnParticles(x, y, col) {
    for (let i = 0; i < 18; i++) {
      const ang = p.random(p.TWO_PI);
      const spd = p.random(2, 6);
      particles.push({
        x, y,
        vx: p.cos(ang) * spd,
        vy: p.sin(ang) * spd - 2,
        rot: p.random(p.TWO_PI),
        vrot: p.random(-0.3, 0.3),
        size: p.random(4, 8),
        life: 40,
        col
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.25;
      pt.rot += pt.vrot;
      pt.life--;
      if (pt.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    p.rectMode(p.CENTER);
    for (const pt of particles) {
      const a = p.constrain(pt.life / 40, 0, 1) * 255;
      p.push();
      p.translate(pt.x, pt.y);
      p.rotate(pt.rot);
      p.noStroke();
      p.fill(p.red(pt.col), p.green(pt.col), p.blue(pt.col), a);
      p.rect(0, 0, pt.size, pt.size * 0.6, 1);
      p.pop();
    }
  }

  function roundedRect(x, y, w, h, r) {
    const ctx = p.drawingContext;
    r = p.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawValueContainer(x, y, w, h, val, type) {
    const ctx = p.drawingContext;
    let g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0.1213, '#7355BD');
    g.addColorStop(0.637, '#3700C0');
    g.addColorStop(1, '#A1716C');

    ctx.save();
    roundedRect(x, y, w, h, h * 0.35);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = '#3700C0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const px = h * 0.55;
    const py = h * 0.25;
    const bx = x + px;
    const by = y + py;
    const bw = w - px * 2;
    const bh = h - py * 2;

    let paper = ctx.createLinearGradient(0, by, 0, by + bh);
    paper.addColorStop(0.0865, '#FFF');
    paper.addColorStop(0.4231, '#D9D9D9');
    paper.addColorStop(1, '#F5F5F5');

    ctx.save();
    roundedRect(bx, by, bw, bh, bh / 2);
    ctx.fillStyle = paper;
    ctx.fill();
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const amount = p.constrain(val / 100, 0, 1);
    let fillGrad = ctx.createLinearGradient(0, by, 0, by + bh);
    if (type === 'Fitness') {
      fillGrad.addColorStop(0, '#FFFFFF');
      fillGrad.addColorStop(0.35, '#c7c7c7');
      fillGrad.addColorStop(1, '#666666');
    } else if (type === 'Mood') {
      fillGrad.addColorStop(0, '#FFE5FA');
      fillGrad.addColorStop(0.35, '#c124f9');
      fillGrad.addColorStop(1, '#5900ff');
    } else if (type === 'Money') {
      fillGrad.addColorStop(0, '#FFFFD1');
      fillGrad.addColorStop(0.35, '#ffd900');
      fillGrad.addColorStop(1, '#d67d00');
    } else if (type === 'Relationship') {
      fillGrad.addColorStop(0, '#D7FFDE');
      fillGrad.addColorStop(0.35, '#62FF7C');
      fillGrad.addColorStop(1, '#00C83A');
    }

    ctx.save();
    roundedRect(bx, by, bw, bh, bh / 2);
    ctx.clip();
    ctx.fillStyle = fillGrad;
    ctx.fillRect(bx, by, bw * amount, bh);
    ctx.restore();
  }

  //position 4 values
  function drawMeters() {
    p.rectMode(p.CORNER);
    const boxW = 110;
    const gap = 12;
    const top = 1;
    const barH = 20;

    STAT_KEYS.forEach((statKey, i) => {
      displayStats[statKey] = p.lerp(displayStats[statKey], stats[statKey], 0.12);
      const x = 20 + i * (boxW + gap);

      p.noStroke();
      p.fill('#3700C0');
      p.textFont('Arial');
      p.textStyle(p.BOLD);
      p.textSize(18);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text(statKey.toUpperCase(), x, top + 26);

      drawValueContainer(x, top + 30, boxW, barH, displayStats[statKey], statKey);

      if (lastDelta[statKey] !== 0) {
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(13);
        p.textStyle(p.BOLD);
        p.fill(lastDelta[statKey] > 0 ? colAccept : colReject);
        p.text(
          (lastDelta[statKey] > 0 ? '+' : '') + lastDelta[statKey],
          x,
          top + 30 + barH + 4
        );
      }
    });
    p.textAlign(p.CENTER, p.CENTER);
  }

  function avatarPanelBounds() {
    return { x: 15, y: 80, w: 215, h: 82 };
  }

  function drawAvatarPanel() {
    const b = avatarPanelBounds();
    p.rectMode(p.CORNER);
    p.noStroke();
    p.fill(245, 230);
    p.rect(b.x, b.y, 48, 48, 6);

    p.push();
    p.colorMode(p.HSB, 360, 100, 100);
    p.fill(avatarHue, 55, 90);
    p.colorMode(p.RGB, 255);
    p.noStroke();
    p.circle(b.x + 24, b.y + 24, 36);
    p.pop();

    p.fill(colInkFaint);
    p.textSize(9);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('image\nplaceholder', b.x + 24, b.y + 24);

    p.textAlign(p.LEFT, p.TOP);
    p.textFont('Arial');
    p.fill(colInk);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.text(nickname, b.x + 58, b.y);

    p.textStyle(p.NORMAL);
    p.textSize(11);
    p.fill(colInkFaint);
    p.text('(click avatar to reroll)', b.x + 58, b.y + 18);

    p.fill(colPurpleDark);
    p.textSize(12);
    p.textStyle(p.BOLD);
    p.text('VIP ' + vipNumber, b.x + 58, b.y + 36);

    p.fill(colInkFaint);
    p.textSize(12);
    p.textStyle(p.NORMAL);
    p.text('Top score: ' + topScoreDays + ' days', b.x + 58, b.y + 54);

    p.textAlign(p.CENTER, p.CENTER);
  }

  function drawAchievementPopup() {
    if (!achievementPopup && achievementPopupQueue.length > 0) {
      achievementPopup = {
        ...achievementPopupQueue.shift(),
        timer: 0,
        total: 170
      };
      
      // ACHIEVEMENT POPUP SOUND PLACEHOLDER PLAY
      if (achievementSound) {
        if (achievementSound.isPlaying()) {
          achievementSound.stop();
        }
        achievementSound.play();
      }
    }

    if (!achievementPopup) return;
    achievementPopup.timer++;
    const t = achievementPopup.timer / achievementPopup.total;
    const slide = t < 0.15 ? easeOutBack(t / 0.15) : (t > 0.85 ? 1 - easeInQuad((t - 0.85) / 0.15) : 1);

    const boxW = 400;
    const boxH = 68;
    const x = DESIGN_W - 20 - boxW * slide;
    const y = 16;

    p.rectMode(p.CORNER);
    p.noStroke();
    p.fill(240);
    p.circle(x - 12, y + boxH / 2, 60);

    p.fill(colInkFaint);
    p.textSize(9);
    p.text('image\nplaceholder', x - 12, y + boxH / 2);

    const ctx = p.drawingContext;
    let popGrad = ctx.createLinearGradient(x + 20, y, x + boxW, y + boxH);
    popGrad.addColorStop(0.1013, '#33ff58');
    popGrad.addColorStop(0.5542, '#339947');
    popGrad.addColorStop(0.9519, '#f7cd26');

    ctx.save();
    roundedRect(x + 20, y, boxW - 20, boxH, 14);
    ctx.fillStyle = popGrad;
    ctx.fill();
    ctx.strokeStyle = '#ebebeb';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Box shadow inset simulation via stroke layers or manual clips
    ctx.restore();

    p.fill(255, 255, 255, 255 * slide);
    p.textAlign(p.LEFT, p.CENTER);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.text('Achievement unlocked: ' + achievementPopup.label, x + 40, y + 24);

    p.textStyle(p.NORMAL);
    p.textSize(12);
    p.text(
      'Day ' + achievementPopup.day + ' earned ' + achievementPopup.count + ' time' + (achievementPopup.count > 1 ? 's' : ''),
      x + 40,
      y + 46
    );

    p.textAlign(p.CENTER, p.CENTER);
    if (achievementPopup.timer >= achievementPopup.total) {
      achievementPopup = null;
    }
  }

  function drawAchievementBoard() {
    const ctx = p.drawingContext;
    p.rectMode(p.CORNER);

    const headerGrad = ctx.createLinearGradient(
      PANEL_X,
      PANEL_Y,
      PANEL_X + PANEL_W,
      PANEL_Y + HEADER_H
    );
    headerGrad.addColorStop(0.00, '#7355BD');
    headerGrad.addColorStop(0.35, '#3700C0');
    headerGrad.addColorStop(0.70, '#8A2BE2');
    headerGrad.addColorStop(1.00, '#F7CD26');

    ctx.fillStyle = headerGrad;
    ctx.fillRect(PANEL_X, PANEL_Y, PANEL_W, HEADER_H);

    p.fill(255, 250, 205);
    p.textFont('Georgia');
    p.textSize(16);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('YOUR ACHIEVEMENTS!', PANEL_X + PANEL_W / 2, PANEL_Y + HEADER_H / 2);

    // Background of achievement (where white list is on) -> --bg-yellow: #f7efca;
    p.noStroke();
    p.fill('#f7efca');
    p.rect(PANEL_X, CONTAINER_Y, PANEL_W, CONTAINER_H);

    // Border for "your achievements!" column 3px solid --pink: #db00ac, and same for event middle panel
    p.stroke('#db00ac');
    p.strokeWeight(3);
    p.noFill();
    p.rect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H);

    p.push();
    ctx.save();
    ctx.beginPath();
    ctx.rect(PANEL_X, CONTAINER_Y, PANEL_W, CONTAINER_H);
    ctx.clip();

    currentAchievementList.forEach((ach, i) => {
      const iy = CONTAINER_Y + i * (ITEM_H + ITEM_GAP) - achScrollY;
      if (iy + ITEM_H < CONTAINER_Y || iy > CONTAINER_Y + CONTAINER_H) {
        return;
      }

      const count = achievementCounts[ach.id] || 0;
      const isUnlocked = count > 0;
      const itemGrad = ctx.createLinearGradient(
        PANEL_X + 6,
        iy,
        PANEL_X + PANEL_W - 6,
        iy + ITEM_H
      );

      if (isUnlocked) {
        itemGrad.addColorStop(0.0, '#ffe88a');
        itemGrad.addColorStop(0.5, '#F3E8FF');
        itemGrad.addColorStop(1.0, '#dbc7f0');
      } else {
        itemGrad.addColorStop(0.0, '#FFFFFF');
        itemGrad.addColorStop(0.5, '#F5F5F5');
        itemGrad.addColorStop(1.0, '#EBEBEB');
      }

      ctx.fillStyle = itemGrad;
      p.stroke(isUnlocked ? '#8A2BE2' : 215);
      p.strokeWeight(isUnlocked ? 1.5 : 1);
      ctx.fillRect(PANEL_X + 6, iy, PANEL_W - 12, ITEM_H);
      ctx.strokeRect(PANEL_X + 6, iy, PANEL_W - 12, ITEM_H);

      p.noStroke();
      p.textFont('Arial');
      p.textAlign(p.LEFT, p.TOP);
      p.fill(isUnlocked ? '#3700C0' : '#4A4A4A');
      p.textSize(13); // Keep the larger panel readable
      p.textStyle(p.BOLD);
      p.text((isUnlocked ? '' : '') + ach.label, PANEL_X + 12, iy + 6);

      p.textStyle(p.NORMAL);
      p.fill(isUnlocked ? '#2D3748' : '#718096');
      p.textSize(11); // Increased font size for visibility
      p.text(ach.congrats, PANEL_X + 12, iy + 22, PANEL_W - 24);

      p.textAlign(p.LEFT, p.BOTTOM);
      p.textSize(12); // Increased font size
      p.fill(isUnlocked ? '#D97706' : '#9CA3AF');
      p.textStyle(p.BOLD);
      p.text('Reward: ' + (isUnlocked ? ach.reward : '?'), PANEL_X + 12, iy + ITEM_H - 5);

      p.textAlign(p.RIGHT, p.BOTTOM);
      p.fill(isUnlocked ? '#059669' : '#9CA3AF');
      p.textSize(11); // Increased font size
      p.textStyle(p.BOLD);
      p.text(count + ' achieved', PANEL_X + PANEL_W - 12, iy + ITEM_H - 5);
    });

    ctx.restore();
    p.pop();
    p.textAlign(p.CENTER, p.CENTER);
  }

  // Moved event panel down closer to the bottom edge of the screen
  const EVENT_PANEL = {
    x: 260,
    y: 587,
    w: 470,
    h: 85
  };

  function drawEventPanel() {
    const { x, y, w, h } = EVENT_PANEL;
    p.rectMode(p.CORNER);

    // Background color: --paper: linear-gradient(...) rendered via drawingContext, or fallback
    const ctx = p.drawingContext;
    let paperGrad = ctx.createLinearGradient(x, y, x, y + h);
    paperGrad.addColorStop(0.0865, '#ffe5e5');
    paperGrad.addColorStop(0.4231, '#f3eabf');
    paperGrad.addColorStop(1.0, '#b3eab4');

    ctx.save();
    ctx.fillStyle = paperGrad;
    ctx.strokeStyle = '#db00ac'; // 3px solid --pink: #db00ac
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.clip();

    p.noStroke();
    p.fill(colInk);
    p.textStyle(p.BOLD);
    p.textFont('Arial');

    const scaledSize = p.constrain(p.width * 0.016, 14, 22);
    p.textSize(scaledSize);
    p.textLeading(scaledSize * 1.3);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(currentCard ? currentCard.prompt : '', x + w / 2, y + h / 2);

    p.textStyle(p.NORMAL);
    ctx.restore();
  }

  function drawEncouragementAndCard() {
    p.rectMode(p.CORNER);
    let leftGlow = 0;
    let rightGlow = 0;

    if (cardState === 'dragging' || cardState === 'resolving') {
      leftGlow = p.constrain(-cardOffset.x / DRAG_THRESHOLD, 0, 1);
      rightGlow = p.constrain(cardOffset.x / DRAG_THRESHOLD, 0, 1);
    }

    const pulse = p.sin(p.frameCount * 0.08) * 4;

    p.textFont('Arial');
    p.textStyle(p.BOLD);

    // Swipe Left Text & Arrow Fixed
    p.push();
    p.translate(690 + pulse * 0.5, SWIPE_LEFT_Y);
    p.noStroke();
    p.fill(83, 166, 67, 210 + leftGlow * 45);
    p.rect(-10, -18, 215, 36, 4);
    p.fill(255);
    p.textSize(15);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('← SWIPE LEFT TO ACCEPT', 0, 0); // Fixed arrow indicator
    p.pop();

    // Swipe Right Text & Arrow Fixed
    p.push();
    p.translate(940 + pulse * 0.5, SWIPE_RIGHT_Y);
    p.noStroke();
    p.fill(55, 0, 192, 210 + rightGlow * 45);
    p.rect(-225, -18, 235, 36, 4);
    p.fill(255);
    p.textSize(15);
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('SWIPE RIGHT TO DECLINE →', 0, 0); // Fixed arrow indicator
    p.pop();

    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.NORMAL);
  }

  // Moved days and age boxes down closer to the bottom edge of the screen
  function drawDaysAgeBox() {
    p.rectMode(p.CORNER);

    // Days background: --bg-green: #d6ecc6
    p.fill('#d6ecc6');
    p.stroke('#F7CD26');
    p.strokeWeight(2);
    p.rect(740, 597, 100, 75);

    p.noStroke();
    p.fill(60);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('DAYS', 790, 617);
    p.textSize(26);
    p.text(totalDays, 790, 646);

    // Age background: --bg-pink: #f9e6f1
    p.fill('#f9e6f1');
    p.stroke('#53a643');
    p.strokeWeight(2);
    p.rect(850, 597, 100, 75);

    p.noStroke();
    p.fill(60);
    p.textSize(14);
    p.textStyle(p.BOLD);
    p.text('AGE', 900, 617);
    p.textSize(26);
    p.text(age, 900, 646);

    p.textStyle(p.NORMAL);
  }

  function easeInQuad(t) {
    return t * t;
  }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  function updateCard() {
    if (cardState === 'entering') {
      enterProgress += 0.08;
      if (enterProgress >= 1) {
        enterProgress = 1;
        cardState = 'idle';
      }
    } else if (cardState === 'idle') {
      cardOffset.x = p.lerp(cardOffset.x, 0, 0.25);
      cardOffset.y = p.lerp(cardOffset.y, 0, 0.25);
    } else if (cardState === 'resolving') {
      resolveProgress += 0.06;
      if (resolveProgress >= 1) {
        resolveProgress = 1;
        discardPile.push(currentCard.idx);
        checkGameOver();
        if (!gameOver) {
          drawNextCard();
        }
      }
    }
  }

  function drawCardOnTop() {
    if (!currentCard) return;
    p.push();
    let x = CARD_X;
    let y = CARD_Y;
    let rot = 0;
    let scaleAmt = 1;
    let flipSquish = 1;
    let showBack = false;

    if (cardState === 'entering') {
      const prg = enterProgress;
      if (entranceType === 'flip') {
        const angle = p.PI * (1 - prg);
        flipSquish = Math.abs(Math.cos(angle));
        showBack = angle > p.HALF_PI;
      } else if (entranceType === 'bounce') {
        y = p.lerp(CARD_Y - 220, CARD_Y, easeOutBounce(prg));
      } else if (entranceType === 'spin') {
        rot = p.radians(p.lerp(720, 0, prg));
        scaleAmt = 0.25 + 0.75 * easeOutBack(prg);
      } else if (entranceType === 'slide') {
        const e = easeOutBack(prg);
        if (slideFrom === 'left') {
          x = p.lerp(CARD_X - 400, CARD_X, e);
        } else if (slideFrom === 'right') {
          x = p.lerp(CARD_X + 400, CARD_X, e);
        } else {
          y = p.lerp(CARD_Y - 300, CARD_Y, e);
        }
      }
    } else if (cardState === 'dragging' || cardState === 'idle') {
      x += cardOffset.x;
      y += cardOffset.y;
      // Keep the swipe tilt subtle and bounded. The old multiplier could
      // rotate the card several hundred degrees at the drag threshold.
      rot = p.radians(p.constrain(
        (cardOffset.x / DRAG_THRESHOLD) * 12,
        -12,
        12
      ));
    } else if (cardState === 'resolving') {
      const e = easeInQuad(resolveProgress);
      x += resolveDir * e * 480;
      y += e * -30;
      rot = p.radians(resolveDir * e * 40 * resolveSpin);
    }

    p.translate(x, y);
    p.rotate(rot);
    p.scale(scaleAmt * flipSquish, scaleAmt);

    if (showBack) {
      drawCardBack();
      p.pop();
      return;
    }

    let dragAmt = 0;
    let dir = 0;
    if (cardState === 'dragging' || cardState === 'idle') {
      dragAmt = p.constrain(Math.abs(cardOffset.x) / DRAG_THRESHOLD, 0, 1);
      dir = cardOffset.x > 0 ? 1 : -1;
    } else if (cardState === 'resolving') {
      dragAmt = 1;
      dir = resolveDir;
    }

    p.rectMode(p.CENTER);
    p.noStroke();
    p.fill(0, 0, 0, 50);
    p.rect(5, 8, CARD_W, CARD_H, 0);

    // Card background using --green-gradient: linear-gradient(180deg, #33ff58 10.13%, #339947 55.42%, #f7cd26 95.19%)
    const ctx = p.drawingContext;
    let cardGrad = ctx.createLinearGradient(0, -CARD_H / 2, 0, CARD_H / 2);
    cardGrad.addColorStop(0.1013, '#33ff58');
    cardGrad.addColorStop(0.5542, '#339947');
    cardGrad.addColorStop(0.9519, '#f7cd26');

    ctx.save();
    roundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 0); // no border radius
    ctx.fillStyle = cardGrad;
    ctx.fill();
    ctx.strokeStyle = '#f7cd26'; // border is 6px solid #f7cd26
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    if (dragAmt > 0) {
      p.noStroke();
      const tintCol = dir < 0 ? colAccept : colReject;
      p.fill(p.red(tintCol), p.green(tintCol), p.blue(tintCol), dragAmt * 90);
      p.rect(0, 0, CARD_W, CARD_H, 0);
    }

    p.noStroke();
    p.fill(40, 25, 10);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.text(currentCard.prompt, 0, 0, CARD_W - 24, CARD_H - 24);

    if (cardState === 'resolving') {
      p.push();
      const a = p.constrain(resolveProgress * 2, 0, 1) * 255;
      p.rotate(p.radians(-16));
      const stampCol = resolveDir < 0 ? colAccept : colReject;
      p.noFill();
      p.stroke(p.red(stampCol), p.green(stampCol), p.blue(stampCol), a);
      p.strokeWeight(3);
      p.rect(0, 60, 130, 38, 4);
      p.noStroke();
      p.fill(p.red(stampCol), p.green(stampCol), p.blue(stampCol), a);
      p.textSize(18);
      p.textStyle(p.BOLD);
      p.text(resolveDir < 0 ? 'ACCEPTED' : 'DECLINED', 0, 62);
      p.textStyle(p.NORMAL);
      p.pop();
    }

    p.pop();
  }

  function drawCardBack() {
    p.rectMode(p.CENTER);
    p.noStroke();
    p.fill(0, 0, 0, 50);
    p.rect(5, 8, CARD_W, CARD_H, 0);
    p.fill(60, 45, 30);
    p.rect(0, 0, CARD_W, CARD_H, 0);
    p.stroke(240);
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(0, 0, CARD_W, CARD_H, 0);
    p.rect(-CARD_W / 2 + 12, -CARD_H / 2 + 12, CARD_W - 24, CARD_H - 24, 4);
    p.noStroke();
    p.fill(240);
    p.push();
    p.rotate(p.radians(45));
    p.rect(0, 0, 36, 36, 4);
    p.pop();
  }

  function pointInCard(mx, my) {
    const x = CARD_X + cardOffset.x;
    const y = CARD_Y + cardOffset.y;
    return (
      mx > x - CARD_W / 2 &&
      mx < x + CARD_W / 2 &&
      my > y - CARD_H / 2 &&
      my < y + CARD_H / 2
    );
  }

  function drawGameOver() {
    p.rectMode(p.CENTER);
    p.noStroke();
    p.fill(0, 0, 0, 170);
    p.rectMode(p.CORNER);
    p.rect(0, 0, DESIGN_W, DESIGN_H);

    p.rectMode(p.CENTER);
    p.fill(colPanel);
    p.stroke(colPanelBorder);
    p.strokeWeight(1.5);
    p.rect(DESIGN_W / 2, DESIGN_H / 2, 420, 240, 10);

    p.noStroke();
    p.fill(colInk);
    p.textSize(28);
    p.textStyle(p.BOLD);
    p.textAlign(p.CENTER, p.CENTER);
    p.text('Game over', DESIGN_W / 2, DESIGN_H / 2 - 80);

    p.textStyle(p.NORMAL);
    p.textSize(15);
    p.text(endReason, DESIGN_W / 2, DESIGN_H / 2 - 45, 340, 40);

    p.textSize(14);
    p.textStyle(p.BOLD);
    let statY = DESIGN_H / 2 + 5;
    for (const statKey of STAT_KEYS) {
      p.text(STAT_LABEL[statKey] + ': ' + Math.round(stats[statKey]), DESIGN_W / 2, statY);
      statY += 18;
    }

    const btnY = DESIGN_H / 2 + 95;
    p.fill(colPurple);
    p.noStroke();
    p.rect(DESIGN_W / 2, btnY, 160, 40, 6);
    p.fill(255);
    p.textSize(15);
    p.textStyle(p.BOLD);
    p.text('PLAY AGAIN', DESIGN_W / 2, btnY);
    p.textStyle(p.NORMAL);
  }

  function isOverRestartButton(mx, my) {
    const btnY = DESIGN_H / 2 + 95;
    return (
      mx > DESIGN_W / 2 - 80 &&
      mx < DESIGN_W / 2 + 80 &&
      my > btnY - 20 &&
      my < btnY + 20
    );
  }

  p.mousePressed = () => {
    const mx = p.mouseX * (DESIGN_W / p.width);
    const my = p.mouseY * (DESIGN_H / p.height);

    if (gameOver) {
      if (isOverRestartButton(mx, my)) {
        randomizeCosmetics();
        startNewGame();
      }
      return;
    }

    const av = avatarPanelBounds();
    if (mx > av.x && mx < av.x + 48 && my > av.y && my < av.y + 48) {
      nickname = p.random(nameList.filter(n => n !== nickname));
      return;
    }

    if (cardState !== 'idle') {
      return;
    }

    if (pointInCard(mx, my)) {
      cardState = 'dragging';
    }
  };

  p.mouseDragged = () => {
    if (cardState !== 'dragging') {
      return;
    }
    const scaleFactor = DESIGN_W / p.width;
    cardOffset.x += p.movedX * scaleFactor;
    cardOffset.y += p.movedY * 0.3 * scaleFactor;
    cardOffset.y = p.constrain(cardOffset.y, -40, 40);
  };

  p.mouseReleased = () => {
    if (cardState !== 'dragging') {
      return;
    }
    if (Math.abs(cardOffset.x) > DRAG_THRESHOLD) {
      resolveCard(cardOffset.x > 0 ? 1 : -1);
    } else {
      cardState = 'idle';
    }
  };
};

new p5(myMainCanvasSketch);