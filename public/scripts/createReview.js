document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("createReviewForm");
  const reviewModal = document.getElementById("createReviewModal");

  function resetReviewModal() {
    const reviewText = document.getElementById("reviewbox");
    const rating = document.getElementById("reviewRating");
  
    if (reviewText) reviewText.value = "";
    if (rating) rating.value = "5";
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const reviewText = document.getElementById("reviewbox").value.trim();
      const rating = document.getElementById("reviewRating").value;
      const establishmentId = document.getElementById("establishmentId").value;

      if (!reviewText) {
        alert("Please enter your review.");
        return;
      }

      try {
        const response = await fetch(`/reviews/${establishmentId}/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ reviewText, rating })
        });

        const data = await response.json();

        if (response.ok) {
          alert("Review posted!");
          location.reload();
        } else {
          alert(data.message || "Failed to post review.");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred while posting the review.");
      }
    });
  }

  // Reset form when modal is closed
  if (reviewModal) {
    reviewModal.addEventListener("hidden.bs.modal", resetReviewModal);
  
    const closeButton = reviewModal.querySelector(".close");
    if (closeButton) {
      closeButton.addEventListener("click", resetReviewModal);
    }
  }
});