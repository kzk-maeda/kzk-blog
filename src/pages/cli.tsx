import React, { useState, useEffect } from 'react';
import { XTerm } from 'xterm-for-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface IState {
}
interface IProps {
}

const CLI = () => {
  const [input, setInput] = useState("")
  const xtermRef: React.RefObject<XTerm> = React.createRef()

  useEffect(() => {
    xtermRef.current!.terminal.writeln(
      "Please enter any string then press enter:"
    );
    xtermRef.current!.terminal.write("echo > ");
  }, []);

  return (
    <>
      <XTerm
        ref={xtermRef}
        onData={(data) => {
          const code = data.charCodeAt(0);
          console.log("data : " + data)
          console.log("data.length : " + data.length)
          console.log("charCodeAt : " + data.charCodeAt(0))
          console.log("input : " + input)
          console.log("input.length : " + input.length)
          if (code === 13 && input.length > 0) {
            // Enter
            const output:string = getOutput(input)
            xtermRef.current!.terminal.write(
                "\r\n" + output + "\r\n"
            );
            xtermRef.current!.terminal.write("echo > ");
            setInput("")
          } else if (code === 13 && input.length == 0) {
            // Enter without command
            xtermRef.current!.terminal.write("\r\necho > ");
          } else if (code === 127 && data != "" && input.length > 0) {
            // Backspace
            xtermRef.current!.terminal.write('\b \b')
            setInput(input.slice(0, -1))
          } else if (code < 32 || code === 127) {
            // Control Key
            return;
          } else {
            // Default Input
            xtermRef.current!.terminal.write(data);
            setInput(input + data)
          }
        }}
      />
      {/* <SyntaxHighlighter language="javascript" style={ dark }></SyntaxHighlighter> */}
    </>
  )
}

export default CLI

const getOutput = (command: string): string => {
  console.log(command)
  switch(command) {
    case 'pwd':
      return '/usr/local/'
  }
  
  return ""
}