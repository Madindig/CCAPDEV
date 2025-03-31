document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[id^='editGymForm-']").forEach(form => {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            alert("Submitting form...");

            const gymIdInput = form.querySelector("[id^='gymId']");
            const gymId = gymIdInput ? gymIdInput.value : null;

            alert(gymId);

            if (!gymId) {
                alert("Error: Gym ID not found!");
                return;
            }

            const gymData = {
                gymName: form.querySelector("[id^='eGymName-']").value,
                gymDesc: form.querySelector("[id^='eGymDescription-']").value,
                address: form.querySelector("[id^='eGymAddress-']").value,
                contactNumber: form.querySelector("[id^='eGymContact-']").value,
                amenities: Array.from(form.querySelectorAll("input[name='eAmenities[]']:checked")).map(input => input.value),
                regions: form.querySelector("input[name='eRegions']:checked")?.value || null
            };

            try {
                const response = await fetch(`/users/updateGym/${gymId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(gymData)
                });

                if (response.ok) {
                    alert("Gym updated successfully!");
                    $(form).closest(".modal").modal("hide"); // Close modal
                    form.reset();
                } else {
                    const errorData = await response.json();
                    alert("Error: " + (errorData.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while updating the gym.");
            }
        });
    });

    $("[id^='editGymModal-']").on("hidden.bs.modal", function () {
        $(this).find("form")[0].reset();
    });
});