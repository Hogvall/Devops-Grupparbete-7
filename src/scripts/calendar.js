import { supabase } from './supabaseClient.js';

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export async function fetchEvents() {
  const user = getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('user_id', user.id); 
    
  if (error) console.error("Error:", error);
  return data || [];
}

export async function createEvent(title, startTime) {
  const user = getUser();
  if (!user) throw new Error("Must be signed in");
  
  const { data, error } = await supabase
    .from('meetings')
    .insert([{ user_id: user.id, title: title, start_time: startTime }]);

  if (error) throw error;
  return data;
}