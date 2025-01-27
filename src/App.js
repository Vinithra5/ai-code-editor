import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your server URL

const App = () => {
  const [code, setCode] = useState('// Start typing your code here...');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // For version control
  const [userName, setUserName] = useState('');

  // Mock AI Suggestions
  const fetchAISuggestion = async (inputCode) => {
    const mockedSuggestions = [
      "Consider adding error handling for better reliability.",
      "You can optimize this loop using array methods like map or filter.",
      "Refactor this function to improve performance.",
      "Use meaningful variable names for better readability.",
      "Add comments to explain complex logic.",
    ];

    // Simulate API behavior
    setAiSuggestion('Fetching AI suggestion...');
    setTimeout(() => {
      const randomSuggestion =
        mockedSuggestions[Math.floor(Math.random() * mockedSuggestions.length)];
      setAiSuggestion(randomSuggestion);
    }, 1000); // 1-second delay
  };

  // Execute Code Function
  const executeCode = async () => {
    setLoading(true);
    try {
      if (language === 'javascript') {
        const capturedLogs = [];
        const originalLog = console.log;

        // Capture console.log outputs
        console.log = (...args) => {
          capturedLogs.push(args.join(' '));
        };

        // Execute the user's code
        new Function(code)();

        // Restore original console.log
        console.log = originalLog;

        // Set captured logs as output
        setOutput(capturedLogs.join('\n') || 'Code executed successfully');
      } else {
        // For other languages, show a placeholder
        setOutput('Code execution for this language is not supported yet.');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format Code
  const formatCode = () => {
    try {
      const formatted = prettier.format(code, {
        parser: 'babel',
        plugins: [parserBabel],
      });
      setCode(formatted);
    } catch (error) {
      alert('Error formatting code: ' + error.message);
    }
  };

  // Save Code Snapshot
  const saveSnapshot = () => {
    setHistory((prev) => [...prev, code]);
    alert('Snapshot saved!');
  };

  // Handle Collaborative Changes
  useEffect(() => {
    socket.on('codeChange', (newCode) => {
      setCode(newCode);
    });
  }, []);

  const handleCodeChange = (newCode) => {
    setCode(newCode || '');
    socket.emit('codeChange', newCode);
    fetchAISuggestion(newCode || '');
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: 'white', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center' }}>AI Code Editor</h1>

      {/* User Authentication */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label htmlFor="userName" style={{ marginRight: '10px' }}>Enter Username:</label>
        <input
          type="text"
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your name..."
          style={{ padding: '5px', fontSize: '16px' }}
        />
      </div>

      {/* Toolbar */}
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label htmlFor="language" style={{ marginRight: '10px' }}>Choose Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: '5px', fontSize: '16px' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python (Mocked)</option>
            <option value="java">Java (Mocked)</option>
            <option value="c">C (Mocked)</option>
          </select>
        </div>
        <button onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')} style={buttonStyle}>
          Toggle {theme === 'vs-dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="50vh"
        language={language}
        theme={theme}
        value={code}
        options={{ scrollBeyondLastLine: false }}
        onChange={handleCodeChange}
      />

      {/* Action Buttons */}
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={executeCode} style={buttonStyle} disabled={loading}>
          {loading ? 'Running...' : 'Run Code'}
        </button>
        <button onClick={formatCode} style={buttonStyle}>Format Code</button>
        <button onClick={saveSnapshot} style={buttonStyle}>Save Snapshot</button>
      </div>

      {/* AI Suggestions */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '10px', marginTop: '20px', borderRadius: '5px' }}>
        <h3>AI Suggestion:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#dcdcdc' }}>
          {aiSuggestion || 'Type some code to see AI suggestions...'}
        </pre>
      </div>

      {/* Output Panel */}
      <div style={{ backgroundColor: '#2d2d2d', padding: '10px', marginTop: '20px', borderRadius: '5px' }}>
        <h3>Output:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#dcdcdc' }}>
          {output || 'Run your code to see output...'}
        </pre>
      </div>
    </div>
  );
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007acc',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
};

export default App;
