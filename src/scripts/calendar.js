import { supabase } from './supabaseClient.js';
import { getCurrentUser } from './utils.js';

export async function fetchEvents() {
  const user = getCurrentUser();
  if (!user) return [];

  const [participantRes, organizerRes] = await Promise.all([
    supabase.from('meeting_participant').select('meeting_id, meetings(*)').eq('user_id', user.id),
    supabase.from('meeting_organizer').select('meeting_id, meetings(*)').eq('user_id', user.id),
  ]);

  if (participantRes.error) console.error("Participant fetch error:", participantRes.error);
  if (organizerRes.error) console.error("Organizer fetch error:", organizerRes.error);

  const participantMeetings = (participantRes.data || []).map(r => r.meetings).filter(Boolean);
  const organizerMeetings = (organizerRes.data || []).map(r => r.meetings).filter(Boolean);

  const seen = new Set();
  return [...participantMeetings, ...organizerMeetings].filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

export async function createEvent(title, startTime) {
  const user = getCurrentUser();
  if (!user)
    throw new Error("Must be signed in");

  const { data, error } = await supabase
    .from('meetings')
    .insert([{ title: title, time: startTime }])
    .select();

  if (error)
    throw error;

  const meeting = data?.[0];
  if (meeting?.id) {
    const { error: orgError } = await supabase
      .from('meeting_organizer')
      .insert([{ user_id: user.id, meeting_id: meeting.id }]);
    if (orgError)
      console.error("Could not add organizer:", orgError);
  }

  return data;
}
