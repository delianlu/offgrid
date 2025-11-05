import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import type { Module, CommonError } from '../types/schemas';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { APP_VERSION } from '../App';

export function ModuleLearning() {
  const { moduleId = 'tense-form' } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [errors, setErrors] = useState<CommonError[]>([]);

  useEffect(() => {
    (async () => {
      try {
        console.log(`Loading module: ${moduleId}`);

        // Ensure content is seeded
        const existing = await db.modules.count();
        console.log(`Database has ${existing} modules`);

        if (existing === 0) {
          console.log('Seeding content...');
          const { ensureSeedContent } = await import('../services/contentLoader');
          await ensureSeedContent(APP_VERSION);
        }

        // Load module
        const mod = await db.modules.get(moduleId);
        console.log(`Module loaded:`, mod);

        if (mod) {
          setModule(mod);
          setErrors(mod.commonErrors || []);
        } else {
          console.error(`Module not found: ${moduleId}`);
        }
      } catch (error) {
        console.error('Error loading module:', error);
      }
    })();
  }, [moduleId]);

  if (!module) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">📚</div>
          <p className="text-lg text-gray-700 font-medium">Loading module...</p>
        </div>
      </div>
    );
  }

  function startPractice() {
    navigate(`/practice/${moduleId}`);
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <Header title={module.name} />

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto" style={{ paddingLeft: '80px', paddingRight: '80px', paddingTop: '24px', paddingBottom: '80px', width: 'calc(100% - 160px)' }}>
        {/* Phase Badge */}
        <div className="mb-6">
          <span className="inline-block bg-orange-100 text-orange-800 text-sm font-bold px-4 py-2 rounded-full shadow-sm">
            📖 Phase 1: LEARN
          </span>
        </div>

        {/* Module Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {module.name}
          </h1>
          <div className="h-1 w-24 bg-orange-500 rounded-full"></div>
        </div>

        {/* Module Introduction */}
        {module.moduleIntroduction && (
          <section className="bg-white rounded-2xl shadow-md p-8 md:p-10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">👋</div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              {module.moduleIntroduction.split('\n\n').map((para, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed mb-3 ml-1">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Contrastive Explanation */}
        {module.contrastiveExplanation && (
          <section className="bg-white rounded-2xl shadow-md p-8 md:p-10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900">
                French vs English: Key Differences
              </h2>
            </div>
            <div className="prose prose-sm max-w-none">
              {module.contrastiveExplanation.split('\n\n').map((para, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap ml-1">
                  {para}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Common Errors */}
        {errors.length > 0 && (
          <section className="bg-white rounded-2xl shadow-md p-8 md:p-10 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Common Errors to Avoid
              </h2>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Study these {errors.length} examples showing typical mistakes and their corrections:
            </p>

            <div className="space-y-4">
              {errors.map((error) => (
                <div
                  key={error.number}
                  className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-4"
                >
                  {/* Error Number and Topic */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      #{error.number}
                    </span>
                    <span className="text-xs font-semibold text-orange-800">
                      {error.subTopic}
                    </span>
                  </div>

                  {/* Wrong vs Correct */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Wrong */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-red-700 mb-2">❌ Wrong:</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {error.wrong}
                      </p>
                    </div>

                    {/* Correct */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-green-700 mb-2">✓ Correct:</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {error.correct}
                      </p>
                    </div>
                  </div>

                  {/* French Connection */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-bold text-blue-900 mb-1">
                      💡 Why this matters:
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {error.frenchConnection}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ready to Practice */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-xl p-6 mb-6 shadow-md">
          <div className="flex items-start gap-3">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 text-xl mb-2">
                Ready to Practice?
              </h2>
              <p className="text-gray-700 mb-4">
                You've learned the grammar rules and seen common mistakes. Now it's time to test your understanding with practice questions!
              </p>
              <Button variant="success" onClick={startPractice}>
                Start Practice Questions →
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
