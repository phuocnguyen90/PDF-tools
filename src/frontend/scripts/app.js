import { uploadFiles } from './upload.js';  // Assuming you've separated upload logic
import { renderThumbnail } from './thumbnail.js';  // Assuming you've separated thumbnail logic
import { enableDragDrop } from './dragDrop.js';  // Assuming you've separated drag/drop logic

let uploadedFiles = [];  // Array to hold the actual file objects
let orderedFiles = [];   // Array to hold the ordered pages

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

    uploadedFiles = Array.from(files); // Store the files for later use

    // Call the uploadFiles function from the module
    uploadFiles(uploadedFiles, function(data) {
        if (data.message) {
            showMessage(data.message, "green");
            loadThumbnails(uploadedFiles);
        } else if (data.error) {
            showMessage(data.error, "red");
        }
    });
});

// Load thumbnails after files are uploaded
function loadThumbnails(files) {
    const thumbnailsContainer = document.getElementById("thumbnails");
    thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

    // Render all thumbnails for each uploaded PDF file
    files.forEach((file, index) => {
        renderThumbnail(file, index, function(pageThumbnails) {
            pageThumbnails.forEach(thumbnail => {
                thumbnailsContainer.appendChild(thumbnail);
            });
        });
    });

    // Enable drag-and-drop functionality after thumbnails are rendered
    enableDragDrop("thumbnails", updateThumbnailOrder);
}

// Update the thumbnail order after drag-and-drop
function updateThumbnailOrder(evt) {
    orderedFiles = [];
    const thumbnails = document.querySelectorAll(".thumbnail");

    thumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector("img");
        if (img) {
            orderedFiles.push(img.alt); // Using file name and page number as unique identifier
        }
    });

    console.log("Ordered files to send for merging:", orderedFiles);

    // Enable the "Merge PDFs" button when files are reordered
    const mergeButton = document.getElementById("merge-btn");
    if (orderedFiles.length > 0) {
        mergeButton.disabled = false;  // Enable the button when there are ordered files
    } else {
        mergeButton.disabled = true;  // Keep the button disabled if no files are ordered
    }
}

// Function to trigger PDF merge when the user clicks the "Merge PDF" button
document.getElementById("merge-btn").addEventListener("click", function() {
    if (orderedFiles.length === 0) {
        alert("Please reorder the pages before merging.");
        return;
    }

    // Send the ordered files to the backend for merging
    fetch("http://127.0.0.1:5000/merge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ files: orderedFiles })  // Send the ordered pages as JSON
    })
    .then(response => response.blob())  // Expect the merged PDF as a blob
    .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'merged.pdf';
        link.click();
    })
    .catch(error => {
        alert("Error merging PDFs. Please try again.");
    });
});

// Function to display success or error messages
function showMessage(message, color) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.style.backgroundColor = color;
    messageDiv.style.display = "block";
}
