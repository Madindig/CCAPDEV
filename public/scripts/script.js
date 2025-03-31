// Navbar establishment search script
document.getElementById("search-addon").addEventListener("click", function() {
    window.location.href = "/results?search="+document.getElementById("searchQueryNavbar").value;
  });