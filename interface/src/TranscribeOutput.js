import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";


const useStyles = () => ({
  root: {
    maxWidth: '500px',
    display: 'flex'
  },
  outputText: {
    marginLeft: '8px',
    color: '#525f7f',
  }
});

const TranscribeOutput = ({classes, transcribedText, interimTranscribedText}) => {
  if (transcribedText.length === 0 && interimTranscribedText.length === 0) {
    return <Typography variant="body1"></Typography>;
  }

  return (
    <div className="outputText-Text">
      <Typography variant="body1">{transcribedText}</Typography>
      <Typography className="outputText-Text" >{interimTranscribedText}</Typography>
    </div>
  )
}

export default withStyles(useStyles)(TranscribeOutput);
