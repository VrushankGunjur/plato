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
import { RingLoader } from "react-spinners";
import { IconButton } from "@material-ui/core";
import { Container } from "reactstrap";
import { TextField } from '@material-ui/core';
import "@fontsource/poppins";
import MicIcon from '@mui/icons-material/Mic';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import DirectionsIcon from '@mui/icons-material/Directions';

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
  const [interimTranscribedData, ] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedModel, setSelectedModel] = useState(0);
  const [transcribeTimeout, setTranscribeTimout] = useState(10);
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

  function transcribeRecording(recordedBlob) {
    const headers = {
      "content-type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("language", selectedLangRef.current)
    formData.append("model_size", modelOptions[selectedModelRef.current])
    formData.append("audio_data", recordedBlob.blob, 'temp_recording');
    axios.post("http://0.0.0.0:8000/transcribe", formData, { headers })
      .then((res) => {
        setTranscribedData(oldData => [...oldData, res.data])
        setIsTranscribing(false)
        intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000)
      });
      
      if (!stopTranscriptionSessionRef.current){
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
    console.log("HIIIIIII")
  }

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <div className="page-header header-filter">
          <div className="squares square1" />
          <div className="squares square2" />
          <div className="squares square3" />
          <div className="squares square4" />
          <div className="squares square5" />
          <div className="squares square6" />
          <div className="squares square7" />
        <Container>
          <div className="content-center brand">
            <h1 className="h1-seo">Plato</h1>
            <h3>
              An AI Pair-Programming Platform Powered by Your Voice.
            </h3>
          </div>
        </Container>
        </div>
      </div>

      <div className="recordIllustration">
        <ReactMic record={isRecording} className="sound-wave" onStop={onStop}
          onData={onData} strokeColor="#0d6efd" backgroundColor="#171941" timeSlice={20}  />
      </div>

      <div class="scroll-box">
        <div>
        <RingLoader sizeUnit={"px"} size={100} color="purple" loading={isTranscribing} />
        </div>
        <TranscribeOutput transcribedText={transcribedData} interimTranscribedText={interimTranscribedData} />
      </div>
      <div className="flex-container">
        <div>
          <Paper 
            component="form"
            sx={{ p: '2px 4px', display: 'flex', borderRadius: 15, alignItems: 'center', width: 500}}
          >
              <IconButton sx={{ p: '4px' }} aria-label="menu">
              <UploadFileIcon fontSize="large"/> {/* onClick={openModal} */}
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Type Text Here"
            />
            <IconButton type="button" sx={{ p: '4px' }} aria-label="Enter">
              <KeyboardReturnIcon />
            </IconButton>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton color="primary" sx={{ p: '4px' }} aria-label="Microphone">
              <div className={classes.buttonsSection} >
                {!isRecording && !isTranscribing && <MicIcon onClick={startRecording} fontSize="large" variant="contained" color="primary">Start transcribing</MicIcon>}
                {(isRecording || isTranscribing) && <MicIcon onClick={stopRecording} fontSize="large" variant="danger" disabled={stopTranscriptionSessionRef.current} color="secondary">Stop</MicIcon>}
              </div>
            </IconButton>
          </Paper>
        </div>
      </div>
      <input id="CLI-Directory"></input>
      <button id="submit-dir-cli" onClick={submitDir}>CLI Only: Submit Directory Path</button>
      <br></br>
      <div>
        <p>Upload files to give the model context</p>
        <input type="file" id="file-input" onChange={uploadCode} multiple></input>
      </div>
      <p>Uploaded Files:</p>
      <ul id="uploaded-file-list"></ul>
      <ul id="server_files"></ul>
      <br></br>
    </div>
  );
}

export default withStyles(useStyles)(App);
