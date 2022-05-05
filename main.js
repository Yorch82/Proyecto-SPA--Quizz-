const welcomeContainer = document.getElementById("welcomeContainer");
const questionContainer = document.getElementById("questionContainer");
const resultContainer = document.getElementById("resultContainer");
const startButton = document.getElementById("start-btn");
const questionPrint = document.getElementById("questionPrint");
const answerButtonPrint = document.getElementById("answerButtonPrint");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
let currentQuestionIndex;


  axios.get("https://opentdb.com/api.php?amount=10&type=multiple")    
  .then((res) => {
    let arrayQuestions = res.data.results
    console.log(arrayQuestions)
    startGame(arrayQuestions)
  })      
  .catch((err) => console.error(err));


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
      answerButtonPrint.appendChild(button)      
    });
  }


  function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonPrint.firstChild){
      answerButtonPrint.removeChild(answerButtonPrint.firstChild)
     }
  }


  function setNextQuestion(arrayQuestions){
    resetState()
    showQuestion(arrayQuestions[currentQuestionIndex])
  }


  function startGame(arrayQuestions){
    welcomeContainer.classList.add('hide')
    currentQuestionIndex = 0
    questionContainer.classList.remove('hide')
    setNextQuestion(arrayQuestions)
    }
    
  startButton.addEventListener('click',startGame)
    nextButton.addEventListener('click',() =>{
    currentQuestionIndex++;
    setNextQuestion()
  })  
  restartButton.addEventListener('click', startGame)  
  
  

  
  
  
    
