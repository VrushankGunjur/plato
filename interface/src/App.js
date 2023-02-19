import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import TranscribeOutput from "./TranscribeOutput";
import SettingsSections from "./SettingsSection";
import { ReactMic } from 'react-mic';
import axios from "axios";

import { PulseLoader } from "react-spinners";

const useStyles = () => ({
  root: {
    display: 'flex',
    flex: '1',
    margin: '100px 0px 100px 0px',
    alignItems: 'center',
    textAlign: 'center',
    flexDirection: 'column',
  },
  title: {
    marginBottom: '30px',
  },
  settingsSection: {
    marginBottom: '20px',
    display: 'flex',
    width: '100%',
  },
  buttonsSection: {
    marginBottom: '40px',
  },
  recordIllustration: {
    width: '100px',
  }
});

const App = ({ classes }) => {
  const [transcribedData, setTranscribedData] = useState([]);
  const [interimTranscribedData,] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedModel, setSelectedModel] = useState(1);
  const [transcribeTimeout, setTranscribeTimout] = useState(15);
  const [stopTranscriptionSession, setStopTranscriptionSession] = useState(false);

  const intervalRef = useRef(null);

  const stopTranscriptionSessionRef = useRef(stopTranscriptionSession);
  stopTranscriptionSessionRef.current = stopTranscriptionSession;

  const selectedLangRef = useRef(selectedLanguage);
  selectedLangRef.current = selectedLanguage;

  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  const supportedLanguages = ['english', 'chinese', 'german', 'spanish', 'russian', 'korean', 'french', 'japanese', 'portuguese', 'turkish', 'polish', 'catalan', 'dutch', 'arabic', 'swedish', 'italian', 'indonesian', 'hindi', 'finnish', 'vietnamese', 'hebrew', 'ukrainian', 'greek', 'malay', 'czech', 'romanian', 'danish', 'hungarian', 'tamil', 'norwegian', 'thai', 'urdu', 'croatian', 'bulgarian', 'lithuanian', 'latin', 'maori', 'malayalam', 'welsh', 'slovak', 'telugu', 'persian', 'latvian', 'bengali', 'serbian', 'azerbaijani', 'slovenian', 'kannada', 'estonian', 'macedonian', 'breton', 'basque', 'icelandic', 'armenian', 'nepali', 'mongolian', 'bosnian', 'kazakh', 'albanian', 'swahili', 'galician', 'marathi', 'punjabi', 'sinhala', 'khmer', 'shona', 'yoruba', 'somali', 'afrikaans', 'occitan', 'georgian', 'belarusian', 'tajik', 'sindhi', 'gujarati', 'amharic', 'yiddish', 'lao', 'uzbek', 'faroese', 'haitian creole', 'pashto', 'turkmen', 'nynorsk', 'maltese', 'sanskrit', 'luxembourgish', 'myanmar', 'tibetan', 'tagalog', 'malagasy', 'assamese', 'tatar', 'hawaiian', 'lingala', 'hausa', 'bashkir', 'javanese', 'sundanese']

  const modelOptions = ['tiny', 'base', 'small', 'medium', 'large', 'large-v1']

  var uploaded_files = []
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);


  function handleTranscribeTimeoutChange(newTimeout) {
    setTranscribeTimout(newTimeout)
  }

  function startRecording() {
    setStopTranscriptionSession(false)
    setIsRecording(true)
    intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000)
  }
/*

// deprecated, reads files from served info
  function report_files() {
    const url = 'http://localhost:8003';
      const fileNames = [];

      fetch(url, {mode: 'cors'})
        .then(response => response.text())
        .then(data => {
          // parse the HTML response to get the list of file names
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(data, 'text/html');
          const links = htmlDoc.getElementsByTagName('a');
          for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.getAttribute('href') !== '../') {
              fileNames.push(link.textContent);
            }
          }
          
          // do something with the list of file names
          // for example, display them in a list
          const list = document.createElement('ul');
          for (let i = 0; i < fileNames.length; i++) {
            const listItem = document.createElement('li');
            listItem.textContent = fileNames[i];
            list.appendChild(listItem);
          }
          document.body.appendChild(list);
        })
        .catch(error => {
          console.log("file server (serve_files.py) not running");
        });
  }

*/
  function stopRecording() {
    clearInterval(intervalRef.current);
    setStopTranscriptionSession(true)
    setIsRecording(false)
    setIsTranscribing(false)
  }

  function onData(recordedBlob) {
    // console.log('chunk of real-time data is: ', recordedBlob);
  }

  function onStop(recordedBlob) {
    transcribeRecording(recordedBlob)
    console.log('transcribing is false');
    setIsTranscribing(true)
  }

  function transcribeInterim() {
    clearInterval(intervalRef.current);
    setIsRecording(false)
  }

  function uploadCode() {
    var finput = document.getElementById('file-input');
    var upload_list = document.getElementById('uploaded-file-list');
    //finput = finput.value;
    //console.log(finput.files)
    var formData = new FormData();

    /*
      In reality, we want to reflect the state of the codebase_files
      directory here, so we need to fetch from the server to display
      the files that exist, using an interval to refresh these files.
    */
    Array.from(finput.files).forEach(file => {
      if (!uploaded_files.includes(file.name)) {
        var newFileItem = document.createElement("li");
        newFileItem.textContent = file.name;
        upload_list.appendChild(newFileItem);
        formData.append('file', file)
        uploaded_files.push(file.name);
      }
    });

    //console.log(formData.entries());
    formData.forEach(thing => {
      console.log(thing);
    }) 

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/upload", true);
    xhr.onload = function() {
      if (this.status === 200) {
        console.log("Files uploaded successfully");
      } else {
        console.error("Error uploading files");
      }
    };
    xhr.send(formData);

  }

  async function transcribeRecording(recordedBlob) {
    const headers = {
      "content-type": "multipart/form-data",
      "responseType": 'stream',
    };
    const formData = new FormData();
    formData.append("language", selectedLangRef.current)
    formData.append("model_size", modelOptions[selectedModelRef.current])
    formData.append("audio_data", recordedBlob.blob, 'temp_recording');
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://0.0.0.0:8000/transcribe');
    xhr.withCredentials = false;
    xhr.send(formData);

    xhr.onreadystatechange = function() {
      //console.log(xhr.readyState);
      if (xhr.readyState === 3 || xhr.readyState === 4) {  // check for partial response
        const output_element = document.getElementById('output');
        output_element.innerHTML = ""; 
        //const data = xhr.responseText.split('\n').filter(line => line.trim() !== '');  // split the response into separate lines
        var data = xhr.responseText;
        //for (let i = 0; i < data.length; i++) {
          //console.log(data[i]);
        data = data.replace(/\n/g, "<br>");
        data = data.replace(/```([^`]+)```/g, '<code>$1</code>')
        data = data.replace(/`([^`]+)`/g, '<code>$1</code>')
        output_element.innerHTML = data.replace(/\n/g, "<br>");

        //setTranscribedData(data);
          /*
          var new_text = document.createTextNode(data[i]);
          //const output_element = document.getElementById('output');
          output_element.appendChild(new_text);
          */
          //const message = JSON.parse(data[i].replace('data: ', ''));  // parse each line as a JSON object
          //console.log(data[i]);  // display the data in the console
          // update your UI with the received data
        //}
        //console.log(data)
        //console.log(transcribedData)
      }
      if (xhr.readyState === 4) {
        setIsTranscribing(false);  
      }
    };

    //setStopTranscriptionSession(false);
    // COMMENTED LINE BELOW
    setIsTranscribing(false);
    //intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000)
    console.log(stopTranscriptionSession);
    console.log(isTranscribing)
    /*
    axios.post("http://0.0.0.0:8000/transcribe", formData, { headers })
      .then((res) => {
        // Vrushank Changes:
        const reader = res.data.getReader();
        // function to read and display the data
        function readAndDisplayData() {
          reader.read().then(({ value, done }) => {
            // if done is true, the stream has ended
            if (done) return;

            // convert the chunk to a string and display it
            const chunk = new TextDecoder('utf-8').decode(value);
            const outputEl = document.getElementById('output');
            outputEl.textContent += chunk;

            // read the next chunk
            readAndDisplayData();
          });
        }
        
        readAndDisplayData();
        // End Vrushank Changes
        setTranscribedData(oldData => [...oldData, res.data])
        setIsTranscribing(false)
        intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000)
      });
      */
    if (!stopTranscriptionSessionRef.current) {
      setIsRecording(true)
    }
  }

  function submitDir() {
    var dir_path = document.getElementById('CLI-Directory').value;
    console.log(dir_path); 
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://0.0.0.0:8000/senddir", true);
    xhr.onload = function() {
      if (this.status === 200) {
        console.log("Files uploaded successfully");
      } else {
        console.error("Error uploading files");
      }
    };
    xhr.send(JSON.stringify(dir_path));
  }

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h3">
          Plato <span role="img" aria-label="microphone-emoji"></span>
        </Typography>
      </div>
      <div className={classes.settingsSection}>
        <SettingsSections disabled={isTranscribing || isRecording} possibleLanguages={supportedLanguages} selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage} modelOptions={modelOptions} selectedModel={selectedModel} onModelChange={setSelectedModel}
          transcribeTimeout={transcribeTimeout} onTranscribeTiemoutChanged={handleTranscribeTimeoutChange} />
      </div>
      <div className={classes.buttonsSection} >
        {!isRecording && !isTranscribing && <Button onClick={startRecording} variant="primary">Start transcribing</Button>}
        {(isRecording || isTranscribing) && <Button onClick={stopRecording} variant="danger" disabled={stopTranscriptionSessionRef.current}>Stop</Button>}
      </div>

      <div className="recordIllustration">
        <ReactMic record={isRecording} className="sound-wave" onStop={onStop}
          onData={onData} strokeColor="#0d6efd" backgroundColor="#f6f6ef" />
      </div>

      <div>
        <TranscribeOutput transcribedText={transcribedData} interimTranscribedText={interimTranscribedData} />
        <PulseLoader sizeUnit={"px"} size={20} color="purple" loading={isTranscribing} />
      </div>
      
      <p id="output" style={{"border": "1px solid black"}}></p>
      
      <input id="CLI-Directory"></input>
      <button id="submit-dir-cli" onClick={submitDir}>CLI Only: Submit Directory Path</button>
      <br></br>

      <p>Uploaded Files:</p>
      <ul id="uploaded-file-list"></ul>
      
      <input type="file" id="file-input" onChange={uploadCode} multiple></input>

      <ul id="server_files"></ul>
    </div>
  );
}

export default withStyles(useStyles)(App);
