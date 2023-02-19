from openai.embeddings_utils import get_embedding, cosine_similarity
import pandas as pd
import openai
import pinecone
import time
from tqdm import tqdm


def openai_models(res, query):
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

    p = "You are a pair programmer for a developer. You are assisting them with what they're struggling with. Be specific in regard to helping with code and technical assistance. Here are some samples of code that may be relevant. Only use these to help if they make sense in context of the developer's thoughts: \n" + \
        s + "\n Talk to the developer directly. Respond to the following stream of thoughts from the developer: "
    prompt = p + query

    from revChatGPT.V1 import Chatbot
    chatbot = Chatbot(config={
        "email": "akshgarg@gmail.com",
        "password": "treehacks"
    })

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

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=1024,
        n=1,
        stop=None,
        temperature=0.7,
    )

    # decision threshold: check if prompt is related to the context
    print(response.choices[0].text)
    '''


def query_pinecone():
    print("Try stuff ...")
    MODEL = "text-embedding-ada-002"
    pinecone.init(
        api_key="8dae86ff-8f12-4f00-900d-564cef7d98cb",
        environment="us-east1-gcp"
    )
    UID = 'v4a92gqjk-0xlqc'
    indx = pinecone.Index(UID)
    query = input("Enter your query: ")
    startTime = time.time()
    openai.api_key = "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"
    xq = openai.Embedding.create(input=query, engine=MODEL)[
        'data'][0]['embedding']
    res = indx.query([xq], top_k=10, include_metadata=True)
    executionTime = (time.time() - startTime)
    print('Execution time in seconds: ' + str(executionTime))
    print(res)


main()
