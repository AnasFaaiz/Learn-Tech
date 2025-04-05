import React, { useState, useRef, useEffect } from 'react';

const styles = {
  container: {
    width: '400px',
    height: '600px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    margin: '2rem auto',
  },
  header: {
    padding: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '8px 8px 0 0',
  },
  headerText: {
    margin: 0,
    fontSize: '1.2rem',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  message: {
    padding: '8px 16px',
    borderRadius: '16px',
    maxWidth: '80%',
    wordWrap: 'break-word',
  },
  userMessage: {
    backgroundColor: '#007bff',
    color: 'white',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#e9ecef',
    color: 'black',
    alignSelf: 'flex-start',
  },
  suggestionMessage: {
    backgroundColor: '#f8f9fa',
    color: '#495057',
    marginLeft: '20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#dee2e6',
    },
  },
  suggestionsHeader: {
    backgroundColor: '#f8f9fa',
    color: '#666',
    fontStyle: 'italic',
    borderLeft: '3px solid #007bff',
    paddingLeft: '10px',
  },
  loadingMessage: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  errorMessage: {
    backgroundColor: '#fff3f3',
    color: '#dc3545',
    borderLeft: '3px solid #dc3545',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
  },
  connectionError: {
    backgroundColor: '#fff3f3',
    color: '#dc3545',
    textAlign: 'center',
    padding: '15px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #dc3545',
  },
  retryButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    '&:hover': {
      backgroundColor: '#c82333',
    },
  },
  serverStatus: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '5px 10px',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  serverOnline: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  serverOffline: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  form: {
    display: 'flex',
    padding: '16px',
    gap: '8px',
    borderTop: '1px solid #ccc',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
};

const BACKEND_URL = 'http://localhost:5000';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const messagesEndRef = useRef(null);

  // Check backend connection on component mount and every 30 seconds
  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${BACKEND_URL}/api/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'healthy') {
        setIsServerOnline(true);
        setConnectionError(null);
      } else {
        throw new Error('Server is not healthy');
      }
    } catch (error) {
      setIsServerOnline(false);
      if (error.name === 'AbortError') {
        setConnectionError('Server connection timed out. Please check if the server is running.');
      } else {
        setConnectionError(`Cannot connect to the server: ${error.message}`);
      }
      console.error('Backend connection error:', error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isServerOnline) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    setIsLoading(true);
    setConnectionError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Server endpoint not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Split the response into answer and follow-up questions
      const [answer, ...followUps] = data.response.split('\n•');
      
      // Add bot's answer
      setMessages(prev => [...prev, { 
        text: answer.trim(), 
        sender: 'bot',
        type: 'answer'
      }]);

      // Add follow-up questions if they exist
      if (followUps.length > 0) {
        setMessages(prev => [...prev, { 
          text: 'Suggested follow-up questions:',
          sender: 'bot',
          type: 'suggestions'
        }]);
        
        followUps.forEach((question, index) => {
          if (question.trim()) {
            setMessages(prev => [...prev, { 
              text: `• ${question.trim()}`,
              sender: 'bot',
              type: 'suggestion'
            }]);
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setConnectionError(`Error: ${error.message}`);
      setMessages(prev => [...prev, { 
        text: 'Sorry, there was an error processing your request.', 
        sender: 'bot',
        type: 'error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageStyle = (message) => {
    const baseStyle = styles.message;
    if (message.sender === 'user') return { ...baseStyle, ...styles.userMessage };
    if (message.type === 'suggestion') return { ...baseStyle, ...styles.suggestionMessage };
    if (message.type === 'suggestions') return { ...baseStyle, ...styles.suggestionsHeader };
    if (message.type === 'error') return { ...baseStyle, ...styles.errorMessage };
    if (message.type === 'loading') return { ...baseStyle, ...styles.loadingMessage };
    return { ...baseStyle, ...styles.botMessage };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerText}>🤖 Gemini AI Assistant</h2>
        <div style={{
          ...styles.serverStatus,
          ...(isServerOnline ? styles.serverOnline : styles.serverOffline)
        }}>
          {isServerOnline ? 'Server Online' : 'Server Offline'}
        </div>
      </div>
      
      <div style={styles.messagesContainer}>
        {connectionError && (
          <div style={styles.connectionError}>
            {connectionError}
            <button 
              style={styles.retryButton}
              onClick={checkBackendConnection}
            >
              Retry Connection
            </button>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            style={getMessageStyle(message)}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div style={{ ...styles.message, ...styles.loadingMessage }}>
            <div style={{ animation: 'typing 1s infinite' }}>...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isServerOnline ? "Ask a question..." : "Server is offline"}
          style={styles.input}
          disabled={isLoading || !isServerOnline}
        />
        <button 
          type="submit" 
          style={{
            ...styles.button,
            ...((isLoading || !isServerOnline) ? styles.disabledButton : {})
          }}
          disabled={isLoading || !isServerOnline}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;