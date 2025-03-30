document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('editPeopleProfileForm');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userId = form.getAttribute('data-user-id');
        const password = document.getElementById('editPeoplePassword').value;
        const confirmPassword = document.getElementById('editPeopleConfirmPassword').value;
        const shortDescription = document.getElementById('editPeopleProfileDescription').value;

        if (password && password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const payload = {
            ...(password && { password }),
            ...(shortDescription && { shortDescription })
        };

        try {
            const response = await fetch(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Profile updated successfully!');
                location.reload();
            } else {
                alert('Error updating profile.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });
});
