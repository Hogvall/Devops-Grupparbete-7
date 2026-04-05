const currentUser = "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2";

export async function getMeeting(id) {
  try {
    const response = await fetch(`https://wufgfgadhvprxdkcducx.supabase.co/rest/v1/meetings?apikey=sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze&select=*,category(name)&id=eq.${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const meeting = await response.json();

    return meeting;

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

export async function getParticipantData(id) {
  try {
    const response = await fetch(`https://wufgfgadhvprxdkcducx.supabase.co/rest/v1/meeting_participant?apikey=sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze&meeting_id=eq.${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const participants = await response.json();

    return participants;

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

export async function addParticipant(userId, meetingId) {
  const response = await fetch(`https://wufgfgadhvprxdkcducx.supabase.co/rest/v1/meeting_participant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": "sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze",
      "Authorization": `Bearer sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      user_id: userId,
      meeting_id: meetingId
    })
  });

  const data = await response.json();
  renderParticipantDiv(meetingId);
  return data;
}

export async function deleteParticipant(userId, meetingId) {
  const url = `https://wufgfgadhvprxdkcducx.supabase.co/rest/v1/meeting_participant?user_id=eq.${userId}&meeting_id=eq.${meetingId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "apikey": "sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze",
      "Authorization": "Bearer sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze"
    }
  });

  const data = await response.json().catch(() => null);
  renderParticipantDiv(meetingId);

  return data;
}

export async function renderParticipantDiv(id) {

    const participants = await getParticipantData(id);
    const participantDiv = document.getElementById('participantDiv');
    const button = document.createElement('button');

    participantDiv.innerHTML = "Anmälda: " + participants.length;

    let isSignedUp;
    if(participants.length > 0){

        for(let participant of participants){
            if(participant.user_id == currentUser){
                isSignedUp = true;
                break;
            }
        }
    }

    if(isSignedUp == true){

        button.textContent = "Avanmäl här";
        button.addEventListener("click", () => deleteParticipant(currentUser, id));

    }
    else{
        
        button.textContent = "Anmäl här";
        button.addEventListener("click", () => addParticipant(currentUser, id));

    }

    participantDiv.append(button);
    

}

export async function renderMeeting() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const meeting = await getMeeting(id);

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

        console.log(formattedDate);

    img.src = meeting[0].image;
    category.textContent = "Category: " + meeting[0].category.name
    title.textContent = meeting[0].title;
    description.textContent = meeting[0].description;
    timeloc.textContent = "Time: " + formattedDate + " Place: " + meeting[0].location;
    participantDiv.id = "participantDiv";

    main.append(img, title, timeloc, description, category, participantDiv);

    renderParticipantDiv(id);
}

renderMeeting();