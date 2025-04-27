document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('loginButton');
    const dropdown = document.getElementById('dropdown');
    const logoutButton = document.getElementById('logoutButton');
    const profileButton = document.getElementById('profileButton');

    // Variable to know when the user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (isLoggedIn && username) {
        // If the user is logged in, show the username on the button
        loginButton.innerHTML = `<i class="bi bi-person-circle"></i> ${username}`;

        // Click event listener for the login button to toggle the display of the logout dropdown
        loginButton.addEventListener('click', function (event) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Click event listener for the logout button functionality
        logoutButton.addEventListener('click', function () {
            // Clear login state
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            // Custom success alert
            Swal.fire({
                icon: 'success',
                title: 'Logged out successfully!',
                text: 'Redirecting...',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Redirect to home after logout
                window.location.hash = '#home';
                // Refresh the page
                window.location.reload();
            });
        });

        profileButton.addEventListener('click', function () {
            window.location.hash = '#userProfile';
            window.location.reload();
        });

    } else {
        // Click event listener that redirects to the login page if the user is not logged in
        loginButton.addEventListener('click', function () {
            // Redirect to the login page
            window.location.hash = '#login';
        });
    }

    // Click event listener to hide the logout menu when clicking outside the button or dropdown
    document.addEventListener('click', function (event) {
        if (!loginButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

});
