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

function post_comment(){
    alert("Posted: " + document.getElementById("commentbox").value);
    document.getElementById("commentbox").value = ""
}

function post_review(){
    alert("Posted: " + document.getElementById("reviewbox").value);
    document.getElementById("reviewbox").value = ""
}