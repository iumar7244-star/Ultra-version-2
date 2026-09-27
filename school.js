import { supabase } from './supabase.js';
import { requireAuth } from './auth.js';

export async function getCurrentMembership() {
    const user = await requireAuth();

    const { data, error } = await supabase
        .from('school_members')
        .select(`
            id,
            school_id,
            user_id,
            role,
            status,
            schools (
                id,
                name,
                address,
                phone,
                email,
                logo_url
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

    if (error) throw error;

    return data;
}

export async function getCurrentSchool() {
    const membership = await getCurrentMembership();

    if (!membership) {
        return null;
    }

    return membership.schools;
}

export async function createSchool({
    name,
    address = '',
    phone = '',
    email = ''
}) {
    await requireAuth();

    const { data, error } = await supabase.rpc(
        'create_school_for_user',
        {
            p_name: name,
            p_address: address,
            p_phone: phone,
            p_email: email
        }
    );

    if (error) throw error;

    return data;
}

export async function updateSchool(schoolId, updates) {
    const { data, error } = await supabase
        .from('schools')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', schoolId)
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function requireSchool() {
    const school = await getCurrentSchool();

    if (!school) {
        throw new Error(
            'No school is associated with this account.'
        );
    }

    return school;
}