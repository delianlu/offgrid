import { db } from '../db/database';
import { calculateModuleProgress } from './progressTracking';
import { loadAchievements } from './achievements';
import { loadChallengeStats } from './challenges';

export interface WeeklyStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number; // in minutes (estimated)
  modulesCompleted: number;
  achievementsUnlocked: number;
  dailyStreak: number;
  topModule: { name: string; accuracy: number } | null;
  weakestModule: { name: string; accuracy: number } | null;
  questionsPerDay: { [day: string]: number };
}



/**
 * Calculate weekly statistics from the last 7 days
 */
export async function calculateWeeklyStats(): Promise<WeeklyStats> {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Get all attempts from the last 7 days
  const weeklyAttempts = await db.attempts
    .where('timestamp')
    .above(oneWeekAgo)
    .toArray();

  const totalQuestions = weeklyAttempts.length;
  const correctAnswers = weeklyAttempts.filter(a => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Estimate time spent (2 minutes per question average)
  const timeSpent = totalQuestions * 2;

  // Get all modules from DB
  const modules = await db.modules.toArray();

  // Calculate modules completed
  const moduleProgress = await Promise.all(
    modules.map(m => calculateModuleProgress(m.id))
  );
  const modulesCompleted = moduleProgress.filter(
    p => p && p.badge === 'complete'
  ).length;

  // Get achievements
  const achievements = loadAchievements();
  const achievementsUnlocked = achievements.filter(a => a.unlockedAt).length;

  // Get daily streak
  const challengeStats = loadChallengeStats();
  const dailyStreak = challengeStats.currentDailyStreak;

  // Find top and weakest modules
  const moduleStats = modules.map((m, idx) => {
    const progress = moduleProgress[idx];
    return {
      name: m.name || m.id,
      accuracy: progress
        ? (progress.formAAccuracy + progress.formBAccuracy) / 2
        : 0,
    };
  }).filter(m => m.accuracy > 0);

  const topModule = moduleStats.length > 0
    ? moduleStats.reduce((max, m) => m.accuracy > max.accuracy ? m : max)
    : null;

  const weakestModule = moduleStats.length > 0
    ? moduleStats.reduce((min, m) => m.accuracy < min.accuracy ? m : min)
    : null;

  // Questions per day
  const questionsPerDay: { [day: string]: number } = {};
  weeklyAttempts.forEach(attempt => {
    const date = new Date(attempt.timestamp);
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    questionsPerDay[dayStr] = (questionsPerDay[dayStr] || 0) + 1;
  });

  return {
    totalQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy),
    timeSpent,
    modulesCompleted,
    achievementsUnlocked,
    dailyStreak,
    topModule: topModule ? { ...topModule, accuracy: Math.round(topModule.accuracy) } : null,
    weakestModule: weakestModule ? { ...weakestModule, accuracy: Math.round(weakestModule.accuracy) } : null,
    questionsPerDay,
  };
}

/**
 * Generate an HTML email report
 */
export function generateEmailReport(stats: WeeklyStats): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OffGrid English - Weekly Progress Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      border-radius: 12px 12px 0 0;
      margin: -30px -30px 30px -30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 15px;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
    }
    .stat-unit {
      font-size: 14px;
      color: #64748b;
      font-weight: normal;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .section h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #1e293b;
    }
    .progress-bar {
      background: #e2e8f0;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }
    .progress-fill {
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    .module-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .module-item:last-child {
      border-bottom: none;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    .cta-button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly Progress Report</h1>
      <p>${today}</p>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Questions Answered</div>
        <div class="stat-value">${stats.totalQuestions}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Accuracy</div>
        <div class="stat-value">${stats.accuracy}<span class="stat-unit">%</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Time Spent</div>
        <div class="stat-value">${stats.timeSpent}<span class="stat-unit">min</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Daily Streak</div>
        <div class="stat-value">${stats.dailyStreak}<span class="stat-unit">🔥</span></div>
      </div>
    </div>

    <div class="section">
      <h2>✅ Your Achievements</h2>
      <p>Modules Completed: <strong>${stats.modulesCompleted} / 7</strong></p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(stats.modulesCompleted / 7) * 100}%"></div>
      </div>
      <p style="margin-top: 15px;">Achievements Unlocked: <strong>${stats.achievementsUnlocked}</strong> 🏆</p>
    </div>

    ${stats.topModule ? `
    <div class="section">
      <h2>⭐ Top Performing Module</h2>
      <div class="module-item">
        <span>${stats.topModule.name}</span>
        <span class="badge badge-success">${stats.topModule.accuracy}% accuracy</span>
      </div>
    </div>
    ` : ''}

    ${stats.weakestModule && stats.weakestModule.accuracy < 70 ? `
    <div class="section">
      <h2>📚 Area for Improvement</h2>
      <div class="module-item">
        <span>${stats.weakestModule.name}</span>
        <span class="badge badge-warning">${stats.weakestModule.accuracy}% accuracy</span>
      </div>
      <p style="margin-top: 15px; font-size: 14px; color: #64748b;">
        💡 Tip: Try the Smart Practice feature to focus on this topic!
      </p>
    </div>
    ` : ''}

    <div class="section">
      <h2>📈 This Week's Activity</h2>
      ${Object.entries(stats.questionsPerDay).map(([day, count]) => `
        <div class="module-item">
          <span>${day}</span>
          <span><strong>${count}</strong> questions</span>
        </div>
      `).join('')}
    </div>

    <div style="text-align: center;">
      <a href="https://your-app-url.com" class="cta-button">Continue Learning →</a>
    </div>

    <div class="footer">
      <p><strong>OffGrid English</strong></p>
      <p>Keep up the great work! Consistency is key to mastering English grammar.</p>
      <p style="margin-top: 10px;">Works 100% offline • Made for Cameroonian learners</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text report
 */
export function generateTextReport(stats: WeeklyStats): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
📊 OFFGRID ENGLISH - WEEKLY PROGRESS REPORT
${today}
${'='.repeat(50)}

📈 WEEKLY STATISTICS
--------------------
Questions Answered: ${stats.totalQuestions}
Correct Answers: ${stats.correctAnswers}
Accuracy: ${stats.accuracy}%
Time Spent: ${stats.timeSpent} minutes
Daily Streak: ${stats.dailyStreak} days 🔥

✅ ACHIEVEMENTS
---------------
Modules Completed: ${stats.modulesCompleted} / 7
Achievements Unlocked: ${stats.achievementsUnlocked} 🏆

${stats.topModule ? `
⭐ TOP PERFORMING MODULE
------------------------
${stats.topModule.name}: ${stats.topModule.accuracy}% accuracy
` : ''}

${stats.weakestModule && stats.weakestModule.accuracy < 70 ? `
📚 AREA FOR IMPROVEMENT
-----------------------
${stats.weakestModule.name}: ${stats.weakestModule.accuracy}% accuracy
💡 Try the Smart Practice feature to focus on this topic!
` : ''}

📅 THIS WEEK'S ACTIVITY
-----------------------
${Object.entries(stats.questionsPerDay)
      .map(([day, count]) => `${day}: ${count} questions`)
      .join('\n')}

${'='.repeat(50)}
Keep up the great work! 🎓
  `.trim();
}
