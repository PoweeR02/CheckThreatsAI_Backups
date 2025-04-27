function setupVerificationCodeForm() {
    const verificationCodeForm = document.getElementById('verificationCodeForm');
    const emailDisplay = document.getElementById('emailDisplay');

    if (verificationCodeForm) {

        // Recover the email from localStorage
        const email = localStorage.getItem('email');

        if (email) {
            // Display the email for which the password is being changed
            emailDisplay.innerText = `The code is sent to: ${email}`;
        }

        // Submit event listener for the form that handles verification code submission
        verificationCodeForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Get the verification code input value
            const verificationCode = document.getElementById('verificationCode').value;

            // Send the data to the verify code API
            fetch('http://localhost:3000/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationCode })
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.success) {
                        Swal.fire({
                            // Custom success alert
                            icon: 'success',
                            title: 'Success!',
                            text: 'Verification code is correct.',
                            timer: 2000,
                            showConfirmButton: false,
                        }).then(() => {
                            // Redirect to password reset section if successful
                            window.location.href = '#resetPassword';
                        });
                    } else {
                        Swal.fire({
                            // Custom error alert
                            icon: 'error',
                            title: 'Error!',
                            text: data.error || 'Invalid verification code. Please try again.',
                        }).then(() => {
                            // Redirect to forgot password section if not succesful
                            window.location.href = '#forgotPassword';
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        // Custom error alert
                        icon: 'error',
                        title: 'Error!',
                        text: 'An error occurred while verifying the code. Please try again later.',
                    });
                });
        });
    }
}
