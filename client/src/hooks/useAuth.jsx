import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

/**
 * A custom hook to provide easy access to the user authentication context.
 * This is the official way to access user state and auth functions in any component.
 * It simplifies component logic by abstracting away the `useContext` call
 * and throws an error if used outside of a UserProvider, which helps catch bugs early.
 */
export const useAuth = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a UserProvider');
    }
    return context;
};

