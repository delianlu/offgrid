import confetti from 'canvas-confetti';

export type CelebrationType =
  | 'correct'
  | 'streak'
  | 'levelUp'
  | 'moduleComplete'
  | 'perfectScore'
  | 'achievement'
  | 'milestone';

/**
 * Celebration configurations
 */
const celebrationConfigs = {
  correct: {
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#10b981', '#34d399', '#6ee7b7']
  },
  streak: {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
    startVelocity: 45
  },
  levelUp: {
    particleCount: 150,
    spread: 120,
    origin: { y: 0.5 },
    colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    startVelocity: 50,
    gravity: 0.8
  },
  moduleComplete: {
    particleCount: 200,
    spread: 160,
    origin: { y: 0.5 },
    colors: ['#ec4899', '#f472b6', '#f9a8d4'],
    startVelocity: 60,
    gravity: 0.6,
    scalar: 1.2
  },
  perfectScore: {
    particleCount: 300,
    spread: 180,
    origin: { y: 0.4 },
    colors: ['#f59e0b', '#eab308', '#fbbf24'],
    startVelocity: 70,
    gravity: 0.5,
    shapes: ['star']
  },
  achievement: {
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
    startVelocity: 40
  },
  milestone: {
    particleCount: 250,
    spread: 150,
    origin: { y: 0.5 },
    colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981'],
    startVelocity: 55,
    gravity: 0.7,
    scalar: 1.3
  }
};

/**
 * Trigger a celebration animation
 */
export function celebrate(type: CelebrationType, count: number = 1) {
  const config = celebrationConfigs[type];

  // Fire confetti burst(s)
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      confetti({
        ...config,
        angle: 90,
        ticks: 200
      });
    }, i * 300); // Stagger multiple bursts
  }
}

/**
 * Continuous confetti rain (for major celebrations)
 */
export function celebrateRain(duration: number = 3000) {
  const end = Date.now() + duration;
  const colors = ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.5 },
      colors
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.5 },
      colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Fireworks effect (for very special occasions)
 */
export function celebrateFireworks(count: number = 5) {
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 50,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: randomInRange(0.2, 0.7)
        },
        colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6']
      });
    }, i * 500);
  }
}

/**
 * Celebrate based on streak milestone
 */
export function celebrateStreak(streakDays: number) {
  if (streakDays === 0) return;

  if (streakDays % 100 === 0) {
    // Century milestone - fireworks!
    celebrateFireworks(10);
  } else if (streakDays % 50 === 0) {
    // Half-century - rain
    celebrateRain(4000);
  } else if (streakDays % 10 === 0) {
    // Every 10 days - big celebration
    celebrate('milestone', 3);
  } else if (streakDays % 5 === 0) {
    // Every 5 days - medium celebration
    celebrate('streak', 2);
  } else {
    // Every day - small celebration
    celebrate('streak', 1);
  }
}

/**
 * Celebrate based on accuracy
 */
export function celebrateAccuracy(accuracy: number) {
  if (accuracy === 100) {
    celebrate('perfectScore', 3);
  } else if (accuracy >= 90) {
    celebrate('achievement', 2);
  } else if (accuracy >= 80) {
    celebrate('correct', 1);
  }
}

/**
 * Celebrate module completion with fireworks
 */
export function celebrateModuleCompletion(moduleName: string) {
  // Big celebration with fireworks
  celebrateFireworks(7);

  // Add confetti rain for dramatic effect
  setTimeout(() => {
    celebrateRain(3000);
  }, 1000);
}

/**
 * Smart celebration based on context
 */
export function smartCelebrate(context: {
  isCorrect?: boolean;
  streak?: number;
  accuracy?: number;
  isModuleComplete?: boolean;
  isPerfectScore?: boolean;
  newAchievement?: boolean;
}) {
  const {
    isCorrect,
    streak,
    accuracy,
    isModuleComplete,
    isPerfectScore,
    newAchievement
  } = context;

  // Priority order: module complete > perfect score > achievement > streak > accuracy > correct
  if (isModuleComplete) {
    celebrateModuleCompletion('Module');
  } else if (isPerfectScore) {
    celebrate('perfectScore', 3);
  } else if (newAchievement) {
    celebrate('achievement', 2);
  } else if (streak && streak > 0) {
    celebrateStreak(streak);
  } else if (accuracy !== undefined) {
    celebrateAccuracy(accuracy);
  } else if (isCorrect) {
    celebrate('correct', 1);
  }
}
