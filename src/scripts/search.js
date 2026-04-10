import { CATEGORIES } from "./create-meeting-logic.js";

const SUPABASE_URL = "https://wufgfgadhvprxdkcducx.supabase.co";
const SUPABASE_KEY = "sb_publishable_RQEs3xlyjHfIs2X3Ql6jbQ_KsKkQZze";

async function fetchMeetings(category = "", location = "") {
  let url = `${SUPABASE_URL}/rest/v1/meetings?select=*`;

  if (category) url += `&category_id=eq.${category}`;
  if (location) url += `&location=eq.${location}`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Could not fetch meetings:", error);
    return [];
  }
}

async function fetchLocations() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/meetings?select=location`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return [...new Set(data.map((m) => m.location))];
  } catch (error) {
    console.error("Could not fetch locations:", error);
    return [];
  }
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

function renderCategoryOptions() {
  const select = document.getElementById("category");
  CATEGORIES.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

async function renderLocationOptions() {
  const select = document.getElementById("location");
  const locations = await fetchLocations();
  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    select.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  renderCategoryOptions();
  await renderLocationOptions();
  const searchBtn = document.querySelector(".search-btn");
  searchBtn.addEventListener("click", handleSearch);
  handleSearch();
});

export { fetchMeetings, fetchLocations, displayMeetings, handleSearch };