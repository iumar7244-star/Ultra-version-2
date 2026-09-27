import { supabase } from './supabase.js';
import { requireSchool } from './school.js';

// Get all classes for the current school
export async function getClasses() {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('school_id', school.id)
        .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
}


// Get one class by ID
export async function getClass(classId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .eq('school_id', school.id)
        .maybeSingle();

    if (error) throw error;

    return data;
}


// Create a new class
export async function createClass({
    name,
    year = null,
    description = ''
}) {
    const school = await requireSchool();

    if (!name || !name.trim()) {
        throw new Error('Class name is required.');
    }

    const { data, error } = await supabase
        .from('classes')
        .insert({
            school_id: school.id,
            name: name.trim(),
            year,
            description
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Update a class
export async function updateClass(classId, updates) {
    const school = await requireSchool();

    const cleanUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('classes')
        .update(cleanUpdates)
        .eq('id', classId)
        .eq('school_id', school.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Delete a class
export async function deleteClass(classId) {
    const school = await requireSchool();

    const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
        .eq('school_id', school.id);

    if (error) throw error;

    return true;
}