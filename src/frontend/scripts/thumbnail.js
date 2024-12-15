export function renderThumbnail(pdfFile, index, callback) {
    const fileReader = new FileReader();

    fileReader.onload = function () {
        const loadingTask = pdfjsLib.getDocument(fileReader.result);
        loadingTask.promise.then(function (pdf) {
            const totalPages = pdf.numPages;
            let pageThumbnails = [];

            // Loop through all the pages and generate thumbnails
            for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
                pdf.getPage(pageNumber).then(function (page) {
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
                        // Create the thumbnail div for each page
                        const thumbnailDiv = document.createElement("div");
                        thumbnailDiv.classList.add("thumbnail");
                        thumbnailDiv.setAttribute("data-index", index);

                        // Create an img element to display the thumbnail
                        const img = document.createElement("img");
                        img.src = canvas.toDataURL();  // Convert the canvas to an image data URL
                        img.alt = pdfFile.name + `-page${pageNumber}`;

                        // Add the page number as part of the thumbnail title
                        const pageNumberSpan = document.createElement('span');
                        pageNumberSpan.textContent = `Page ${pageNumber}`;
                        thumbnailDiv.appendChild(pageNumberSpan);
                        thumbnailDiv.appendChild(img);

                        pageThumbnails.push(thumbnailDiv);

                        // After all thumbnails are ready, call the callback
                        if (pageThumbnails.length === totalPages) {
                            callback(pageThumbnails);
                        }
                    });
                });
            }
        });
    };

    // Read the PDF file as a data URL
    fileReader.readAsArrayBuffer(pdfFile);
}
