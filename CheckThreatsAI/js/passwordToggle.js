function togglePasswordVisibility(toggleButtonId, passwordFieldId) {
    const toggleButton = document.getElementById(toggleButtonId);
    const passwordField = document.getElementById(passwordFieldId);

    if (toggleButton && passwordField) {
        // Click event listener to the toggle button
        toggleButton.addEventListener('click', function () {
            // Toggle the password field type between 'password' and 'text'
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);

            // Toggle the icon between 'bi-eye' and 'bi-eye-slash'
            this.classList.toggle('bi-eye');
            this.classList.toggle('bi-eye-slash');
        });
    }
}
