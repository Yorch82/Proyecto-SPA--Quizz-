const welcomeContainer = document.getElementById("welcomeContainer");
const questionContainer = document.getElementById("questionContainer");
const resultContainer = document.getElementById("resultContainer");
const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
const questionPrint = document.getElementById("questionPrint")
const answerButtonPrint = document.getElementById("prueba");
// const answerButtonPrint2 = document.getElementById("text_button2");
// const answerButtonPrint3 = document.getElementById("text_button3");
// const answerButtonPrint4 = document.getElementById("text_button4");



let currentQuestionIndex; 


  


  // function setStatusClass(element, correct){
  //   if (correct){
  //     element.classList.add('correct');
  //   } else {
  //     element.classList.add('wrong');
  //   }
  // }



  // function selectAnswer(){
  //   allAnswers.forEach(value => {
  //       if (correctAnswer == value){
  //         correctAnswer.classList.add('correct');
  //       } else {
  //         incorrectAnswer.classList.add('wrong');
  //       }
  //     })
    
  //   if (question.length > currentQuestionIndex + 1) {
  //     nextButton.classList.remove('hide');
  //   } else{
  //     restartButton.classList.remove('hide');
  //   }
  // }
  //   button.addEventListener('click',selectAnswer)

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
    answers.forEach(answer => {
      const button = document.createElement("button")
      button.inerHTML = answer.text
      button.classList.add("button_answer")
      if (answer.correct){
        button.dataset.correct = true
      }
      // button.addEventListener('click', selectAnswer)
      console.log(button)
      answerButtonPrint.appendChild(button)
      
    })
    
    //   button.classList.add('btn');
    //  if(answer.correct){
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
  .then((res) => {
    let arrayQuestions = res.data.results
    welcomeContainer.classList.add('hide')
    questionContainer.classList.remove('hide')
    setNextQuestion(arrayQuestions)
  })      
  .catch((err) => console.error(err));
    
    }
    
    startButton.addEventListener('click',startGame)
    nextButton.addEventListener('click',() =>{
    currentQuestionIndex++;
    setNextQuestion()
  })  
  restartButton.addEventListener('click', startGame)  
  
  

  
  
  
    
