import { uploadImage, createMeeting, addOrganizer } from "./create-meeting-logic.js";
import { renderCategoryOptions, showStatusMessage } from "./create-meeting-view.js";

const currentUser = "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2";

renderCategoryOptions();

document.getElementById("create_meeting_form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;

    try {
        let imageUrl = null;
        const imageFile = form.image.files[0];
        if (imageFile) 
            imageUrl = await uploadImage(imageFile);

        const [meeting] = await createMeeting({
            title: form.title.value.trim(),
            description: form.description.value.trim(),
            category_id: Number(form.category_id.value),
            location: form.location.value.trim(),
            time: form.time.value,
            image: imageUrl,
            max_participants: Number(form.max_participants.value)
        });

        await addOrganizer(currentUser, meeting.id);

        showStatusMessage("The meeting has been created.");
        form.reset();
    } catch {
        showStatusMessage("Something went wrong.", true);
    }
});
