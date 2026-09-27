import { supabase } from './supabase.js';
import { getCurrentUser, signOut } from './auth.js';

export async function isPlatformAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data, error } = await supabase.rpc('is_platform_admin');
  if (error) throw error;
  return !!data;
}

export async function requirePlatformAdmin() {
  const ok = await isPlatformAdmin();
  if (!ok) throw new Error('Admin access required.');
}

export async function getAdminOverview() {
  const { data, error } = await supabase.rpc('admin_overview');
  if (error) throw error;
  return data || {};
}

export async function getRegisteredUsers() {
  const { data, error } = await supabase.rpc('admin_registered_users');
  if (error) throw error;
  return data || [];
}

export async function getSchools() {
  const { data, error } = await supabase.rpc('admin_schools');
  if (error) throw error;
  return data || [];
}

export async function getAllPdfs() {
  const { data, error } = await supabase.rpc('admin_pdfs');
  if (error) throw error;
  return data || [];
}

export async function adminDeletePdf(id, storagePath) {
  const { data, error } = await supabase.rpc('admin_delete_pdf', { p_id:id, p_storage_path:storagePath });
  if (error) throw error;
  return data;
}

export { signOut };
