/**
 * Provides a global context for user authentication state throughout the application.
 * This context integrates directly with the Supabase client to manage sessions,
 * user data, and loading states in a secure and efficient way.
 */
import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabaseClient';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);
    
    // --- THE FIX ---
    // This new function manually tells Supabase to refresh the user's token.
    // When the token is refreshed, the onAuthStateChange listener above will
    // automatically fire and update the user state with the latest metadata.
    const refreshUserSession = async () => {
        await supabase.auth.refreshSession();
    };

    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        logout: () => supabase.auth.signOut(),
        refreshUserSession, // Expose the new function to the context
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

