<p align="center">
  <br/>
  <h2 align="center">Plato</h2>
  <h6 align="center">Plato is an AI pair-programming platform powered by your voice.</h6>
</div>
https://devpost.com/software/plato-5f4m7c?ref_content=user-portfolio&ref_feature=in_progress
https://www.youtube.com/watch?v=Lo3RpOQhQUE

## Inspiration
What's the best way to get over a road block? To create new solutions? To find a bug in one's code? 
We believe it's a fresh pair of eyes. However we live in a world where everyone is incredibly busy and getting personalized attention or tutoring is expensive and time-consuming. We built Plato to bridge that gap. 

## What it does
Concisely put, Plate is an AI-Based pair-programmer that is powered through your voice. But let's break that down. At a high level, Plato allows users to upload their working repositories/files either to the web or spin up a local command line interface referencing it. It uses these files along with its extensive pre-existing knowledge about major programming languages to offer your instant, personalized, and accurate feedback to rapidly accelerate your development process. 

## How we built it
Plato is powered through recent advancements in large language models. First, it builds on the Open AI Whisper model to convert audio to text in real time. It uses a unique embeddings based approach to efficiently and instantly index and package your code. It couples these embeddings with a custom-designed, reverse-engineered Chat-GPT model. Through extensive iteration, we designed accurate and easy to use text to text prompts that allow Plato to parse folder/repository specific content, join it with pre-existing knowledge scraped through millions of text files, and give users a highly immersive coding experience. We package these suite of models with easy-to-use and fast servers that quickly allow a user to upload files or provide paths to where they are stored and spin up a quick, interactive instance that changes how they code for the better.

## Challenges we ran into
Receiving continuous audio data from our users and being expected to output text results with minimal latency took quite a toll on our system. To say the least, the audio files were too large, the embeddings too copious, and the text generation too slow — resulting in massive wait times while a large clunky model spun up and we transmitted large amounts of data. Only after a combination of stream transmission/network programming, embedding caching, and changing audio transcription frequency were we able to enable Plato to run in under a few seconds, with real-time data showing up on the user end as the data is generated. Just as much as maybe a philosopher like Plato may take!

## Accomplishments that we're proud of
The biggest highlights from our project were coming up with a unique embeddings approach that allowed us to parse and store the entire codebases we were working with. Doing so rapidly transformed the scope of our queries and made Plato the best debugging and code-generation assistant to ever exist. Our second massive win was shaving latency and making our models work in a real-time manner. After our optimizations, Plato can now output text to users with 2-3 seconds post an initial initialization of 10s. This made our interface clean and most importantly, a product that serves the user with high throughput.

## What we learned
I think the biggest takeaway for our team was just learning all the infra related work that goes into deploying a machine learning model. Most of our experiences lay in machine learning, so it was quite fascinating to see how much latency and proper infrastructure related challenges can impact a successful product. That said, getting each component working was reassuring and learning to "hack" things together was a fun process. Overall, we're really happy with the final product. 

## What's next for Plato
With a robust pipeline of audio to context dependent conversation, Plato has copious applications: Plato's robust code generation, interpretation, and advice capabilities make it perfect for speeding up Software Engineers' productivity. With 29 million Software Engineers worldwide, a projected 22% growth rate of SWEs from 2020 to 2030, and SWEs spending more than 50% of their time looking at a code editor, Plato's AI framework has vast potential to improve the Software Development lifecycle. In addition to expanding Plato to an AI Visual Studio-esque text editing tool, we are thrilled to see how its hints and learning features allow for advances in Education. In a world where even middle school children are learning how to code, its shocking how unaccessible personalized guidance and feedback is on one's code. Simply put, we are determined to fill in this gap.

Copyright Plato 2023-2024
