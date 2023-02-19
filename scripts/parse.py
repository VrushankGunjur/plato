# parse
import os
import openai
import pandas as pd
import pinecone
import random
import string


user_text = "so I don't know why this isn't working. I think the issue could be some kind of rebasing issue."

# make vector embeddings over the given files/folder

path = "backend"
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
    print("FINISHED")


        
    
        






# get functions from files

