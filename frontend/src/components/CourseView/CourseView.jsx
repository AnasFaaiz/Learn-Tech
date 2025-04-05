import { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, CheckCircle, AlertCircle, Clock, Award, BookOpen, FileText, Code } from 'lucide-react'
import { courseService } from '../../services/api'
import './CourseView.css'
import LearningBuddy from '../LearningBuddy/LearningBuddy'

function CourseView({ courseId, onBackClick }) {
  const [course, setCourse] = useState(null)
  const [units, setUnits] = useState([])
  const [activeUnit, setActiveUnit] = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // overview, lecture, quiz, project
  const [quizInProgress, setQuizInProgress] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [courseProgress, setCourseProgress] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true)
        
        // Fetch course details and progress in parallel
        const [courseData, progressData] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getCourseProgress(courseId)
        ])
        
        setCourse(courseData)
        setUnits(courseData.units || [])
        setCourseProgress(progressData)
      } catch (error) {
        console.error('Error fetching course data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId])

  useEffect(() => {
    // Start tracking session when viewing a course
    if (courseId && !sessionId) {
      startCourseSession()
    }
    
    // Clean up function to end the session when unmounting
    return () => {
      if (sessionId) {
        endCourseSession()
      }
    }
  }, [courseId])

  const startCourseSession = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/course-session/start/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ course_id: courseId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessionId(data.session_id)
      }
    } catch (error) {
      console.error('Error starting course session:', error)
    }
  }

  const endCourseSession = async () => {
    try {
      await fetch(`http://localhost:8000/api/course-session/end/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId })
      })
    } catch (error) {
      console.error('Error ending course session:', error)
    }
  }

  // The mock quiz remains for now, but would ideally come from the backend too
  const mockQuiz = {
    title: "Core Concepts Quiz",
    questions: [
      {
        id: 1,
        question: "Which of the following best describes the main principle of this course?",
        options: [
          "Writing efficient algorithms",
          "Understanding system architecture",
          "Building user interfaces", 
          "Managing databases"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "What is the recommended approach for implementing the techniques covered?",
        options: [
          "Bottom-up implementation",
          "Top-down design",
          "Iterative development",
          "Waterfall methodology"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "Which tool is most appropriate for the tasks covered in this unit?",
        options: [
          "Visual Studio Code",
          "Jupyter Notebook",
          "Docker",
          "Postman"
        ],
        correctAnswer: 0
      }
    ]
  }

  const handleMarkAsKnown = (unitId) => {
    const unit = units.find(u => u.id === unitId)
    setActiveUnit(unit)
    setQuizInProgress(true)
    setViewMode('quiz')
  }

  // Handler for quiz submission
  const handleSubmitQuiz = async (answers) => {
    // Calculate score
    const correctAnswers = mockQuiz.questions.filter((q, index) => 
      answers[index] === q.correctAnswer
    ).length
    
    const score = Math.round((correctAnswers / mockQuiz.questions.length) * 100)
    
    setQuizResults({
      score,
      passed: score >= 70,
      correctAnswers,
      totalQuestions: mockQuiz.questions.length
    })
    
    setQuizInProgress(false)
    
    if (score >= 70 && activeUnit) {
      try {
        // Mark the unit as completed in the backend
        await courseService.markUnitCompleted(activeUnit.id)
        
        // Refresh course progress data
        const progressData = await courseService.getCourseProgress(courseId)
        setCourseProgress(progressData)
        
        // Save quiz results for learning buddy to analyze
        await buddyService.saveQuizResult(courseId, {
          quiz_topic: activeUnit.title,
          score,
          max_score: 100
        });
      } catch (error) {
        console.error('Error updating unit completion:', error)
      }
    }
  }

  const handleStartUnit = (unitId) => {
    const unit = units.find(u => u.id === unitId)
    setActiveUnit(unit)
    
    if (unit.topics && unit.topics.length > 0) {
      setActiveTopic(unit.topics[0])
    } else {
      setActiveTopic(null)
    }
    
    setViewMode('lecture')
  }

  const handleSelectTopic = (topicId) => {
    const topic = activeUnit?.topics.find(t => t.id === topicId)
    setActiveTopic(topic)
    setViewMode('lecture')
  }

  const handleMarkTopicCompleted = async (topicId) => {
    try {
      // Mark the topic as completed in the backend
      await courseService.markTopicCompleted(topicId)
      
      // Refresh course progress data
      const progressData = await courseService.getCourseProgress(courseId)
      setCourseProgress(progressData)
    } catch (error) {
      console.error('Error marking topic completed:', error)
    }
  }

  if (loading) {
    return <div className="course-view-loading">Loading course content...</div>
  }

  // Helper function to get unit progress data
  const getUnitProgressData = (unitId) => {
    if (!courseProgress || !courseProgress.units) {
      return { progress: 0, is_completed: false, topics: [] }
    }
    
    const unitData = courseProgress.units.find(u => u.id === unitId)
    return unitData || { progress: 0, is_completed: false, topics: [] }
  }

  // Helper function to check if a topic is completed
  const isTopicCompleted = (topicId) => {
    if (!courseProgress || !courseProgress.units) return false
    
    for (const unit of courseProgress.units) {
      const topic = unit.topics.find(t => t.id === topicId)
      if (topic && topic.is_completed) return true
    }
    
    return false
  }

  const renderUnitsList = () => (
    <div className="course-units-list">
      <h2>Course Units</h2>
      {units.map(unit => {
        const unitProgress = getUnitProgressData(unit.id)
        
        return (
          <div key={unit.id} className={`course-unit-card ${unitProgress.is_completed ? 'completed' : ''}`}>
            <div className="unit-header">
              <h3>{unit.title}</h3>
              <div className="unit-progress">
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${unitProgress.progress}%` }}></div>
                </div>
                <span>{unitProgress.progress}% complete</span>
              </div>
            </div>
            
            <div className="unit-actions">
              <button 
                className="start-unit-btn"
                onClick={() => handleStartUnit(unit.id)}
              >
                {unitProgress.progress > 0 ? 'Continue Unit' : 'Start Unit'}
              </button>
              
              {!unitProgress.is_completed && (
                <button 
                  className="know-this-btn"
                  onClick={() => handleMarkAsKnown(unit.id)}
                >
                  I already know this
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderUnitContent = () => {
    if (!activeUnit) return null;
    
    const unitProgress = getUnitProgressData(activeUnit.id)
    
    switch (viewMode) {
      case 'lecture':
        return (
          <div className="unit-content">
            <div className="unit-sidebar">
              <h3>Unit: {activeUnit.title}</h3>
              <div className="topics-list">
                {activeUnit.topics && activeUnit.topics.map(topic => {
                  const isCompleted = isTopicCompleted(topic.id)
                  
                  return (
                    <button 
                      key={topic.id}
                      className={`topic-item ${isCompleted ? 'completed' : ''} ${activeTopic?.id === topic.id ? 'active' : ''}`}
                      onClick={() => handleSelectTopic(topic.id)}
                    >
                      {topic.title}
                      {isCompleted && <CheckCircle size={16} />}
                    </button>
                  )
                })}
              </div>
              
              <div className="unit-navigation">
                <button 
                  className="quiz-button"
                  onClick={() => setViewMode('quiz')}
                >
                  Take Unit Quiz
                </button>
                <button 
                  className="buddy-button"
                  onClick={() => setAiChatOpen(true)}
                >
                  <MessageCircle size={16} />
                  Learning Buddy
                </button>
                <button
                  className="back-button"
                  onClick={() => {
                    setActiveUnit(null)
                    setActiveTopic(null)
                    setViewMode('overview')
                  }}
                >
                  Back to Overview
                </button>
              </div>
            </div>
            
            <div className="topic-content">
              {activeTopic ? (
                <>
                  <h2>{activeTopic.title}</h2>
                  
                  <div className="content-tabs">
                    <button className="tab active">Lecture</button>
                    <button className="tab">Reading Material</button>
                    <button className="tab">Summary</button>
                    <button className="tab">Project</button>
                  </div>
                  
                  <div className="lecture-content">
                    <div dangerouslySetInnerHTML={{ __html: activeTopic.content }} />
                    
                    <h3>Key Points</h3>
                    <ul>
                      <li>Understanding the core principles behind {activeTopic.title}</li>
                      <li>Practical applications and use cases</li>
                      <li>Best practices and common pitfalls to avoid</li>
                      <li>Advanced techniques for experienced users</li>
                    </ul>
                    
                    <div className="video-placeholder">
                      <div className="play-button">▶</div>
                      <p>Video Lecture: {activeTopic.title}</p>
                    </div>
                    
                    <h3>Interactive Example</h3>
                    <div className="code-example">
                      <pre><code>{`function example() {
  // This is a sample code snippet
  const data = processInput();
  
  if (data.isValid) {
    return applyTechnique(data);
  }
  
  return handleError();
}`}</code></pre>
                    </div>
                    
                    {!isTopicCompleted(activeTopic.id) && (
                      <button 
                        className="mark-completed-btn"
                        onClick={() => handleMarkTopicCompleted(activeTopic.id)}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-topic-selected">
                  <p>Select a topic from the left sidebar to begin learning</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'quiz':
        return (
          <div className="quiz-container">
            <h2>{activeUnit.title} - Assessment</h2>
            
            {quizInProgress ? (
              <QuizComponent 
                quiz={mockQuiz} 
                onSubmit={handleSubmitQuiz} 
              />
            ) : quizResults ? (
              <div className="quiz-results">
                <h3>Quiz Results</h3>
                
                <div className={`results-card ${quizResults.passed ? 'passed' : 'failed'}`}>
                  <div className="score">
                    {quizResults.passed ? (
                      <CheckCircle size={48} />
                    ) : (
                      <AlertCircle size={48} />
                    )}
                    <h2>{quizResults.score}%</h2>
                  </div>
                  
                  <p>
                    {quizResults.passed 
                      ? `Congratulations! You've passed this unit's assessment.` 
                      : `You'll need to score at least 70% to pass this unit.`
                    }
                  </p>
                  
                  <p>You answered {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correctly.</p>
                  
                  <div className="results-actions">
                    {quizResults.passed ? (
                      <button 
                        className="continue-btn"
                        onClick={() => {
                          setActiveUnit(null)
                          setViewMode('overview')
                          setQuizResults(null)
                        }}
                      >
                        Return to Course
                      </button>
                    ) : (
                      <>
                        <button 
                          className="retry-btn"
                          onClick={() => {
                            setQuizResults(null)
                            setQuizInProgress(true)
                          }}
                        >
                          Retry Quiz
                        </button>
                        <button
                          className="study-more-btn"
                          onClick={() => {
                            setViewMode('lecture')
                            setActiveTopic(activeUnit.topics[0])
                            setQuizResults(null)
                          }}
                        >
                          Study Topics
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="quiz-intro">
                <h3>Ready to test your knowledge?</h3>
                <p>This quiz will assess your understanding of {activeUnit.title}.</p>
                <ul>
                  <li>The quiz contains {mockQuiz.questions.length} questions</li>
                  <li>You need to score at least 70% to pass</li>
                  <li>You can retake the quiz if needed</li>
                </ul>
                
                <div className="quiz-actions">
                  <button 
                    className="start-quiz-btn"
                    onClick={() => setQuizInProgress(true)}
                  >
                    Start Quiz
                  </button>
                  <button
                    className="back-button"
                    onClick={() => setViewMode('overview')}
                  >
                    Back to Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  const renderOverview = () => (
    <div className="course-overview">
      <div className="course-header" 
        style={{backgroundColor: course?.image_color || '#7e57c2'}}>
        <button className="back-button" onClick={onBackClick}>
          <ArrowLeft size={20} />
          Back to Courses
        </button>
        <h1>{course?.title || 'Course Title'}</h1>
        <div className="course-meta">
          <span className="difficulty">{course?.difficulty || 'Intermediate'}</span>
          <span className="rating">{course?.rating || '4.8'} ★</span>
          <span className="duration"><Clock size={16} /> {course?.duration || '12h 30m'}</span>
        </div>
      </div>
      
      <div className="course-content-wrapper">
        <div className="course-main-content">
          <div className="course-description">
            <h2>About This Course</h2>
            <p>{course?.description || 'Course description loading...'}</p>
            
            <div className="course-stats">
              <div className="stat-item">
                <Award size={24} />
                <div className="stat-text">
                  <h4>Certification</h4>
                  <p>Available upon completion</p>
                </div>
              </div>
              <div className="stat-item">
                <BookOpen size={24} />
                <div className="stat-text">
                  <h4>Units</h4>
                  <p>{units.length} course units</p>
                </div>
              </div>
              <div className="stat-item">
                <FileText size={24} />
                <div className="stat-text">
                  <h4>Projects</h4>
                  <p>3 hands-on projects</p>
                </div>
              </div>
              <div className="stat-item">
                <Code size={24} />
                <div className="stat-text">
                  <h4>Prerequisites</h4>
                  <p>Basic programming knowledge</p>
                </div>
              </div>
            </div>
          </div>
          
          {renderUnitsList()}
        </div>
        
        <div className="course-sidebar">
          <div className="progress-card">
            <h3>Your Progress</h3>
            <div className="progress-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e0e0e0" strokeWidth="12" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#7e57c2" 
                  strokeWidth="12" 
                  strokeDasharray="339.3"
                  strokeDashoffset={339.3 * (1 - (courseProgress?.overall_progress || 0) / 100)}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="progress-text">{courseProgress?.overall_progress || 0}%</div>
            </div>
            <p>{courseProgress?.completed_units || 0} of {units.length} units completed</p>
          </div>
          
          <div className="learning-paths-card">
            <h3>Learning Paths</h3>
            <p>This course is part of these learning paths:</p>
            <ul>
              <li>Full-Stack Web Development</li>
              <li>Mobile App Developer</li>
            </ul>
          </div>
          
          <button 
            className="ai-chat-button"
            onClick={() => setAiChatOpen(true)}
          >
            <MessageCircle size={18} />
            Chat with Learning Buddy
          </button>
        </div>
      </div>

      {/* Replace the old AI chat modal with our new Learning Buddy component */}
      <LearningBuddy
        courseId={courseId}
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />
    </div>
  )

  return (
    <div className="course-view-container">
      {viewMode === 'overview' ? renderOverview() : renderUnitContent()}
    </div>
  )
}

// Quiz Component
function QuizComponent({ quiz, onSubmit }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(null))
  
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = optionIndex
    setAnswers(newAnswers)
  }
  
  const handleSubmit = () => {
    if (answers.some(answer => answer === null)) {
      alert("Please answer all questions before submitting.")
      return
    }
    
    onSubmit(answers)
  }
  
  return (
    <div className="quiz">
      <h3>{quiz.title}</h3>
      
      {quiz.questions.map((question, qIndex) => (
        <div key={question.id} className="question-card">
          <h4>Question {qIndex + 1}: {question.question}</h4>
          
          <div className="options">
            {question.options.map((option, oIndex) => (
              <label key={oIndex} className="option-label">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => handleSelectAnswer(qIndex, oIndex)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      <div className="quiz-actions">
        <button className="submit-quiz-btn" onClick={handleSubmit}>
          Submit Quiz
        </button>
      </div>
    </div>
  )
}

export default CourseView;