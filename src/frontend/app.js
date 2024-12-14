// Function to display success or error messages
function showMessage(message, color) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = color;
    messageDiv.style.display = "block";
}
// Function to render a PDF thumbnail
// Function to render a PDF thumbnail
function renderThumbnail(pdfFile, index) {
    console.log("Rendering thumbnail for file:", pdfFile);  // Log the file to check if it's correct

    // Check if the file is an instance of File (File is a subclass of Blob)
    if (!(pdfFile instanceof File)) {
        console.error("Expected a File object, but got", pdfFile);
        return;  // If it's not a File, we can't process it
    }

    const fileReader = new FileReader();

    fileReader.onload = function () {
        const loadingTask = pdfjsLib.getDocument(fileReader.result);
        loadingTask.promise.then(function (pdf) {
            // Get the first page
            pdf.getPage(1).then(function (page) {
                const scale = 0.2; // Adjust scale for thumbnails
                const viewport = page.getViewport({ scale: scale });
                
                // Create a canvas element to render the PDF page
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render the page into the canvas context
                page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise.then(function () {
                    // Create the thumbnail div
                    const thumbnailDiv = document.createElement("div");
                    thumbnailDiv.classList.add("thumbnail");
                    thumbnailDiv.setAttribute("data-index", index);

                    const img = document.createElement("img");
                    img.src = canvas.toDataURL();  // Convert the canvas to an image data URL
                    img.alt = pdfFile.name;

                    thumbnailDiv.appendChild(img);
                    document.getElementById("thumbnails").appendChild(thumbnailDiv);
                });
            });
        });
    };

    // Read the PDF file as a data URL
    fileReader.readAsArrayBuffer(pdfFile);
}

// Function to load the uploaded files and render thumbnails
function loadThumbnails(files) {
    const thumbnailsContainer = document.getElementById("thumbnails");
    thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

    if (files && files.length > 0) {
        files.forEach((file, index) => {
            renderThumbnail(file, index);  // Render each thumbnail
        });

        console.log("Thumbnails rendered successfully.");  // Debug log

        // Enable the merge button after thumbnails are ready
        document.getElementById("merge-btn").disabled = false;
    } else {
        console.error("No files to render thumbnails.");
    }
}

let uploadedFiles = [];  // Array to hold the actual file objects

// Handle file uploads and render thumbnails
document.getElementById("upload-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    const fileInput = document.getElementById("file-input");
    const files = fileInput.files;

    // Check if files are selected
    if (files.length === 0) {
        alert("Please select files to upload.");
        return;
    }

    // Clear the previously uploaded files array
    uploadedFiles = [];

    const formData = new FormData();

    // Add selected files to FormData and save them in the uploadedFiles array
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
        uploadedFiles.push(files[i]);  // Store the file object in the array
        console.log(`File ${i + 1}: ${files[i].name}`);
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

        if (data.message) {
            showMessage(data.message, "green");
            loadThumbnails(uploadedFiles);  // Pass the actual files (not filenames) to render thumbnails
        } else if (data.error) {
            console.error("Error from backend:", data.error);  // Log the backend error
            showMessage(data.error, "red");
        }
    })
    .catch(error => {
        console.error("Error during fetch:", error);  // Log any fetch errors
        showMessage("Error uploading files. Please try again.", "red");
    });
});

// Function to render a PDF thumbnail
function renderThumbnail(pdfFile, index) {
    console.log("Rendering thumbnail for file:", pdfFile);  // Log the file to check if it's correct

    if (!(pdfFile instanceof File)) {
        console.error("Expected a File object, but got", pdfFile);
        return;  // If it's not a File, we can't process it
    }

    const fileReader = new FileReader();

    fileReader.onload = function () {
        const loadingTask = pdfjsLib.getDocument(fileReader.result);
        loadingTask.promise.then(function (pdf) {
            // Get the first page
            pdf.getPage(1).then(function (page) {
                const scale = 0.2; // Adjust scale for thumbnails
                const viewport = page.getViewport({ scale: scale });
                
                // Create a canvas element to render the PDF page
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render the page into the canvas context
                page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise.then(function () {
                    // Create the thumbnail div
                    const thumbnailDiv = document.createElement("div");
                    thumbnailDiv.classList.add("thumbnail");
                    thumbnailDiv.setAttribute("data-index", index);

                    const img = document.createElement("img");
                    img.src = canvas.toDataURL();  // Convert the canvas to an image data URL
                    img.alt = pdfFile.name;

                    thumbnailDiv.appendChild(img);
                    document.getElementById("thumbnails").appendChild(thumbnailDiv);
                });
            });
        });
    };

    // Read the PDF file as a data URL
    fileReader.readAsArrayBuffer(pdfFile);
}

// Function to load the uploaded files and render thumbnails
function loadThumbnails(files) {
    const thumbnailsContainer = document.getElementById("thumbnails");
    thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

    if (files && files.length > 0) {
        files.forEach((file, index) => {
            renderThumbnail(file, index);  // Render each thumbnail
        });

        console.log("Thumbnails rendered successfully.");  // Debug log

        // Enable the merge button after thumbnails are ready
        document.getElementById("merge-btn").disabled = false;
    } else {
        console.error("No files to render thumbnails.");
    }
}

// Function to display success or error messages
function showMessage(message, color) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = color;
    messageDiv.style.display = "block";
}


// Merge PDFs based on the order of the thumbnails
document.getElementById("merge-btn").addEventListener("click", function() {
    const orderedFiles = [];
    const thumbnails = document.querySelectorAll(".thumbnail");

    // Collect the ordered file names based on the thumbnails
    thumbnails.forEach(thumbnail => {
        orderedFiles.push(thumbnail.querySelector("img").alt); // Get the filename
    });

    console.log("Ordered files to send for merging:", orderedFiles);  // Log the ordered files

    // Send the ordered files to the backend for merging
    fetch("http://127.0.0.1:5000/merge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ files: orderedFiles })  // Send the array of files as JSON
    })
    .then(response => response.blob())  // Expect the merged PDF as a blob
    .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged.pdf';
        link.click();
    })
    .catch(error => {
        console.error("Error merging PDFs:", error);  // Log any merge errors
        alert("Error merging PDFs. Please try again.");
    });
});
