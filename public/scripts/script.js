$(document).ready(function() {
    $('#register-link').click(function() {
        $('#registerModal').modal('show');
        $('#loginModal').modal('hide');
    });
});

let tempFilename = ""; // Store temp filename globally

document.getElementById("profilePictureFile").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show the image preview
    const preview = document.getElementById("profileImagePreview"); // Ensure this element exists in your HTML
    const reader = new FileReader();

    reader.onload = function (e) {
        preview.src = e.target.result;
    };

    reader.readAsDataURL(file);

    console.log("Uploading profile picture:", file.name); // Debugging

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
        const response = await fetch("/api/users/uploadTempProfilePicture", {
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
        console.error("Error uploading profile pictureeee:", error);
    }
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

// **Ensure `tempFilename` is sent when registering**
document.getElementById("registerButton").addEventListener("click", async function (event) {
    event.preventDefault();

    console.log("Temp Filename Before Registration:", tempFilename); // Debugging

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

    // ✅ Check if tempFilename is empty
    if (!tempFilename) {
        console.warn("⚠ Warning: No profile picture uploaded. Using default.");
    }

    try {
        const response = await fetch("/api/users", {
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
        const response = await fetch("/api/users/login", {
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
        const response = await fetch("/api/users/login", {
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

// document.getElementById("profilePictureFile").addEventListener("change", async function (event) {
//     const file = event.target.files[0];
//     if (!file) return;

//     // Update the image preview in the modal
//     const preview = document.getElementById("profileImageDisplay");
//     const reader = new FileReader();

//     reader.onload = function (e) {
//         preview.src = e.target.result; // Show selected image as preview
//     };

//     reader.readAsDataURL(file);

//     // Prepare the form data for upload
//     const formData = new FormData();
//     formData.append("profilePicture", file);

//     try {
//         const response = await fetch("/api/users/uploadProfilePicture", {
//             method: "POST",
//             body: formData
//         });

//         const data = await response.json();
//         if (response.ok) {
//             console.log("Profile picture updated successfully!");
//         } else {
//             console.error("Error:", data.message);
//         }
//     } catch (error) {
//         console.error("Error uploading profile picture:", error);
//     }
// });
