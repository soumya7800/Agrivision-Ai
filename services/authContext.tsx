import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser as useClerkUser, useClerk, SignedIn as ClerkSignedIn, SignedOut as ClerkSignedOut, SignIn as ClerkSignIn, SignUp as ClerkSignUp, UserButton as ClerkUserButton } from '@clerk/clerk-react';
import { User, LogOut } from 'lucide-react';

// --- CONFIGURATION ---
const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const IS_CLERK_VALID = CLERK_KEY && CLERK_KEY.startsWith('pk_');

if (!IS_CLERK_VALID) {
    console.warn("AuthContext: Missing valid Clerk Publishable Key. Falling back to local mock mode.");
}

// --- LOCAL AUTH IMPLEMENTATION ---
interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    imageUrl: string;
}

interface AuthContextType {
    user: UserProfile | null;
    isSignedIn: boolean;
    isLoaded: boolean;
    login: (email?: string) => Promise<void>; // Unified login trigger
    signup: (name?: string, email?: string) => Promise<void>;
    logout: () => void;
    isDemo: boolean;
}

const LocalAuthContext = createContext<AuthContextType | null>(null);

const LocalAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        try {
            // v3 key for fresh local state
            const stored = localStorage.getItem('agri_app_user_v3');
            return stored ? JSON.parse(stored) : null;
        } catch (e) { return null; }
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const login = async (email: string = "demo@agrivision.ai") => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const mockUser: UserProfile = {
                    id: 'local-' + Date.now(),
                    fullName: 'Demo User',
                    email: email,
                    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
                };
                setUser(mockUser);
                localStorage.setItem('agri_app_user_v3', JSON.stringify(mockUser));
                resolve();
            }, 500);
        });
    };

    const signup = async (name: string = "User", email: string = "user@example.com") => {
        return login(email); // Mock signup just logs in
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('agri_app_user_v3');
    };

    return (
        <LocalAuthContext.Provider value={{ user, isSignedIn: !!user, isLoaded, login, signup, logout, isDemo: true }}>
            {children}
        </LocalAuthContext.Provider>
    );
};

// --- UNIFIED PROVIDER ---
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    if (IS_CLERK_VALID) {
        return (
            <ClerkProvider publishableKey={CLERK_KEY}>
                {children}
            </ClerkProvider>
        );
    }
    return <LocalAuthProvider>{children}</LocalAuthProvider>;
};

// --- UNIFIED HOOK ---
export const useAuth = () => {
    if (IS_CLERK_VALID) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { isLoaded, isSignedIn, user: clerkUser } = useClerkUser();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { signOut, openSignIn, openSignUp } = useClerk();

        // Normalize Clerk user to our UserProfile shape
        const user: UserProfile | null = clerkUser ? {
            id: clerkUser.id,
            fullName: clerkUser.fullName || clerkUser.firstName || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            imageUrl: clerkUser.imageUrl
        } : null;

        return {
            isLoaded,
            isSignedIn: !!isSignedIn,
            user,
            login: () => openSignIn(),
            signup: () => openSignUp(),
            logout: () => signOut(),
            isDemo: false
        };
    } else {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const context = useContext(LocalAuthContext);
        if (!context) throw new Error("useAuth must be used within AuthProvider");
        return context;
    }
};

// --- COMPONENTS ---

export const SignIn = () => {
    if (IS_CLERK_VALID) {
        // Clerk's pre-built component, centered
        return (
            <div className="flex justify-center items-center">
                <ClerkSignIn routing="hash" />
            </div>
        );
    }

    // Local Fallback UI
    const { login } = useAuth();
    return (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl bg-black/40 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-agri-green/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-agri-green" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Demo Access</h2>
            <p className="text-slate-400 mb-6 font-light">
                Clerk keys missing. Enter demo mode.
            </p>
            <button
                onClick={() => login()}
                className="w-full py-3 bg-agri-green text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"
            >
                Enter Demo Platform
            </button>
        </div>
    );
};

export const SignUp = () => {
    if (IS_CLERK_VALID) {
        return (
            <div className="flex justify-center items-center">
                <ClerkSignUp routing="hash" />
            </div>
        );
    }
    // Reuse SignIn for local mock
    return <SignIn />;
};

export const UserButton = () => {
    if (IS_CLERK_VALID) {
        return (
            <div className="pl-4 border-l border-white/10">
                <ClerkUserButton />
            </div>
        );
    }

    const { user, logout } = useAuth();
    if (!user) return null;

    return (
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="flex flex-col items-end mr-2 hidden sm:flex">
                <span className="text-xs text-agri-green font-bold uppercase tracking-wider">Local</span>
                <span className="text-sm font-medium text-white">{user.fullName}</span>
            </div>
            <button
                onClick={logout}
                className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-red-500/50 transition-colors group"
            >
                <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <LogOut className="w-4 h-4 text-white" />
                </div>
            </button>
        </div>
    );
};
