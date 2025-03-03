let selectedFile = null; // Store selected file globally

document.getElementById("profilePictureFile").addEventListener("change", function (event) {
    selectedFile = event.target.files[0];

    if (!selectedFile) {
        console.warn("No file selected.");
        return;
    }

    console.log("Selected file:", selectedFile.name);

    // Get the preview image element
    const preview = document.getElementById("profileImagePreview");
    if (!preview) {
        console.error("Image preview element not found.");
        return;
    }

    // Read the image file and update the preview
    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block"; // Ensure the image is visible
        console.log("Image preview updated.");
    };

    reader.onerror = function (error) {
        console.error("Error reading file:", error);
    };

    reader.readAsDataURL(selectedFile); // Convert file to a data URL for preview
});

// Track the selected role (default to 'people')
let selectedRole = "people";

// When clicking "People" or "Business", set the selected role
document.getElementById("peopleButton").addEventListener("click", function () {
    selectedRole = "people";
});

document.getElementById("businessButton").addEventListener("click", function () {
    selectedRole = "business";
});

document.getElementById("registerButton").addEventListener("click", async function (event) {
    event.preventDefault();

    console.log("Registering user...");

    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName = document.getElementById("registerLastName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
    const shortDescription = document.getElementById("profileDescription").value.trim() || "";
    const role = selectedRole;

    if (!firstName || !lastName || !username || !password || !confirmPassword) {
        alert("Please fill in all required fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    let tempFilename = ""; // Default to empty

    // Upload the image only when the user clicks "Register"
    if (selectedFile) {
        console.log("Uploading profile picture...");

        const formData = new FormData();
        formData.append("profilePicture", selectedFile);

        try {
            const response = await fetch("/users/uploadTempProfilePicture", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                tempFilename = data.tempFilename;
                console.log("Uploaded temp filename:", tempFilename);
            } else {
                console.error("Upload error:", data.message);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        }
    }

    // Send registration request
    try {
        const response = await fetch("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, username, password, shortDescription, role, tempFilename })
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Registration Successful:", data);
            window.location.reload();
        } else {
            console.error("Error:", data.message);
        }
    } catch (error) {
        console.error("Error registering user:", error);
    }
});

// Handle Login Submission
document.getElementById("loginButton").addEventListener("click", async function (event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    try {
        const response = await fetch("/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role: selectedRole })
        });

        const data = await response.json();
        if (response.ok) {
            // alert("Login successful!");
            window.location.reload();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert("Error logging in. Please try again.");
    }
});

// Auto-login after successful registration
async function loginUser(username, password, role) {
    try {
        const response = await fetch("/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role })
        });

        const data = await response.json();
        if (response.ok) {
            window.location.reload();
        } else {
            alert(`Error logging in after registration: ${data.message}`);
        }
    } catch (error) {
        console.error("Auto-login error:", error);
        alert("Auto-login failed. Please log in manually.");
    }
}
