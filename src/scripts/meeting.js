import { getMeeting } from "./meeting-logic.js";
import { renderMeetingDom, renderParticipantDiv } from "./meeting-view.js";

//Render full meeting
export async function renderMeeting() {
    const meetingId = new URLSearchParams(window.location.search).get('id');
    const meeting = await getMeeting(meetingId);

    renderMeetingDom(meeting); 
    renderParticipantDiv(meetingId);
}

renderMeeting();