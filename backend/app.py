import os
import tempfile
import flask
from flask import Flask, make_response
from flask import request
from flask_cors import CORS
import whisper
import openai
import pinecone
import random
import string

app = flask.Flask(__name__)
CORS(app)

cli_path = ""

@app.route('/chatgpt', methods=['POST'])
def chatgpt(res, query):
    results = []
    for result in res.matches:
        # print(result.metadata.keys())
        results.append(result.metadata['text'])

    proc = results
    s = ""
    seen = set()
    i = 0
    count = 0
    while i < len(proc):
        indx1 = proc[i][0].find(';')
        num = proc[i][0][:indx1]
        proc[i][0] = proc[i][0][indx1+1:]
        indx2 = proc[i][0].find(';')
        title = proc[i][0][:indx2]
        if title[:10] not in seen:
            s += str(count+1) + ". "
            seen.add(title[:10])
            indx3 = proc[i][0].find('Offered:')
            info = proc[i][0][indx3:]
            num = num[:len(num)-1]
            s += (num + ", " + title + ", " + info)
            s += "\n"
            count += 1
        i += 1

    p = "Your name is Plato and you are a pair programmer for a developer. You are assisting them with what they're struggling with. Be specific in regard to helping with code and technical assistance. Here are some samples of code that may be relevant. Only use these to help if they make sense in context of the developer's thoughts: \n" + \
        s + "\n Talk to the developer directly. Respond to the following stream of thoughts from the developer: "
    prompt = p + query

    from revChatGPT.V1 import Chatbot
    chatbot = Chatbot(config={
        "email": "akshgarg@gmail.com",
        "password": "treehacks"
    })

    response = ""

    for data in chatbot.ask(
    prompt
    ):
        response = data["message"]

    return response

    '''
    print("Chatbot: ")
    prev_text = ""
    for data in chatbot.ask(
        prompt,
    ):
        message = data["message"][len(prev_text):]
        print(message, end="", flush=True)
        prev_text = data["message"]
    print()
    '''






def query_pinecone(p_indx, audio):
    MODEL = "text-embedding-ada-002"
    pinecone.init(
        api_key="8dae86ff-8f12-4f00-900d-564cef7d98cb",
        environment="us-east1-gcp"
    )
    indx = p_indx
    query = audio
    openai.api_key = "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"
    xq = openai.Embedding.create(input=query, engine=MODEL)[
        'data'][0]['embedding']
    res = indx.query([xq], top_k=10, include_metadata=True)
    return res
    


def index():
    path = "codebase_files"
    dir_list = os.listdir(path)
    print(dir_list)
    openai.api_key = "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"
    pinecone.init(
        api_key="8dae86ff-8f12-4f00-900d-564cef7d98cb",
        environment="us-east1-gcp"
    )
    MODEL = "text-embedding-ada-002"
    length = 15


    valid_chars = string.ascii_lowercase + string.digits + '-'
    first_char = random.choice(string.ascii_lowercase + string.digits)
    last_char = random.choice(string.ascii_lowercase + string.digits)
    middle_chars = ''.join(random.choice(valid_chars) for i in range(length-2))
    # Concatenate the string
    UID = first_char + middle_chars + last_char

    if UID not in pinecone.list_indexes():
            dim = 0
            res = openai.Embedding.create(input='string.py', engine=MODEL)['data'][0]['embedding']
            pinecone.create_index(UID, dimension=len(res))
        # connect to index
    indx = pinecone.Index(UID)

    CONST_SPLIT = 50 # should scale on average size or file type
    chunk_i = 0
    for f in dir_list:
        if f == 'serve_files.py':
            continue
        pthname = path + '/' + f
        if os.path.isdir(pthname):
            continue
        i = 0
        with open(pthname, 'r') as file:
        # iterate over each line in the file
            chunk = ''
            for line in file:
                chunk += line
                i += 1
                if i == CONST_SPLIT:
                    line = [chunk]
                    id = [str(chunk_i)]
                    res = openai.Embedding.create(input=line[0], engine=MODEL)
                    embed = [(res['data'])[0]['embedding']]
                    # prep metadata and upsert batch
                    meta = [{'text': line}]
                    to_upsert = zip(id, embed, meta)
                    # upsert to Pinecone
                    print("Inserted chunk ", chunk_i)
                    indx.upsert(vectors=list(to_upsert))
                    chunk_i += 1
                    i = 0  # restart chunk
                    chunk = ''
            # extra text
            if len(chunk) > 0:
                line = [chunk]
                id = [str(chunk_i)]
                res = openai.Embedding.create(input=line[0], engine=MODEL)
                embed = [(res['data'])[0]['embedding']]
                # prep metadata and upsert batch
                meta = [{'text': line}]
                to_upsert = zip(id, embed, meta)
                # upsert to Pinecone
                print("Inserted chunk ", chunk_i)
                indx.upsert(vectors=list(to_upsert))
                chunk_i += 1
                i = 0  # restart chunk
                chunk = ''
    return indx
        


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

        
        audio = result['text']
        if len(audio) > 1:
            indx = index()
            res = query_pinecone(indx, audio)
            out = chatgpt(res, audio)
            return out
        else:
            res = 'No discernable audio captured.'
            return res
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

@app.route('/senddir', methods=['POST'])
def get_dir():
    data = request.get_data(as_text=True)
    cli_path = data
    return "received"
