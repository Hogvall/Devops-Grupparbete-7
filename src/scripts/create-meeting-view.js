import { CATEGORIES } from "./create-meeting-logic.js";

export function renderCategoryOptions() {
    const select = document.getElementById("category");

    CATEGORIES.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

export function showStatusMessage(message, isError = false) {
    const el = document.getElementById("status_message");
    el.textContent = message;
    el.style.color = isError ? "red" : "green";
}
