$(document).ready(function() {
    $('#register-link').click(function() {
        $('#registerModal').modal('show');
        $('#loginModal').modal('hide');
    });
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

// Handle Registration Submission
document.getElementById("registerButton").addEventListener("click", async function (event) {
    event.preventDefault();

    const firstName = document.getElementById("registerFirstName").value.trim();
    const lastName = document.getElementById("registerLastName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
    const shortDescription = document.getElementById("profileDescription").value.trim() || "";

    if (!firstName || !lastName || !username || !password || !confirmPassword) {
        alert("Please fill in all required fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, username, password, shortDescription, role: selectedRole })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registration successful! Logging you in...");
            await loginUser(username, password, selectedRole);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error registering user:", error);
        alert("Error registering. Please try again.");
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
