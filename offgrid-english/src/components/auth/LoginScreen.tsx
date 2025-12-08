import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { CreateProfile } from './CreateProfile';
import { Button } from '../common/Button';
import { Plus, AlertCircle, Settings, X, School, CheckCircle } from 'lucide-react';
import type { UserProfile } from '../../types/schemas';

export function LoginScreen() {
    const { users, login, joinClass } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [managingUser, setManagingUser] = useState<UserProfile | null>(null);
    const [pin, setPin] = useState('');
    const [classCode, setClassCode] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedUser) return;

        setIsLoggingIn(true);
        setError('');

        const result = await login(selectedUser.id, pin);

        setIsLoggingIn(false);
        if (!result.success) {
            setError(result.message || 'Login failed');
            setPin(''); // Clear PIN on error
        }
    };

    // Auto-login if user has no PIN
    const handleUserSelect = (user: UserProfile) => {
        setSelectedUser(user);
        setPin('');
        setError('');

        if (!user.pinHash) {
            // If no PIN, login immediately
            setIsLoggingIn(true);
            login(user.id, '').then(result => {
                setIsLoggingIn(false);
                if (!result.success) {
                    setError(result.message || 'Login failed');
                }
            });
        }
    };

    const handleJoinClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!managingUser || !classCode.trim()) return;

        setIsJoining(true);
        setError('');
        setSuccessMessage('');

        const result = await joinClass(managingUser.id, classCode);

        setIsJoining(false);
        if (result.success) {
            setSuccessMessage(result.message || 'Successfully joined class!');
            setClassCode('');
        } else {
            setError(result.message || 'Failed to join class');
        }
    };

    if (isCreating) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <CreateProfile onCancel={() => setIsCreating(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-earth-900/20 w-full max-w-md p-8 relative border border-white/50 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-palm-400 via-sunshine-400 to-clay-400"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-palm-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-clay-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-earth-900 mb-2 tracking-tight">Welcome Back! 👋</h1>
                    <p className="text-earth-600 font-medium">Who is learning today?</p>
                </div>

                {/* User Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {users.map((user) => (
                        <div key={user.id} className="relative group">
                            <button
                                onClick={() => handleUserSelect(user)}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group-hover:-translate-y-1 duration-300 ${selectedUser?.id === user.id
                                    ? 'border-palm-500 bg-palm-50 shadow-md ring-2 ring-palm-200 ring-offset-2'
                                    : 'border-earth-100 hover:border-palm-300 hover:bg-white hover:shadow-lg'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-1 transition-transform group-hover:scale-110 ${selectedUser?.id === user.id ? 'bg-white shadow-sm' : 'bg-earth-50 group-hover:bg-palm-50'
                                    }`}>
                                    {user.avatar}
                                </div>
                                <span className={`font-bold truncate w-full text-center ${selectedUser?.id === user.id ? 'text-palm-700' : 'text-earth-700'
                                    }`}>
                                    {user.name}
                                </span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setManagingUser(user);
                                    setError('');
                                    setSuccessMessage('');
                                    setClassCode('');
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-earth-200 text-earth-400 hover:text-palm-600 hover:border-palm-200 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                title="Manage Profile"
                            >
                                <Settings size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Add User Button */}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-4 rounded-2xl border-2 border-dashed border-earth-300 hover:border-palm-400 hover:bg-palm-50/50 transition-all flex flex-col items-center justify-center gap-3 text-earth-500 hover:text-palm-600 group h-full min-h-[140px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-earth-100 group-hover:bg-palm-100 flex items-center justify-center transition-colors">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm">New Profile</span>
                    </button>
                </div>

                {/* PIN Entry Modal/Section */}
                <AnimatePresence>
                    {selectedUser && selectedUser.pinHash && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="overflow-hidden"
                        >
                            <form onSubmit={handleLogin} className="bg-earth-50/50 rounded-2xl p-6 border border-earth-100 shadow-inner">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">
                                        {selectedUser.avatar}
                                    </div>
                                    <div>
                                        <p className="text-xs text-earth-500 font-bold uppercase tracking-wider">Logging in as</p>
                                        <p className="font-black text-earth-900 text-lg leading-none">{selectedUser.name}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-earth-600 mb-2 uppercase tracking-wider">
                                        Enter PIN
                                    </label>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                        className="w-full p-4 rounded-xl border-2 border-earth-200 focus:border-palm-500 focus:ring-4 focus:ring-palm-500/10 outline-none font-mono tracking-[0.5em] text-center text-2xl bg-white transition-all placeholder-earth-200 text-earth-900"
                                        placeholder="••••"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-clay-600 text-sm mb-4 bg-clay-50 p-3 rounded-xl border border-clay-100 animate-shake">
                                        <AlertCircle size={16} />
                                        <span className="font-medium">{error}</span>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-4 text-lg shadow-lg shadow-palm-500/20 hover:shadow-xl hover:shadow-palm-500/30 hover:-translate-y-0.5 transition-all"
                                    disabled={isLoggingIn || pin.length < 4}
                                >
                                    {isLoggingIn ? 'Verifying...' : 'Login'}
                                </Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Manage Profile Modal */}
                {managingUser && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl rounded-3xl z-20 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-earth-900 flex items-center gap-2">
                                <Settings size={20} className="text-earth-400" />
                                Manage Profile
                            </h2>
                            <button
                                onClick={() => setManagingUser(null)}
                                className="p-2 hover:bg-earth-100 rounded-full transition-colors text-earth-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-8 p-4 bg-earth-50 rounded-2xl border border-earth-100">
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-4xl">
                                {managingUser.avatar}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-earth-900">{managingUser.name}</h3>
                                <p className="text-sm text-earth-500 capitalize font-medium bg-earth-200/50 inline-block px-2 py-0.5 rounded text-xs mt-1">{managingUser.role}</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {/* Join Class Section */}
                            <div>
                                <h3 className="text-sm font-bold text-earth-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                    <School size={16} />
                                    Join a Class
                                </h3>
                                <form onSubmit={handleJoinClass} className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={classCode}
                                            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                                            placeholder="CODE"
                                            maxLength={6}
                                            className="flex-1 px-4 py-3 border-2 border-earth-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-mono uppercase text-lg tracking-wider bg-white transition-all"
                                        />
                                        <Button
                                            type="submit"
                                            variant="secondary"
                                            disabled={isJoining || classCode.length !== 6}
                                            className="px-6"
                                        >
                                            {isJoining ? '...' : 'Join'}
                                        </Button>
                                    </div>
                                    {error && (
                                        <p className="text-sm text-clay-600 flex items-center gap-1 font-medium bg-clay-50 p-2 rounded-lg">
                                            <AlertCircle size={14} /> {error}
                                        </p>
                                    )}
                                    {successMessage && (
                                        <p className="text-sm text-palm-600 flex items-center gap-1 font-medium bg-palm-50 p-2 rounded-lg">
                                            <CheckCircle size={14} /> {successMessage}
                                        </p>
                                    )}
                                </form>
                            </div>

                            {/* Joined Classes List */}
                            {managingUser.classIds && managingUser.classIds.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-earth-700 mb-3 uppercase tracking-wide">Joined Classes</h3>
                                    <div className="space-y-2">
                                        {managingUser.classIds.map(classId => (
                                            <div key={classId} className="px-4 py-3 bg-white text-earth-600 rounded-xl text-sm border border-earth-200 shadow-sm flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-palm-500"></div>
                                                <span className="font-mono font-medium">{classId.substring(0, 8)}...</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
