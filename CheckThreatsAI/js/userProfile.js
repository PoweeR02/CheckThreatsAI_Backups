function renderUserProfile() {
    // Get user data from localStorage
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    // Display the profile title
    const userAccountTitle = document.getElementById('userAccountTitle');
    if (userAccountTitle) {
        userAccountTitle.textContent = `${username}'s Account`;
    }

    // Display the user's email
    const userEmail = document.getElementById('userEmail');
    if (userEmail) {
        userEmail.textContent = email;
    }

    // Get reviews for the logged-in user
    const userReviewsList = document.getElementById('userReviewsList');
    if (userReviewsList) {
        userReviewsList.innerHTML = ''; // Clear previous content

        // API call to get user reviews
        fetch(`http://localhost:3000/user-profile-reviews?email=${email}`)
            .then(response => response.json())
            .then(reviews => {
                if (!Array.isArray(reviews) || reviews.length === 0) {
                    userReviewsList.innerHTML = '<p class="text-center">You have not made any reviews.</p>';
                } else {
                    reviews.forEach(review => {
                        const formattedDate = replaceDashesWithSlashes(review.date);
                        const reviewElement = document.createElement('div');
                        reviewElement.classList.add('card', 'mb-3');

                        // Save the email in localStorage
                        reviewElement.innerHTML = `
                            <div class="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <p class="card-text">${review.message}</p>
                                    <p class="card-text"><small class="text-muted">Reviewed on: ${formattedDate}</small></p>
                                </div>
                                <button class="btn btn-sm remove-review" data-message="${review.message}" data-date="${formattedDate}">❌</button>
                            </div>
                        `;
                        userReviewsList.appendChild(reviewElement);
                    });

                    // Add listener for the delete buttons
                    document.querySelectorAll('.remove-review').forEach(button => {
                        button.addEventListener('click', (event) => {
                            const message = event.target.getAttribute('data-message');
                            const date = event.target.getAttribute('data-date');
                            Swal.fire({
                                title: 'Are you sure?',
                                text: 'Do you really want to delete this review? This action cannot be undone.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Yes, delete it!',
                                cancelButtonText: 'Cancel'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    fetch(`http://localhost:3000/delete-review`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ message, date })
                                    })
                                        .then(response => response.json())
                                        .then(result => {
                                            if (result.success) {
                                                Swal.fire('Deleted!', 'Your review has been deleted.', 'success')
                                                    .then(() => {
                                                        renderUserProfile(); // Reload profile to remove deleted review
                                                    });
                                            } else {
                                                Swal.fire('Error', 'There was a problem deleting the review.', 'error');
                                            }
                                        })
                                        .catch(err => {
                                            console.error('Error deleting review:', err);
                                            Swal.fire('Error', 'An error occurred while deleting the review.', 'error');
                                        });
                                }
                            });
                        });
                    });
                }
            })
            .catch(err => {
                console.error('Error fetching reviews:', err);
                userReviewsList.innerHTML = '<p class="text-center">Error loading reviews.</p>';
            });
    }

    // Get analyses for the logged-in user
    const userReportsList = document.getElementById('userReportsList'); // ✅ Nuevo contenedor para análisis
    if (userReportsList) {
        userReportsList.innerHTML = ''; // Clear previous content

        // API call to get user analyses
        fetch(`http://localhost:3000/user-profile-analyses?email=${email}`)
            .then(response => response.json())
            .then(analyses => {
                if (!Array.isArray(analyses) || analyses.length === 0) {
                    userReportsList.innerHTML = '<p class="text-center">You have not made any file analyses.</p>';
                } else {
                    analyses.forEach(analysis => {
                        const formattedDate = replaceDashesWithSlashes(analysis.analysis_date);
                        const analysisElement = document.createElement('div');
                        analysisElement.classList.add('card', 'mb-3');

                        // Add the delete button (the cross)
                        analysisElement.innerHTML = `
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title"><u>File</u>: ${analysis.file_name}</h5>
                                <p class="card-text"><strong>Result:</strong> ${analysis.file_type}</p>
                                <p class="card-text"><small class="text-muted">Analyzed on: ${formattedDate}</small></p>
                            </div>
                            <button class="btn btn-sm remove-analysis" data-id="${analysis.id_file_analysis}">❌</button>
                        </div>
                    `;
                        userReportsList.appendChild(analysisElement);
                    });

                    // Add event listener for the delete analysis buttons
                    document.querySelectorAll('.remove-analysis').forEach(button => {
                        button.addEventListener('click', (event) => {
                            const analysisId = event.target.getAttribute('data-id');
                            Swal.fire({
                                title: 'Are you sure?',
                                text: 'Do you really want to delete this analysis? This action cannot be undone.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Yes, delete it!',
                                cancelButtonText: 'Cancel'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    fetch(`http://localhost:3000/delete-analysis`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ id_file_analysis: analysisId })
                                    })
                                        .then(response => response.json())
                                        .then(result => {
                                            if (result.success) {
                                                Swal.fire('Deleted!', 'Your analysis has been deleted.', 'success')
                                                    .then(() => {
                                                        renderUserProfile(); // Reload profile to remove deleted analysis
                                                    });
                                            } else {
                                                Swal.fire('Error', 'There was a problem deleting the analysis.', 'error');
                                            }
                                        })
                                        .catch(err => {
                                            console.error('Error deleting analysis:', err);
                                            Swal.fire('Error', 'An error occurred while deleting the analysis.', 'error');
                                        });
                                }
                            });
                        });
                    });
                }
            })
            .catch(err => {
                console.error('Error fetching analyses:', err);
                userReportsList.innerHTML = '<p class="text-center">Error loading analyses.</p>';
            });
    }


    // Delete account functionality
    const deleteAccountButton = document.getElementById('deleteAccountButton');
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', () => {
            // Confirm account deletion with SweetAlert
            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you really want to delete your account? This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Fetch request to delete the account from the server
                    fetch(`http://localhost:3000/delete-account`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email })  // Sending email in the request body
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (result.success) {
                                // Clear localStorage
                                localStorage.setItem('isLoggedIn', false);
                                localStorage.removeItem('username');
                                localStorage.removeItem('email');

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Account deleted!',
                                    text: 'Your account has been deleted successfully.',
                                    confirmButtonColor: '#3085d6'
                                }).then(() => {
                                    // Redirect to home after account deletion
                                    window.location.hash = '#home';
                                    window.location.reload();
                                });
                            } else {
                                Swal.fire('Error', 'There was a problem deleting your account.', 'error');
                            }
                        })
                        .catch(err => {
                            console.error('Error deleting account:', err);
                            Swal.fire('Error', 'An error occurred while deleting your account.', 'error');
                        });
                }
            });
        });
    }
}

// Function to replace dashes with slashes for date formatting
function replaceDashesWithSlashes(dateString) {
    return dateString.replace(/-/g, '/');
}