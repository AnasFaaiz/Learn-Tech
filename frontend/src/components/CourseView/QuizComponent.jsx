import { useState, useEffect } from 'react';
import './CourseView.css';

function QuizComponent({ quiz, onSubmit }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null));
  const [performanceHistory, setPerformanceHistory] = useState([]); // Track performance
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('auto'); // 'auto', 'easy', 'medium', 'hard'
  const [aiSuggestion, setAiSuggestion] = useState(null); // AI suggestion for difficulty
  const [showHistory, setShowHistory] = useState(false); // Toggle history view
  
  // Initialize history from localStorage
  useEffect(() => {
    try {
      const userHistory = localStorage.getItem('quizPerformanceHistory');
      if (userHistory) {
        const history = JSON.parse(userHistory);
        setPerformanceHistory(history);
        
        // Calculate suggested difficulty based on past performance
        const suggestion = analyzePerformance(history);
        setAiSuggestion(suggestion);
      }
    } catch (error) {
      console.error("Error loading quiz history:", error);
    }
    
    console.log("Quiz Questions:", quiz.questions);
  }, [quiz]);

  // AI function to analyze performance and suggest appropriate difficulty
  const analyzePerformance = (history) => {
    if (!history || history.length === 0) return null;
    
    // Calculate average score from recent attempts (last 3)
    const recentAttempts = history.slice(-3);
    const avgScore = recentAttempts.reduce((sum, item) => sum + item.score, 0) / recentAttempts.length;
    
    // AI suggestion logic based on performance patterns and learning curve
    if (avgScore > 85) {
      return {
        suggestion: 'hard',
        reason: 'You\'ve consistently scored high. Try challenging questions!'
      };
    } else if (avgScore > 70) {
      return {
        suggestion: 'medium',
        reason: 'You\'re doing well. Medium difficulty questions will help you improve.'
      };
    } else {
      return {
        suggestion: 'easy',
        reason: 'Start with easy questions to build your confidence.'
      };
    }
  };

  // Update AI suggestion when performance history changes
  useEffect(() => {
    if (performanceHistory.length > 0) {
      const suggestion = analyzePerformance(performanceHistory);
      setAiSuggestion(suggestion);
    }
  }, [performanceHistory]);

  const renderDifficultyLabel = (questionId) => {
    // If specific difficulty is selected, show that difficulty label
    if (adaptiveDifficulty !== 'auto') {
      const isEasy = adaptiveDifficulty === 'easy';
      const isMedium = adaptiveDifficulty === 'medium';
      const isHard = adaptiveDifficulty === 'hard';
      
      // Set text and style based on selected difficulty
      let text = isEasy ? "Easy" : isMedium ? "Medium" : "Hard";
      let color = isEasy ? "#4CAF50" : isMedium ? "#FF9800" : "#f44336";
      
      const labelStyle = {
        color: 'white',
        backgroundColor: color,
        fontWeight: 'bold',
        marginLeft: '10px',
        fontSize: '0.85rem',
        padding: '3px 10px',
        borderRadius: '4px',
        display: 'inline-block',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        minWidth: '60px',
        textAlign: 'center'
      };
      
      return <span style={labelStyle}>{text}</span>;
    }
    
    // Default behavior - determine difficulty based on question ID
    const isEasy = questionId <= 10;
    const isMedium = questionId > 10 && questionId <= 20;
    const isHard = questionId > 20;
  
    // Set text and style based on difficulty
    let text = "Easy";
    let color = "#4CAF50"; // Green
    
    if (isMedium) {
      text = "Medium";
      color = "#FF9800"; // Orange
    } else if (isHard) {
      text = "Hard";
      color = "#f44336"; // Red
    }
    
    const labelStyle = {
      color: 'white',
      backgroundColor: color,
      fontWeight: 'bold',
      marginLeft: '10px',
      fontSize: '0.85rem',
      padding: '3px 10px',
      borderRadius: '4px',
      display: 'inline-block',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      minWidth: '60px',
      textAlign: 'center'
    };
    
    return <span style={labelStyle}>{text}</span>;
  };
  
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };
  
  const handleSubmit = () => {
    if (answers.some(answer => answer === null)) {
      alert("Please answer all questions before submitting.");
      return;
    }
    
    try {
      // Calculate score for this attempt
      const correctAnswers = quiz.questions.filter((q, index) => 
        answers[index] === q.correctAnswer
      ).length;
      
      const score = Math.round((correctAnswers / quiz.questions.length) * 100);
      
      // Add this performance to history with enhanced metadata
      const updatedHistory = [
        ...performanceHistory,
        {
          timestamp: new Date().toISOString(),
          score: score,
          difficulty: adaptiveDifficulty,
          courseId: quiz.courseId || 'unknown',
          quizTitle: quiz.title,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          // Add question IDs to track which questions were asked
          questionIds: quiz.questions.map(q => q.id)
        }
      ];
      
      // Store in localStorage for persistence
      localStorage.setItem('quizPerformanceHistory', JSON.stringify(updatedHistory));
      setPerformanceHistory(updatedHistory);
      
      console.log("Quiz attempt saved to history:", updatedHistory[updatedHistory.length - 1]);
      
      // Submit answers to parent component
      onSubmit(answers);
    } catch (error) {
      console.error("Error saving quiz history:", error);
      // Still submit answers even if history saving fails
      onSubmit(answers);
    }
  };

  // Handle difficulty change
  const handleDifficultyChange = (difficulty) => {
    setAdaptiveDifficulty(difficulty);
  };
  
  // Format a date string for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  // Styled components (existing styles...)
  const questionCardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };
  
  const questionHeaderStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    margin: '0 0 15px 0',
    padding: '0 0 10px 0',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap',
    gap: '8px'
  };
  
  const optionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  };
  
  const optionLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };
  
  const optionTextStyle = {
    marginLeft: '10px'
  };
  
  const submitBtnStyle = {
    backgroundColor: '#7e57c2',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px',
    fontWeight: 'bold'
  };

  // AI Suggestion panel style
  const aiSuggestionStyle = {
    backgroundColor: '#f0f4ff',
    border: '1px solid #d0d9ff',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };

  const aiIconStyle = {
    width: '36px',
    height: '36px',
    backgroundColor: '#7e57c2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px'
  };

  const difficultyButtonsStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  };

  const difficultyButtonStyle = (level) => ({
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: adaptiveDifficulty === level ? 'bold' : 'normal',
    color: 'white',
    backgroundColor: 
      level === 'easy' ? '#4CAF50' : 
      level === 'medium' ? '#FF9800' : 
      level === 'hard' ? '#f44336' : '#7e57c2'
  });

  // History panel style
  const historyPanelStyle = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px'
  };

  const historyItemStyle = (score) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
    backgroundColor: score >= 70 ? '#e8f5e9' : '#ffebee',
    borderLeft: `4px solid ${score >= 70 ? '#4CAF50' : '#f44336'}`
  });
  
  return (
    <div className="quiz" style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>{quiz.title}</h3>

      {performanceHistory.length > 0 && (
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #7e57c2',
              color: '#7e57c2',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            {showHistory ? 'Hide History' : 'Show Quiz History'}
          </button>
        </div>
      )}

        {showHistory && performanceHistory.length > 0 && (
          <div style={historyPanelStyle}>
            <h4 style={{ margin: '0 0 10px 0' }}>Your Quiz History</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {performanceHistory.slice().reverse().map((attempt, index) => (
                <div key={index} style={historyItemStyle(attempt.score)}>
                  <div>
                    <strong>{attempt.quizTitle || 'Quiz Attempt'}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {formatDate(attempt.timestamp)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      {attempt.correctAnswers || 0} of {attempt.totalQuestions || 0} correct
                    </div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      backgroundColor: attempt.score >= 70 ? '#4CAF50' : '#f44336',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      minWidth: '45px',
                      textAlign: 'center'
                    }}>
                      {attempt.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      
      {/* AI Adaptive Difficulty Panel */}
      {aiSuggestion && (
        <div style={aiSuggestionStyle}>
          <div style={aiIconStyle}>AI</div>
          <div>
            <h4 style={{ margin: '0 0 5px 0' }}>AI Learning Assistant</h4>
            <p style={{ margin: '0 0 10px 0' }}>{aiSuggestion.reason}</p>
            <div style={difficultyButtonsStyle}>
              <button 
                style={difficultyButtonStyle('auto')}
                onClick={() => handleDifficultyChange('auto')}
              >
                Auto
              </button>
              <button 
                style={difficultyButtonStyle('easy')}
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button 
                style={difficultyButtonStyle('medium')}
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </button>
              <button 
                style={difficultyButtonStyle('hard')}
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Quiz Questions */}
      {quiz.questions.map((question, qIndex) => (
        <div key={question.id} style={questionCardStyle}>
          <h4 style={questionHeaderStyle}>
            <span style={{ flex: '1' }}>Question {qIndex + 1}: {question.question}</span>
            {renderDifficultyLabel(question.id)}
          </h4>
          
          <div style={optionsStyle}>
            {question.options.map((option, oIndex) => (
              <label 
                key={oIndex} 
                style={{
                  ...optionLabelStyle,
                  backgroundColor: answers[qIndex] === oIndex ? '#f0f0ff' : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => handleSelectAnswer(qIndex, oIndex)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={optionTextStyle}>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handleSubmit}
          style={submitBtnStyle}
          disabled={answers.some(answer => answer === null)}
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizComponent;