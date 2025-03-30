async function post_review() {
    const reviewText = document.getElementById("reviewbox").value.trim();
    const rating = document.getElementById("reviewRating").value;
    const establishmentId = window.location.pathname.split("/").pop(); // Get ID from URL
  
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
        location.reload(); // Reload to show new review
      } else {
        alert(data.message || "Failed to post review.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while posting the review.");
    }
  }