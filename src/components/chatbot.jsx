import React, { useState } from 'react';

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
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I'm processing your request...", 
          sender: 'bot' 
        }]);
      }, 500);
      setInput('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerText}>🤖 AI Assistant</h2>
      </div>
      
      <div style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(message.sender === 'user' ? styles.userMessage : styles.botMessage),
            }}
          >
            {message.text}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;