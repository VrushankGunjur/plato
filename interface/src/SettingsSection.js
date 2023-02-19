import React from "react";



const SettingsSections = ({ disabled, possibleLanguages, selectedLanguage, onLanguageChange,
  modelOptions, selectedModel, onModelChange, transcribeTimeout, onTranscribeTiemoutChanged }) => {

  function onModelChangeLocal(event) {
    onModelChange(event.target.value)
  }

  function onTranscribeTiemoutChangedLocal(event) {
    onTranscribeTiemoutChanged(event.target.value)
  }

  return (
    <div className="Container">
      <p>An AI Pair-Programming Platform Powered by Your Voice</p>
    </div>
  )
}

export default SettingsSections;
