function setupReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    const usernameInput = document.getElementById('reviewName');

    // Fill the name field with the username stored in localStorage
    const username = localStorage.getItem('username');
    if (username) {
        usernameInput.value = username;
        usernameInput.style.backgroundColor = '#e9ecef';
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            // Prevent the default behavior of an event from occurring
            e.preventDefault();

            const name = usernameInput.value; // Use the name from the input
            const city = document.getElementById('reviewCity').value;
            const message = document.getElementById('reviewMessage').value;

            // Send the data to the reviews API
            fetch('http://localhost:3000/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send the form data
                body: JSON.stringify({ name, city, message, username }),
            })
                .then(response => response.json())
                .then(data => {
                    // Custom success alert
                    Swal.fire({
                        title: 'Success!',
                        text: 'Review added successfully!',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });

                    // Reset the form after sending
                    reviewForm.reset();
                    // Redirect to home after successfully sending the review
                    window.location.href = '#home'; // Change the hash to 'home' to load the main page
                    // Update reviews after adding a new one
                    displayReviews();
                })
                .catch(error => {
                    console.error('Error:', error);
                    // Custom error alert
                    Swal.fire({
                        title: 'Error!',
                        text: 'Error adding review. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        });
    }
}

// Function to show existing reviews
function displayReviews() {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    // Get reviews from API
    fetch('http://localhost:3000/reviews')
        .then(response => response.json())
        .then(data => {
            // Clear the reviews list
            reviewsList.innerHTML = '';

            if (data.length === 0) {
                reviewsList.innerHTML = '<p class="text-center">No reviews yet.</p>';
            } else {
                // Add each review to the DOM
                data.forEach(review => {
                    const formattedDate = replaceDashesWithSlashes(review.date);
                    const reviewElement = document.createElement('div');
                    reviewElement.classList.add('card', 'mb-3');
                    reviewElement.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">${review.name} from ${review.city}</h5>
                            <p class="card-text">${review.message}</p>
                            <p class="card-text"><small class="text-muted">Reviewed on: ${formattedDate}</small></p>
                        </div>
                    `;
                    reviewsList.appendChild(reviewElement);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching reviews:', error);
            reviewsList.innerHTML = '<p class="text-center">Error loading reviews. Please try again later.</p>';
        });
}

// Function to replace dashes with slashes for date formatting
function replaceDashesWithSlashes(dateString) {
    return dateString.replace(/-/g, '/');
}

