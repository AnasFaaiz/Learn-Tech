import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, PlusCircle, MinusCircle, HelpCircle, BookOpen, Clock } from 'lucide-react'
import './LearningBuddy.css'
import { courseService, buddyService } from '../../services/api'

function LearningBuddy({ courseId, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [learningProfile, setLearningProfile] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch course info, learning profile, and chat history when component mounts
  useEffect(() => {
    if (isOpen && courseId) {
      fetchData();
      startSession();
    }
    
    // Clean up when the component unmounts or course changes
    return () => {
      if (sessionId) {
        endSession();
      }
    };
  }, [isOpen, courseId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  async function fetchData() {
    try {
      // Fetch course info, chat history and learning profile in parallel
      const [courseData, chatHistory, profileData] = await Promise.all([
        courseService.getCourseById(courseId),
        buddyService.getChatHistory(courseId),
        buddyService.getLearningProfile()
      ]);
      
      setCourseInfo(courseData);
      setMessages(chatHistory);
      setLearningProfile(profileData);
      
      // If no messages exist, add a welcome message
      if (chatHistory.length === 0) {
        const welcomeMessage = {
          id: 'welcome',
          content: `Hi there! I'm your learning buddy for "${courseData.title}". How can I help you today? You can ask me questions about the course, request a quiz, or get study tips.`,
          is_from_ai: true,
          timestamp: new Date().toISOString(),
          message_type: 'general'
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error fetching learning buddy data:', error);
    }
  }
  
  async function startSession() {
    try {
      const response = await buddyService.startSession(courseId);
      setSessionId(response.session_id);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }
  
  async function endSession() {
    try {
      await buddyService.endSession(sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }
  
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  
  async function sendMessage(e) {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message to UI immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      is_from_ai: false,
      timestamp: new Date().toISOString(),
      message_type: 'general'
    };
    
    setMessages(prevMessages => [...prevMessages, tempUserMessage]);
    setNewMessage('');
    
    // Add temporary "typing" indicator
    const typingIndicator = {
      id: 'typing',
      content: 'Buddy is thinking...',
      is_from_ai: true,
      timestamp: new Date().toISOString(),
      message_type: 'typing'
    };
    
    setMessages(prevMessages => [...prevMessages, typingIndicator]);
    setIsLoading(true);
    
    try {
      const response = await buddyService.sendMessage(courseId, newMessage);
      
      // Remove typing indicator and add actual AI response
      setMessages(prevMessages => 
        prevMessages
          .filter(msg => msg.id !== 'typing')
          .concat([
            response.user_message,
            response.ai_response
          ])
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove typing indicator and add error message
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== 'typing').concat([{
          id: `error-${Date.now()}`,
          content: "I'm having trouble responding right now. Please try again later.",
          is_from_ai: true,
          timestamp: new Date().toISOString(),
          message_type: 'error'
        }])
      );
    } finally {
      setIsLoading(false);
    }
  }
  
  function getMessageIcon(type) {
    switch(type) {
      case 'quiz':
        return <BookOpen size={16} />;
      case 'suggestion':
        return <HelpCircle size={16} />;
      case 'question':
        return <HelpCircle size={16} />;
      default:
        return null;
    }
  }
  
  // Quick prompts the user can click on
  const quickPrompts = [
    "Can you quiz me on this topic?",
    "What should I focus on next?",
    "Summarize key concepts for me",
    "I'm struggling with understanding this",
    "How does this relate to real-world applications?"
  ];

  return (
    <div className={`learning-buddy-modal ${isOpen ? 'open' : ''}`}>
      <div className="learning-buddy-container">
        <div className="buddy-header">
          <div className="buddy-title">
            <MessageCircle size={20} />
            <h3>Learning Buddy</h3>
          </div>
          {courseInfo && (
            <div className="course-info">
              <span>{courseInfo.title}</span>
            </div>
          )}
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        
        <div className="buddy-messages">
          {messages.map((message, index) => (
            <div 
              key={message.id || index} 
              className={`message ${message.is_from_ai ? 'ai' : 'user'} ${message.message_type}`}
            >
              {message.is_from_ai && (
                <div className="ai-avatar">
                  <span>B</span>
                </div>
              )}
              <div className="message-content">
                {message.message_type && message.message_type !== 'general' && message.message_type !== 'typing' && (
                  <span className="message-type-indicator">
                    {getMessageIcon(message.message_type)}
                    {message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)}
                  </span>
                )}
                <p>{message.content}</p>
                {message.is_from_ai && message.message_type !== 'typing' && (
                  <div className="message-actions">
                    <button title="More like this">
                      <PlusCircle size={16} />
                    </button>
                    <button title="Less like this">
                      <MinusCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="quick-prompts">
          {quickPrompts.map((prompt, index) => (
            <button 
              key={index} 
              className="quick-prompt-btn"
              onClick={() => setNewMessage(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="buddy-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask your learning buddy..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !newMessage.trim()}>
            <Send size={20} />
          </button>
        </form>
        
        {learningProfile && (
          <div className="learning-stats">
            <div className="stat">
              <Clock size={16} />
              <span>Learning style: {learningProfile.learning_style}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningBuddy;