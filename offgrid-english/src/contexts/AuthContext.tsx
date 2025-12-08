import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { db } from '../db/database';
import type { UserProfile } from '../types/schemas';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
    currentUser: UserProfile | null;
    isLoading: boolean;
    login: (userId: string, pin: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    register: (name: string, avatar: string, pin: string, role?: 'student' | 'teacher') => Promise<{ success: boolean; message?: string }>;
    joinClass: (userId: string, code: string) => Promise<{ success: boolean; message?: string }>;
    users: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);

    // Load users and restore session on mount
    useEffect(() => {
        const loadUsersAndSession = async () => {
            try {
                const allUsers = await db.users.toArray();
                setUsers(allUsers);

                // Restore session
                const savedUserId = localStorage.getItem('currentUserId');
                if (savedUserId) {
                    const user = allUsers.find(u => u.id === savedUserId);
                    if (user) {
                        setCurrentUser(user);
                    }
                }
            } catch (error) {
                console.error('Failed to load users:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadUsersAndSession();
    }, []);

    const login = async (userId: string, pin: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const user = await db.users.get(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // If user has no PIN, allow login immediately
            if (!user.pinHash) {
                setCurrentUser(user);
                localStorage.setItem('currentUserId', user.id); // Persist session
                await db.users.update(userId, { lastLoginAt: Date.now() });
                return { success: true };
            }

            // If user has PIN, verify it
            const isValid = await bcrypt.compare(pin, user.pinHash);
            if (isValid) {
                setCurrentUser(user);
                localStorage.setItem('currentUserId', user.id); // Persist session
                // Update last login
                await db.users.update(userId, { lastLoginAt: Date.now() });
                return { success: true };
            } else {
                return { success: false, message: 'Incorrect PIN' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const register = async (name: string, avatar: string, pin: string, role: 'student' | 'teacher' = 'student'): Promise<{ success: boolean; message?: string }> => {
        try {
            let pinHash: string | undefined;

            // Only hash if PIN is provided
            if (pin && pin.length >= 4) {
                const salt = await bcrypt.genSalt(10);
                pinHash = await bcrypt.hash(pin, salt);
            }

            const newUser: UserProfile = {
                id: uuidv4(),
                name,
                avatar,
                pinHash,
                role,
                classIds: [],
                createdAt: Date.now(),
                lastLoginAt: Date.now()
            };

            await db.users.add(newUser);
            setUsers(prev => [...prev, newUser]);
            setCurrentUser(newUser); // Auto-login after register
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed' };
        }
    };

    const joinClass = async (userId: string, code: string): Promise<{ success: boolean; message?: string }> => {
        try {
            // Find class by code
            const classroom = await db.classrooms.where('code').equals(code.toUpperCase()).first();

            if (!classroom) {
                return { success: false, message: 'Invalid class code' };
            }

            const user = await db.users.get(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Check if already in class
            if (user.classIds?.includes(classroom.id)) {
                return { success: false, message: 'You are already in this class' };
            }

            // Add class ID to user
            const updatedClassIds = [...(user.classIds || []), classroom.id];
            await db.users.update(userId, { classIds: updatedClassIds });

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, classIds: updatedClassIds } : u));
            if (currentUser?.id === userId) {
                setCurrentUser({ ...currentUser, classIds: updatedClassIds });
            }

            return { success: true, message: `Joined class: ${classroom.name}` };
        } catch (error) {
            console.error('Join class error:', error);
            return { success: false, message: 'Failed to join class' };
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            isLoading,
            login,
            logout,
            register,
            joinClass,
            users
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
