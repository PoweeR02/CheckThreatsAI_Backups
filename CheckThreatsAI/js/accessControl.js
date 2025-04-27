function setupDynamicButtons() {
    const getStartedButton = document.getElementById('getStartedButton');
    const addReviewButton = document.getElementById('addReviewButton');

    // Variable to know when is logged the user
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Configuration of button "Get Started"
    if (getStartedButton) {
        // Click event listener for the "Get Started" button to handle navigation based on login status
        getStartedButton.addEventListener('click', function () {
            if (isLoggedIn) {
                // Redirection to the section of "Upload Files"
                window.location.hash = '#uploadFiles';
            } else {
                // Custom danger alert
                Swal.fire({
                    icon: 'warning',
                    title: 'You must log in first!',
                    text: 'Please log in to continue.',
                    confirmButtonText: 'Log In',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirection to the section of "Login"
                        window.location.hash = '#login';
                    }
                });
            }
        });
    }

    // Configuration of button "Add Review"
    if (addReviewButton) {
        // Click event listener for the "Add review" button to handle navigation based on login status
        addReviewButton.addEventListener('click', function () {
            if (isLoggedIn) {
                // Redirection to the section of "Add Review"
                window.location.hash = '#addReview';
            } else {
                // Custom danger alert
                Swal.fire({
                    icon: 'warning',
                    title: 'You must log in first!',
                    text: 'Please log in to continue.',
                    confirmButtonText: 'Log In',
                    showCancelButton: true,
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Redirection to the section of de login
                        window.location.hash = '#login';
                    }
                });
            }
        });
    }
}

