import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import socket from "../../services/socket";

function CodeEditor() {
  const [language, setLanguage] = useState("javascript");

  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);

  // Receive code from another participant
  useEffect(() => {
    function handleCodeUpdated(data) {
      if (!editorRef.current) return;
      isRemoteChange.current = true;
      editorRef.current.setValue(data.code);
      isRemoteChange.current = false;
    }

    socket.on("code:updated", handleCodeUpdated);

    return () => {
      socket.off("code:updated", handleCodeUpdated);
    };
  }, []);

  // Store Monaco editor instance
  function handleEditorMount(editor) {
    editorRef.current = editor;
  }

  // Handle local typing
  function handleEditorChange(value) {
    if (isRemoteChange.current) return;
    socket.emit("code:update", {
      code: value || ""
    });
  }

  return (
    <section className="editor-panel">
      <div className="editor-toolbar">
        <div>
          <h2>Code Editor</h2>
          <p>Collaborate. Code. Solve.</p>
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
        </select>
      </div>

      <Editor
        height="500px"
        language={language}
        theme="vs-dark"
        defaultValue=""
        onMount={handleEditorMount}
        onChange={handleEditorChange}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          lineNumbers: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          tabSize: 4,
        }}
      />
    </section>
  );
}

export default CodeEditor;
