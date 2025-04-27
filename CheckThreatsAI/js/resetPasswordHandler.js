function setupResetPasswordForm() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const passwordField = document.getElementById('resetPassword');
    const confirmPasswordField = document.getElementById('resetConfirmPassword');
    const passwordRequirements = document.getElementById('passwordRequirements');
    const emailDisplay = document.getElementById('emailDisplay');

    if (resetPasswordForm) {
        // Recover the email from localStorage
        const email = localStorage.getItem('email');

        if (email) {
            // Display the email for which the password is being changed
            emailDisplay.innerText = `You are changing the password for: ${email}`;
        }

        // Submit event listener to the reset password form
        resetPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the default form submission

            const password = passwordField.value; // Get the new password
            const confirmPassword = confirmPasswordField.value; // Get the confirmation password

            // Validate the password against defined criteria
            const requirements = validatePassword(password);
            if (requirements.length > 0) {
                // Custom warning alert
                Swal.fire({
                    icon: 'warning',
                    title: 'Password requirements not met!',
                    text: 'Please ensure your password meets the following requirements: ' + requirements.join(', '),
                    confirmButtonText: 'OK'
                });
                // Exit if the password is invalid
                return;
            }

            // Check if both passwords match
            if (password !== confirmPassword) {
                // Custom warning alert
                Swal.fire({
                    icon: 'warning',
                    title: 'Passwords do not match!',
                    text: 'Please make sure both passwords are identical.',
                    confirmButtonText: 'OK'
                });
                // Exit if passwords do not match
                return;
            }

            // Send the data to the reset password API
            fetch('http://localhost:3000/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send email and new password as JSON
                body: JSON.stringify({ email, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Custom success alert
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Password has been reset successfully.',
                            timer: 2000,
                            showConfirmButton: false,
                        }).then(() => {
                            // Redirect to login page
                            window.location.href = '#login';
                        });
                    } else {
                        // Custom error alert
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Failed to reset password. Please try again.',
                        });
                    }
                })
                .catch(error => {
                    // Log any errors to the console
                    console.error('Error:', error);
                    // Custom error alert
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'An error occurred while resetting the password. Please try again later.',
                    });
                });
        });

        // Call to the function that shows and hides the text with the password and confirm password
        togglePasswordVisibility('toggleResetPassword', 'resetPassword');
        togglePasswordVisibility('toggleResetConfirmPassword', 'resetConfirmPassword');

        // Input event listener to validate the password in real-time and display feedback on requirements
        passwordField.addEventListener('input', function () {
            const requirements = validatePassword(passwordField.value); // Validate current password input
            passwordRequirements.innerHTML = requirements.length === 0
                ? '<span class="text-success">Password is valid</span>' // Show success message if valid
                : 'Requirements: ' + requirements.join(', '); // Show requirements if invalid
        });
    }
}
