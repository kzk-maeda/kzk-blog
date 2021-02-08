import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { NoSsr } from '@material-ui/core';
const { XTerm = {} } = typeof window !== `undefined` ? require("xterm-for-react") : {}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    cli: {
      position: 'fixed',
      bottom: 0,
      right: 0,
      left: 0,
      overflowY: 'auto',
    }
  })
)

const CLI = () => {
  const classes = useStyles();
  const [input, setInput] = useState("")
  const xtermRef: React.RefObject<typeof XTerm> = React.createRef()

  useEffect(() => {
    xtermRef.current?.terminal.writeln(
      "Please enter any string then press enter:"
    );
    xtermRef.current?.terminal.write("echo > ");
  }, []);

  return (
    <NoSsr>
      <XTerm className={classes.cli}
        options={{ theme: {background: "brightBlack"} }}
        ref={xtermRef}
        onData={(data: string) => {
          const code = data.charCodeAt(0);
          // console.log("data : " + data)
          // console.log("data.length : " + data.length)
          // console.log("charCodeAt : " + data.charCodeAt(0))
          // console.log("input : " + input)
          // console.log("input.length : " + input.length)
          if (code === 13 && input.length > 0) {
            // Enter
            const output:string = getOutput(input)
            displayOutput(xtermRef, "\r\n" + output + "\r\n");
            displayOutput(xtermRef, "echo > ");
            setInput("")
          } else if (code === 13 && input.length == 0) {
            // Enter without command
            displayOutput(xtermRef, "\r\necho > ");
          } else if (code === 127 && data != "" && input.length > 0) {
            // Backspace
            displayOutput(xtermRef, '\b \b')
            setInput(input.slice(0, -1))
          } else if (code < 32 || code === 127) {
            // Control Key
            return;
          } else {
            // Default Input
            displayOutput(xtermRef, data);
            setInput(input + data)
          }
        }}
      />
    </NoSsr>
  )
}

export default CLI

const getOutput = (command: string): string => {
  // console.log(command)
  switch(command) {
    case 'pwd':
      return '/usr/local/'
    case 'whoami':
      return 'Kazuki Maeda'
  }
  
  return ""
}

const displayOutput = (ref: React.RefObject<typeof XTerm> ,output: string) => {
  ref.current?.terminal.write(output)
}