function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        // Submit event listener to the login form
        loginForm.addEventListener('submit', function (event) {
            // Prevent the default behavior of an event from occurring
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('loginPassword').value;

            // Send the data to the login API
            fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Save the session state in localStorage
                        localStorage.setItem('isLoggedIn', true);
                        localStorage.setItem('username', username);
                        // Save the email in localStorage
                        localStorage.setItem('email', data.email);

                        // Custom success alert
                        Swal.fire({
                            icon: 'success',
                            title: 'Login successful!',
                            text: 'Redirecting...',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            // Redirect to the home page
                            window.location.hash = '#home';
                            // Refresh the page
                            window.location.reload();
                        });
                    } else {
                        // Custom error alert
                        Swal.fire({
                            icon: 'error',
                            title: 'Login failed',
                            text: 'Check your credentials and try again.',
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        // Custom error alert
                        icon: 'error',
                        title: 'Error',
                        text: 'Error recovering password. Please try again later.',
                    });
                });
        });

        // Call to the function that shows and hides the text.
        togglePasswordVisibility('toggleLoginPassword', 'loginPassword');
    }
}
