import { supabase } from './supabase.js';
import { requireSchool } from './school.js';

// ------------------------------------------------------------
// TOPICS  (a "topic" is what the site calls a subject/lesson)
// ------------------------------------------------------------

// Add a new topic and link it to a term in one call.
export async function addTopic({ termId, code, subject }) {
    const school = await requireSchool();

    if (!subject || !subject.trim()) {
        throw new Error('Topic name is required.');
    }
    if (!termId) {
        throw new Error('Please choose a term.');
    }

    const { data: topic, error: topicError } = await supabase
        .from('topics')
        .insert({
            school_id: school.id,
            code: (code || '').trim() || null,
            subject: subject.trim()
        })
        .select()
        .single();

    if (topicError) throw topicError;

    const { error: linkError } = await supabase
        .from('term_topics')
        .insert({
            school_id: school.id,
            term_id: termId,
            topic_id: topic.id
        });

    if (linkError) throw linkError;

    return topic;
}

// All topics for this school (regardless of term), newest first.
export async function getSchoolTopics() {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function deleteTopic(topicId) {
    const school = await requireSchool();

    // Clean up dependent rows first in case the database has no cascade set up.
    await supabase.from('questions').delete().eq('topic_id', topicId).eq('school_id', school.id);
    await supabase.from('term_topics').delete().eq('topic_id', topicId).eq('school_id', school.id);

    const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId)
        .eq('school_id', school.id);

    if (error) throw error;
    return true;
}

// ------------------------------------------------------------
// QUESTIONS
// ------------------------------------------------------------

export async function getQuestions(topicId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('school_id', school.id)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function addQuestion({ topicId, topicCode, question, answer, acceptable }) {
    const school = await requireSchool();

    if (!question || !question.trim() || !answer || !answer.trim()) {
        throw new Error('Question and answer are both required.');
    }

    const { data, error } = await supabase
        .from('questions')
        .insert({
            school_id: school.id,
            topic_id: topicId,
            topic_code: topicCode || null,
            question: question.trim(),
            type: 'typing',
            answer: answer.trim(),
            acceptable: acceptable && acceptable.length ? acceptable : [],
            marks: 1,
            difficulty: 'medium',
            active: true
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteQuestion(questionId) {
    const school = await requireSchool();

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
        .eq('school_id', school.id);

    if (error) throw error;
    return true;
}
