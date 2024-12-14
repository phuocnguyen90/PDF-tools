from PyPDF2 import PdfMerger
import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Ensure the "uploads" directory exists
UPLOAD_FOLDER = os.path.abspath('uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def hello_world():
    return jsonify(message="Hello, World!")

@app.route('/merge', methods=['POST'])
def merge_pdfs():
    file_names = request.json.get('files', [])

    if not file_names:
        return jsonify(error="No files provided for merging"), 400

    print(f"Files received for merging: {file_names}")  # Log received filenames
    merger = PdfMerger()

    for file_name in file_names:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_name)
        print(f"Checking file: {file_name} at path: {file_path}")  # Log the file path

        if os.path.exists(file_path):
            print(f"Adding file: {file_name}")  # Log that the file is being added
            merger.append(file_path)
        else:
            print(f"File not found: {file_name}")  # Log missing files
            return jsonify(error=f"File {file_name} not found."), 404

    merged_filename = 'merged_output.pdf'
    merged_filepath = os.path.join(app.config['UPLOAD_FOLDER'], merged_filename)
    print(f"Saving merged PDF as: {merged_filename}")  # Log the merged file path
    merger.write(merged_filepath)
    merger.close()

    return send_file(merged_filepath, as_attachment=True)


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

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        print(f"Saving file: {file.filename} to {file_path}")  # Log the file saving path
        file.save(file_path)
        file_paths.append(file.filename)

    return jsonify(message="Files uploaded successfully!", files=file_paths), 200



if __name__ == '__main__':
    app.run(debug=True)