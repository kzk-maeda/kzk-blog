import React, { useState, useEffect, useLayoutEffect } from 'react';
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
  const [count, setCount] = useState(0)
  const xtermRef: React.RefObject<typeof XTerm> = React.createRef()

  const prompt: string = "\x1b[1;32mkzk_maeda \x1b[1;35m$ \x1b[37m"
  useEffect(() => {
    // console.log(xtermRef)
  }, []);
  
  useLayoutEffect(() => {
    // console.log("layout effect");
    // console.log(count)
    // 初回のbackgroud renderと、toggle on時のrender
    if (count < 2) {
      xtermRef.current?.terminal.writeln(
        "Welcome to kzk_maeda's CLI Profile!"
      );
      xtermRef.current?.terminal.writeln(
        "Please enter any string then press enter:"
      );
      xtermRef.current?.terminal.writeln(
        "Please enter 'help' to see available commands:"
      )
      xtermRef.current?.terminal.write(prompt);
      setCount(prevCount => prevCount + 1)
    }
  });

  return (
    // XTermがdocument objectを操作するので、SSR時にbuild errorとなる
    // それを回避するために、Xterm ComponentはSSRをスキップする
    <NoSsr fallback="<>" defer={true}>
      <XTerm className={classes.cli}
        options={{ theme: {background: "brightBlack"} }}
        ref={xtermRef}
        onData={(data: string) => {
          const code = data.charCodeAt(0);
          // console.log(xtermRef)
          console.log("data : " + data)
          console.log("data.length : " + data.length)
          console.log("charCodeAt : " + data.charCodeAt(0))
          console.log("input : " + input)
          console.log("input.length : " + input.length)
          if (code === 13 && input.length > 0) {
            // Enter
            if (input === 'clear') {
              xtermRef.current.terminal.clear()
            } else {
              const output:string = getOutput(input)
              displayOutput(xtermRef, "\r\n" + output + "\r\n");
              displayOutput(xtermRef, prompt);
              setInput("")
            }
          } else if (code === 13 && input.length == 0) {
            // Enter without command
            displayOutput(xtermRef, "\r\n" + prompt);
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
  switch(true) {
    case /pwd/.test(command):
      return '/usr/local/'
    case /whoami/.test(command):
      return 'Kazuki Maeda(kzk_maeda)'
    case /business/.test(command):
      return 'atama plus, inc. SRE\r\nFreelance Engineer / Patent Consultant'
    case /works/.test(command):
      return workText
    case /help/.test(command):
      return helpText
    case /date/.test(command):
      return strDate()
    case /sns twitter/.test(command):
      window.open('https://twitter.com/kzk_maeda');
      return 'open twitter to kzk_maeda'
    case /sns github/.test(command):
      window.open('https://github.com/kzk-maeda')
      return 'open github to kzk-maeda'
    case /sns linkedin/.test(command):
      window.open('https://www.linkedin.com/in/kzk-maeda/')
      return 'open linkedin to kzk-maeda'
    case /sns/.test(command):
      return 'usage: sns [twitter/github/linkedin]'
    default:
      return "Not authorized command\r\nType 'help' to see help"
  }
  
  return ""
}

const helpText = "kzk_maeda\r\n"
  + "Basic Commands \r\n\r\n"
  + "whoami                           :show author name\r\n"
  + "works                            :show works history\r\n"
  + "business                         :show current business\r\n"
  + "sns [twitter/github/linkedin]    :open sns account in new tab"

const workText = "My works history:\r\n"
  + "2013.04-2014.10   \x1b[1;34mPanasonic\r\n\x1b[37m"
  + "                  (Patent Officer)\r\n"
  + "2014.11-2020.08   \x1b[1;34mRecruit Technologies\r\n\x1b[37m"
  + "                  (SRE/TeamLead/ScrumMaster/ProjectManager)\r\n"
  + "2016.10-now       \x1b[1;34mFreelance\r\n\x1b[37m"
  + "                  (Develop DataPipeline/API System/Consult about Patent)"

const strDate = (): string => {
  const date = new Date();
  return date.getFullYear()
  + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
  + '/' + ('0' + date.getDate()).slice(-2)
  + ' ' + ('0' + date.getHours()).slice(-2)
  + ':' + ('0' + date.getMinutes()).slice(-2)
  + ':' + ('0' + date.getSeconds()).slice(-2)
  + '(JST)';
}

const displayOutput = (ref: React.RefObject<typeof XTerm> ,output: string) => {
  ref.current?.terminal.write(output)
}
