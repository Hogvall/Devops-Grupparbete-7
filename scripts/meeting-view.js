import { isUserSignedUp, formatMeetingDate, addParticipantToApi, deleteParticipantFromApi, getParticipantData } from "./meeting-logic.js"

//Mock a logged in user
const currentUser = "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2";

//Render participant info bit
export async function renderParticipantDiv(meetingId) {
    const participants = await getParticipantData(meetingId);
    const participantDiv = document.getElementById('participantDiv');
    participantDiv.innerHTML = `<div>Anmälda: ${participants.length}</div>`;

    const button = document.createElement('button');
    const signedUp = isUserSignedUp(participants, currentUser);

    if (signedUp) {
        button.textContent = "Avanmäl här";
        button.addEventListener("click", async () => {
            await deleteParticipantFromApi(currentUser, meetingId);
            renderParticipantDiv(meetingId);
        });
    } else {
        button.textContent = "Anmäl här";
        button.addEventListener("click", async () => {
            await addParticipantToApi(currentUser, meetingId);
            renderParticipantDiv(meetingId);
        });
    }

    participantDiv.append(button);
}

//Render full meeting DOM
export function renderMeetingDom(meeting) {
    const main = document.getElementById('app');
    const m = meeting[0];

    document.title += " | " + m.title;

    const img = document.createElement('img');
    img.src = m.image;

    const title = document.createElement('h3');
    title.textContent = m.title;

    const timeloc = document.createElement('div');
    timeloc.textContent = `Time: ${formatMeetingDate(m.time)} Place: ${m.location}`;

    const category = document.createElement('div');
    category.textContent = "Category: " + m.category.name;

    const description = document.createElement('p');
    description.textContent = m.description;

    const participantDiv = document.createElement('div');
    participantDiv.id = "participantDiv";

    main.append(img, title, timeloc, description, category, participantDiv);
}