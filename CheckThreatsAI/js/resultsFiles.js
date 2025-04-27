function setupResultsPage() {
    // Retrieve file name and username from localStorage
    const fileName = localStorage.getItem("uploadedFileName");
    const username = localStorage.getItem("username");

    // Get the actual analysis result
    const fileResult = JSON.parse(localStorage.getItem("fileAnalysisResult"));
    const detectedType = fileResult?.result || "Unknown";

    // Display the title with the analyzed file name
    document.getElementById("result-title").innerHTML =
        '<span style="text-decoration: underline;">Analysis result</span>: ' + fileName;

    // Define possible file types
    const fileTypes = [
        "Benign",
        "RedLineStealer",
        "Downloader",
        "RAT",
        "BankingTrojan",
        "SnakeKeyLogger",
        "Spyware"
    ];

    // Descriptions associated with each file type
    const fileDescriptions = {
        "Benign": "This file does not appear to contain any malicious content and is considered safe.",
        "RedLineStealer": "RedLine Stealer is a malware that steals sensitive data, including passwords and cookies. Handle with caution.",
        "Downloader": "This file acts as a downloader, often used to fetch and install additional malware onto your system.",
        "RAT": "Remote Access Trojan (RAT) allows attackers to control your system remotely. Handle with extreme caution.",
        "BankingTrojan": "This malware is designed to steal sensitive banking information such as passwords and account numbers.",
        "SnakeKeyLogger": "Snake Keylogger is a malware that records keystrokes to steal personal information. Handle carefully.",
        "Spyware": "Spyware collects information about you without your consent and may monitor your activities."
    };

    // Display the detected file type
    document.getElementById("file-category").innerHTML =
        '<span style="text-decoration: underline;">File Type</span>: ' + detectedType;

    // Display the corresponding file description
    document.getElementById("file-description").textContent =
        fileDescriptions[detectedType] || "No description available.";

    // Save the analysis to the database
    if (username && fileName) {
        fetch('http://localhost:3000/resultsFiles', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                file_name: fileName,
                file_type: detectedType
            })
        })
            .then(response => response.json())
            .then(data => console.log("Analysis saved:", data))
            .catch(error => console.error("Error saving analysis:", error));
    } else {
        console.warn("Username not found. Analysis not saved.");
    }

    // Setup navigation buttons
    document.getElementById('analyzeAnotherFileBtn').addEventListener('click', () => {
        window.location.hash = '#uploadFiles';
    });

    document.getElementById('goHomeBtn').addEventListener('click', () => {
        window.location.hash = '#home';
    });
}
