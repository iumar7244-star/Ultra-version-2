import { supabase } from './supabase.js';

export async function signUp(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name.trim(),
                full_name: name.trim()
            }
        }
    });

    if (error) throw error;
    return data;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
}

export async function getCurrentUser() {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
}

export async function getSession() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) throw error;
    return session;
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

export async function requireAuth() {
    const session = await getSession();

    if (!session) {
        throw new Error('You must be logged in.');
    }

    return session.user;
}

export async function resetPassword(email) {
    const redirectTo =
        `${window.location.origin}${window.location.pathname}`;

    const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo
        });

    if (error) throw error;
}

export async function updatePassword(newPassword) {
    const { data, error } =
        await supabase.auth.updateUser({
            password: newPassword
        });

    if (error) throw error;

    return data;
}
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/setup.html` }
    });
    if (error) throw error;
    return data;
}
