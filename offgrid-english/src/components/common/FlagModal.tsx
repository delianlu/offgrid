import { useState } from 'react';
import { db } from '../../db/database';
import { Button } from './Button';

interface FlagModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string;
    moduleId: string;
}

export function FlagModal({ isOpen, onClose, itemId, moduleId }: FlagModalProps) {
    const [reason, setReason] = useState<'wrong' | 'confusing' | 'inappropriate' | 'other'>('wrong');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await db.flags.add({
                id: crypto.randomUUID(),
                itemId,
                moduleId,
                reason,
                comment,
                timestamp: Date.now(),
                status: 'open'
            });
            onClose();
            // Reset form
            setReason('wrong');
            setComment('');
            alert('Thank you! Your feedback has been recorded.');
        } catch (error) {
            console.error('Failed to submit flag:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🚩</span> Report an Issue
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                What's the problem?
                            </label>
                            <div className="space-y-2">
                                {[
                                    { value: 'wrong', label: 'Answer is wrong' },
                                    { value: 'confusing', label: 'Question is confusing' },
                                    { value: 'inappropriate', label: 'Culturally inappropriate' },
                                    { value: 'other', label: 'Other issue' }
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={option.value}
                                            checked={reason === option.value}
                                            onChange={(e) => setReason(e.target.value as any)}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional details (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                                placeholder="Please describe the issue..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
