const supabase_token = import.meta.env.VITE_SUBABASE_KEY;
const supabase_baseurl = "https://wufgfgadhvprxdkcducx.supabase.co";

//Fetch a meeting
export async function getMeeting(meetingId) {
    const response = await fetch(
        `${supabase_baseurl}/rest/v1/meetings?apikey=${supabase_token}&select=*,category(name)&id=eq.${meetingId}`
    );
    if (!response.ok) throw new Error(response.status);
    return response.json();
}

//Fetch participant info
export async function getParticipantData(meetingId) {
    const response = await fetch(
        `${supabase_baseurl}/rest/v1/meeting_participant?apikey=${supabase_token}&meeting_id=eq.${meetingId}`
    );
    if (!response.ok) throw new Error(response.status);
    return response.json();
}

//Add current user to meeting as participant
export async function addParticipantToApi(userId, meetingId) {
    const response = await fetch(`${supabase_baseurl}/rest/v1/meeting_participant`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabase_token,
            "Authorization": `Bearer ${supabase_token}`,
            "Prefer": "return=representation"
        },
        body: JSON.stringify({ user_id: userId, meeting_id: meetingId })
    });
    return response.json();
}

//Delete current user from meeting as participant
export async function deleteParticipantFromApi(userId, meetingId) {
    const response = await fetch(
        `${supabase_baseurl}/rest/v1/meeting_participant?user_id=eq.${userId}&meeting_id=eq.${meetingId}`,
        {
            method: "DELETE",
            headers: {
                "apikey": supabase_token,
                "Authorization": `Bearer ${supabase_token}`
            }
        }
    );
    return response.json().catch(() => null);
}

//Check if current user signed up to the meeting
export function isUserSignedUp(participants, currentUser) {
    return participants.some(p => p.user_id === currentUser);
}

//Format date
export function formatMeetingDate(dateString) {
    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeStyle: "short"
    }).format(new Date(dateString));
}