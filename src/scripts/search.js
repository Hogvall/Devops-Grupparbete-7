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