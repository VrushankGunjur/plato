import os
import tempfile
import flask
from flask import Flask, make_response
from flask import request
from flask_cors import CORS
import whisper

app = flask.Flask(__name__)
CORS(app)


@app.route('/transcribe', methods=['POST'])
def transcribe():
    if request.method == 'POST':
        language = request.form['language']
        model = request.form['model_size']

        # there are no english models for large
        if model != 'large' and language == 'english':
            model = model + '.en'
        audio_model = whisper.load_model(model)

        temp_dir = tempfile.mkdtemp()
        save_path = os.path.join(temp_dir, 'temp.wav')

        wav_file = request.files['audio_data']
        wav_file.save(save_path)

        if language == 'english':
            result = audio_model.transcribe(save_path, language='english')
        else:
            result = audio_model.transcribe(save_path)

        return result['text']
    else:
        return "This endpoint only processes POST wav blob"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file uploaded.', 400
    

    uploaded_files = request.files.getlist('file')  # get all files from the 'file' field
    for file in uploaded_files:
        file.save(f'./codebase_files/{file.filename}')  # save each file to the specified folder

    response = make_response('File saved.')
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
