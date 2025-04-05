import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import axios from 'axios';
import '../../index.css';

const BACKEND_URL = 'http://localhost:5000';

const Chatbot = ({ initialMessage, onClose }) => {
  const [messages, setMessages] = useState([
    { content: initialMessage, type: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Add user message to chat
      setMessages(prev => [...prev, { 
        content: inputMessage, 
        type: 'user' 
      }]);

      // Send message to Django backend with Gemini integration
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        message: inputMessage
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Handle Gemini response
      if (response.data && response.data.response) {
        setMessages(prev => [...prev, { 
          content: response.data.response,
          type: 'bot' 
        }]);
      } else {
        throw new Error('Invalid response from Gemini API');
      }

    } catch (error) {
      console.error('Gemini API error:', error);
      setMessages(prev => [...prev, { 
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        type: 'error' 
      }]);
    } finally {
      setIsLoading(false);
      setInputMessage('');
    }
  };
  

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <MessageCircle size={20} />
          <span>AI Learning Assistant</span>
        </div>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chatbot-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputMessage.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;