import os
import openai
from utils import split_file_by_function
import re

openai.api_key = "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"


# create OpenAI embeddings from app.py
def get_embedding(text, model="text-embedding-ada-002"):
    text = text.replace("\n", " ")
    return openai.Embedding.create(input=[text], model=model)['data'][0]['embedding']

# user davinci to summarize code


def summarize_code(text):
    response = openai.Completion.create(
        model="code-davinci-002",
        prompt=f"Can you summarize this code for me: {text}.",
        temperature=0,
        max_tokens=256,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    return response['choices'][0]['text']


for filename in os.listdir('models'):

    if filename.endswith(".py"):
        print(filename)
        functions = split_file_by_function('models/' + filename)
        for function in functions:
            # print(function[0])
            print(function[2])
            print(summarize_code(function[2]))
            # print(get_embedding(function[2]))


# response = openai.Completion.create(
#     model="code-davinci-003",
#     prompt="Try to understand what I am trying to do here. So I don't know why this isn't working. I think the issue could be some kind of rebasing issue.",
#     temperature=0,
#      max_tokens=256,
#      top_p=1,
#      frequency_penalty=0,
#      presence_penalty=0
# )


#
