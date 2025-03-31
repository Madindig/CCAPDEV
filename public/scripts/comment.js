function loadComments(reviewId, establishmentId) {
    fetch(`/establishments/${establishmentId}/reviews/${reviewId}`)
        .then(response => response.json())
        .then(data => {
            const commentSection = document.getElementById("commentModalBody");
            commentSection.innerHTML = ""; // Clear previous comments

            if (data.comments.length > 0) {
                data.comments.forEach(comment => {
                    commentSection.innerHTML += `
                        <div class="comment">
                            <p><strong>${comment.userId.username}</strong>: ${comment.commentText}</p>
                            <p><small>Posted at: ${new Date(comment.createdAt).toLocaleString()}</small></p>
                            <hr>
                        </div>
                    `;
                });
            } else {
                commentSection.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
            }
        })
        .catch(error => console.error("Error loading comments:", error));
}

function post_comment() {
    const commentText = document.getElementById("commentbox").value;
    if (commentText.trim() === "") {
        alert("Comment cannot be empty.");
        return;
    }

    fetch('/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ commentText })
    })
    .then(response => response.json())
    .then(newComment => {
        const commentSection = document.getElementById("commentModalBody");
        commentSection.innerHTML += `
            <div class="comment">
                <p><strong>${newComment.userId.username}</strong>: ${newComment.commentText}</p>
                <p><small>Posted at: ${new Date(newComment.createdAt).toLocaleString()}</small></p>
                <hr>
            </div>
        `;
        document.getElementById("commentbox").value = "";
    })
    .catch(error => console.error("Error posting comment:", error));
}

function post_review() {
    const reviewText = document.getElementById("reviewbox").value;
    if (reviewText.trim() === "") {
        alert("Review cannot be empty.");
        return;
    }

    fetch('/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewText })
    })
    .then(response => response.json())
    .then(newReview => {
        alert("Review posted successfully.");
        document.getElementById("reviewbox").value = "";
    })
    .catch(error => console.error("Error posting review:", error));
}