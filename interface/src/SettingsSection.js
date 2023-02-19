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
      <h4>An AI Pair-Programming Platform Powered by Your Voice &#127908;</h4>
    </div>
  )
}

export default SettingsSections;
