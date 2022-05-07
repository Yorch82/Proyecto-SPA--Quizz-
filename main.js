const welcomeContainer = document.getElementById("welcomeContainer");
const questionContainer = document.getElementById("questionContainer");
const resultContainer = document.getElementById("resultContainer");
const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
const questionPrint = document.getElementById("questionPrint")
const answerButtonPrint = document.getElementById("buttonContainer");
const showScore = document.getElementById ('showScore');
const globalQuestion = document.getElementById ('globalQuestion');
const scoreText = document.getElementById ('scoreText');

let correctAnswers = 0;

const totalQuestions = 4;

let currentQuestionIndex; 



  function setStatusClass(element, correct){
    if (correct){     
      element.classList.add('correct');      
    } else {     
      element.classList.add('wrong');
    }
  }



     function selectAnswer(){
      Array.from(answerButtonPrint.children).forEach((button) => {
        setStatusClass(button, button.dataset.correct);
      });
      
      if ( totalQuestions > currentQuestionIndex + 1) {
        
      nextButton.classList.remove('hide');
      } else{
      showScore.classList.remove('hide');
    }
   }
 

  function showQuestion(question){   
    questionPrint.innerHTML = `<h2>${question.question}</h2>`;
    showAnswers(question)  
  }

  function showAnswers(question){
    let correctAnswer = {
      text : question.correct_answer,
      correct : true
    };
    let answers =[]
    let incorrectAnswer = question.incorrect_answers;
    incorrectAnswer.forEach(incorrect => {
      answers.push({text : incorrect, correct : false})
    })
    answers.push(correctAnswer)
    answers.sort(function(a,b){
      if (a.text > b.text){       
        return 1
      }
      if (a.text < b.text){       
        return -1
      }
      return 0                   
    })  
    answers.forEach(answer => {
      const button = document.createElement("button")
      button.innerText = answer.text
      button.classList.add("button_answer")
      if (answer.correct){
        button.dataset.correct = true 
      }      
      button.addEventListener('click',() =>{
        if (answer.correct == true){
        correctAnswers++; 
        localStorage.setItem('counter', JSON.stringify(correctAnswers));
      }       
        selectAnswer();
      })
        
      answerButtonPrint.appendChild(button);
      
    })
  }
  

    function resetState() {
    nextButton.classList.add('hide');
    while (answerButtonPrint.firstChild){
      answerButtonPrint.removeChild(answerButtonPrint.firstChild)
     }
  }


  function setInitialQuestion(arrayQuestions){
    resetState()
    showQuestion(arrayQuestions[currentQuestionIndex])
  }

  function setNextQuestion(){
    let preguntas = JSON.parse(localStorage.getItem('preguntas'))
    resetState();
    showQuestion(preguntas[currentQuestionIndex]);
  }

  function startGame(){
    axios.get("https://opentdb.com/api.php?amount=10&type=multiple")    
  .then((res) => {
    currentQuestionIndex = 0
    let arrayQuestions = res.data.results
    welcomeContainer.classList.add('hide')
    globalQuestion.classList.remove('hide')
    localStorage.setItem('preguntas', JSON.stringify(arrayQuestions))
    setInitialQuestion(arrayQuestions)
  })      
  .catch((err) => console.error(err));
    
    }

    function showResults(){
      globalQuestion.classList.add('hide');
      resultContainer.classList.remove('hide');
      showScore.classList.remove('hide');
      let counter = JSON.parse(localStorage.getItem('counter'))
      scoreText.innerHTML = `<h2> ${counter} / 10 <br> Eres un paquete </h2>`;

    }
    
    startButton.addEventListener('click',startGame)
    nextButton.addEventListener('click',() =>{
    currentQuestionIndex++;
    setNextQuestion()  
  })  
  restartButton.addEventListener('click', startGame) 
  showScore.addEventListener('click', showResults) 
  
  
  
  
  
    
