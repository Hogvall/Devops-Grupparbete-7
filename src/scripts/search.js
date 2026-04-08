const SUPABASE_URL = "https://wufgfgadhvprxdkcducx.supabase.co";
const SUPABASE_KEY = "sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze";

async function fetchMeetings(category = "", location = "") {
  let url = `${SUPABASE_URL}/rest/v1/meetings?select=*`;

  if (category) url += `&category_id=eq.${category}`;
  if (location) url += `&location=eq.${location}`;

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const data = await response.json();
  return data;
}
function displayMeetings(meetings) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (meetings.length === 0) {
    container.innerHTML = "<p>No meetings found.</p>";
    return;
  }

  meetings.forEach((meeting) => {
    const card = document.createElement("div");
    card.className = "meeting-card";
    card.innerHTML = `
      <img src="${meeting.image}" alt="${meeting.title}" />
      <h3>${meeting.title}</h3>
      <p>${meeting.location}</p>
      <p>${meeting.time}</p>
      <a href="meeting.html?id=${meeting.id}">View meeting</a>
    `;
    container.appendChild(card);
  });
}
async function handleSearch() {
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;
  const meetings = await fetchMeetings(category, location);
  displayMeetings(meetings);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.querySelector(".search-btn");
  searchBtn.addEventListener("click", handleSearch);
  handleSearch();
});