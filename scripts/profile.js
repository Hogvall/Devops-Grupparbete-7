 
// Auth (signup/login/logout) + Create/Edit p rofile via Supabase REST API

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://wufgfgadhvprxdkcducx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZmdmZ2FkaHZwcnhka2NkdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDM5ODIsImV4cCI6MjA5MDYxOTk4Mn0.nrag-MvQtWt4d_sDyIBPD80s49IClYxKJXacLupAyKc";

const PROFILES_ENDPOINT = `${SUPABASE_URL}/rest/v1/profiles`;
const AUTH_URL = `${SUPABASE_URL}/auth/v1`;

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Returns base headers using the anon key (unauthenticated requests).
 */
export function getAnonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    ...extra,
  };
}

/**
 * Returns headers authenticated with the user's JWT access token.
 */
export function getAuthHeaders(accessToken, extra = {}) {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  };
}

/**
 * Save the Supabase session to localStorage.
 */
export function saveSession(session) {
  localStorage.setItem("sb_session", JSON.stringify(session));
}

/**
 * Load the saved session from localStorage.
 * Returns the session object or null.
 */
export function loadSession() {
  try {
    const raw = localStorage.getItem("sb_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the session from localStorage.
 */
export function clearSession() {
  localStorage.removeItem("sb_session");
}

// ── Auth API calls ────────────────────────────────────────────────────────────

/**
 * Sign up a new user with email and password.
 * Returns { session, user } on success.
 */
export async function signUp(email, password) {
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: getAnonHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || "Registrering misslyckades.");
  return data;
}

/**
 * Sign in an existing user with email and password.
 * Returns { access_token, user, ... } on success.
 */
export async function signIn(email, password) {
  const res = await fetch(`${AUTH_URL}/token?grant_type=password`, {
    method: "POST",
    headers: getAnonHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || "Inloggning misslyckades.");
  return data;
}

/**
 * Sign out the current user (invalidates the token server-side).
 */
export async function signOut(accessToken) {
  await fetch(`${AUTH_URL}/logout`, {
    method: "POST",
    headers: getAuthHeaders(accessToken),
  });
  clearSession();
}

// ── Profile API calls ─────────────────────────────────────────────────────────

/**
 * Validate the profile form fields.
 * Returns { valid: boolean, errors: object }
 */
export function validateProfile({ fname, lname, birthdate, location }) {
  const errors = {};
  if (!fname || fname.trim() === "") errors.fname = "Förnamn krävs.";
  if (!lname || lname.trim() === "") errors.lname = "Efternamn krävs.";
  if (!birthdate) errors.birthdate = "Födelsedag krävs.";
  if (!location || location.trim() === "") errors.location = "Plats krävs.";
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Fetch the profile for the logged-in user by their auth UUID.
 * Returns the profile object or null if not found.
 */
export async function fetchProfile(userId, accessToken) {
  const res = await fetch(`${PROFILES_ENDPOINT}?id=eq.${userId}&select=*`, {
    headers: getAuthHeaders(accessToken, { Accept: "application/json" }),
  });

  if (!res.ok) throw new Error(`Kunde inte hämta profil: ${res.status}`);
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

/**
 * Create a new profile using the auth user's UUID as the id.
 */
export async function createProfile(userId, profile, accessToken) {
  const res = await fetch(PROFILES_ENDPOINT, {
    method: "POST",
    headers: getAuthHeaders(accessToken, { Prefer: "return=representation" }),
    body: JSON.stringify({ id: userId, ...profile }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Kunde inte skapa profil: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update an existing profile by the user's UUID.
 */
export async function updateProfile(userId, profile, accessToken) {
  const res = await fetch(`${PROFILES_ENDPOINT}?id=eq.${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(accessToken, { Prefer: "return=representation" }),
    body: JSON.stringify(profile),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Kunde inte uppdatera profil: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

export function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => { toast.className = ""; }, 3500);
}

export function showFieldErrors(errors) {
  document.querySelectorAll(".field-error").forEach((el) => el.classList.remove("visible"));
  document.querySelectorAll("input").forEach((el) => el.classList.remove("error"));

  for (const [field, message] of Object.entries(errors)) {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(`${field}Error`);
    if (input) input.classList.add("error");
    if (errorEl) { errorEl.textContent = message; errorEl.classList.add("visible"); }
  }
}

export function clearFieldErrors() {
  document.querySelectorAll(".field-error").forEach((el) => el.classList.remove("visible"));
  document.querySelectorAll("input").forEach((el) => el.classList.remove("error"));
}

export function populateForm(profile) {
  if (!profile) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
  set("fname", profile.fname);
  set("lname", profile.lname);
  set("birthdate", profile.birthdate);
  set("location", profile.location);
  set("email", profile.email);
  set("imageInput", profile.image);
  updateAvatar(profile.image);
  updateAvatarPlaceholder(profile.fname);
}

export function updateAvatar(url) {
  const img = document.getElementById("avatarImg");
  const placeholder = document.getElementById("avatarPlaceholder");
  if (!img || !placeholder) return;
  if (url && url.trim() !== "") {
    img.src = url.trim();
    img.style.display = "block";
    placeholder.style.display = "none";
  } else {
    img.src = "";
    img.style.display = "none";
    placeholder.style.display = "block";
  }
}

export function updateAvatarPlaceholder(fname) {
  const placeholder = document.getElementById("avatarPlaceholder");
  if (!placeholder) return;
  placeholder.textContent = fname ? fname.charAt(0).toUpperCase() : "👤";
}

export function readFormValues() {
  return {
    fname: document.getElementById("fname")?.value.trim() ?? "",
    lname: document.getElementById("lname")?.value.trim() ?? "",
    birthdate: document.getElementById("birthdate")?.value ?? "",
    location: document.getElementById("location")?.value.trim() ?? "",
    image: document.getElementById("imageInput")?.value.trim() ?? "",
  };
}

// ── Section switching ─────────────────────────────────────────────────────────

function showAuth() {
  document.getElementById("authSection").classList.add("active");
  document.getElementById("profileSection").classList.remove("active");
  document.getElementById("logoutBtn").style.display = "none";
}

function showProfile() {
  document.getElementById("authSection").classList.remove("active");
  document.getElementById("profileSection").classList.add("active");
  document.getElementById("logoutBtn").style.display = "block";
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  // ── Tab switching (Login / Signup) ──
  document.getElementById("tabLogin")?.addEventListener("click", () => {
    document.getElementById("tabLogin").classList.add("active");
    document.getElementById("tabSignup").classList.remove("active");
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
    clearFieldErrors();
  });

  document.getElementById("tabSignup")?.addEventListener("click", () => {
    document.getElementById("tabSignup").classList.add("active");
    document.getElementById("tabLogin").classList.remove("active");
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
    clearFieldErrors();
  });

  // ── Login ──
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    clearFieldErrors();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email) { showFieldErrors({ loginEmail: "E-post krävs." }); return; }
    if (!password) { showFieldErrors({ loginPassword: "Lösenord krävs." }); return; }

    const btn = document.getElementById("loginBtn");
    btn.disabled = true; btn.textContent = "Loggar in...";

    try {
      const session = await signIn(email, password);
      saveSession(session);
      await loadProfileSection(session);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled = false; btn.textContent = "Logga in";
    }
  });

  // ── Signup ──
  document.getElementById("signupBtn")?.addEventListener("click", async () => {
    clearFieldErrors();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!email) { showFieldErrors({ signupEmail: "E-post krävs." }); return; }
    if (password.length < 6) { showFieldErrors({ signupPassword: "Lösenordet måste vara minst 6 tecken." }); return; }

    const btn = document.getElementById("signupBtn");
    btn.disabled = true; btn.textContent = "Skapar konto...";

    try {
      const result = await signUp(email, password);
      // Supabase may require email confirmation — handle both cases
      if (result.access_token) {
        saveSession(result);
        await loadProfileSection(result);
      } else {
        showToast("Konto skapat! Kontrollera din e-post för att bekräfta.", "success");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      btn.disabled = false; btn.textContent = "Skapa konto";
    }
  });

  // ── Logout ──
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    const session = loadSession();
    if (session?.access_token) await signOut(session.access_token).catch(() => {});
    clearSession();
    showAuth();
    showToast("Du har loggats ut.", "success");
  });

  // ── Check for existing session on load ──
  const session = loadSession();
  if (session?.access_token) {
    await loadProfileSection(session);
  } else {
    showAuth();
  }
}

/**
 * After successful auth: show the profile form and load any existing data.
 */
async function loadProfileSection(session) {
  showProfile();

  const userId = session.user?.id;
  const accessToken = session.access_token;
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");
  const pageTitle = document.getElementById("pageTitle");

  // Pre-fill email from auth
  const emailEl = document.getElementById("email");
  if (emailEl && session.user?.email) emailEl.value = session.user.email;

  let existingProfile = null;
  let isEditMode = false;

  try {
    existingProfile = await fetchProfile(userId, accessToken);
  } catch (e) {
    console.warn("Kunde inte ladda profil:", e.message);
  }

  if (existingProfile) {
    isEditMode = true;
    pageTitle.textContent = "Redigera profil";
    statusText.textContent = "Redigerar befintlig profil";
    statusBadge.classList.add("existing");
    populateForm(existingProfile);
  } else {
    statusText.textContent = "Skapar ny profil";
  }

  // ── Avatar URL input ──
  const imageInput = document.getElementById("imageInput");
  imageInput?.addEventListener("input", () => updateAvatar(imageInput.value));
  document.getElementById("avatarCircle")?.addEventListener("click", () => imageInput?.focus());
  document.getElementById("fname")?.addEventListener("input", (e) => {
    const img = document.getElementById("avatarImg");
    if (!img || img.style.display === "none") updateAvatarPlaceholder(e.target.value);
  });

  // ── Reset button ──
  document.getElementById("resetBtn")?.addEventListener("click", () => {
    if (isEditMode && existingProfile) {
      populateForm(existingProfile);
    } else {
      document.getElementById("profileForm")?.reset();
      if (emailEl && session.user?.email) emailEl.value = session.user.email;
      updateAvatar(""); updateAvatarPlaceholder("");
    }
    clearFieldErrors();
  });

  // ── Profile form submit ──
  document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const values = readFormValues();
    // Add email from auth user for storage
    const profileData = { ...values, email: session.user?.email };
    const { valid, errors } = validateProfile(values);

    if (!valid) { showFieldErrors(errors); return; }

    const saveBtn = document.getElementById("saveBtn");
    saveBtn.disabled = true; saveBtn.textContent = "Sparar...";

    try {
      if (isEditMode) {
        existingProfile = await updateProfile(userId, profileData, accessToken);
        showToast("Profilen uppdaterades! ✓", "success");
      } else {
        existingProfile = await createProfile(userId, profileData, accessToken);
        isEditMode = true;
        pageTitle.textContent = "Redigera profil";
        statusText.textContent = "Redigerar befintlig profil";
        statusBadge.classList.add("existing");
        showToast("Profilen skapades! ✓", "success");
      }
    } catch (err) {
      showToast(err.message || "Något gick fel.", "error");
    } finally {
      saveBtn.disabled = false; saveBtn.textContent = "Spara profil";
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
