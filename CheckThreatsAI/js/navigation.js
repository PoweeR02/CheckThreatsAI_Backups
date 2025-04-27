function updateActiveNav() {
    // Getting the hash from URL. If it is not present, default to home
    const currentHash = window.location.hash || '#home';
    // Select all elements with the class 'nav-link'
    const navLinks = document.querySelectorAll('.nav-link');

    // Loop through nav links and update active class based on the current hash
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentHash) {
            // Add 'active' class to matching link
            link.classList.add('active');
        } else {
            // Remove 'active' class to matching link
            link.classList.remove('active');
        }
    });

    const loginButton = document.getElementById('loginButton');
    // Toggle button state based on whether the current hash is '#login'
    if (currentHash === '#login') {
        loginButton.classList.add('btn-active');
        loginButton.classList.remove('btn-inactive');
    } else {
        loginButton.classList.add('btn-inactive');
        loginButton.classList.remove('btn-active');
    }
}
