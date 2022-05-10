//We take consts from DOM
const textWelcome = document.getElementById("textWelcome");
const questionContainer = document.getElementById("questionContainer");
const resultContainer = document.getElementById("resultContainer");
const startButton = document.getElementById("start-btn")
const nextButton = document.getElementById("next-btn");
const restartButton = document.getElementById("restart-btn");
const questionPrint = document.getElementById("questionPrint")
const answerButtonPrint = document.getElementById("buttonContainer");
const showScore = document.getElementById ('showScore');
const globalQuestion = document.getElementById ('globalQuestion');
const scoreText = document.getElementById ('scoreText');
let modal = document.getElementById("myModal");
const btn2 = document.getElementById("viewStats");
let span = document.getElementsByClassName("close")[0];
const myBar = document.getElementById("myBar");


//We create variables for counters
const totalQuestions = 10;
let correctAnswers = 0;
let currentQuestionIndex;
let currentGame = 0;
totalGames = []
totalCorrects=[]
let myChart;

//Here we trigger the Start Button to begin the game
startButton.addEventListener('click',() => {
  localStorage.removeItem('counter')
  correctAnswers = 0;
  startGame()
})

//Event on next button to set and count the next question
nextButton.addEventListener('click',() =>{
  currentQuestionIndex++;
  setNextQuestion()
})

//Event on restart button in order to restart game and remove counter from local storage
restartButton.addEventListener('click', () =>{
  localStorage.removeItem('counter')
  correctAnswers = 0;
  startGame()
})

//Event that triggers the function to see your stats
showScore.addEventListener('click', showResults)


// When the user clicks the button, open the modal
btn2.addEventListener('click',function() {
  modal.style.display = "block";
})

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

//Function so start game
function startGame(){
  currentGame ++;
  totalGames.push(currentGame)
  const data = {
    labels:  totalGames,
    datasets: [{
      label: 'Your progress',
      backgroundColor: 'rgb(51, 161, 253)',
      borderColor: 'rgb(255, 99, 132)',
      data: totalCorrects,
    }]
  };
  const config = {
    type: 'bar',
    data: data,
  };
  if (myChart) {
    myChart.destroy();
}
  myChart = new Chart('chart', config);
  axios.get("https://opentdb.com/api.php?amount=10&type=multiple")
  .then((res) => {
    currentQuestionIndex = 0
    let arrayQuestions = res.data.results
    textWelcome.classList.add('hide')
    globalQuestion.classList.remove('hide')
    resultContainer.classList.add('hide')
    showScore.classList.add('hide')
    localStorage.setItem('preguntas', JSON.stringify(arrayQuestions))
    setInitialQuestion(arrayQuestions)
  })
  .catch((err) => console.error(err));
}

//Function to set the initial question
function setInitialQuestion(arrayQuestions){  
  resetState()
  showQuestion(arrayQuestions[currentQuestionIndex])
}

//Function to reset the the answers state before print the next one
function resetState() {
  nextButton.classList.add('hide');
  
  while (answerButtonPrint.firstChild){
    answerButtonPrint.removeChild(answerButtonPrint.firstChild)
  }
}

//Function to print the current question on HTML
function showQuestion(question){
  myBar.style.width = `${(currentQuestionIndex/totalQuestions) * 100}%`
  questionPrint.innerHTML = `<h2>${question.question}</h2>`;
  showAnswers(question)
}

//Function to show the answers
function showAnswers(question){
  let filterAnswer = question.correct_answer.replaceAll(/&quot;/g, "'").replaceAll(/&eacute;/g, "é").replaceAll(/&#039;/g, " ").replaceAll(/&uoml;/g, "").replaceAll(/&reg;/g, "").replaceAll(/&amp;/g, "")
  let correctAnswer = {
    text : filterAnswer,
    correct : true
  };
  console.log(question.correct_answer,"la mala")
  let answers =[]
  let incorrectAnswer = question.incorrect_answers;
  console.log(incorrectAnswer);
  incorrectAnswer.forEach(incorrect => {
    let incorrectFormat = incorrect.replaceAll(/&quot;/g, "'").replaceAll(/&eacute;/g, "é").replaceAll(/&#039;/g, " ").replaceAll(/&uoml;/g, "").replaceAll(/&reg;/g, "").replaceAll(/&amp;/g, "")
    answers.push({text : incorrectFormat, correct : false})  
  })
  answers.push(correctAnswer)
  console.log(answers, "soy las respuestas")
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
    localStorage.setItem('counter', JSON.stringify(correctAnswers));
    selectAnswer();
    })
    answerButtonPrint.appendChild(button);
    })
}

//Funciton to detect the correct and wrong answers
function selectAnswer(){
  Array.from(answerButtonPrint.children).forEach((button) => {
    button.disabled = true;
    setStatusClass(button, button.dataset.correct);
});
  if ( totalQuestions > currentQuestionIndex + 1) {
    nextButton.classList.remove('hide');
  } else{
  totalCorrects.push(correctAnswers)
  showScore.classList.remove('hide');
}
}

//Function that set the color to the buttons as needed
function setStatusClass(element, correct){
  if (correct){
    element.classList.add('correct');
  } else {
    element.classList.add('wrong');
  }
}

//function to set the second and the incoming questions
function setNextQuestion(){
  let preguntas = JSON.parse(localStorage.getItem('preguntas'))
  resetState();
  showQuestion(preguntas[currentQuestionIndex]);
}

//Function to print your stats
function showResults(){
  globalQuestion.classList.add('hide');
  resultContainer.classList.remove('hide');
  showScore.classList.remove('hide');
  let counter = JSON.parse(localStorage.getItem('counter'))
  console.log(counter)
  if (counter == 0 || counter <= 2) {
    scoreText.innerHTML = `<div class= "circle"> <h2 class="textResult"><span class="decorationScore"> ${counter} / 10 </span> <br> LOOSER </h2> </div>
    <audio autoplay>
  <source src="./Assets/Fail.mp3" type="audio/mpeg">
  </audio>`;
  } else if (counter >2 && counter < 5) {
    scoreText.innerHTML = `<div class= "circle"> <h2 class="textResult"> <span class="decorationScore"> ${counter} / 10 </span> <br> YOU ALMOST GOT IT!</div> </h2>
    <audio autoplay>
    <source src="./Assets/Retratado.mp3" type="audio/mpeg">
    </audio>`;
  } else if (counter >= 5 && counter <=7) {
    scoreText.innerHTML = `<div class= "circle"> <h2 class="textResult"> <span class="decorationScore"> ${counter} / 10 </span> <br> YOU'RE DOING GREAT! </div> </h2>
    <audio autoplay>
  <source src="./Assets/Kids.mp3" type="audio/mpeg">
  </audio>`;
  } else if (counter >7 && counter < 10) {
    scoreText.innerHTML = `<div class= "circle"> <h2 class="textResult"> <span class="decorationScore"> ${counter} / 10 </span> <br> YOU ARE A BEAST! </div> </h2>
    <audio autoplay>
  <source src="./Assets/Chiquito.mp3" type="audio/mpeg">
  </audio>`;
  } else {
    scoreText.innerHTML = `<div class= "circle"> <h2 class="textResult"> <span class="decorationScore"> ${counter} / 10 </span> <br> LEGEND! </div> </h2>
    <audio autoplay>
    <source src="./Assets/Austin.mp3" type="audio/mpeg">
    </audio>`;
  }
}



