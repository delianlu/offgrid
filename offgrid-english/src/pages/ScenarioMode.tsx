import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScenarioChat, type ScenarioStep } from '../components/ScenarioChat';
import { Button } from '../components/common/Button';

interface Scenario {
    id: string;
    title: string;
    description: string;
    initialStepId: string;
    steps: Record<string, ScenarioStep>;
}

export function ScenarioMode() {
    const { scenarioId } = useParams();
    const navigate = useNavigate();
    const [scenario, setScenario] = useState<Scenario | null>(null);
    const [allScenarios, setAllScenarios] = useState<Scenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    useEffect(() => {
        setLoading(true);
        setCompleted(false);
        fetch('/modules/scenarios.json')
            .then(res => res.json())
            .then(data => {
                setAllScenarios(data.scenarios);
                const found = data.scenarios.find((s: Scenario) => s.id === scenarioId);
                setScenario(found || null);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load scenarios", err);
                setLoading(false);
            });
    }, [scenarioId]);

    const handleComplete = (score: number) => {
        setFinalScore(score);
        setCompleted(true);
    };

    const handleNextScenario = () => {
        const currentIndex = allScenarios.findIndex(s => s.id === scenarioId);
        if (currentIndex !== -1 && currentIndex < allScenarios.length - 1) {
            const nextScenario = allScenarios[currentIndex + 1];
            navigate(`/scenario/${nextScenario.id}`);
        } else {
            navigate('/');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Scenario...</div>;
    if (!scenario) return <div className="p-10 text-center">Scenario not found!</div>;

    if (completed) {
        const currentIndex = allScenarios.findIndex(s => s.id === scenarioId);
        const hasNext = currentIndex !== -1 && currentIndex < allScenarios.length - 1;

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Scenario Complete!</h2>
                    <p className="text-gray-600 mb-6">You finished "{scenario.title}"</p>

                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-blue-800 font-bold uppercase tracking-wide">Your Score</p>
                        <p className="text-4xl font-bold text-blue-600">{finalScore} XP</p>
                    </div>

                    <div className="space-y-3">
                        {hasNext ? (
                            <Button variant="primary" onClick={handleNextScenario} className="w-full">
                                Next Scenario →
                            </Button>
                        ) : (
                            <Button variant="primary" onClick={() => navigate('/')} className="w-full">
                                Finish & Back to Home
                            </Button>
                        )}

                        <Button variant="secondary" onClick={() => window.location.reload()} className="w-full">
                            Replay Scenario
                        </Button>

                        {hasNext && (
                            <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
                                Back to Home
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
            <div className="max-w-2xl w-full mb-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => navigate('/')} size="sm">
                    ← Back
                </Button>
            </div>

            <div className="max-w-2xl w-full h-full">
                <ScenarioChat
                    scenarioTitle={scenario.title}
                    steps={scenario.steps}
                    initialStepId={scenario.initialStepId}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
