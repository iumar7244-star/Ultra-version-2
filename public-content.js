import { supabase } from './supabase.js';

// These are for ANONYMOUS visitors (students) — no requireAuth/requireSchool,
// relying on the public SELECT row-level-security policies instead.

export async function getPublicTerms(schoolId) {
    const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('school_id', schoolId)
        .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getPublicTopicsForTerm(schoolId, termId) {
    const { data, error } = await supabase
        .from('term_topics')
        .select(`
            term_id,
            topic_id,
            topics ( id, code, subject )
        `)
        .eq('school_id', schoolId)
        .eq('term_id', termId);

    if (error) throw error;

    return (data || [])
        .filter(row => row.topics)
        .map(row => ({ id: row.topics.id, code: row.topics.code, subject: row.topics.subject }));
}

export async function getPublicQuestions(schoolId, topicId) {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('school_id', schoolId)
        .eq('topic_id', topicId);

    if (error) throw error;
    return (data || []).filter(q => q.active !== false);
}
