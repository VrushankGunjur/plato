import os
import tempfile
import flask
from flask import Flask, make_response, Response, stream_with_context
from flask import request
from flask_cors import CORS
import whisper
import openai
import pinecone
import random
import requests
import string
from revChatGPT.V1 import Chatbot


app = flask.Flask(__name__)
app.config['wsgi.buffer_size'] = 10240
CORS(app)

cli_path = ""
files = None
indx = None
chatbot = None
index_again = True
DEFAULT_MODE = 'friend'
mode = DEFAULT_MODE
workingMode = 'CLI'
UID = 'plato'
CONST_SPLIT = 25

def chatgpt(res, query):
    # print(res)
    contexts = ""
    for matches in res.to_dict()['matches']:
        if 'text' in matches['metadata'].keys() and 'file' in matches['metadata'].keys():
            text = matches['metadata']['text']
            file = matches['metadata']['file']
            chunk_i = matches['metadata']['chunk_i']

            stiched = f"{file} from line {int(chunk_i*CONST_SPLIT)} to {int(chunk_i*CONST_SPLIT + CONST_SPLIT)} \n{''.join(text)}\n--------------\n"
            contexts += stiched

    # p = "Your name is Plato and you are a pair programmer for a developer. You are assisting them with what they're struggling with. Be specific in regard to helping with code and technical assistance. Here are some samples of code that may be relevant. Only use these to help if they make sense in context of the developer's thoughts: \n" + \
    #     s + "\n Talk to the developer directly. Please limit your response to less than 50 words. Respond to the following stream of thoughts from the developer: "
    
    global mode
    if mode != 'code' and mode != 'hint' and mode != 'friend':
        mode = DEFAULT_MODE

    #print(f"mode: {mode}")
    if mode == 'code':
        p = "This is the code you should reference: \n {} \n. Not all of these are relevant though. Use the ones that have the highest relevance score. \n \
        Use these along with your knowledge base to talk to the developer:".format(contexts)
    elif mode == 'hint': 
        p = "This is the code you should reference: \n {} \n. Not all of these are relevant though. Use the ones that have the highest relevance score. \n \
        Use these along with your knowledge base to give hints to the user. Please try to avoid giving the answer:".format(contexts)
    elif mode == 'friend':
        p = "Emulate being a friend to the user. Listen to their requests and respond in a nice and supportive way: "
    else: 
        p = ""


    prompt = p + query

    # prompt = query

    print(f"prompt: {prompt}")

    prev_text = ""

    for data in chatbot.ask(
        prompt,
    ):
        message = data["message"][len(prev_text) :]
        # print(message, end="", flush=True)
        prev_text = data["message"]
        yield message


    return prev_text

def query_pinecone(p_indx, audio):
    MODEL = "text-embedding-ada-002"
    pinecone.init(
        api_key="8dae86ff-8f12-4f00-900d-564cef7d98cb",
        environment="us-east1-gcp"
    )
    indx = p_indx
    query = audio
    my_headers = {
    'Content-Type' : 'application/json',
    'Authorization' : 'Bearer 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',
    }
    request_body = {
        "model": "text-embedding-ada-002",
        "input": query
    }
    response = requests.post('https://api.openai.com/v1/embeddings', headers=my_headers, json=request_body)
    xq = response.json()['data'][0]['embedding']
    res = indx.query([xq], top_k=3, include_metadata=True)
    return res
    
def chatbot_init():
    global chatbot
    chatbot = Chatbot(config={
        "email": "akshgarg@gmail.com",
        "password": "treehacks"
    })

def pinecone_init():
    MODEL = "text-embedding-ada-002"

    pinecone.init(
        api_key="8dae86ff-8f12-4f00-900d-564cef7d98cb",
        environment="us-east1-gcp"
    )
    
    # if starting:
    #     if UID in pinecone.list_indexes():
    #         pinecone.delete_index(UID)

    if UID not in pinecone.list_indexes():
        print("index didn't exist")
        res = openai.Embedding.create(input='string.py', engine=MODEL)['data'][0]['embedding']
        pinecone.create_index(UID, dimension=len(res))
    else:
        pinecone.Index(UID).delete(deleteAll='true')
        # connect to index
    
    global indx
    indx = pinecone.Index(UID)

def index():
    path = "/Users/vrushankgunjur/Documents/treehacks23-demo/plato/backend/codebase_files"
    global cli_path
    if cli_path != "":
        path = cli_path

    print(path)

    dir_list = os.listdir(path)
    print(dir_list)
    openai.api_key = "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"
    MODEL = "text-embedding-ada-002"
    length = 15

    # should scale on average size or file type
    for f in dir_list:
        chunk_i = 0

        if f == 'serve_files.py' or f == '.DS_Store':
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
                    meta = [{'text': line, 'file': pthname, 'chunk_i': chunk_i}]
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
                meta = [{'text': line, 'file': pthname, 'chunk_i': chunk_i}]
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

        global mode
        print(f"mode = {mode}")

        mode = request.form['akshMode']
        print('------------------------------------------')
        print(f"mode = {mode}")

        global workingMode
        workingMode = request.form['modeSelector']
        print(workingMode)
        if workingMode == "Web":
            global cli_path
            cli_path = ""

        # request.form['operateMode']

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
            # change path to cli_path instead
            path = "codebase_files"
            dir_list = os.listdir(path)
            global files
            if dir_list != files:
                files = dir_list
                
            print(audio)

            global indx
            if indx is None:
                pinecone_init()

            global chatbot
            if chatbot is None:
                chatbot_init()
            
            global index_again
            if index_again:
                indx = index()
                print('index again')
                index_again = False

            res = query_pinecone(indx, audio)

            # return Response(chatgpt(res, audio), mimetype='text/event-stream')
            out = Response(chatgpt(res, audio), mimetype='text/event-stream')
            print(out)
            return out
            final_msg = ""
            # chatgpt is a stream, we loop over it to get every word
            for text in chatgpt(res, audio):
                final_msg += text
                print(text, end="", flush = True)
            
            return final_msg
        else:
            res = 'No discernable audio captured.'
            return res



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
    data = request.get_data(as_text=True)[1:-1]
    global UID
    pinecone.Index(UID).delete(deleteAll='true')
    print(data)
    global cli_path
    cli_path = data

    global index_again
    index_again = True
    return 'received'
