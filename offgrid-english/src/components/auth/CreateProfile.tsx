import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { User, Lock, Smile, Upload, Image as ImageIcon } from 'lucide-react';

const AVATARS = ['👤', '🎓', '💼', '🚀', '💡', '🌍', '💻', '🎨', '📚', '⚡', '🌟', '🎯'];

interface CreateProfileProps {
    onCancel?: () => void;
}

export function CreateProfile({ onCancel }: CreateProfileProps) {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState(AVATARS[0]);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                setError('Image size should be less than 500KB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        // PIN is now optional
        if (pin && (pin.length < 4 || pin.length > 6)) {
            setError('PIN must be 4-6 digits if provided');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        setIsSubmitting(true);
        const result = await register(name, avatar, pin);
        setIsSubmitting(false);

        if (!result.success) {
            setError(result.message || 'Failed to create profile');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Profile</h2>
                <p className="text-gray-600">Set up your offline learning profile</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Smile size={18} /> Choose Avatar</span>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                            <Upload size={14} /> Upload Photo
                        </button>
                    </label>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    <div className="grid grid-cols-6 gap-2 mb-4">
                        {AVATARS.map((a) => (
                            <button
                                key={a}
                                type="button"
                                onClick={() => setAvatar(a)}
                                className={`text-2xl p-2 rounded-lg transition-all ${avatar === a
                                    ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                                    : 'hover:bg-gray-100'
                                    }`}
                            >
                                {a}
                            </button>
                        ))}
                    </div>

                    {/* Preview Area for Custom Uploads */}
                    {avatar.startsWith('data:image') && (
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-indigo-900">Custom Photo Selected</p>
                                <button
                                    type="button"
                                    onClick={() => setAvatar(AVATARS[0])}
                                    className="text-xs text-indigo-500 hover:text-indigo-700"
                                >
                                    Remove & Use Emoji
                                </button>
                            </div>
                            <CheckCircle size={20} className="text-indigo-500" />
                        </div>
                    )}
                </div>

                {/* Name Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <User size={18} /> Name / Nickname
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your name"
                    />
                </div>

                {/* PIN Input */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Lock size={18} /> PIN (Optional)
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest"
                            placeholder="****"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm PIN
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest"
                            placeholder="****"
                            disabled={!pin}
                        />
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2"
                    >
                        <AlertCircle size={16} />
                        {error}
                    </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                    {onCancel && (
                        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
