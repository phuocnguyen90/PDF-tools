# PDF Split, Reorder, and Merge Tool

Tired of paying for online services just to edit or merge PDFs? This project is for you! With a little configuration, you can set up your **own cloud-based PDF editor** for free or at minimal cost, using **AWS Lambda** for a serverless backend and a lightweight frontend that can be hosted anywhere—even on a simple WordPress site.

## Why This Project?
Editing PDFs shouldn't require expensive subscriptions or tedious manual installations. This tool allows you to:
- Split, reorder, and merge PDF files seamlessly online.
- Host your own solution to avoid third-party services, ensuring privacy and security.
- Keep costs low by leveraging serverless infrastructure like **AWS Lambda**.

## Features
- **Split PDFs** into individual pages for easy management.
- **Drag-and-Drop Reordering**: Rearrange pages visually before merging.
- **Merge PDFs** into a single file with one click.
- **Delete Pages**: Remove unnecessary pages directly from the interface.
- Optional **OCR and Editing**: Add advanced processing via a serverless backend.

## How It Works
1. **Frontend**:
   - A simple HTML file with JavaScript to handle file uploads, thumbnails, and page reordering.
   - Can be hosted on any platform, including WordPress, Netlify, or GitHub Pages.

2. **Backend**:
   - Built with **Flask** and deployed as a serverless app using **AWS Lambda** via **Zappa**.
   - Handles advanced features like OCR, PDF splitting, and merging.

## Setup Instructions
### Prerequisites
- **AWS CLI** installed and configured with access to deploy Lambda functions.
- **Zappa** installed (`pip install zappa`).

### Steps
1. **Backend Setup**:
   - Clone this repository and navigate to the `backend` folder:
     ```bash
     git clone https://github.com/phuocnguyen90/PDF-tools
     cd pdf-tool/backend
     ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Deploy to AWS Lambda using Zappa:
     ```bash
     zappa init
     zappa deploy
     ```

2. **Frontend Setup**:
   - Use the provided `index.html` file in the `frontend` folder.
   - Upload it to your preferred hosting service (e.g., WordPress, Netlify, or a custom domain).

3. **Configuration**:
   - Update the API URL in the frontend JavaScript to match your deployed backend:
     ```javascript
     const API_URL = "https://your-lambda-api-url.amazonaws.com/";
     ```

### Usage
1. Open the frontend in your browser.
2. Upload PDFs, reorder pages, delete unnecessary ones, and merge them with a single click.
3. Download the final PDF, all managed through your personal cloud infrastructure.

## Benefits
- **Cost-Effective**: Use free AWS Lambda tiers or minimal pay-as-you-go pricing.
- **Privacy**: Files are processed on your own serverless backend, not third-party services.
- **Flexibility**: Host the frontend anywhere and update features as needed.

## Future Enhancements
- Add advanced editing capabilities, such as annotations or cropping.
- Expand OCR functionality for text extraction and editing.
- Add support for saving and resuming editing sessions.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details. 

