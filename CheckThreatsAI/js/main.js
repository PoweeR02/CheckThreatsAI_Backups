document.addEventListener("DOMContentLoaded", function () {
    function loadContent() {
        // Getting the hash from URL without "#". If it is not present, default to home
        const hash = window.location.hash.substring(1) || 'home';
        const mainContent = document.getElementById('main-content');

        fetch(`html/${hash}.html`)
            .then(response => {
                if (!response.ok) throw new Error('Content not found');
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;

                switch (hash) {
                    case 'addReview':
                        setupReviewForm();
                        break;
                    case 'login':
                        setupLoginForm();
                        break;
                    case 'register':
                        setupRegisterForm();
                        break;
                    case 'home':
                        setupDynamicButtons();
                        displayReviews();
                        break;
                    case 'forgotPassword':
                        setupForgotPasswordForm();
                        break;
                    case 'verificationCode':
                        setupVerificationCodeForm();
                        break;
                    case 'resetPassword':
                        setupResetPasswordForm();
                        break;
                    case 'userProfile':
                        renderUserProfile();
                        break;
                    case 'uploadFiles':
                        setupFileUpload();
                        break;
                    case 'processingFiles':
                        setupProcessingSimulation();
                        break;
                    case 'resultsFiles':
                        setupResultsPage();
                }
            })
            .catch(error => {
                // Show the error image if the content is not found.
                mainContent.innerHTML = `<img src="images/not_found.jpg" alt="Content not available" class="img-fluid mx-auto d-block mb-5" style="max-width: 500px;">`;
                // Custom error alert
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'The requested address does not exist on this website.',
                });
                console.error('Error loading content:', error);
            });
    }

    // Listener to detect hash changes
    window.addEventListener('hashchange', function () {
        updateActiveNav();
        loadContent();
    });

    // Listener to detect load content.
    window.addEventListener('load', function () {
        updateActiveNav();
        loadContent();
    });
});
