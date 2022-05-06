const welcomeContainer = document.getElementById("welcomeContainer");
const questionContainer = document.getElementById("questionContainer");
const resultContainer = document.getElementById("resultContainer");
const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
const questionPrint = document.getElementById("questionPrint")
const answerButtonPrint1 = document.getElementById("text_button1");
const answerButtonPrint2 = document.getElementById("text_button2");
const answerButtonPrint3 = document.getElementById("text_button3");
const answerButtonPrint4 = document.getElementById("text_button4");



<<<<<<< HEAD
=======
let currentQuestionIndex; 


  
>>>>>>> 3929470d70716e441e8caadd3dbc540099a2085b


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
<<<<<<< HEAD
    questionPrint.innerHTML = `<div>${question.question}</div>`
    // question.answers.forEach(answer => {
    //   const button = document.createElement('button');
    //   button.innerText = answer.text;
=======
    questionPrint.innerHTML = `<h2>${question.question}</h2>`;
    showAnswers(question)
   
    
  
>>>>>>> 3929470d70716e441e8caadd3dbc540099a2085b
    //   button.classList.add('btn');
    //   if(answer.correct){
    //     button.dataset.correct = true;
    //   }
    //   button.addEventListener('click',selectAnswer)
    //   answerButtonPrint.appendChild(button)      
    // });
  }

  function showAnswers(question){
    let correctAnswer = arrayAnswers.correct_answer;
    let incorrectAnswer = arrayAnswers.incorrect_answers;
    incorrectAnswer.push(correctAnswer);
    allAnswers = incorrectAnswer.sort();
    answerButtonPrint1.innerHTML = `${arrayAnswers[0]}`;
    answerButtonPrint2.innerHTML = `${arrayAnswers[1]}`
    answerButtonPrint3.innerHTML = `${arrayAnswers[2]}`
    answerButtonPrint4.innerHTML = `${arrayAnswers[3]}`
    //   button.classList.add('btn');
    //   if(answer.correct){
    //     button.dataset.correct = true;
    //   }
    //   button.addEventListener('click',selectAnswer)
    //   answerButtonPrint.appendChild(button)      
    // });
  }

  function resetState() {
    nextButton.classList.add('hide');
    // while (answerButtonPrint.firstChild){
    //   answerButtonPrint.removeChild(answerButtonPrint.firstChild)
    //  }
  }


  function setNextQuestion(arrayQuestions){
    resetState()
    currentQuestionIndex = 0
    showQuestion(arrayQuestions[currentQuestionIndex])
  }


  function startGame(){
    axios.get("https://opentdb.com/api.php?amount=10&type=multiple")    
<<<<<<< HEAD
    .then((res) => {
=======
  .then((res) => {
>>>>>>> 3929470d70716e441e8caadd3dbc540099a2085b
    let arrayQuestions = res.data.results
    welcomeContainer.classList.add('hide')
    questionContainer.classList.remove('hide')
    console.log(arrayQuestions)
    setNextQuestion(arrayQuestions)
<<<<<<< HEAD
    })      
    .catch((err) => console.error(err));    
  }
    
  startButton.addEventListener('click',startGame)
  nextButton.addEventListener('click',() =>{
=======
  })      
  .catch((err) => console.error(err));
    
    }
    
    startButton.addEventListener('click',startGame)
    nextButton.addEventListener('click',() =>{
>>>>>>> 3929470d70716e441e8caadd3dbc540099a2085b
    currentQuestionIndex++;
    setNextQuestion()
  })  
  restartButton.addEventListener('click', startGame)  
  
  

  
  
  
    
