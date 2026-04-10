import { supabase } from './supabaseClient.js';
import { getCurrentUser } from './utils.js';

export async function fetchEvents() {
  const user = getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('meeting_participant')
    .select('meeting_id, meetings(*)')
    .eq('user_id', user.id);

  if (error) 
    console.error("Error:", error);

  return (data || []).map(row => row.meetings).filter(Boolean);
}

export async function createEvent(title, startTime) {
  const user = getCurrentUser();
  if (!user) 
    throw new Error("Must be signed in");

  const { data, error } = await supabase
    .from('meetings')
    .insert([{ title: title, time: startTime }]);

  if (error) 
    throw error;

  return data;
}
