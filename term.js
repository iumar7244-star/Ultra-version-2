// ============================================================
// TERMS & TOPICS
// ============================================================

import { supabase } from './supabase.js';
import { requireSchool } from './school.js';


// ------------------------------------------------------------
// LOCAL FALLBACK
// ------------------------------------------------------------

const LOCAL_TERMS = [
    {
        id: 'first',
        ar: 'الفصل الأول',
        en: 'First Term',
        topics: ['06', '07']
    },
    {
        id: 'second',
        ar: 'الفصل الثاني',
        en: 'Second Term',
        topics: []
    },
    {
        id: 'third',
        ar: 'الفصل الثالث',
        en: 'Third Term',
        topics: ['01', '02', '03', '04', '05']
    }
];

const LOCAL_TOPICS = [
    { code: '01', subject: 'الدولة الأموية في الأندلس' },
    { code: '02', subject: 'عبد الرحمن الداخل' },
    { code: '03', subject: 'عبد الرحمن الأوسط' },
    { code: '04', subject: 'عبد الرحمن الناصر' },
    { code: '05', subject: 'انهيار الدولة في الأندلس' },
    { code: '06', subject: 'الخلفاء الراشدون' },
    { code: '07', subject: 'قيام الدولة الأموية' }
];


// ------------------------------------------------------------
// GET TERMS
// ------------------------------------------------------------

export async function getTerms() {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('school_id', school.id)
        .order('sort_order', { ascending: true });

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return LOCAL_TERMS;
    }

    return data.map(term => ({
        id: term.id,
        ar: term.name_ar,
        en: term.name_en,
        topics: []
    }));
}


// ------------------------------------------------------------
// GET TOPICS
// ------------------------------------------------------------

export async function getTopics() {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('school_id', school.id)
        .order('code', { ascending: true });

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        return LOCAL_TOPICS;
    }

    return data.map(topic => ({
        code: topic.code,
        subject: topic.subject,
        id: topic.id
    }));
}


// ------------------------------------------------------------
// GET ONE TERM
// ------------------------------------------------------------

export async function getTerm(termId) {
    const terms = await getTerms();

    return terms.find(term => term.id === termId) || null;
}


// ------------------------------------------------------------
// GET ONE TOPIC
// ------------------------------------------------------------

export async function getTopic(topicCode) {
    const topics = await getTopics();

    return topics.find(topic => topic.code === topicCode) || null;
}


// ------------------------------------------------------------
// GET TOPICS FOR A TERM
// ------------------------------------------------------------

export async function getTopicsForTerm(termId) {
    const school = await requireSchool();

    const { data, error } = await supabase
        .from('term_topics')
        .select(`
            term_id,
            topic_id,
            topics (
                id,
                code,
                subject
            )
        `)
        .eq('school_id', school.id)
        .eq('term_id', termId);

    if (error) {
        throw error;
    }

    if (!data || data.length === 0) {
        const localTerm = LOCAL_TERMS.find(
            term => term.id === termId
        );

        if (!localTerm) {
            return [];
        }

        return LOCAL_TOPICS.filter(topic =>
            localTerm.topics.includes(topic.code)
        );
    }

    return data
        .filter(row => row.topics)
        .map(row => ({
            id: row.topics.id,
            code: row.topics.code,
            subject: row.topics.subject
        }));
}


// ------------------------------------------------------------
// BACKWARD COMPATIBILITY
// ------------------------------------------------------------

export const TERMS = LOCAL_TERMS;
export const TOPIC_META = LOCAL_TOPICS;