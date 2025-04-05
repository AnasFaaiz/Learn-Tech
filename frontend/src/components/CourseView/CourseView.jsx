import { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, CheckCircle, AlertCircle, Clock, Award, BookOpen, FileText, Code, X } from 'lucide-react'
import { courseService } from '../../services/api'
import './CourseView.css'

function CourseView({ courseId, onBackClick }) {
  const [course, setCourse] = useState(null)
  const [activeUnit, setActiveUnit] = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // overview, lecture, quiz, project
  const [quizInProgress, setQuizInProgress] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [aiLearningPathOpen, setAiLearningPathOpen] = useState(false);
  const [learningPathData, setLearningPathData] = useState(null);
  const [learningPathLoading, setLearningPathLoading] = useState(false);

  const generateAiLearningPath = async () => {
    setLearningPathLoading(true);
    
    try {
      // In a real implementation, this would be an actual API call to Gemini
      // Simulating API call with timeout
      setTimeout(() => {
        // Mock Gemini API response
        const mockLearningPathData = {
          currentProgress: 33,
          estimatedCompletionTime: "4 weeks",
          recommendedPace: "2 hours daily, focus on practical exercises",
          learningStyle: "Visual & hands-on",
          strengths: [
            "Environment setup concepts",
            "Understanding basic principles",
            "Tool familiarity"
          ],
          areasForImprovement: [
            "Advanced techniques application",
            "Performance optimization patterns",
            "Security implementation"
          ],
          recommendedPath: [
            {
              unitId: 2,
              title: "Core Concepts",
              topics: [
                { id: 5, title: "Advanced Techniques", priority: "High", reason: "Foundational for later units" },
                { id: 10, title: "Performance Optimization", priority: "Medium", reason: "Builds on your existing progress" }
              ],
              estimatedTime: "1 week"
            },
            {
              unitId: 3,
              title: "Building Your First Project",
              topics: [
                { id: 13, title: "Project Planning & Requirements", priority: "High", reason: "Essential skill for real-world applications" },
                { id: 15, title: "Implementing Core Features", priority: "High", reason: "Applies concepts from Unit 2" }
              ],
              estimatedTime: "3 weeks"
            }
          ],
          nextCourses: [
            { id: "adv-102", title: "Advanced Implementation Techniques", match: 92 },
            { id: "sec-201", title: "Security Fundamentals", match: 87 }
          ],
          personalizedTips: [
            "Focus on hands-on exercises over theoretical content",
            "Schedule 30-minute daily practice sessions",
            "Review completed topics weekly for better retention",
            "Join community discussion forum for collaboration"
          ]
        };
        
        setLearningPathData(mockLearningPathData);
        setLearningPathLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error generating learning path:", error);
      setLearningPathLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setLoading(true)
        const courseData = await courseService.getCourseById(courseId)
        setCourse(courseData)
      } catch (error) {
        console.error('Error fetching course details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [courseId])

  const mockQuizQuestions = {
    easy: [
      {
        id: 1,
        question: "What is the first step in setting up your development environment?",
        options: [
          "Install required software",
          "Write code",
          "Deploy application",
          "Create documentation"
        ],
        correctAnswer: 0,
        unitId: 1
      },
      {
        id: 2,
        question: "Which tool is used for version control in this course?",
        options: ["Git", "SVN", "Mercurial", "FTP"],
        correctAnswer: 0,
        unitId: 1
      },
      {
        id: 3,
        question: "How can you get help during the course?",
        options: [
          "Community forums",
          "Course documentation",
          "AI Assistant",
          "All of the above"
        ],
        correctAnswer: 3,
        unitId: 1
      },
      {
        id: 4,
        question: "What is the recommended IDE for this course?",
        options: [
          "Visual Studio Code",
          "Sublime Text",
          "Notepad++",
          "Atom"
        ],
        correctAnswer: 0,
        unitId: 1
      },
      {
        id: 5,
        question: "Which of these is a fundamental principle covered in Unit 2?",
        options: [
          "Data Flow",
          "Complex Algorithms",
          "Machine Learning",
          "Quantum Computing"
        ],
        correctAnswer: 0,
        unitId: 2
      },
      {
        id: 6,
        question: "What is the primary purpose of error handling?",
        options: [
          "Prevent application crashes",
          "Speed up code",
          "Reduce memory usage",
          "Improve UI design"
        ],
        correctAnswer: 0,
        unitId: 2
      },
      {
        id: 7,
        question: "Which stage comes first in project development?",
        options: [
          "Planning",
          "Testing",
          "Deployment",
          "Marketing"
        ],
        correctAnswer: 0,
        unitId: 3
      },
      {
        id: 8,
        question: "What is a basic requirement for database integration?",
        options: [
          "Connection string",
          "Graphics card",
          "Sound system",
          "Printer"
        ],
        correctAnswer: 0,
        unitId: 3
      },
      {
        id: 9,
        question: "Which is the most basic form of testing?",
        options: [
          "Unit Testing",
          "Load Testing",
          "Stress Testing",
          "Integration Testing"
        ],
        correctAnswer: 0,
        unitId: 3
      },
      {
        id: 10,
        question: "What is the purpose of documentation?",
        options: [
          "Guide future developers",
          "Waste time",
          "Fill disk space",
          "Look professional"
        ],
        correctAnswer: 0,
        unitId: 5
      }
    ],
    medium: [
      {
        id: 11,
        question: "How does state management affect application performance?",
        options: [
          "Through efficient data updates",
          "By changing colors",
          "Through faster internet",
          "By adding more buttons"
        ],
        correctAnswer: 0,
        unitId: 2
      },
      {
        id: 12,
        question: "What is the role of middleware in the application?",
        options: [
          "Process requests between components",
          "Store data permanently",
          "Display user interface",
          "Send emails"
        ],
        correctAnswer: 0,
        unitId: 2
      },
      {
        id: 13,
        question: "How do you implement proper error boundaries?",
        options: [
          "Using try-catch blocks strategically",
          "Ignoring all errors",
          "Removing error messages",
          "Restarting the application"
        ],
        correctAnswer: 0,
        unitId: 2
      },
      {
        id: 14,
        question: "Which authentication method is most secure for web applications?",
        options: [
          "JWT with refresh tokens",
          "Plain text passwords",
          "No authentication",
          "Single token"
        ],
        correctAnswer: 0,
        unitId: 3
      },
      {
        id: 15,
        question: "What is the purpose of a CI/CD pipeline?",
        options: [
          "Automate deployment process",
          "Create user interfaces",
          "Write documentation",
          "Design databases"
        ],
        correctAnswer: 0,
        unitId: 3
      },
      {
        id: 16,
        question: "How does caching improve performance?",
        options: [
          "By storing frequently accessed data",
          "By using more memory",
          "By running more processes",
          "By adding more servers"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 17,
        question: "What is the benefit of microservices architecture?",
        options: [
          "Better scalability and maintenance",
          "Simpler deployment",
          "Lower cost",
          "Faster development"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 18,
        question: "How do containers help in deployment?",
        options: [
          "Ensure consistent environments",
          "Make applications faster",
          "Reduce code size",
          "Improve UI design"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 19,
        question: "What is the purpose of load balancing?",
        options: [
          "Distribute traffic evenly",
          "Speed up coding",
          "Reduce costs",
          "Improve security"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 20,
        question: "How do you implement proper logging?",
        options: [
          "Using structured logging levels",
          "Print everything to console",
          "Ignore all errors",
          "Log only errors"
        ],
        correctAnswer: 0,
        unitId: 5
      }
    ],
    hard: [
      {
        id: 21,
        question: "How would you optimize database queries in a high-traffic application?",
        options: [
          "Implement indexing and query optimization",
          "Use bigger servers",
          "Remove all queries",
          "Disable database"
        ],
        correctAnswer: 0,
        unitId: 3
      },
      {
        id: 22,
        question: "What is the best approach to handle race conditions in distributed systems?",
        options: [
          "Implement distributed locks and versioning",
          "Ignore concurrent requests",
          "Use single server",
          "Disable writes"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 23,
        question: "How would you implement real-time updates in a scalable way?",
        options: [
          "Use WebSockets with proper connection management",
          "Continuous polling",
          "Page refresh",
          "Manual updates"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 24,
        question: "What is the most efficient way to handle file uploads in a distributed system?",
        options: [
          "Streaming with chunked upload and distributed storage",
          "Single server upload",
          "Email attachments",
          "Local storage"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 25,
        question: "How would you implement a fault-tolerant microservice architecture?",
        options: [
          "Circuit breakers and fallback mechanisms",
          "Multiple copies",
          "Single instance",
          "Manual restart"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 26,
        question: "What is the best approach for handling eventual consistency in distributed databases?",
        options: [
          "CQRS with event sourcing",
          "Single database",
          "Avoid updates",
          "Manual sync"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 27,
        question: "How would you implement zero-downtime deployment?",
        options: [
          "Blue-green deployment with proper health checks",
          "Quick restart",
          "Maintenance window",
          "Multiple servers"
        ],
        correctAnswer: 0,
        unitId: 5
      },
      {
        id: 28,
        question: "What is the most comprehensive approach to application monitoring?",
        options: [
          "Distributed tracing with metrics and logging",
          "Console logs",
          "Error emails",
          "User feedback"
        ],
        correctAnswer: 0,
        unitId: 5
      },
      {
        id: 29,
        question: "How would you implement a scalable search functionality?",
        options: [
          "Elasticsearch with proper indexing and sharding",
          "Database queries",
          "Array filter",
          "Linear search"
        ],
        correctAnswer: 0,
        unitId: 4
      },
      {
        id: 30,
        question: "What is the best strategy for database backup in a high-availability system?",
        options: [
          "Incremental backups with point-in-time recovery",
          "Daily backup",
          "Weekly backup",
          "Manual backup"
        ],
        correctAnswer: 0,
        unitId: 5
      }
    ]
  };

  const mockUnits = [
    {
      id: 1,
      title: "Introduction to the Course",
      progress: 100,
      completed: true,
      topics: [
        { id: 1, title: "Course Overview", completed: true },
        { id: 2, title: "Setting Up Your Environment", completed: true },
        { id: 3, title: "Understanding the Course Structure", completed: true },
        { id: 4, title: "Prerequisites & Learning Goals", completed: true },
        { id: 5, title: "Getting Help & Community Resources", completed: true }
      ]
    },
    {
      id: 2,
      title: "Core Concepts",
      progress: 75,
      completed: false,
      topics: [
        { id: 3, title: "Fundamental Principles", completed: true },
        { id: 4, title: "Practical Applications", completed: true },
        { id: 5, title: "Advanced Techniques", completed: false },
        { id: 10, title: "Performance Optimization", completed: false },
        { id: 11, title: "Security Best Practices", completed: false },
        { id: 12, title: "Error Handling & Debugging", completed: false }
      ]
    },
    {
      id: 3,
      title: "Building Your First Project",
      progress: 0,
      completed: false,
      topics: [
        { id: 13, title: "Project Planning & Requirements", completed: false },
        { id: 14, title: "Setting Up Project Structure", completed: false },
        { id: 15, title: "Implementing Core Features", completed: false },
        { id: 16, title: "Adding Authentication & Authorization", completed: false },
        { id: 17, title: "Database Integration", completed: false },
        { id: 18, title: "Testing & Quality Assurance", completed: false },
        { id: 19, title: "Deployment & CI/CD Pipeline", completed: false },
        { id: 20, title: "Monitoring & Maintenance", completed: false }
      ]
    },
  ]


  // Handler for marking a unit as "I know this"
  // Update the handleMarkAsKnown function to use appropriate difficulty questions
const handleMarkAsKnown = (unitId) => {
  setActiveUnit(mockUnits.find(unit => unit.id === unitId));
  
  // Get questions for this unit
  const unitQuestions = [
    ...mockQuizQuestions.easy.filter(q => q.unitId === unitId),
    ...mockQuizQuestions.medium.filter(q => q.unitId === unitId),
    ...mockQuizQuestions.hard.filter(q => q.unitId === unitId)
  ];
  
  // Take 5 random questions
  const selectedQuestions = unitQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
  
  setQuizInProgress(true);
  setViewMode('quiz');
  setCurrentQuiz({
    title: `${mockUnits.find(u => u.id === unitId)?.title} Assessment`,
    questions: selectedQuestions
  });
}

  // Handler for quiz submission
  const handleSubmitQuiz = (answers) => {
    // Calculate score using currentQuiz questions
    const correctAnswers = currentQuiz.questions.filter((q, index) => 
      answers[index] === q.correctAnswer
    ).length
    
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100)
    
    setQuizResults({
      score,
      passed: score >= 70,
      correctAnswers,
      totalQuestions: currentQuiz.questions.length
    })
    
    setQuizInProgress(false)
    
    // Update unit completion if passed
    if (score >= 70 && activeUnit) {
      const updatedUnits = mockUnits.map(unit => 
        unit.id === activeUnit.id 
          ? { ...unit, completed: true, progress: 100 } 
          : unit
      )
    }
  }
  
  {quizInProgress && currentQuiz && (
    <QuizComponent 
      quiz={currentQuiz} 
      onSubmit={handleSubmitQuiz} 
    />
  )}

  const handleStartUnit = (unitId) => {
    setActiveUnit(mockUnits.find(unit => unit.id === unitId))
    setActiveTopic(mockUnits.find(unit => unit.id === unitId)?.topics[0] || null)
    setViewMode('lecture')
  }

  const handleSelectTopic = (topicId) => {
    const topic = activeUnit?.topics.find(t => t.id === topicId)
    setActiveTopic(topic)
    setViewMode('lecture')
  }

  if (loading) {
    return <div className="course-view-loading">Loading course content...</div>
  }

  const renderUnitsList = () => (
    <div className="course-units-list">
      <h2>Course Units</h2>
      {mockUnits.map(unit => (
        <div key={unit.id} className={`course-unit-card ${unit.completed ? 'completed' : ''}`}>
          <div className="unit-header">
            <h3>{unit.title}</h3>
            <div className="unit-progress">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${unit.progress}%` }}></div>
              </div>
              <span>{unit.progress}% complete</span>
            </div>
          </div>
          
          <div className="unit-actions">
            <button 
              className="start-unit-btn"
              onClick={() => handleStartUnit(unit.id)}
            >
              {unit.progress > 0 ? 'Continue Unit' : 'Start Unit'}
            </button>
            
            {!unit.completed && (
              <button 
                className="know-this-btn"
                onClick={() => handleMarkAsKnown(unit.id)}
              >
                I already know this
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderUnitContent = () => {
    if (!activeUnit) return null;
    
    switch (viewMode) {
      case 'lecture':
        return (
          <div className="unit-content">
            <div className="unit-sidebar">
              <h3>Unit: {activeUnit.title}</h3>
              <div className="topics-list">
                {activeUnit.topics.map(topic => (
                  <button 
                    key={topic.id}
                    className={`topic-item ${topic.completed ? 'completed' : ''} ${activeTopic?.id === topic.id ? 'active' : ''}`}
                    onClick={() => handleSelectTopic(topic.id)}
                  >
                    {topic.title}
                    {topic.completed && <CheckCircle size={16} />}
                  </button>
                ))}
              </div>
              
              <div className="unit-navigation">
                <button 
                  className="quiz-button"
                  onClick={() => setViewMode('quiz')}
                >
                  Take Unit Quiz
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
                    {/* Mock lecture content */}
                    <p>This is the lecture content for {activeTopic.title}. In a real application, this would include videos, interactive elements, and more detailed explanations.</p>
                    
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
        currentQuiz && (
          <QuizComponent 
            quiz={currentQuiz}
            onSubmit={handleSubmitQuiz}
          />
        )
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
                  <li>The quiz contains 5 questions</li> {/* Updated to reflect actual quiz length */}
                  <li>You need to score at least 70% to pass</li>
                  <li>You can retake the quiz if needed</li>
                </ul>
                
                <div className="quiz-actions">
                <button 
                    className="start-quiz-btn"
                    onClick={() => {
                      // Initialize quiz when starting
                      const unitQuestions = [
                        ...mockQuizQuestions.easy.filter(q => q.unitId === activeUnit.id),
                        ...mockQuizQuestions.medium.filter(q => q.unitId === activeUnit.id),
                        ...mockQuizQuestions.hard.filter(q => q.unitId === activeUnit.id)
                      ];
                      
                      const selectedQuestions = unitQuestions
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 5);
                      
                      setCurrentQuiz({
                        title: `${activeUnit.title} Assessment`,
                        questions: selectedQuestions
                      });
                      setQuizInProgress(true);
                    }}
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
            <div className="description-header">
              <h2>About This Course</h2>
              <button 
                className="syllabus-button" 
                onClick={() => setShowSyllabus(true)}
                title="View Course Syllabus"
              >
                <BookOpen size={20} />
              </button>
            </div>
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
                  <p>{mockUnits.length} course units</p>
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
          {showSyllabus && (
            <div className="syllabus-overlay">
              <div className="syllabus-content">
                <div className="syllabus-header">
                  <h2>Course Syllabus</h2>
                  <button 
                    className="close-button"
                    onClick={() => setShowSyllabus(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="syllabus-body">
                  {mockUnits.map((unit) => (
                    <div key={unit.id} className="syllabus-unit">
                      <div className="unit-header">
                        <h3>Unit {unit.id}: {unit.title}</h3>
                        {unit.completed && <CheckCircle size={16} />}
                      </div>
                      
                      <ul className="topics-list">
                        {unit.topics.map((topic) => (
                          <li 
                            key={topic.id} 
                            className={topic.completed ? 'completed' : ''}
                            onClick={() => {
                              setShowSyllabus(false);
                              handleSelectTopic(topic.id);
                            }}
                          >
                            {topic.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}       
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
                  strokeDashoffset={339.3 * (1 - 0.33)} // 33% complete (mockup)
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="progress-text">33%</div>
            </div>
            <p>1 of 3 units completed</p>
          </div>
          
          
          
          <div className="learning-paths-card">
            <div className="Learning-paths-header">
              <h3>Learning Path</h3>   
              <button 
                className="ai-learning-path"
                onClick={() => {
                  setAiLearningPathOpen(true);
                  generateAiLearningPath();
                }}
              >
                AI
              </button>
            </div>
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
            Discuss with AI Assistant
          </button>
        </div>
      </div>

      {/* AI Learning Path Overlay */}
{aiLearningPathOpen && (
  <div className="ai-learning-path-overlay">
    <div className="ai-learning-path-container">
      <div className="ai-learning-path-header">
        <h2>
          <span className="ai-badge">AI</span>
          Your Personalized Learning Path
        </h2>
        <button 
          className="close-button"
          onClick={() => setAiLearningPathOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="ai-learning-path-content">
        {learningPathLoading ? (
          <div className="ai-loading">
            <div className="ai-loading-spinner"></div>
            <p>Gemini AI is analyzing your learning patterns and generating a personalized path...</p>
          </div>
        ) : learningPathData ? (
          <>
            <div className="learning-path-summary">
              <div className="summary-card">
                <h4>Current Progress</h4>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${learningPathData.currentProgress}%` }}
                    ></div>
                  </div>
                  <span>{learningPathData.currentProgress}%</span>
                </div>
              </div>
              <div className="summary-card">
                <h4>Est. Completion</h4>
                <p>{learningPathData.estimatedCompletionTime}</p>
              </div>
              <div className="summary-card">
                <h4>Recommended Pace</h4>
                <p>{learningPathData.recommendedPace}</p>
              </div>
              <div className="summary-card">
                <h4>Learning Style</h4>
                <p>{learningPathData.learningStyle}</p>
              </div>
            </div>
            
            <div className="learning-path-sections">
              <div className="learning-path-section">
                <h3>Recommended Learning Path</h3>
                <div className="recommended-units">
                  {learningPathData.recommendedPath.map((unit, index) => (
                    <div key={unit.unitId} className="recommended-unit">
                      <div className="unit-header">
                        <h4>
                          <span className="unit-number">{index + 1}</span>
                          {unit.title}
                        </h4>
                        <span className="estimated-time">{unit.estimatedTime}</span>
                      </div>
                      
                      <div className="recommended-topics">
                        {unit.topics.map(topic => (
                          <div key={topic.id} className="recommended-topic">
                            <div className="topic-info">
                              <h5>{topic.title}</h5>
                              <span className={`priority ${topic.priority.toLowerCase()}`}>
                                {topic.priority} Priority
                              </span>
                            </div>
                            <p className="topic-reason">{topic.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="learning-path-section two-columns">
                <div className="column">
                  <h3>Your Strengths</h3>
                  <ul className="strengths-list">
                    {learningPathData.strengths.map((strength, index) => (
                      <li key={index}>
                        <CheckCircle size={16} />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="column">
                  <h3>Areas for Improvement</h3>
                  <ul className="improvement-list">
                    {learningPathData.areasForImprovement.map((area, index) => (
                      <li key={index}>
                        <AlertCircle size={16} />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="learning-path-section">
                <h3>Recommended Next Courses</h3>
                <div className="next-courses">
                  {learningPathData.nextCourses.map(course => (
                    <div key={course.id} className="next-course-card">
                      <h4>{course.title}</h4>
                      <div className="match-indicator">
                        <div className="match-bar">
                          <div 
                            className="match-fill" 
                            style={{ width: `${course.match}%` }}
                          ></div>
                        </div>
                        <span>{course.match}% match</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="learning-path-section">
                <h3>Personalized Learning Tips</h3>
                <ul className="personalized-tips">
                  {learningPathData.personalizedTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="learning-path-actions">
              <button 
                className="apply-recommendations"
                onClick={() => {
                  // Apply the recommendations (in a real app)
                  alert("Recommendations applied to your learning dashboard!");
                  setAiLearningPathOpen(false);
                }}
              >
                Apply Recommendations
              </button>
              <button 
                className="export-path"
              >
                Export Learning Plan
              </button>
            </div>
          </>
        ) : (
          <div className="ai-error">
            <p>Unable to generate learning path. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      
      {aiChatOpen && (
        <div className="ai-chat-modal">
          <div className="ai-chat-container">
            <div className="chat-header">
              <h3>AI Learning Assistant</h3>
              <button onClick={() => setAiChatOpen(false)}>×</button>
            </div>
            <div className="chat-messages">
              <div className="message ai">
                <div className="message-content">
                  <p>Hello! I'm your AI learning assistant for this course. How can I help you today?</p>
                </div>
              </div>
              <div className="message user">
                <div className="message-content">
                  <p>Can you explain the concept from Unit 2 in more detail?</p>
                </div>
              </div>
              <div className="message ai">
                <div className="message-content">
                  <p>Of course! Unit 2 covers Core Concepts, which includes fundamental principles and practical applications.</p>
                  <p>The key idea is to understand how these principles work together to create robust solutions. Would you like me to elaborate on a specific topic within this unit?</p>
                </div>
              </div>
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Ask a question about this course..." />
              <button>Send</button>
            </div>
          </div>
        </div>
      )}
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