function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const emailField = document.getElementById('email');
    const usernameField = document.getElementById('registerUsername');
    const passwordField = document.getElementById('registerPassword');
    const confirmPasswordField = document.getElementById('registerConfirmPassword');
    const passwordRequirements = document.getElementById('passwordRequirements');

    if (registerForm) {
        // Submit listener to the register form
        registerForm.addEventListener('submit', function (e) {
            // Prevent the default behavior of an event from occurring
            e.preventDefault();

            const username = usernameField.value;
            const email = emailField.value;
            const password = passwordField.value;
            const confirmPassword = confirmPasswordField.value;

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
            }
            // Check if both passwords match
            else if (password !== confirmPassword) {
                // Custom warning alert
                Swal.fire({
                    icon: 'warning',
                    title: 'Passwords do not match!',
                    text: 'Please make sure both passwords are identical.',
                    confirmButtonText: 'OK'
                });
            } else {
                // Send the data to the register API
                fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Custom success alert
                            Swal.fire({
                                icon: 'success',
                                title: 'Registration successful!',
                                text: 'You can now log in.',
                                timer: 1500,
                                showConfirmButton: false
                            }).then(() => {
                                // Redirect to login
                                window.location.hash = '#login';
                            });
                        } else {
                            // Custom error alert
                            Swal.fire({
                                icon: 'error',
                                title: 'Registration failed',
                                text: 'Something went wrong. Please try again.',
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        // Custom error alert
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error registering. Please try again later.',
                        });
                    });
            }
        });

        // Call to the function that shows and hides the text with the password and confirm password
        togglePasswordVisibility('toggleRegisterPassword', 'registerPassword');
        togglePasswordVisibility('toggleRegisterConfirmPassword', 'registerConfirmPassword');

        // Input listener to validate the password in real-time and display feedback on requirements
        passwordField.addEventListener('input', function () {
            const requirements = validatePassword(passwordField.value);
            passwordRequirements.innerHTML = requirements.length === 0
                ? '<span class="text-success">Password is valid</span>'
                : 'Requirements: ' + requirements.join(', ');
        });
    }
}

// Function to validate the password
function validatePassword(password) {
    const requirements = [];
    if (password.length < 8) requirements.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) requirements.push('At least one uppercase letter');
    if (!/[0-9]/.test(password)) requirements.push('At least one number');
    return requirements; // Retorna los requisitos no cumplidos
}
