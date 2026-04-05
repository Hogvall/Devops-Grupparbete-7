//Mocking a logged in user.
const currentUser = "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2";

//Subabase variables
const supabase_token = "sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze";
const supabase_baseurl = "https://wufgfgadhvprxdkcducx.supabase.co";

//Fetching a meeting by id.
export async function getMeeting(meetingId) {
    try {
        const response = await fetch(`${supabase_baseurl}/rest/v1/meetings?apikey=${supabase_token}&select=*,category(name)&id=eq.${meetingId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const meeting = await response.json();
        return meeting;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

//Fetching users that signed up for the meeting.
export async function getParticipantData(meetingId) {
    try {
        const response = await fetch(`${supabase_baseurl}/rest/v1/meeting_participant?apikey=${supabase_token}&meeting_id=eq.${meetingId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const participants = await response.json();
        return participants;

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

//Signing up user to meeting
export async function addParticipant(userId, meetingId) {
    const response = await fetch(`${supabase_baseurl}/rest/v1/meeting_participant`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": `${supabase_token}`,
            "Authorization": `Bearer ${supabase_token}`,
            "Prefer": "return=representation"
        },
        body: JSON.stringify({
            user_id: userId,
            meeting_id: meetingId
        })
    });

    renderParticipantDiv(meetingId);

    const data = await response.json();
    return data;
}

//Removing user from meeting
export async function deleteParticipant(userId, meetingId) {
    const url = `${supabase_baseurl}/rest/v1/meeting_participant?user_id=eq.${userId}&meeting_id=eq.${meetingId}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "apikey": `${supabase_token}`,
            "Authorization": `Bearer ${supabase_token}`,
        }
    });

    renderParticipantDiv(meetingId);

    const data = await response.json().catch(() => null);
    return data;
}

//Render no of sign-ups and button for signing up/cancelling.
export async function renderParticipantDiv(meetingId) {

    const participants = await getParticipantData(meetingId);
    const participantDiv = document.getElementById('participantDiv');
    const button = document.createElement('button');

    participantDiv.innerHTML = `<div>Anmälda: ${participants.length}</div>`;

    let isSignedUp;
    if (participants.length > 0) {

        for (let participant of participants) {
            if (participant.user_id == currentUser) {
                isSignedUp = true;
                break;
            }else{
                isSignedUp = false;
            }
        }
    }

    if (isSignedUp == true) {
        button.textContent = "Avanmäl här";
        button.addEventListener("click", () => deleteParticipant(currentUser, meetingId));
    }else{
        button.textContent = "Anmäl här";
        button.addEventListener("click", () => addParticipant(currentUser, meetingId));
    }

    participantDiv.append(button);

}

//Render meeting and related data
export async function renderMeeting() {

    const urlParams = new URLSearchParams(window.location.search);
    const meetingId = urlParams.get('id');

    const meeting = await getMeeting(meetingId);

    console.log(meeting);

    const main = document.getElementById('app');
    const img = document.createElement('img');
    const category = document.createElement('div');
    const timeloc = document.createElement('div');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    const participantDiv = document.createElement('div');

    document.title = document.title + " | " + meeting[0].title;

    const formattedDate = new Intl.DateTimeFormat("en-en", {
        dateStyle: "long",
        timeStyle: "short"
    }).format(new Date(meeting[0].time));

    img.src = meeting[0].image;
    category.textContent = "Category: " + meeting[0].category.name
    title.textContent = meeting[0].title;
    description.textContent = meeting[0].description;
    timeloc.textContent = "Time: " + formattedDate + " Place: " + meeting[0].location;
    participantDiv.id = "participantDiv";

    main.append(img, title, timeloc, description, category, participantDiv);

    renderParticipantDiv(meetingId);
}

renderMeeting();