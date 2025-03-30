let selectedFile = null;

document.addEventListener("DOMContentLoaded", function () {
    const profilePictureInput = document.getElementById("profilePictureFile");
    const registerButton = document.getElementById("registerButton");
    const loginButton = document.getElementById("loginButton");
    const registerModal = document.getElementById("registerModal");

    const loginModal = document.getElementById("loginModal");

    function resetLoginModal() {
        const username = document.getElementById("loginUsername");
        const password = document.getElementById("loginPassword");
        const rememberMe = document.getElementById("rememberMe");

        if (username) username.value = "";
        if (password) password.value = "";
        if (rememberMe) rememberMe.checked = false;
    }

    function resetRegisterModal() {
        selectedFile = null;
        profilePictureInput.value = "";
        const preview = document.getElementById("profileImagePreview");
        if (preview) {
            preview.src = "/profile_pictures/default_avatar.jpg";
        }

        // Reset all text inputs and selects inside the modal
        const fieldsToReset = [
            "registerFirstName",
            "registerLastName",
            "registerUsername",
            "registerPassword",
            "registerConfirmPassword",
            "profileDescription",
            "accountType"
        ];

        fieldsToReset.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                if (field.tagName === "SELECT") {
                    field.selectedIndex = 0; // Reset dropdown
                } else {
                    field.value = ""; // Clear text inputs
                }
            }
        });
    }

    if (loginModal) {
        loginModal.addEventListener("hidden.bs.modal", resetLoginModal);
        const closeButton = loginModal.querySelector(".close");
        if (closeButton) {
            closeButton.addEventListener("click", resetLoginModal);
        }
    }

    if (registerModal) {
        registerModal.addEventListener("hidden.bs.modal", resetRegisterModal);
        const closeButton = registerModal.querySelector(".close");
        if (closeButton) {
            closeButton.addEventListener("click", resetRegisterModal);
        }
    }

    if (profilePictureInput) {
        profilePictureInput.addEventListener("change", function (event) {
            selectedFile = event.target.files[0];

            if (!selectedFile) {
                console.warn("No file selected.");
                return;
            }

            console.log("Selected file:", selectedFile.name);

            const preview = document.getElementById("profileImagePreview");
            if (!preview) {
                console.error("Image preview element not found.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = "block"; 
                console.log("Image preview updated.");
            };

            reader.onerror = function (error) {
                console.error("Error reading file:", error);
            };

            reader.readAsDataURL(selectedFile); 
        });
    }

    if (registerButton) {
        registerButton.addEventListener("click", async function (event) {
            event.preventDefault();

            console.log("Registering user...");

            const firstName = document.getElementById("registerFirstName").value.trim();
            const lastName = document.getElementById("registerLastName").value.trim();
            const username = document.getElementById("registerUsername").value.trim();
            const password = document.getElementById("registerPassword").value.trim();
            const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
            const shortDescription = document.getElementById("profileDescription").value.trim() || "";
            const role = document.getElementById("accountType").value;

            if (!firstName || !lastName || !username || !password || !confirmPassword) {
                alert("Please fill in all required fields.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            let tempFilename = "";

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
                        tempFilename = data.filename;
                        console.log("Uploaded temp filename:", tempFilename);
                    } else {
                        console.error("Upload error:", data.message);
                    }
                } catch (error) {
                    console.error("Error uploading profile picture:", error);
                }
            }

            try {
                const response = await fetch("/users/register", {
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
    }

    if (loginButton) {
        loginButton.addEventListener("click", async function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();
            console.log("Password field value before login:", document.getElementById("loginPassword").value);

            if (!username || !password) {
                alert("Please enter both username and password.");
                return;
            }

            try {
                const response = await fetch("/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.reload();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error("Error logging in:", error);
                alert("Error logging in. Please try again.");
            }
        });
    }

    async function loginUser(username, password) {
        try {
            const response = await fetch("/users/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password})
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
})
