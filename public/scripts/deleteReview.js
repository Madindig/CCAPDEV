document.addEventListener("DOMContentLoaded", () => {
    const confirmDeleteButtons = document.querySelectorAll('[id^="deleteButton-"]');
  
    confirmDeleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const reviewId = button.dataset.reviewId;
        if (!reviewId) return;
  
        try {
          const response = await fetch(`/reviews/${reviewId}`, {
            method: "DELETE"
          });
  
          const data = await response.json();
  
          if (response.ok) {
            alert("Review deleted successfully!");
            location.reload();
          } else {
            alert(data.message || "Failed to delete review.");
          }
        } catch (err) {
          console.error(err);
          alert("An error occurred while deleting the review.");
        }
      });
    });
  });