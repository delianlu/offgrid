import type { Scenario } from '../types/schemas';

interface ScenarioBadgeProps {
  scenario: NonNullable<Scenario>;
}

export function ScenarioBadge({ scenario }: ScenarioBadgeProps) {
  return (
    <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-l-4 border-purple-500 dark:border-purple-400 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{scenario.icon}</span>
        <div>
          <h3 className="font-bold text-purple-900 dark:text-purple-100 text-sm">
            Scenario: {scenario.name}
          </h3>
          <p className="text-xs text-purple-700 dark:text-purple-200 mt-1">
            {scenario.description}
          </p>
        </div>
      </div>
    </div>
  );
}
