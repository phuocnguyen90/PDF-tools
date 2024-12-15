from PyPDF2 import PdfMerger
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import logging
import shutil

# Set working directory
WORKING_FOLDER = os.getcwd()  # Get the current working directory
EXPECTED_FOLDER = "backend"  # Expected folder to be "backend" (or any directory name you'd like)

# Check if the app is running from the frontend directory, and adjust if necessary
if "frontend" in WORKING_FOLDER:
    logging.debug("Running from the frontend directory. Adjusting the working folder.")
    os.chdir(os.path.abspath(os.path.join(WORKING_FOLDER, "../backend")))  # Change working directory to 'backend'

# Now, ensure that the app is running from the 'backend' folder (or wherever you want it)
logging.debug(f"Current working directory: {os.getcwd()}")  # Log to confirm the change


app = Flask(__name__)
CORS(app)

# Ensure the "uploads" directory exists
# Define the upload folder and temporary page folder
UPLOAD_FOLDER = os.path.abspath('uploads')
TEMP_PAGE_FOLDER = os.path.join(UPLOAD_FOLDER, 'temp_pages')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(TEMP_PAGE_FOLDER):
    os.makedirs(TEMP_PAGE_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['TEMP_PAGE_FOLDER'] = TEMP_PAGE_FOLDER

@app.route('/')
def hello_world():
    return jsonify(message="Hello, World!")
# Upload files
@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify(error="No files selected"), 400

    files = request.files.getlist("files")
    if not files:
        return jsonify(error="No files uploaded"), 400

    file_paths = []
    for file in files:
        if file.filename == '':
            return jsonify(error="No selected file"), 400

        # Save the original file to the backend's `uploads` directory
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
        file_paths.append(file.filename)

    return jsonify(message="Files uploaded successfully!", files=file_paths), 200

# Merge PDFs (Reordering pages and merging)
@app.route('/merge', methods=['POST'])
def merge_pdfs():
    file_names = request.json.get('files', [])

    if not file_names:
        return jsonify(error="No files provided for merging"), 400

    # Initialize a PdfMerger instance
    merger = PdfMerger()

    # Add pages in the correct order
    for file_name in file_names:
        # Extract the page number from the file_name (e.g., "gift Phuoc.pdf-page1")
        file_name_base, page_num = file_name.rsplit('-', 1)
        page_file = os.path.join(app.config['TEMP_PAGE_FOLDER'], f'{file_name}')

        if os.path.exists(page_file):
            merger.append(page_file)
        else:
            return jsonify(error=f"File {file_name} not found."), 404

    # Output the merged PDF file
    merged_filename = 'merged_output.pdf'
    merged_filepath = os.path.join(app.config['UPLOAD_FOLDER'], merged_filename)
    merger.write(merged_filepath)
    merger.close()

    # Clean up temporary page files after merge
    shutil.rmtree(TEMP_PAGE_FOLDER)

    return send_file(merged_filepath, as_attachment=True)



if __name__ == '__main__':
    app.run(debug=True)