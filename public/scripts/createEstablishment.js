document.addEventListener("DOMContentLoaded", function () {
    const createGymForm = document.getElementById("createGymForm");

    console.log("this should be here");
    if (createGymForm) {
        createGymForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const gymData = {
                gymName: document.getElementById("registerGymName").value,
                gymDesc: document.getElementById("gymProfileDescription").value,
                address: document.getElementById("gymAddress").value,
                contactNumber: document.getElementById("gymContact").value,
                amenities: Array.from(document.querySelectorAll("input[name='amenities[]']:checked"))
                    .map(input => input.value),
                regions: document.querySelector("input[name='regions']:checked")?.value || ""
            };

            try {
                const response = await fetch("/createGym", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(gymData)
                });

                if (response.ok) {
                    const result = await response.json();
                    alert("Establishment created successfully!");
                    console.log(result);

                    $("#createGymModal").modal("hide");
                    createGymForm.reset();
                } else {
                    const errorData = await response.json();
                    alert("Error: " + (errorData.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });

        $("#createGymModal").on("hidden.bs.modal", function () {
            createGymForm.reset();
        });
    } else {
        console.error("Form element not found!");
    }
});