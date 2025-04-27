function setupProcessingSimulation() {
    // Retrieve file information from localStorage
    const fileInfo = JSON.parse(localStorage.getItem("fileToAnalyze"));
    const fileNameElement = document.getElementById('fileName');

    // If no file is found, display a message and exit
    if (!fileInfo) {
        fileNameElement.innerText = "No file to analyze.";
        return;
    }

    const { name, data } = fileInfo;

    // Display the file name being analyzed
    fileNameElement.innerHTML = '<span style="text-decoration: underline;">Analyzing</span>: ' + name;

    // Convert base64 string back to a File object
    const byteString = atob(data.split(',')[1]);
    const mimeString = data.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeString });
    const file = new File([blob], name);

    const formData = new FormData();
    formData.append("file", file);

    // Send the file to the backend for analysis
    fetch("http://localhost:3000/analyze-file", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error("Flask server is not responding");
            return response.json();
        })
        .then(data => {
            // Save the analysis result into localStorage
            localStorage.setItem("fileAnalysisResult", JSON.stringify({
                filename: data.filename,
                result: data.result
            }));

            // Clean up the uploaded file data
            localStorage.removeItem("fileToAnalyze");

            // Show a success alert
            Swal.fire({
                icon: "success",
                title: "Analysis Complete",
                text: "Redirecting to results...",
                showConfirmButton: false,
                timer: 2000
            });

            // After 2 seconds, redirect to results page
            setTimeout(() => {
                window.location.hash = "#resultsFiles";
            }, 2000);
        })
        .catch(error => {
            console.error("Error:", error);

            // Save an error result into localStorage
            localStorage.setItem("fileAnalysisResult", JSON.stringify({
                filename: name,
                result: "Error during file analysis"
            }));

            // Show an error alert
            Swal.fire({
                icon: "error",
                title: "Error during analysis",
                text: "Redirecting...",
                showConfirmButton: false,
                timer: 2000
            });

            // After 2 seconds, redirect to results page even if there was an error
            setTimeout(() => {
                window.location.hash = "#resultsFiles";
            }, 2000);
        });
}
