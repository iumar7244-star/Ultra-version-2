import { supabase } from './supabase.js';
import { requireSchool } from './school.js';


// Get all students in the current school
export async function getStudents() {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('students')
        .select(`
            *,
            classes (
                id,
                name,
                year
            )
        `)
        .eq('school_id', school.id)
        .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
}


// Get students belonging to one class
export async function getStudentsByClass(classId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('students')
        .select(`
            *,
            classes (
                id,
                name,
                year
            )
        `)
        .eq('school_id', school.id)
        .eq('class_id', classId)
        .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
}


// Get one student
export async function getStudent(studentId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('students')
        .select(`
            *,
            classes (
                id,
                name,
                year
            )
        `)
        .eq('id', studentId)
        .eq('school_id', school.id)
        .maybeSingle();

    if (error) throw error;

    return data;
}


// Create a student
export async function createStudent({
    name,
    studentCode = '',
    classId,
    gender = null,
    dateOfBirth = null
}) {
    const school = await requireSchool();

    if (!name || !name.trim()) {
        throw new Error('Student name is required.');
    }

    if (!classId) {
        throw new Error('Class is required.');
    }

    const { data, error } = await supabase
        .from('students')
        .insert({
            school_id: school.id,
            class_id: classId,
            name: name.trim(),
            student_code: studentCode.trim(),
            gender,
            date_of_birth: dateOfBirth
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Update a student
export async function updateStudent(studentId, updates) {
    const school = await requireSchool();

    const cleanUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('students')
        .update(cleanUpdates)
        .eq('id', studentId)
        .eq('school_id', school.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Delete a student
export async function deleteStudent(studentId) {
    const school = await requireSchool();

    const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)
        .eq('school_id', school.id);

    if (error) throw error;

    return true;
}


// Search students by name or student code
export async function searchStudents(searchTerm) {
    const school = await requireSchool();

    const term = (searchTerm || '').trim();

    if (!term) {
        return getStudents();
    }

    const { data, error } = await supabase
        .from('students')
        .select(`
            *,
            classes (
                id,
                name,
                year
            )
        `)
        .eq('school_id', school.id)
        .or(`name.ilike.%${term}%,student_code.ilike.%${term}%`)
        .order('name', { ascending: true });

    if (error) throw error;

    return data || [];
}