document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editProfileForm');
    const profileImagePreview = document.getElementById('profileImagePreview');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userId = form.getAttribute('data-user-id');
        const formData = new FormData(form);
        const previousPicture = formData.get('previousPicture'); // Assuming there's an input for previous picture

        try {
            const response = await fetch(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...Object.fromEntries(formData),
                    previousPicture: previousPicture
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                profileImagePreview.src = data.newProfileImage; // Assuming the response contains the new image URL
                alert('Profile updated successfully!');
            } else {
                alert('Error updating profile.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
