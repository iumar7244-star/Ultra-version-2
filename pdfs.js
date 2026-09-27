import { supabase } from './supabase.js';
import { requireSchool } from './school.js';

const BUCKET = 'pdfs';

// Admin: upload a PDF for the logged-in school. `topicId` is optional —
// leave it null to attach the file to a subject label only.
export async function uploadPdf({ title, topicId = null, subject = '', file }) {
    const school = await requireSchool();

    if (!file) throw new Error('Please choose a PDF file.');
    if (file.type !== 'application/pdf') throw new Error('Only PDF files are allowed.');
    if (!title || !title.trim()) throw new Error('Please give the file a title.');

    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `${school.id}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false, contentType: 'application/pdf' });

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
        .from('pdf_resources')
        .insert({
            school_id: school.id,
            topic_id: topicId,
            subject: subject || null,
            title: title.trim(),
            storage_path: path
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export function pdfPublicUrl(storagePath) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
}

// Admin: list this school's own PDFs (dashboard).
export async function listMyPdfs() {
    const school = await requireSchool();
    return listPdfsForSchool(school.id);
}

// Public: list a specific school's PDFs (no login needed — RLS allows public select).
export async function listPdfsForSchool(schoolId) {
    const { data, error } = await supabase
        .from('pdf_resources')
        .select('*')
        .eq('school_id', schoolId)
        .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function deletePdf(id, storagePath) {
    const school = await requireSchool();

    await supabase.storage.from(BUCKET).remove([storagePath]);

    const { error } = await supabase
        .from('pdf_resources')
        .delete()
        .eq('id', id)
        .eq('school_id', school.id);

    if (error) throw error;
    return true;
}
