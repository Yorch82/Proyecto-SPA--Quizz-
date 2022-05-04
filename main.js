const welcomeContainer = document.getElementById("welcomeContainer");
const questionContainer = document.getElementById("questionContainer");
const resultContainer = document.getElementById("resultContainer");
const startButton = document.getElementById("start-btn");
const questionPrint = document.getElementById("questionPrint");
const answerButtonPrint = document.getElementById("answertButtonPrint");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");

let currentQuestionIndex;


const questions = [
    {
      question: "What is 2 + 2?",
      answers: [
        { text: "4", correct: true },
        { text: "22", correct: false },
      ],
    },
    {
      question: "Is web development fun?",
      answers: [
        { text: "Kinda", correct: false },
        { text: "YES!!!", correct: true },
        { text: "Um no", correct: false },
        { text: "IDK", correct: false },
      ],
    },
    {
      question: "What is 4 * 2?",
      answers: [
        { text: "6", correct: false },
        { text: "8", correct: true },
        { text: "Yes", correct: false },
      ],
    },
  ];
  

  function setStatusClass(element, correct){
    if (correct){
      element.classList.add('correct');
    } else {
      element.classList.add('wrong');
    }
  }



  function selectAnswer(){
    Array.from(questionPrint.children).forEach(button => {
     setStatusClass(button, button.dataset.correct) 
    });
    if (questions.length > currentQuestionIndex + 1) {
      nextButton.classList.remove('hide');
    } else{
      restartButton.classList.remove('hide');
    }
  }

  function showQuestion(question){
    questionPrint.innerText = question.question;
    question.answers.forEach(answer => {
      const button = document.createElement('button');
      button.innerText = answer.text;
      button.classList.add('btn');
      if(answer.correct){
        button.dataset.correct = true;
      }
      button.addEventListener('click',selectAnswer)
      questionPrint.appendChild(button)      
    });
  }


  function resetState() {
    nextButton.classList.add('hide');
    while (questionPrint.firstChild){
      questionPrint.removeChild(questionPrint.firstChild)
     }
  }


  function setNextQuestion(){
    resetState()
    showQuestion(questions[currentQuestionIndex])
  }


  function startGame(){
    welcomeContainer.classList.add('hide')
    currentQuestionIndex = 0
    questionContainer.classList.remove('hide')
    setNextQuestion()
    }
    
    startButton.addEventListener('click',startGame)

    nextButton.addEventListener('click',() =>{
    currentQuestionIndex++;
    setNextQuestion()
  })
  
    restartButton.addEventListener('click', startGame)  
  
  
  
  