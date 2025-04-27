function setupFileUpload() {
    let selectedFile = null;
    const dragArea = document.getElementById('dragArea');
    const fileInput = document.getElementById('fileInput');
    const fileBtn = document.getElementById('fileBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileList = document.getElementById('fileList');

    // Setup click on "Browse files" button to trigger hidden input
    fileBtn.addEventListener('click', () => fileInput.click());

    // Handle file selection through file dialog
    fileInput.addEventListener('change', () => addFile(fileInput.files[0]));

    // Setup drag-and-drop events
    window.addEventListener('dragover', (event) => {
        event.preventDefault();
        dragArea.classList.add('hover');
    });

    window.addEventListener('dragleave', () => dragArea.classList.remove('hover'));

    window.addEventListener('drop', (event) => {
        event.preventDefault();
        dragArea.classList.remove('hover');
        addFile(event.dataTransfer.files[0]);
    });

    // Add file to the list and validate size
    function addFile(file) {
        const MAX_FILE_SIZE_MB = 5;
        const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            Swal.fire({
                icon: 'error',
                title: 'File too large',
                text: `The selected file exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
                confirmButtonText: 'OK'
            });
            return;
        }

        selectedFile = file;
        fileList.innerHTML = '';

        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        listItem.innerHTML = `
            ${selectedFile.name}
            <button type="button" class="btn btn-danger btn-sm remove-file">Remove</button>
        `;
        fileList.appendChild(listItem);

        fileInfo.innerHTML = `<p><strong>1 file</strong> selected.</p>`;

        // Setup remove button for selected file
        document.querySelector('.remove-file').addEventListener('click', () => {
            selectedFile = null;
            fileList.innerHTML = '';
            fileInfo.innerHTML = '';
        });
    }

    // Handle form submission
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            Swal.fire({
                title: 'No file selected',
                text: 'Please select a file to upload.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Save the uploaded file name to localStorage
        localStorage.setItem("uploadedFileName", selectedFile.name);

        // Convert selected file to Base64
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Data = event.target.result;

            // Save the base64 file in localStorage
            localStorage.setItem("fileToAnalyze", JSON.stringify({
                name: selectedFile.name,
                data: base64Data
            }));

            // Check if Flask server is running
            fetch("http://localhost:5000/ping")
                .then(response => {
                    if (!response.ok) throw new Error("Flask not responding");
                    Swal.fire({
                        icon: 'success',
                        title: 'File Uploaded Successfully!',
                        text: 'Redirecting...',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.hash = '#processingFiles';
                        window.location.reload(); // Reload page to load processingFiles.js
                    });
                })
                .catch(error => {
                    console.error("Flask server not responding:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Flask is not running',
                        text: 'Please make sure the backend is active in PyCharm.',
                        confirmButtonText: 'OK'
                    });
                });
        };

        reader.readAsDataURL(selectedFile);
    });
}
