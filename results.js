import { supabase } from './supabase.js';
import { requireSchool } from './school.js';


// Create a new quiz attempt
export async function createAttempt({
    studentId,
    classId = null,
    termId = null,
    topicId = null,
    mode = 'typing',
    totalQuestions = 0
}) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
            school_id: school.id,
            student_id: studentId,
            class_id: classId,
            term_id: termId,
            topic_id: topicId,
            mode,
            total_questions: totalQuestions,
            score: 0,
            percentage: 0,
            status: 'in_progress'
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Save one answer
export async function saveAnswer({
    attemptId,
    questionId,
    answer = '',
    isCorrect = false,
    marks = 0,
    typedDetail = null
}) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_answers')
        .upsert(
            {
                school_id: school.id,
                attempt_id: attemptId,
                question_id: String(questionId),
                answer,
                is_correct: isCorrect,
                marks,
                typed_detail: typedDetail
            },
            {
                onConflict: 'attempt_id,question_id'
            }
        )
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Save multiple answers at once
export async function saveAnswers(attemptId, answers) {
    const school = await requireSchool();

    const rows = answers.map(item => ({
        school_id: school.id,
        attempt_id: attemptId,
        question_id: String(item.questionId),
        answer: item.answer || '',
        is_correct: Boolean(item.isCorrect),
        marks: Number(item.marks || 0),
        typed_detail: item.typedDetail || null
    }));

    if (!rows.length) return [];

    const { data, error } = await supabase
        .from('quiz_answers')
        .upsert(rows, {
            onConflict: 'attempt_id,question_id'
        })
        .select();

    if (error) throw error;

    return data || [];
}


// Finish an attempt and save final score
export async function finishAttempt(
    attemptId,
    {
        score,
        totalQuestions,
        percentage,
        status = 'completed'
    }
) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_attempts')
        .update({
            score,
            total_questions: totalQuestions,
            percentage,
            status,
            completed_at: new Date().toISOString()
        })
        .eq('id', attemptId)
        .eq('school_id', school.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}


// Get one attempt with its answers
export async function getAttempt(attemptId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
            *,
            quiz_answers (
                id,
                question_id,
                answer,
                is_correct,
                marks,
                typed_detail
            )
        `)
        .eq('id', attemptId)
        .eq('school_id', school.id)
        .maybeSingle();

    if (error) throw error;

    return data;
}


// Get all attempts for a student
export async function getStudentAttempts(studentId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
            *,
            students (
                id,
                name,
                student_code
            ),
            classes (
                id,
                name,
                year
            )
        `)
        .eq('school_id', school.id)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
}


// Get all attempts for a class
export async function getClassAttempts(classId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
            *,
            students (
                id,
                name,
                student_code
            )
        `)
        .eq('school_id', school.id)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
}


// Get all attempts for the current school
export async function getAllAttempts() {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
            *,
            students (
                id,
                name,
                student_code
            ),
            classes (
                id,
                name,
                year
            )
        `)
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
}


// Delete an attempt
export async function deleteAttempt(attemptId) {
    const school = await requireSchool();

    const { error } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('id', attemptId)
        .eq('school_id', school.id);

    if (error) throw error;

    return true;
}