document.getElementById("createGymForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this); // Automatically gathers all form inputs
    console.log("Form submitted!");
    try {
        const response = await fetch("/createGym", {
            method: "POST",
            body: formData, // Sends as multipart/form-data
        });

        if (response.ok) {
            const result = await response.json();
            alert("Establishment created successfully!");
            console.log(result);
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
        }

        console.log("Response received:", response);
    } catch (error) {
        console.error("Error:", error);
    }
});

document.getElementById("gymProfilePictureFile").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("gymProfileImagePreview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.querySelector("button[type='submit']").addEventListener("click", function () {
    console.log("Submit button clicked!");
});