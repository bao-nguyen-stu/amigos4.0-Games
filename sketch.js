
/* ==========================================================================
   1. VIRUS / CORRUPTION LOGIC
   ========================================================================== */
window.isGlitchActive = false;
window.adSpamInterval = null;
window.glitchTimeoutId = null;

const CORRUPTION_DURATION_MS = 10000;
const AD_SPAWN_INTERVAL_MS = 350;
const CTA_TEXT = "You saw the addiction. Did you see the person?";

// Helper object to store and restore original DOM text elements
const CorruptionOperator = {
  originalTexts: [],
  reset: function () {
    this.originalTexts = [];
  }
};

window.triggerGlobalGlitch = function triggerCorruption() {
  if (window.isGlitchActive) return;
  window.isGlitchActive = true;

  document.body.classList.add("grayscale-glitch-body");

  if (typeof activeChimeSound !== "undefined" && activeChimeSound) {
    activeChimeSound.currentTime = 0;
    activeChimeSound.play().catch(() => {});
  }

  const textElements = Array.from(
    document.querySelectorAll(
      "p, h1, h2, h3, h4, span, a, button, small, strong, em",
    ),
  );
  if (CorruptionOperator.originalTexts.length === 0) {
    CorruptionOperator.originalTexts = textElements.map((el) => {
      return { element: el, originalHTML: el.innerHTML };
    });
  }

  swapAllTextToCTA();
  startFog();

  window.adSpamInterval = setInterval(spawnSpamAd, AD_SPAWN_INTERVAL_MS);

  window.glitchTimeoutId = setTimeout(() => {
    if (window.adSpamInterval) clearInterval(window.adSpamInterval);
    if (typeof HydraAdsSystem !== "undefined") {
      HydraAdsSystem.clearAll();
    }
    if (window.isGlitchActive) {
      showLookAwayButton();
    }
  }, CORRUPTION_DURATION_MS);
};

function swapAllTextToCTA() {
  const textElements = document.querySelectorAll(
    "p, h1, h2, h3, h4, span, a, button, small, strong, em",
  );
  textElements.forEach((el) => {
    if (!el.closest("#whats-new-modal")) {
      if (el.children.length === 0) {
        el.innerText = CTA_TEXT;
        el.style.color = "#ff0000";
        el.style.backgroundColor = "#000";
      }
    }
  });
}

function startFog() {
  if (document.getElementById("fog-overlay")) return;
  const fog = document.createElement("div");
  fog.id = "fog-overlay";
  document.body.appendChild(fog);
  requestAnimationFrame(() => fog.classList.add("fog-active"));
}

function spawnSpamAd() {
  if (typeof activeChimeSound !== "undefined" && activeChimeSound) {
    activeChimeSound.currentTime = 0;
    activeChimeSound.play().catch(() => {});
  }

  const ad = document.createElement("div");
  ad.className = "spam-ad";

  const width = 32 + Math.random() * 20;
  const top = Math.random() * 75;
  const left = Math.random() * 70;
  const rotate = (Math.random() * 10 - 5).toFixed(1);

  ad.style.top = `${top}%`;
  ad.style.left = `${left}%`;
  ad.style.width = `${width}%`;
  ad.style.setProperty("--rot", `${rotate}deg`);
  ad.innerText = CTA_TEXT;

  document.body.appendChild(ad);
}

function showLookAwayButton() {
  const btn = document.createElement("button");
  btn.id = "look-away-btn";
  btn.innerText = "Looking away is never the answer";
  document.body.appendChild(btn);

  requestAnimationFrame(() => btn.classList.add("look-away-visible"));
  btn.addEventListener("click", () => showFinalPanel(), { once: true });
}

function showFinalPanel() {
  const fog = document.getElementById("fog-overlay");
  if (fog) fog.remove();

  const btn = document.getElementById("look-away-btn");
  if (btn) btn.remove();

  document.querySelectorAll(".spam-ad").forEach((ad) => ad.remove());

  const page = document.querySelector(".page");
  const topbar = document.querySelector(".topbar");
  if (page) page.style.display = "none";
  if (topbar) topbar.style.display = "none";

  const modal = document.getElementById("whats-new-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }

  window.isGlitchActive = false;
}

window.restoreWebToNormal = function () {
  if (window.adSpamInterval) clearInterval(window.adSpamInterval);
  if (window.glitchTimeoutId) clearTimeout(window.glitchTimeoutId);
  if (typeof HydraAdsSystem !== "undefined") HydraAdsSystem.clearAll();

  const fog = document.getElementById("fog-overlay");
  if (fog) fog.remove();
  document.querySelectorAll(".spam-ad").forEach((ad) => ad.remove());
  const lookAwayBtn = document.getElementById("look-away-btn");
  if (lookAwayBtn) lookAwayBtn.remove();

  document.body.classList.remove("grayscale-glitch-body");

  const page = document.querySelector(".page");
  const topbar = document.querySelector(".topbar");
  if (page) page.style.display = "";
  if (topbar) topbar.style.display = "";

  CorruptionOperator.originalTexts.forEach((item) => {
    if (item.element) {
      item.element.innerHTML = item.originalHTML;
      item.element.style.color = "";
      item.element.style.backgroundColor = "";
    }
  });

  CorruptionOperator.originalTexts = [];
  CorruptionOperator.reset();
  window.isGlitchActive = false;
};

/* ==========================================================================
   2. MAIN P5 GAME SKETCH
   ========================================================================== */
const myMainCanvasSketch = (p) => { 
  let aspectRatio; 
  const DESIGN_W = 960, DESIGN_H = 720; 
  const CONTENT_OFFSET_Y = 0; 
 
  // GAME STATES: 'START', 'PLAYING'
  let gameState = 'START';

  // SOUNDS 
  let swipeSound; 
  let achievementSound; 
 
  const SWIPE_SOUND_PATH = 'designed-sounds/COMM2754-2026-S2-A3w12-airleak-1-anim.wav'; 
  const ACHIEVEMENT_SOUND_PATH = 'designed-sounds/COMM2754-2026-S2-A3w12-BeyondTheLabel-over10.wav'; 
 
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
 
  let stats = { Fitness: 50, Mood: 50, Money: 50, Relationship: 50 }; 
  let displayStats = { ...stats }; 
  let lastDelta = { Fitness: 0, Mood: 0, Money: 0, Relationship: 0 }; 
 
  let totalDays = 0; 
  let age = 18; 
  let acquiredLabels = [];

  /* ==========================================================================
     EVENT DATA
     ========================================================================== */
  const EVENTS_SECTION_A = [
    {
      prompt: "You get into university.",
      yesText: "Go",
      yesLabels: ["ambitious", "hard-working", "grown-up"],
      yesValues: { fitness: 10, mood: 20, money: -30, relationship: 20 },
      noText: "Take a year off",
      noLabels: ["independent", "lazy", "stupid", "ignorant"],
      noValues: { fitness: 0, mood: -10, money: 0, relationship: -10 }
    },
    {
      prompt: "You need money for university.",
      yesText: "Keep working",
      yesLabels: ["ambitious", "hard-working", "grown-up", "determined"],
      yesValues: { fitness: 0, mood: 20, money: -20, relationship: 20 },
      noText: "Take a year off",
      noLabels: ["independent", "lazy", "stupid", "ignorant"],
      noValues: { fitness: 0, mood: -10, money: 0, relationship: -10 }
    },
    {
      prompt: "Your part-time job is exhausting you.",
      yesText: "Keep working",
      yesLabels: ["responsible", "struggling", "determined"],
      yesValues: { fitness: -20, mood: -10, money: -20, relationship: -20 },
      noText: "Cut your hours",
      noLabels: ["stubborn", "careful", "frustrated"],
      noValues: { fitness: -10, mood: 20, money: -20, relationship: -10 }
    },
    {
      prompt: "You fail a university subject.",
      yesText: "Retake it",
      yesLabels: ["responsible", "struggling", "clearheaded", "determined"],
      yesValues: { fitness: -10, mood: 10, money: -10, relationship: 0 },
      noText: "Give up",
      noLabels: ["reckless", "careless"],
      noValues: { fitness: -10, mood: -20, money: 0, relationship: -20 }
    },
    {
      prompt: "You graduate from university.",
      yesText: "Celebrate with family",
      yesLabels: ["successful", "hard-working", "clearheaded", "obedient"],
      yesValues: { fitness: 10, mood: 20, money: 0, relationship: 30 },
      noText: "Celebrate with friends",
      noLabels: ["successful", "social", "independent"],
      noValues: { fitness: 0, mood: 10, money: -10, relationship: 20 }
    },
    {
      prompt: "You get your first full-time job.",
      yesText: "Take it",
      yesLabels: ["hard-working", "responsible", "ambitious"],
      yesValues: { fitness: 0, mood: 20, money: 10, relationship: 10 },
      noText: "Keep looking",
      noLabels: ["ambitious", "independent", "careless"],
      noValues: { fitness: -10, mood: -10, money: 0, relationship: 0 }
    },
    {
      prompt: "Your first salary arrives.",
      yesText: "Save it",
      yesLabels: ["responsible", "clearheaded", "cautious"],
      yesValues: { fitness: 0, mood: 10, money: 20, relationship: 0 },
      noText: "Spend it",
      noLabels: ["reckless", "wasteful", "careless"],
      noValues: { fitness: -10, mood: 20, money: -20, relationship: 0 }
    }
  ];

  const EVENTS_SECTION_B = [
    {
      prompt: "You haven't slept well for weeks.",
      yesText: "See a doctor",
      yesLabels: ["responsible", "struggling", "clearheaded", "cautious"],
      yesValues: { fitness: 20, mood: 10, money: -20, relationship: 0 },
      noText: "Ignore it",
      noLabels: ["stubborn", "careless"],
      noValues: { fitness: -20, mood: -20, money: 0, relationship: 0 }
    },
    {
      prompt: "You can't handle things alone anymore.",
      yesText: "See a doctor",
      yesLabels: ["struggling", "accountable", "clearheaded"],
      yesValues: { fitness: 20, mood: 20, money: -30, relationship: 10 },
      noText: "Keep it private",
      noLabels: ["stubborn", "distant", "isolated", "cautious"],
      noValues: { fitness: -20, mood: -20, money: 0, relationship: -20 }
    },
    {
      prompt: "You lose your job.",
      yesText: "Tell your family",
      yesLabels: ["struggling", "dependent", "desperate"],
      yesValues: { fitness: 0, mood: 20, money: 10, relationship: 20 },
      noText: "Hide it",
      noLabels: ["clearheaded", "cautious", "secretive"],
      noValues: { fitness: 0, mood: -20, money: -10, relationship: -20 }
    },
    {
      prompt: "Mum calls. You haven't called for three days.",
      yesText: "Pick up",
      yesLabels: ["responsible"],
      yesValues: { fitness: -20, mood: 10, money: -20, relationship: 0 },
      noText: "Ignore",
      noLabels: ["stubborn", "distant", "isolated"],
      noValues: { fitness: 0, mood: -20, money: 0, relationship: -30 }
    },
    {
      prompt: "You have been awake since 7am. Someone offers you something to stay awake.",
      yesText: "Take it",
      yesLabels: ["reckless", "hard-working", "desperate"],
      yesValues: { fitness: -20, mood: 20, money: -10, relationship: 0 },
      noText: "Refuse",
      noLabels: ["clearheaded", "cautious"],
      noValues: { fitness: 0, mood: -10, money: 0, relationship: 0 }
    },
    {
      prompt: "Your new friends spend a lot when you go out.",
      yesText: "Keep hanging out",
      yesLabels: ["reckless", "influenced", "wasteful", "stubborn"],
      yesValues: { fitness: 0, mood: 10, money: -30, relationship: 20 },
      noText: "Cut back",
      noLabels: ["clearheaded", "independent", "responsible"],
      noValues: { fitness: 0, mood: 0, money: 20, relationship: -10 }
    },
    {
      prompt: "You move out. Your parents want you to call every day.",
      yesText: "Agree",
      yesLabels: ["obedient", "grown-up", "responsible"],
      yesValues: { fitness: 5, mood: 20, money: 20, relationship: 20 },
      noText: "Disagree",
      noLabels: ["distant", "independent", "ill-manner", "reckless"],
      noValues: { fitness: 0, mood: 0, money: 0, relationship: -20 }
    },
    {
      prompt: "A friend offers you something to forget your problems.",
      yesText: "Try it",
      yesLabels: ["reckless", "influenced", "desperate"],
      yesValues: { fitness: -20, mood: 10, money: -20, relationship: 0 },
      noText: "Refuse",
      noLabels: ["clearheaded", "cautious"],
      noValues: { fitness: 0, mood: -10, money: 0, relationship: 0 }
    },
    {
      prompt: "Someone offers you easy money. 'Don't ask questions.'",
      yesText: "Take it",
      yesLabels: ["reckless", "ambitious", "desperate"],
      yesValues: { fitness: 0, mood: 30, money: 40, relationship: 0 },
      noText: "Walk away",
      noLabels: ["grown-up", "clearheaded"],
      noValues: { fitness: 0, mood: 10, money: 0, relationship: -10 }
    },
    {
      prompt: "You have not felt like yourself lately. Your friend suggests a break.",
      yesText: "Take a break",
      yesLabels: ["cooperative", "recovering"],
      yesValues: { fitness: 30, mood: 20, money: 0, relationship: 20 },
      noText: "Keep partying",
      noLabels: ["influenced", "struggling", "reckless"],
      noValues: { fitness: -20, mood: -10, money: -20, relationship: -10 }
    },
    {
      prompt: "Someone says, 'You can't get addicted to this.'",
      yesText: "Believe them",
      yesLabels: ["influenced", "obedient", "reckless"],
      yesValues: { fitness: -20, mood: -20, money: -20, relationship: 10 },
      noText: "Look into it",
      noLabels: ["careful", "grown-up", "independent", "cautious"],
      noValues: { fitness: 0, mood: 0, money: 0, relationship: -10 }
    },
    {
      prompt: "You have started hiding things from your family.",
      yesText: "Tell them",
      yesLabels: ["dependent", "struggling", "obedient"],
      yesValues: { fitness: 0, mood: 20, money: 0, relationship: 20 },
      noText: "Say you are fine",
      noLabels: ["secretive", "struggling"],
      noValues: { fitness: 0, mood: -20, money: 0, relationship: -10 }
    },
    {
      prompt: "You check your bank account. You know where the money went.",
      yesText: "Face it",
      yesLabels: ["responsible", "struggling"],
      yesValues: { fitness: 0, mood: -10, money: -10, relationship: 0 },
      noText: "Ignore it",
      noLabels: ["struggling", "influenced", "reckless", "wasteful"],
      noValues: { fitness: 0, mood: -20, money: -30, relationship: 0 }
    },
    {
      prompt: "The feeling does not last as long anymore.",
      yesText: "Take more",
      yesLabels: ["dependent", "struggling", "influenced", "reckless"],
      yesValues: { fitness: -20, mood: -30, money: -30, relationship: -20 },
      noText: "Change type",
      noLabels: ["dependent", "struggling", "influenced"],
      noValues: { fitness: -10, mood: -20, money: -20, relationship: -10 }
    }
  ];

  const EVENTS_SECTION_C = [
    {
      prompt: "Your family wants you to enter rehabilitation.",
      yesText: "Go",
      yesLabels: ["dependent", "struggling", "cooperative", "recovering"],
      yesValues: { fitness: 30, mood: 20, money: -40, relationship: 10 },
      noText: "Refuse",
      noLabels: ["suspicious", "stubborn", "reckless", "wasteful", "gangster"],
      noValues: { fitness: -20, mood: -10, money: 0, relationship: -30 }
    },
    {
      prompt: "The authorities require you to attend rehabilitation.",
      yesText: "Cooperate",
      yesLabels: ["suspicious", "struggling", "cooperative", "recovering"],
      yesValues: { fitness: 30, mood: 20, money: 0, relationship: 30 },
      noText: "Refuse",
      noLabels: ["dishonest", "dependent", "influenced", "gangster"],
      noValues: { fitness: -30, mood: 0, money: -20, relationship: -20 }
    },
    {
      prompt: "You have not used it for two months. You smell it from a passer-by.",
      yesText: "Use again",
      yesLabels: ["influenced", "struggling", "reckless", "gangster"],
      yesValues: { fitness: -20, mood: 10, money: -40, relationship: -30 },
      noText: "Control yourself",
      noLabels: ["grown-up", "responsible", "recovering"],
      noValues: { fitness: 20, mood: -30, money: 0, relationship: 20 }
    },
    {
      prompt: "You blocked the group and decided to stop after rehab.",
      yesText: "Stay sober",
      yesLabels: ["grown-up", "responsible", "independent", "recovering"],
      yesValues: { fitness: 30, mood: 10, money: 0, relationship: 30 },
      noText: "Contact them again",
      noLabels: ["dishonest", "dependent", "influenced", "reckless"],
      noValues: { fitness: -20, mood: 20, money: -30, relationship: -10 }
    },
    {
      prompt: "Police stop you. There are drugs in your bag.",
      yesText: "Tell the truth",
      yesLabels: ["accountable", "gangster", "reckless", "criminal"],
      yesValues: { fitness: -30, mood: -30, money: -40, relationship: -20 },
      noText: "Lie",
      noLabels: ["dishonest", "gangster", "reckless"],
      noValues: { fitness: -40, mood: -20, money: -50, relationship: -30 }
    },
    {
      prompt: "Police catch you carrying drugs for someone else.",
      yesText: "Tell the truth",
      yesLabels: ["accountable", "gangster", "reckless"],
      yesValues: { fitness: -30, mood: -30, money: -60, relationship: -30 },
      noText: "Protect the group",
      noLabels: ["dishonest", "gangster", "reckless"],
      noValues: { fitness: -50, mood: -10, money: -40, relationship: -10 }
    },
    {
      prompt: "Court day. Your family is behind you.",
      yesText: "Face it",
      yesLabels: ["accountable", "gangster", "reckless", "criminal"],
      yesValues: { fitness: -20, mood: -20, money: -40, relationship: -20 },
      noText: "Blame everyone else",
      noLabels: ["dishonest", "ill-manner", "ill-tempered", "gangster"],
      noValues: { fitness: -30, mood: 10, money: -40, relationship: -40 }
    },
    {
      prompt: "You look thinner. Your neighbour gossips that you are an addict.",
      yesText: "Ignore them",
      yesLabels: ["suspicious", "grown-up", "secretive"],
      yesValues: { fitness: 0, mood: -30, money: 0, relationship: 20 },
      noText: "Curse them",
      noLabels: ["gangster", "reckless", "ill-tempered"],
      noValues: { fitness: 0, mood: 30, money: 0, relationship: -30 }
    }
  ];

  const ALL_STAGE1_LABELS = [
    "ambitious", "hard-working", "determined", "grown-up", "responsible",
    "cooperative", "accountable", "careful", "cautious", "pretty",
    "clearheaded", "handsome", "independent", "successful", "obedient",
    "social", "recovering", "lazy", "ignorant", "careless", "reckless",
    "stubborn", "frustrated", "intelligent", "struggling", "desperate",
    "wasteful", "distant", "isolated", "secretive", "suspicious",
    "influenced", "dependent", "gangster", "dishonest", "ill-manner",
    "ill-tempered", "humble", "clever", "steady", "affectionate",
    "honest", "gentle"
  ];

  /* ==========================================================================
     ACHIEVEMENTS LIST & GAME ENGINE LOGIC
   ========================================================================== */
  const ALL_ACHIEVEMENTS = [
    {
      id: 'new_chapter',
      label: 'NEW CHAPTER!',
      congrats: 'Get into university or get a job.',
      reward: '+10 Mood',
      rewardValues: { mood: 10 },
      check: (s, d, card, choice) => {
        if (!card || choice !== 'yes') return false;
        return (
          card.prompt === "You get into university." || 
          card.prompt === "You get your first full-time job."
        );
      }
    },
    {
      id: 'side_hustle',
      label: 'SIDE HUSTLE',
      congrats: 'Work a part-time job while studying.',
      reward: '+5 Money',
      rewardValues: { money: 5 },
      check: (s, d, card, choice) => {
        if (!card || choice !== 'yes') return false;
        return card.prompt === "You need money for university.";
      }
    },
    {
      id: 'become_rich',
      label: 'BECOME RICH!!!',
      congrats: 'Claim your earnings!',
      reward: '+10 Money',
      rewardValues: { money: 10 },
      check: (s, d, card, choice) => {
        if (!card) return false;
        const cardValues = choice === 'yes' ? card.yesValues : card.noValues;
        const isSaveChoice = (card.prompt === "Your first salary arrives." && choice === 'yes');
        const earnedHighMoney = cardValues && cardValues.money >= 30;
        return isSaveChoice || earnedHighMoney;
      }
    },
    {
      id: 'golden_child',
      label: 'GOLDEN CHILD',
      congrats: "You are the family's pride!",
      reward: '+10 Relationship',
      rewardValues: { relationship: 10 },
      check: (s, d, card, choice) => {
        if (!card || choice !== 'yes') return false;
        const targetPrompts = [
          "You get into university.",
          "You graduate from university.",
          "Mum calls. You haven't called for three days.",
          "You get your first full-time job."
        ];
        return targetPrompts.includes(card.prompt);
      }
    },
    {
      id: 'burnout',
      label: 'BURNOUT',
      congrats: 'Welcome to the rat race~!',
      reward: '-10 Fitness',
      rewardValues: { fitness: -10 },
      check: s => s.Fitness < 30 || s.Mood < 30
    },
    {
      id: 'best_choice',
      label: 'BEST CHOICE!',
      congrats: 'To a long and healthy life~',
      reward: '+5 Fitness, +5 Mood',
      rewardValues: { fitness: 5, mood: 5 },
      check: (s, d, card, choice) => {
        if (!card || choice !== 'yes') return false;
        return (
          card.prompt === "You haven't slept well for weeks." ||
          card.prompt === "You can't handle things alone anymore."
        );
      }
    },
    {
      id: 'bad_influence',
      label: 'BAD INFLUENCE',
      congrats: "You're notorious for being a gangster!",
      reward: '-10 Relationship, -10 Money',
      rewardValues: { relationship: -10, money: -10 },
      check: (s, d, card, choice, history, labels) => {
        const gangsterCount = labels.filter(l => l.toLowerCase() === 'gangster').length;
        return gangsterCount > 0 && gangsterCount % 3 === 0 && history.lastGangsterCount !== gangsterCount;
      }
    },
    {
      id: 'jellyfish',
      label: 'JELLYFISH<333',
      congrats: 'So spineless, so weak-willed~~~',
      reward: '-5 Mood',
      rewardValues: { mood: -5 },
      check: (s, d, card, choice, history, labels) => {
        const targetLabels = ['dependent', 'influenced', 'weak', 'submissive', 'indulgent'];
        const totalMatchingLabels = labels.filter(l => targetLabels.includes(l.toLowerCase())).length;
        return totalMatchingLabels >= 3 && !history.unlockedJellyfish;
      }
    },
    {
      id: 'adulthood_30',
      label: '30 DAYS OF ADULTHOOD!',
      congrats: 'You survived another month on your own!',
      reward: '+5 All Stats',
      rewardValues: { fitness: 5, mood: 5, money: 5, relationship: 5 },
      check: (s, d, card, choice, history) => {
        const completedYears = Math.floor(d / 365);
        return completedYears > 0 && completedYears > history.lastAdulthoodYearCount;
      }
    },
    {
      id: 'second_chance',
      label: 'SECOND CHANCE',
      congrats: 'Time from rehab to sobriety?',
      reward: '+5 All Stats',
      rewardValues: { fitness: 5, mood: 5, money: 5, relationship: 5 },
      check: (s, d, card, choice, history, labels) => {
        const recoveringCount = labels.filter(l => l.toLowerCase() === 'recovering').length;
        return recoveringCount > (history.lastRecoveringCount || 0);
      }
    },
    {
      id: 'crime_boss',
      label: 'CRIME BOSS',
      congrats: 'The police have tracked you down again.',
      reward: '-5 All Stats',
      rewardValues: { fitness: -5, mood: -5, money: -5, relationship: -5 },
      check: (s, d, card, choice, history, labels) => {
        const criminalCount = labels.filter(l => l.toLowerCase() === 'criminal').length;
        return criminalCount > 0 && criminalCount % 2 === 0 && history.lastCriminalCount !== criminalCount;
      }
    },
    {
      id: 'final_boss',
      label: 'FINAL BOSS',
      congrats: 'A priority target',
      reward: '-10 All Stats',
      rewardValues: { fitness: -10, mood: -10, money: -10, relationship: -10 },
      check: (s, d, card, choice, history, labels) => {
        const hasGangster = labels.some(l => l.toLowerCase() === 'gangster');
        const hasDependent = labels.some(l => l.toLowerCase() === 'dependent');
        return hasGangster && hasDependent && s.Money >= 80;
      }
    },
    {
      id: 'pinnacle_of_life',
      label: 'THE PINNACLE OF LIFE',
      congrats: 'Life at its finest!',
      reward: '+5 All Stats',
      rewardValues: { fitness: 5, mood: 5, money: 5, relationship: 5 },
      check: s => s.Fitness > 80 && s.Mood > 80 && s.Money > 80 && s.Relationship > 80
    }
  ];

  /* Helper state for tracking cumulative label counters & adulthood milestones */
  let achievementHistory = {
    lastAdulthoodYearCount: 0,
    unlockedJellyfish: false,
    lastGangsterCount: 0,
    lastCriminalCount: 0,
    lastRecoveringCount: 0
  };

  function resetAchievementHistory() {
    achievementHistory = {
      lastAdulthoodYearCount: 0,
      unlockedJellyfish: false,
      lastGangsterCount: 0,
      lastCriminalCount: 0,
      lastRecoveringCount: 0
    };
  }

  function checkAchievements() {
    if (!currentCard) return;

    const accepted = resolveDir < 0;
    const choice = accepted ? 'yes' : 'no';

    for (const def of ALL_ACHIEVEMENTS) {
      if (def.check(stats, totalDays, currentCard, choice, achievementHistory, acquiredLabels)) {
        queueAchievement(def);

        if (def.id === 'adulthood_30') {
          achievementHistory.lastAdulthoodYearCount = Math.floor(totalDays / 365);
        }
        if (def.id === 'jellyfish') achievementHistory.unlockedJellyfish = true;
        if (def.id === 'bad_influence') {
          achievementHistory.lastGangsterCount = acquiredLabels.filter(l => l.toLowerCase() === 'gangster').length;
        }
        if (def.id === 'crime_boss') {
          achievementHistory.lastCriminalCount = acquiredLabels.filter(l => l.toLowerCase() === 'criminal').length;
        }
        if (def.id === 'second_chance') {
          achievementHistory.lastRecoveringCount = acquiredLabels.filter(l => l.toLowerCase() === 'recovering').length;
        }
      }
    }
  }
 
  let achievementCounts = {}; 
  let achievementLog = []; 
  let achievementPopupQueue = []; 
  let achievementPopup = null; 
  let achScrollY = 0; 
  let currentAchievementList = [...ALL_ACHIEVEMENTS]; 
 
  const PANEL_W = 250; 
  const PANEL_H = 562; 
  const HEADER_H = 36; 
  const PANEL_X = 0; 
  const PANEL_Y = DESIGN_H - PANEL_H; 
  const CONTAINER_Y = PANEL_Y + HEADER_H; 
  const CONTAINER_H = PANEL_H - HEADER_H; 
  const ITEM_H = 64; 
  const ITEM_GAP = 4; 
 
  const nameList = ['FreshGrad99', 'JamieTries', 'QuinnOnTheGrind', 'xX_NewStart_Xx']; 
  let nickname = ''; 
  let vipNumber = 0; 
  let topScoreDays = 0; 
  let avatarHue = 0; 
 
  let drawPileA = [];
  let drawPileB = [];
  let drawPileC = [];
  let sectionACount = 0;
  let sectionBCount = 0;
  let cardsPlayedCount = 0;
 
  let currentCard = null; 
  let cardState = 'entering'; 
  let cardOffset = { x: 0, y: 0 }; 
  let resolveDir = 0; 
  let resolveProgress = 0; 
  let resolveSpin = 1; 
  let enterProgress = 0; 
  let entranceType = 'flip'; 
  let slideFrom = 'left'; 
 
  let particles = []; 
  let shakeAmount = 0; 
  let gameOver = false; 
  let endReason = ''; 
  let lastDaysAdded = 0; 

  // Countdown timer variables for Play Again option
  let autoRestartTimer = 5;
  let lastTimerSecond = 0;

  const CARD_W = 170; 
  const CARD_H = 260; 
  const CARD_X = 840; 
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
    colPanel = p.color('#b3eab4'); 
    colPanelBorder = p.color('#db00ac'); 
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
  }; 
 
  p.draw = () => { 
    p.clear(); 
    p.scale(p.width / DESIGN_W); 
    p.translate(0, CONTENT_OFFSET_Y); 

    if (gameState === 'START') {
      drawOpeningScreen();
      return;
    }
 
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

  /* ========================================================================== 
   OPENING SCREEN
   ========================================================================== */ 

function getStartButtonBounds() {
  // Corrected coordinates including the +40 visual offset
  return {
    x: DESIGN_W / 2,
    y: DESIGN_H / 2 + 100, 
    w: 320,
    h: 70
  };
}

function drawOpeningScreen() {
  const ctx = p.drawingContext;

  const grad = ctx.createLinearGradient(0, 0, DESIGN_W, DESIGN_H);
  grad.addColorStop(0, '#460087');
  grad.addColorStop(0.33, '#ff00c8');
  grad.addColorStop(0.66, '#F7CD26');
  grad.addColorStop(1, '#b3eab4');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

  p.textAlign(p.CENTER, p.CENTER);

  p.textFont('Arial');
  p.textSize(32);
  p.textStyle(p.BOLD);
  p.strokeWeight(3);
  p.fill(255);
  p.stroke('#c6109f');
  p.text("Wonder how others view your character?", DESIGN_W / 2, DESIGN_H / 2 - 80);

  p.textFont('Georgia');
  p.textSize(40);
  p.textStyle(p.BOLD);
  p.noStroke();
  p.strokeWeight(3);
  p.fill('#3700C0');
  p.text("Play ✦ LIFE RUSH! ✦ to see what they see!", DESIGN_W / 2, DESIGN_H / 2 - 20);

  const btn = getStartButtonBounds();
  const mx = p.mouseX * (DESIGN_W / p.width);
  const my = p.mouseY * (DESIGN_H / p.height);

  const isHover = mx > btn.x - btn.w / 2 && mx < btn.x + btn.w / 2 &&
                  my > btn.y - btn.h / 2 && my < btn.y + btn.h / 2;

  const pulseScale = 1 + p.sin(p.frameCount * 0.06) * 0.03;

  p.push();
  p.translate(btn.x, btn.y);
  p.scale(pulseScale);

  let btnGrad = ctx.createLinearGradient(0, -btn.h / 2, 0, btn.h / 2);
  if (isHover) {
    btnGrad.addColorStop(0, '#ff2a8d');
    btnGrad.addColorStop(1, '#9a00e6');
  } else {
    btnGrad.addColorStop(0, '#a8ff2e');
    btnGrad.addColorStop(1, '#f3f712');
  }

  ctx.fillStyle = btnGrad;
  roundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, btn.h / 2);
  ctx.fill();

  ctx.strokeStyle = '#db00ac';
  ctx.lineWidth = 3;
  ctx.stroke();

  p.textFont('Arial');
  p.textSize(22);
  p.textStyle(p.BOLD);
  p.noStroke();
  p.fill(isHover ? '#FFFFFF' : '#0a3d00');
  p.text("Create Your Profile", 0, 0);

  p.pop();
}

// Global click listener directly on the canvas element
window.addEventListener('click', (e) => {
  const btn = getStartButtonBounds();
  const mx = p.mouseX * (DESIGN_W / p.width);
  const my = p.mouseY * (DESIGN_H / p.height);

  const isClicked = mx > btn.x - btn.w / 2 && mx < btn.x + btn.w / 2 &&
                    my > btn.y - btn.h / 2 && my < btn.y + btn.h / 2;

  if (isClicked) {
    const snd = new Audio('designed-sounds/COMM2754-2026-S2-A3w12-BeyondTheLabel-scored.wav');
    snd.play().catch(err => console.error("Audio blocked or file not found at path:", err));
  }
});

  /* ========================================================================== 
   GAME CONTROLS & LOGIC 
   ========================================================================== */
  function randomizeCosmetics() { 
    nickname = p.random(nameList); 
    vipNumber = Math.floor(p.random(1, 999)); 
    topScoreDays = Math.floor(p.random(40, 400)); 
    avatarHue = p.random(360); 
  } 

  function startNewGame() { 
    resetAchievementHistory();

    stats = { 
      Fitness: Math.floor(p.random(50, 76)), 
      Mood: Math.floor(p.random(50, 76)), 
      Money: Math.floor(p.random(50, 76)), 
      Relationship: Math.floor(p.random(50, 76)) 
    }; 

    displayStats = { ...stats }; 
    lastDelta = { Fitness: 0, Mood: 0, Money: 0, Relationship: 0 }; 

    totalDays = 0; 
    age = 18; 
    cardsPlayedCount = 0;
    sectionACount = 0;
    sectionBCount = 0;

    acquiredLabels = p.shuffle([...ALL_STAGE1_LABELS]).slice(0, 8);

    drawPileA = p.shuffle([...Array(EVENTS_SECTION_A.length).keys()]);
    drawPileB = p.shuffle([...Array(EVENTS_SECTION_B.length).keys()]);
    drawPileC = p.shuffle([...Array(EVENTS_SECTION_C.length).keys()]);

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

    autoRestartTimer = 5;
    lastTimerSecond = p.millis();

    drawNextCard(); 
  } 

  function drawNextCard() { 
    let evt;
    let chosenSection;

    if (sectionACount < 3) {
      chosenSection = 'A';
    } else if (sectionBCount < 3) {
      let options = ['A', 'B'];
      chosenSection = options[Math.floor(p.random(options.length))];
    } else {
      let options = ['A', 'B', 'C'];
      chosenSection = options[Math.floor(p.random(options.length))];
    }

    if (chosenSection === 'A') {
      if (drawPileA.length === 0) {
        drawPileA = p.shuffle([...Array(EVENTS_SECTION_A.length).keys()]);
      }
      let index = drawPileA.pop();
      evt = EVENTS_SECTION_A[index];
      sectionACount++;
    } else if (chosenSection === 'B') {
      if (drawPileB.length === 0) {
        drawPileB = p.shuffle([...Array(EVENTS_SECTION_B.length).keys()]);
      }
      let index = drawPileB.pop();
      evt = EVENTS_SECTION_B[index];
      sectionBCount++;
    } else if (chosenSection === 'C') {
      if (drawPileC.length === 0) {
        drawPileC = p.shuffle([...Array(EVENTS_SECTION_C.length).keys()]);
      }
      let index = drawPileC.pop();
      evt = EVENTS_SECTION_C[index];
    }

    currentCard = { ...evt }; 
    cardState = 'entering'; 
    enterProgress = 0; 
    cardOffset = { x: 0, y: 0 }; 

    let animationTypes = ['flip', 'bounce', 'spin', 'slide'];
    entranceType = animationTypes[Math.floor(p.random(animationTypes.length))]; 
    
    let directions = ['left', 'right', 'top'];
    slideFrom = directions[Math.floor(p.random(directions.length))]; 
  } 

  function applyEffects(effects, labels) { 
    if (labels && labels.length > 0) {
      acquiredLabels.push(...labels);
    }

    const mapping = { fitness: 'Fitness', mood: 'Mood', money: 'Money', relationship: 'Relationship' };
    for (const key in effects) {
      const statKey = mapping[key];
      if (!statKey) continue;
      const delta = effects[key];
      lastDelta[statKey] = delta !== 0 ? delta : lastDelta[statKey]; 

      if (delta !== 0) { 
        stats[statKey] = p.max(0, stats[statKey] + delta); 
        if (Math.abs(delta) >= 8) shakeAmount = p.max(shakeAmount, 6); 
      } 
    }
  } 

  function checkGameOver() { 
    for (const statKey of STAT_KEYS) { 
      if (stats[statKey] <= 0) { 
        gameOver = true; 
        endReason = `Your ${STAT_LABEL[statKey]} hit rock bottom.`; 
        autoRestartTimer = 8;
        lastTimerSecond = p.millis();
        return; 
      } 
    } 
  } 

  function resolveCard(direction) { 
    if (cardState !== 'idle' && cardState !== 'dragging') return; 

    resolveDir = direction; 
    resolveProgress = 0; 
    resolveSpin = p.random(0.7, 1.4); 
    cardState = 'resolving'; 

    if (swipeSound) { 
      if (swipeSound.isPlaying()) swipeSound.stop(); 
      swipeSound.play(); 
    } 

    const accepted = direction < 0; 

    const effects = accepted ? currentCard.yesValues : currentCard.noValues; 
    const newLabels = accepted ? currentCard.yesLabels : currentCard.noLabels;

    applyEffects(effects, newLabels); 

    lastDaysAdded = Math.floor(p.random(17, 30)); 
    totalDays += lastDaysAdded; 
    age = 18 + Math.floor(totalDays / 365); 
    cardsPlayedCount++;

    checkAchievements(); 

    const burstCol = accepted ? colAccept : colReject; 
    spawnParticles(CARD_X + cardOffset.x, CARD_Y + cardOffset.y, burstCol); 
  } 

  function queueAchievement(def) { 
    achievementCounts[def.id] = (achievementCounts[def.id] || 0) + 1; 
    const entry = { id: def.id, label: def.label, day: totalDays, count: achievementCounts[def.id] }; 
    achievementLog.unshift(entry); 
    achievementPopupQueue.push(entry); 

    if (def.rewardValues) {
      applyEffects(def.rewardValues, []);
    }

    const index = currentAchievementList.findIndex(a => a.id === def.id); 
    if (index !== -1) { 
      const [achItem] = currentAchievementList.splice(index, 1); 
      currentAchievementList.unshift(achItem); 
    } 
    achScrollY = 0; 
  } 

  function drawAchievementPopup() { 
    if (!achievementPopup && achievementPopupQueue.length > 0) { 
      achievementPopup = { ...achievementPopupQueue.shift(), timer: 0, total: 170 }; 
      if (achievementSound) { 
        if (achievementSound.isPlaying()) achievementSound.stop(); 
        achievementSound.play(); 
      } 
    } 
    if (!achievementPopup) return; 

    achievementPopup.timer++; 
    const t = achievementPopup.timer / achievementPopup.total; 
    const slide = t < 0.15 ? easeOutBack(t / 0.15) : (t > 0.85 ? 1 - easeInQuad((t - 0.85) / 0.15) : 1); 

    const boxW = 380, boxH = 68; 
    const x = DESIGN_W - 20 - boxW * slide; 
    const y = 16; 

    p.push();
    p.rectMode(p.CORNER);

    const ctx = p.drawingContext; 
    let popGrad = ctx.createLinearGradient(x, y, x + boxW, y + boxH); 
    popGrad.addColorStop(0, '#2e0054'); 
    popGrad.addColorStop(0.5, '#5c00a3'); 
    popGrad.addColorStop(1, '#8a00e6'); 

    ctx.fillStyle = popGrad; 
    ctx.fillRect(x, y, boxW, boxH); 

    ctx.strokeStyle = '#db00ac'; 
    ctx.lineWidth = 3; 
    ctx.strokeRect(x, y, boxW, boxH); 

    p.textAlign(p.LEFT, p.TOP); 
    p.textFont('Georgia'); 
    p.textSize(12); 
    p.textStyle(p.BOLD); 
    p.fill('#FFF56D'); 
    p.text('★ ACHIEVEMENT UNLOCKED! ★', x + 16, y + 10); 

    p.textFont('Arial'); 
    p.textSize(16); 
    p.textStyle(p.BOLD); 
    
    p.fill(0, 180);
    p.text(achievementPopup.label, x + 17, y + 27);

    p.fill(255); 
    p.text(achievementPopup.label, x + 16, y + 26); 

    p.textFont('Arial');
    p.textStyle(p.NORMAL); 
    p.textSize(12); 
    p.fill('#E0D0FF'); 
    p.text('Day ' + achievementPopup.day + ' • Earned ' + achievementPopup.count + ' time' + (achievementPopup.count > 1 ? 's' : ''), x + 16, y + 46); 

    p.pop();

    if (achievementPopup.timer >= achievementPopup.total) achievementPopup = null; 
  } 

  function drawEncouragementAndCard() { 
    p.rectMode(p.CORNER); 

    let leftGlow = 0, rightGlow = 0; 
    if (cardState === 'dragging' || cardState === 'resolving') { 
      leftGlow = p.constrain(-cardOffset.x / DRAG_THRESHOLD, 0, 1); 
      rightGlow = p.constrain(cardOffset.x / DRAG_THRESHOLD, 0, 1); 
    } 

    const pulse = p.sin(p.frameCount * 0.08) * 4; 
    p.textFont('Arial'); 
    p.textStyle(p.BOLD); 

    p.push(); 
    p.translate(690 + pulse * 0.5, SWIPE_LEFT_Y); 
    p.noStroke(); 
    p.fill(83, 166, 67, 210 + leftGlow * 45); 
    p.rect(-10, -18, 215, 36, 4); 
    p.fill(255); 
    p.textSize(13); 
    p.textAlign(p.CENTER, p.CENTER); 
    const yesText = currentCard ? `← ${currentCard.yesText.toUpperCase()}` : '← SWIPE LEFT';
    p.text(yesText, 97, 0); 
    p.pop(); 

    p.push(); 
    p.translate(940 + pulse * 0.5, SWIPE_RIGHT_Y); 
    p.noStroke(); 
    p.fill(55, 0, 192, 210 + rightGlow * 45); 
    p.rect(-225, -18, 235, 36, 4); 
    p.fill(255); 
    p.textSize(13); 
    p.textAlign(p.CENTER, p.CENTER); 
    const noText = currentCard ? `${currentCard.noText.toUpperCase()} →` : 'SWIPE RIGHT →';
    p.text(noText, -107, 0); 
    p.pop(); 

    p.textStyle(p.NORMAL); 
  } 

  function drawCardOnTop() { 
    if (!currentCard) return; 

    p.push(); 
    let x = CARD_X, y = CARD_Y; 
    let rot = 0, scaleAmt = 1, flipSquish = 1; 
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
        if (slideFrom === 'left') x = p.lerp(CARD_X - 400, CARD_X, e); 
        else if (slideFrom === 'right') x = p.lerp(CARD_X + 400, CARD_X, e); 
        else y = p.lerp(CARD_Y - 300, CARD_Y, e); 
      } 
    } else if (cardState === 'dragging' || cardState === 'idle') { 
      x += cardOffset.x; 
      y += cardOffset.y; 
      rot = p.radians(p.constrain((cardOffset.x / DRAG_THRESHOLD) * 12, -12, 12)); 
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

    let dragAmt = 0, dir = 0; 
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

    const ctx = p.drawingContext; 
    let cardGrad = ctx.createLinearGradient(0, -CARD_H / 2, 0, CARD_H / 2); 
    cardGrad.addColorStop(0.1013, '#33ff58'); 
    cardGrad.addColorStop(0.5542, '#339947'); 
    cardGrad.addColorStop(0.9519, '#f7cd26'); 

    ctx.save(); 
    roundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 0); 
    ctx.fillStyle = cardGrad; 
    ctx.fill(); 
    ctx.strokeStyle = '#f7cd26'; 
    ctx.lineWidth = 6; 
    ctx.stroke(); 
    ctx.restore(); 

    if (dragAmt > 0) { 
      p.noStroke(); 
      const tintCol = dir < 0 ? colAccept : colReject; 
      p.fill(p.red(tintCol), p.green(tintCol), p.blue(tintCol), dragAmt * 90); 
      p.rect(0, 0, CARD_W, CARD_H, 0); 
    } 

    p.stroke('#fffbe7');
    p.strokeWeight(2.5); 
    p.fill(80, 25, 100); 
    p.textAlign(p.CENTER, p.CENTER); 
    p.textSize(22); 
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
      p.textSize(16); 
      p.textStyle(p.BOLD); 
      p.text(resolveDir < 0 ? 'ACCEPT' : 'DECLINE', 0, 62); 
      p.pop(); 
    } 

    p.pop(); 
  } 

  /* ========================================================================== 
     MOUSE EVENTS 
     ========================================================================== */ 
  p.mousePressed = () => { 
    const mx = p.mouseX * (DESIGN_W / p.width); 
    const my = p.mouseY * (DESIGN_H / p.height); 

    if (gameState === 'START') {
      const btn = getStartButtonBounds();
      if (mx > btn.x - btn.w / 2 && mx < btn.x + btn.w / 2 &&
          my > btn.y - btn.h / 2 && my < btn.y + btn.h / 2) {
        gameState = 'PLAYING';
        startNewGame();
      }
      return;
    }

    if (gameOver) { 
      if (isOverRestartButton(mx, my)) { 
        // Clear active popups & reset internal flags
        if (typeof HydraAdsSystem !== 'undefined') {
          HydraAdsSystem.clearAll();
        }

        randomizeCosmetics(); 
        startNewGame(); 

        // Start popup escalation sequence
        if (typeof HydraAdsSystem !== 'undefined') {
          HydraAdsSystem.startEscalationSequence();
        }
      } 
      return; 
    } 

    const av = avatarPanelBounds(); 
    if (mx > av.x && mx < av.x + 48 && my > av.y && my < av.y + 48) { 
      nickname = p.random(nameList.filter(n => n !== nickname)); 
      return; 
    } 

    if (cardState !== 'idle') return; 

    if (pointInCard(mx, my)) { 
      cardState = 'dragging'; 
    } 
  };

  p.mouseDragged = () => { 
    if (cardState !== 'dragging') return; 
    const scaleFactor = DESIGN_W / p.width; 
    cardOffset.x += p.movedX * scaleFactor; 
    cardOffset.y += p.movedY * 0.3 * scaleFactor; 
    cardOffset.y = p.constrain(cardOffset.y, -40, 40); 
  }; 

  p.mouseReleased = () => { 
    if (cardState !== 'dragging') return; 
    if (Math.abs(cardOffset.x) > DRAG_THRESHOLD) { 
      resolveCard(cardOffset.x > 0 ? 1 : -1); 
    } else { 
      cardState = 'idle'; 
    } 
  }; 

  p.mouseWheel = (event) => { 
    if (gameState !== 'PLAYING') return false;
    const mx = p.mouseX * (DESIGN_W / p.width); 
    const my = p.mouseY * (DESIGN_H / p.height); 

    if (mx >= PANEL_X && mx <= PANEL_X + PANEL_W && my >= CONTAINER_Y && my <= CONTAINER_Y + CONTAINER_H) { 
      const maxScroll = Math.max(0, currentAchievementList.length * (ITEM_H + ITEM_GAP) - CONTAINER_H); 
      achScrollY = p.constrain(achScrollY + event.delta * 0.5, 0, maxScroll); 
    } 
    return false; 
  }; 

  /* ========================================================================== 
     UTILITY & DRAW HELPERS
     ========================================================================== */ 
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
        life: 40, col 
      }); 
    } 
  } 

  function updateParticles() { 
    for (let i = particles.length - 1; i >= 0; i--) { 
      const pt = particles[i]; 
      pt.x += pt.vx; pt.y += pt.vy; 
      pt.vy += 0.25; pt.rot += pt.vrot; 
      pt.life--; 
      if (pt.life <= 0) particles.splice(i, 1); 
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
    ctx.fillStyle = g; ctx.fill(); 
    ctx.strokeStyle = '#3700C0'; ctx.lineWidth = 2; ctx.stroke(); 
    ctx.restore(); 

    const px = h * 0.55, py = h * 0.25; 
    const bx = x + px, by = y + py; 
    const bw = w - px * 2, bh = h - py * 2; 

    let paper = ctx.createLinearGradient(0, by, 0, by + bh); 
    paper.addColorStop(0.0865, '#FFF'); 
    paper.addColorStop(0.4231, '#D9D9D9'); 
    paper.addColorStop(1, '#F5F5F5'); 

    ctx.save(); 
    roundedRect(bx, by, bw, bh, bh / 2); 
    ctx.fillStyle = paper; ctx.fill(); 
    ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; ctx.stroke(); 
    ctx.restore(); 

    const amount = p.constrain(val / 100, 0, 1); 
    let fillGrad = ctx.createLinearGradient(0, by, 0, by + bh); 

    if (type === 'Fitness') { 
      fillGrad.addColorStop(0, '#FFFFFF'); fillGrad.addColorStop(0.35, '#c7c7c7'); fillGrad.addColorStop(1, '#666666'); 
    } else if (type === 'Mood') { 
      fillGrad.addColorStop(0, '#FFE5FA'); fillGrad.addColorStop(0.35, '#c124f9'); fillGrad.addColorStop(1, '#5900ff'); 
    } else if (type === 'Money') { 
      fillGrad.addColorStop(0, '#FFFFD1'); fillGrad.addColorStop(0.35, '#ffd900'); fillGrad.addColorStop(1, '#d67d00'); 
    } else if (type === 'Relationship') { 
      fillGrad.addColorStop(0, '#D7FFDE'); fillGrad.addColorStop(0.35, '#62FF7C'); fillGrad.addColorStop(1, '#00C83A'); 
    } 

    ctx.save(); 
    roundedRect(bx, by, bw, bh, bh / 2); 
    ctx.clip(); 
    ctx.fillStyle = fillGrad; 
    ctx.fillRect(bx, by, bw * amount, bh); 
    ctx.restore(); 
  } 

  function drawMeters() { 
    p.rectMode(p.CORNER); 
    const boxW = 110, gap = 12, top = 1, barH = 20; 

    STAT_KEYS.forEach((statKey, i) => { 
      displayStats[statKey] = p.lerp(displayStats[statKey], stats[statKey], 0.12); 
      const x = 20 + i * (boxW + gap); 
      p.noStroke(); 
      p.fill('#3700C0'); 
      p.textFont('Arial'); p.textStyle(p.BOLD); p.textSize(18); 
      p.textAlign(p.LEFT, p.BOTTOM); 
      p.text(statKey.toUpperCase(), x, top + 26); 

      drawValueContainer(x, top + 30, boxW, barH, displayStats[statKey], statKey); 

      if (lastDelta[statKey] !== 0) { 
        p.textAlign(p.LEFT, p.TOP); 
        p.textSize(13); p.textStyle(p.BOLD); 
        p.fill(lastDelta[statKey] > 0 ? colAccept : colReject); 
        p.text((lastDelta[statKey] > 0 ? '+' : '') + lastDelta[statKey], x, top + 30 + barH + 4); 
      } 
    }); 
    p.textAlign(p.CENTER, p.CENTER); 
  } 

  function avatarPanelBounds() { return { x: 15, y: 80, w: 215, h: 82 }; } 

  function drawAvatarPanel() { 
    const b = avatarPanelBounds(); 
    p.rectMode(p.CORNER); 
    p.noStroke(); p.fill(245, 230); 
    p.rect(b.x, b.y, 48, 48, 6); 

    p.push(); 
    p.colorMode(p.HSB, 360, 100, 100); 
    p.fill(avatarHue, 55, 90); 
    p.colorMode(p.RGB, 255); 
    p.noStroke(); 
    p.circle(b.x + 24, b.y + 24, 36); 
    p.pop(); 

    p.fill(colInkFaint); p.textSize(9); 
    p.textAlign(p.CENTER, p.CENTER); 
    p.text('image\nplaceholder', b.x + 24, b.y + 24); 

    p.textAlign(p.LEFT, p.TOP); p.textFont('Arial'); 
    p.fill(colInk); p.textSize(15); p.textStyle(p.BOLD); 
    p.text(nickname, b.x + 58, b.y); 

    p.textStyle(p.NORMAL); p.textSize(11); p.fill(colInkFaint); 
    p.text('(click avatar to reroll)', b.x + 58, b.y + 18); 

    p.fill(colPurpleDark); p.textSize(12); p.textStyle(p.BOLD); 
    p.text('VIP ' + vipNumber, b.x + 58, b.y + 36); 

    p.fill(colInkFaint); p.textSize(12); p.textStyle(p.NORMAL); 
    p.text('Top score: ' + topScoreDays + ' days', b.x + 58, b.y + 54); 
    p.textAlign(p.CENTER, p.CENTER); 
  } 

  function drawAchievementBoard() { 
    const ctx = p.drawingContext; 
    p.rectMode(p.CORNER); 

    const headerGrad = ctx.createLinearGradient(PANEL_X, PANEL_Y, PANEL_X + PANEL_W, PANEL_Y + HEADER_H); 
    headerGrad.addColorStop(0.00, '#7355BD'); 
    headerGrad.addColorStop(0.35, '#3700C0'); 
    headerGrad.addColorStop(0.70, '#8A2BE2'); 
    headerGrad.addColorStop(1.00, '#F7CD26'); 

    ctx.fillStyle = headerGrad; 
    ctx.fillRect(PANEL_X, PANEL_Y, PANEL_W, HEADER_H); 

    p.fill(255, 250, 205); 
    p.textFont('Georgia'); p.textSize(16); p.textStyle(p.BOLD); 
    p.textAlign(p.CENTER, p.CENTER); 
    p.text('YOUR ACHIEVEMENTS!', PANEL_X + PANEL_W / 2, PANEL_Y + HEADER_H / 2); 

    p.noStroke(); p.fill('#f7efca'); 
    p.rect(PANEL_X, CONTAINER_Y, PANEL_W, CONTAINER_H); 

    p.stroke('#db00ac'); p.strokeWeight(3); p.noFill(); 
    p.rect(PANEL_X, PANEL_Y, PANEL_W, PANEL_H); 

    p.push(); 
    ctx.save(); 
    ctx.beginPath(); 
    ctx.rect(PANEL_X, CONTAINER_Y, PANEL_W, CONTAINER_H); 
    ctx.clip(); 

    currentAchievementList.forEach((ach, i) => { 
      const iy = CONTAINER_Y + i * (ITEM_H + ITEM_GAP) - achScrollY; 
      if (iy + ITEM_H < CONTAINER_Y || iy > CONTAINER_Y + CONTAINER_H) return; 

      const count = achievementCounts[ach.id] || 0; 
      const isUnlocked = count > 0; 

      const itemGrad = ctx.createLinearGradient(PANEL_X + 6, iy, PANEL_X + PANEL_W - 6, iy + ITEM_H); 
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

      p.noStroke(); p.textFont('Arial'); p.textAlign(p.LEFT, p.TOP); 
      p.fill(isUnlocked ? '#3700C0' : '#4A4A4A'); 
      p.textSize(13); p.textStyle(p.BOLD); 
      p.text(ach.label, PANEL_X + 12, iy + 6); 

      p.textStyle(p.NORMAL); p.fill(isUnlocked ? '#2D3748' : '#718096'); 
      p.textSize(11); 
      p.text(ach.congrats, PANEL_X + 12, iy + 22, PANEL_W - 24); 

      p.textAlign(p.LEFT, p.BOTTOM); p.textSize(12); 
      p.fill(isUnlocked ? '#D97706' : '#9CA3AF'); p.textStyle(p.BOLD); 
      p.text('Reward: ' + (isUnlocked ? ach.reward : '?'), PANEL_X + 12, iy + ITEM_H - 5); 

      p.textAlign(p.RIGHT, p.BOTTOM); 
      p.fill(isUnlocked ? '#059669' : '#9CA3AF'); p.textSize(11); p.textStyle(p.BOLD); 
      p.text(count + ' achieved', PANEL_X + PANEL_W - 12, iy + ITEM_H - 5); 
    }); 

    ctx.restore(); 
    p.pop(); 
    p.textAlign(p.CENTER, p.CENTER); 
  } 

  function drawDaysAgeBox() { 
    p.rectMode(p.CORNER); 
    p.fill('#d6ecc6'); p.stroke('#F7CD26'); p.strokeWeight(2); 
    p.rect(740, 597, 100, 75); 

    p.noStroke(); p.fill(60); p.textSize(14); p.textStyle(p.BOLD); 
    p.textAlign(p.CENTER, p.CENTER); 
    p.text('DAYS', 790, 617); 
    p.textSize(26); p.text(totalDays, 790, 646); 

    p.fill('#f9e6f1'); p.stroke('#53a643'); p.strokeWeight(2); 
    p.rect(850, 597, 100, 75); 

    p.noStroke(); p.fill(60); p.textSize(14); p.textStyle(p.BOLD); 
    p.text('AGE', 900, 617); 
    p.textSize(26); p.text(age, 900, 646); 
    p.textStyle(p.NORMAL); 
  } 

  function easeInQuad(t) { return t * t; } 
  function easeOutBack(t) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); } 
  function easeOutBounce(t) { 
    const n1 = 7.5625, d1 = 2.75; 
    if (t < 1 / d1) return n1 * t * t; 
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75; 
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375; 
    else return n1 * (t -= 2.625 / d1) * t + 0.984375; 
  } 

  function updateCard() { 
    if (cardState === 'entering') { 
      enterProgress += 0.08; 
      if (enterProgress >= 1) { enterProgress = 1; cardState = 'idle'; } 
    } else if (cardState === 'idle') { 
      cardOffset.x = p.lerp(cardOffset.x, 0, 0.25); 
      cardOffset.y = p.lerp(cardOffset.y, 0, 0.25); 
    } else if (cardState === 'resolving') { 
      resolveProgress += 0.06; 
      if (resolveProgress >= 1) { 
        resolveProgress = 1; 
        checkGameOver(); 
        if (!gameOver) drawNextCard(); 
      } 
    } 
  } 

  function drawCardBack() { 
    p.rectMode(p.CENTER); p.noStroke(); p.fill(0, 0, 0, 50); 
    p.rect(5, 8, CARD_W, CARD_H, 0); 
    p.fill(60, 45, 30); p.rect(0, 0, CARD_W, CARD_H, 0); 
    p.stroke(240); p.strokeWeight(1.5); p.noFill(); 
    p.rect(0, 0, CARD_W, CARD_H, 0); 
    p.rect(-CARD_W / 2 + 12, -CARD_H / 2 + 12, CARD_W - 24, CARD_H - 24, 4); 
    p.noStroke(); p.fill(240); 
    p.push(); p.rotate(p.radians(45)); 
    p.rect(0, 0, 36, 36, 4); 
    p.pop(); 
  } 

  function pointInCard(mx, my) { 
    const x = CARD_X + cardOffset.x; 
    const y = CARD_Y + cardOffset.y; 
    return (mx > x - CARD_W / 2 && mx < x + CARD_W / 2 && my > y - CARD_H / 2 && my < y + CARD_H / 2); 
  } 

  /* ========================================================================== 
     PLAY AGAIN / GAME OVER PANEL 
     ========================================================================== */
  function drawGameOver() { 
    if (p.millis() - lastTimerSecond >= 1000) {
      lastTimerSecond = p.millis();
      autoRestartTimer--;
      if (autoRestartTimer <= 0) {
        randomizeCosmetics();
        startNewGame();
        return;
      }
    }

    p.rectMode(p.CENTER); 
    p.noStroke(); 
    p.fill(0, 0, 0, 180); 
    p.rectMode(p.CORNER); 
    p.rect(0, 0, DESIGN_W, DESIGN_H); 
    p.rectMode(p.CENTER); 

    p.fill(colPanel); 
    p.stroke(colPanelBorder); 
    p.strokeWeight(3); 
    p.rect(DESIGN_W / 2, DESIGN_H / 2, 500, 280, 16); 

    p.textFont('Arial'); 
    p.textAlign(p.CENTER, p.CENTER); 

    p.noStroke(); 
    p.fill(colPurpleDark); 
    p.textSize(36); 
    p.textStyle(p.BOLD); 
    p.text('✦ LIFE RUSH! ✦', DESIGN_W / 2, DESIGN_H / 2 - 85); 

    p.fill(colInkFaint); 
    p.textSize(16); 
    p.textStyle(p.BOLD); 
    p.text(`${nickname} finished at ${totalDays} days, ${age} years old`, DESIGN_W / 2, DESIGN_H / 2 - 35); 

    p.fill('#c6109f'); 
    p.textSize(22); 
    p.textStyle(p.BOLD); 
    p.textFont('Georgia');
    p.text('What do you see beyond the label?', DESIGN_W / 2, DESIGN_H / 2 + 10); 

    const btnY = DESIGN_H / 2 + 75; 
    const mx = p.mouseX * (DESIGN_W / p.width); 
    const my = p.mouseY * (DESIGN_H / p.height); 
    const isHover = isOverRestartButton(mx, my); 

    p.fill(isHover ? colPurpleDark : colPurple); 
    p.noStroke(); 
    p.rect(DESIGN_W / 2, btnY, 260, 48, 8); 

    p.fill(255); 
    p.textSize(16); 
    p.textStyle(p.BOLD); 
    p.text(`PLAY AGAIN (${autoRestartTimer}s)`, DESIGN_W / 2, btnY); 
    p.textStyle(p.NORMAL); 
  } 

  function isOverRestartButton(mx, my) { 
    const btnY = DESIGN_H / 2 + 75; 
    return (mx > DESIGN_W / 2 - 130 && mx < DESIGN_W / 2 + 130 && my > btnY - 24 && my < btnY + 24); 
  } 

  window.addEventListener('click', () => {
  const mx = p.mouseX * (DESIGN_W / p.width);
  const my = p.mouseY * (DESIGN_H / p.height);

  // 1. Kiểm tra nếu click vào nút Create Your Profile (ở màn hình mở đầu)
  if (typeof getStartButtonBounds === 'function') {
    const startBtn = getStartButtonBounds();
    const isStartClicked = mx > startBtn.x - startBtn.w / 2 && mx < startBtn.x + startBtn.w / 2 &&
                           my > startBtn.y - startBtn.h / 2 && my < startBtn.y + startBtn.h / 2;
    if (isStartClicked) {
      new Audio('designed-sounds/COMM2754-2026-S2-A3w12-BeyondTheLabel-scored.wav').play().catch(() => {});
    }
  }

  if (typeof gameState !== 'undefined' && gameState === 'GAMEOVER') { 
    if (isOverRestartButton(mx, my)) {
      new Audio('designed-sounds/COMM2754-2026-S2-A3w12-BeyondTheLabel-scored.wav').play().catch(() => {});
    }
  }
});
}; 

new p5(myMainCanvasSketch);
