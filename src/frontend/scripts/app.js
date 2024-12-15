import { enableDragDrop } from './dragDrop.js';  // Handling drag and drop logic for reordering

let uploadedFiles = [];  // Store the files temporarily
let orderedFiles = [];   // Store the ordered files after reordering
let pdfDocuments = [];   // Store the PDF documents (pages) for rendering and manipulation

// Handle multiple PDF file selection
document.getElementById("file-input").addEventListener("change", function(event) {
    const files = event.target.files;
    
    if (files.length > 0) {
        for (let file of files) {
            if (file.type === 'application/pdf') {
                checkForDuplicateFile(file).then(isDuplicate => {
                    if (isDuplicate) {
                        // Ask user if they want to add duplicate pages
                        const confirmAdd = confirm(`The file "${file.name}" is a duplicate. Do you want to add its pages?`);
                        if (confirmAdd) {
                            uploadedFiles.push(file);
                            loadPdf(file);
                        }
                    } else {
                        uploadedFiles.push(file);
                        loadPdf(file);
                    }
                });
            } else {
                alert("Please select only PDF files.");
            }
        }
    }
});

// Check if the uploaded file is a duplicate
function checkForDuplicateFile(file) {
    return new Promise((resolve) => {
        const isDuplicate = uploadedFiles.some(f => f.name === file.name);
        resolve(isDuplicate);
    });
}

// Load PDF and split into pages
function loadPdf(file) {
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const loadingTask = pdfjsLib.getDocument(fileReader.result);
        loadingTask.promise.then(function(pdf) {
            pdfDocuments.push(pdf); // Store the loaded PDF document
            renderPdfPages(pdf);
        });
    };

    fileReader.readAsArrayBuffer(file);
}

// Render PDF pages as thumbnails
function renderPdfPages(pdf) {
    const thumbnailsContainer = document.getElementById("thumbnails");
    const totalPages = pdf.numPages;

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        renderThumbnail(pdf, pageNumber);
    }
}

// Render a single page as a thumbnail
function renderThumbnail(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        const scale = 0.2;  // Scale for thumbnail
        const viewport = page.getViewport({ scale: scale });

        // Create a canvas to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render the page into the canvas
        page.render({ canvasContext: context, viewport: viewport }).promise.then(function() {
            // Create a div to hold the thumbnail
            const thumbnailDiv = document.createElement("div");
            thumbnailDiv.classList.add("thumbnail");
            thumbnailDiv.setAttribute("data-page", pageNumber);

            const img = document.createElement("img");
            img.src = canvas.toDataURL();  // Convert canvas to data URL for image
            img.alt = `file-page${pageNumber}`;
            thumbnailDiv.appendChild(img);

            // Add delete button to each thumbnail
            const deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete";
            deleteButton.onclick = () => deletePage(thumbnailDiv, `file-page${pageNumber}`);
            thumbnailDiv.appendChild(deleteButton);

            document.getElementById("thumbnails").appendChild(thumbnailDiv);
        });
    });
}

// Delete a specific page
function deletePage(thumbnailDiv, pageIdentifier) {
    // Remove from UI
    thumbnailDiv.remove();

    // Remove from orderedFiles
    orderedFiles = orderedFiles.filter(file => file !== pageIdentifier);
    console.log(`Page ${pageIdentifier} deleted. Updated ordered files:`, orderedFiles);

    // Disable merge button if no pages are ordered
    const mergeButton = document.getElementById("merge-btn");
    if (orderedFiles.length === 0) {
        mergeButton.disabled = true;
    }
}

// Enable drag-and-drop reordering
enableDragDrop("thumbnails", updateThumbnailOrder);

// Update page order after drag-and-drop
function updateThumbnailOrder(evt) {
    orderedFiles = [];
    const thumbnails = document.querySelectorAll(".thumbnail");

    thumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector("img");
        if (img) {
            orderedFiles.push(img.alt); // Save the order of pages
        }
    });

    console.log("Ordered files to send for merging:", orderedFiles);

    // Enable merge button when pages are reordered
    const mergeButton = document.getElementById("merge-btn");
    if (orderedFiles.length > 0) {
        mergeButton.disabled = false;  // Enable the button
    } else {
        mergeButton.disabled = true;  // Disable the button
    }
}

// Handle merge action on button click
document.getElementById("merge-btn").addEventListener("click", function() {
    if (orderedFiles.length === 0) {
        alert("Please reorder the pages before merging.");
        return;
    }

    // Send the ordered pages to the backend for merging or use jsPDF if no backend processing is needed
    if (shouldUseBackendForMerging()) {
        uploadPagesForMerging();
    } else {
        generateMergedPdfOnFrontend();
    }
});

// Function to decide if we need the backend for merging (e.g., OCR or editing required)
function shouldUseBackendForMerging() {
    return false;  // For now, assuming no backend operations are required
}

// Upload pages to the backend for merging
function uploadPagesForMerging() {
    fetch("http://127.0.0.1:5000/merge", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ files: orderedFiles })  // Send the ordered pages
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
}

// Generate the merged PDF on the frontend using jsPDF
function generateMergedPdfOnFrontend() {
    const mergedPdf = new window.jsPDF();  // Access jsPDF globally through the window object
    
    orderedFiles.forEach(fileIdentifier => {
        const [fileName, pageNumber] = fileIdentifier.split('-');
        const pdfDocument = pdfDocuments.find(pdf => pdf.filename === fileName);
        
        if (pdfDocument) {
            pdfDocument.getPage(parseInt(pageNumber)).then(page => {
                const scale = 0.2;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                    mergedPdf.addImage(canvas.toDataURL(), 'JPEG', 0, 0, viewport.width, viewport.height);
                    if (orderedFiles.indexOf(fileIdentifier) === orderedFiles.length - 1) {
                        mergedPdf.save("merged.pdf");
                    }
                });
            });
        }
    });
}

