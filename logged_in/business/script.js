document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = '/home/index.html';
});

document.getElementById('profileButton').addEventListener('click', function(event) {
    event.preventDefault();
    window.location.href = '/logged_in/business/index.html';
});