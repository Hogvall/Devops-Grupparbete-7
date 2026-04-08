const supabase_token = import.meta.env.VITE_SUPABASE_KEY;
const supabase_baseurl = import.meta.env.VITE_SUPABASE_URL;
const storage_bucket = "meeting_images";

export const CATEGORIES = [
    { id: 1, name: "Tech & Networking" },
    { id: 2, name: "Sports & Fitness" },
    { id: 3, name: "Music & Arts" },
    { id: 4, name: "Food & Drink" },
    { id: 5, name: "Education" },
    { id: 6, name: "Other" },
];

export async function uploadImage(file) {
    const filename = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const response = await fetch(
        `${supabase_baseurl}/storage/v1/object/${storage_bucket}/${filename}`,
        {
            method: "POST",
            headers: {
                "apikey": supabase_token,
                "Authorization": `Bearer ${supabase_token}`,
                "Content-Type": file.type
            },
            body: file
        }
    );
    if (!response.ok) 
        throw new Error(response.status);

    return `${supabase_baseurl}/storage/v1/object/public/${storage_bucket}/${filename}`;
}

export async function createMeeting(meetingData) {
    const response = await fetch(`${supabase_baseurl}/rest/v1/meetings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabase_token,
            "Authorization": `Bearer ${supabase_token}`,
            "Prefer": "return=representation"
        },
        body: JSON.stringify(meetingData)
    });
    if (!response.ok) 
        throw new Error(response.status);

    return response.json();
}

export async function addOrganizer(userId, meetingId) {
    const response = await fetch(`${supabase_baseurl}/rest/v1/meeting_organizer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabase_token,
            "Authorization": `Bearer ${supabase_token}`,
            "Prefer": "return=representation"
        },
        body: JSON.stringify({ user_id: userId, meeting_id: meetingId })
    });
    if (!response.ok) 
        throw new Error(response.status);

    return response.json();
}