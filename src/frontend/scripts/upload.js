export function uploadFiles(files, callback) {
    const formData = new FormData();

    // Add selected files to FormData
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }

    // Send the POST request to upload files to the backend
    console.log("Sending files to backend...");
    fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData
    })
    .then(response => {
        console.log("Response status:", response.status);  // Log response status
        return response.json();  // Return the parsed JSON response
    })
    .then(data => {
        console.log("Backend response:", data);  // Log the backend response
        callback(data);
    })
    .catch(error => {
        console.error("Error during fetch:", error);  // Log any fetch errors
        callback({ error: "Error uploading files. Please try again." });
    });
}
