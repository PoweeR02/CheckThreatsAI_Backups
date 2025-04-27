function setupForgotPasswordForm() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (event) {
            // Prevent the default behavior of an event from occurring
            event.preventDefault();
            const email = document.getElementById('email').value;

            // Save the email in localStorage
            localStorage.setItem('email', email);

            // Send the data to the forgot password API
            fetch('http://localhost:3000/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
                // Process the response as JSON
                .then(response => response.json())
                .then(data => {
                    // Check if the response is successful. If there is no message in data, we assume it's an error related to the email
                    if (data.message) {
                        // Custom success alert
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'The email is correct',
                            timer: 2000,
                            showConfirmButton: false,
                        }).then(() => {
                            // Redirect to the verification code section
                            window.location.href = '#verificationCode';
                        });
                    } else {
                        // Custom error alert
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Please check your email and try again.', // Specific message for incorrect email
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        // Custom error alert
                        icon: 'error',
                        title: 'Error!',
                        text: 'Error recovering password. Please try again later.', // General error message
                    });
                });
        });
    }
}
