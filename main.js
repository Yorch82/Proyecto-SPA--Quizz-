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
const totalQuestions = 10;
let correctAnswers = 0;
let currentQuestionIndex;
let currentGame = 0;
totalGames = []
totalCorrects=[]
let myChart;
// Get the modal
let modal = document.getElementById("myModal");
// Get the button that opens the modal
const btn2 = document.getElementById("viewStats");
// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];
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
  totalCorrects.push(correctAnswers)
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
    let incorrectFormat = incorrect.replaceAll(/&quot;/ig, "'").replaceAll(/&eacute;/ig, "é").replaceAll(/&#039;/ig, "");
    answers.push({text : incorrectFormat, correct : false})
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
      button.disabled = true;
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
  currentGame ++;
  totalGames.push(currentGame)
  const data = {
    labels:  totalGames,
    datasets: [{
      label: 'Mi primera gráfica',
      backgroundColor: 'rgb(255, 99, 132)',
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
function showResults(){
  globalQuestion.classList.add('hide');
  resultContainer.classList.remove('hide');
  showScore.classList.remove('hide');
  let counter = JSON.parse(localStorage.getItem('counter'))
  if (counter <= 2) {
    scoreText.innerHTML = `<h2> ${counter} / 10 <br> Looser </h2>`;
  } else if (counter >2 && counter < 5) {
    scoreText.innerHTML = `<h2> ${counter} / 10 <br> You almost get it! Try again </h2>`;
  } else if (counter >= 5 && counter <=7) {
    scoreText.innerHTML = `<h2> ${counter} / 10 <br> You're doing great! </h2>`;
  } else if (counter >7 && counter < 10) {
    scoreText.innerHTML = `<h2> ${counter} / 10 <br> You are a BEAST! </h2>`;
  } else {
    scoreText.innerHTML = `<h2> ${counter} / 10 <br> GOD!!!!!!! </h2>`;
  }
  console.log(counter)
}
startButton.addEventListener('click',startGame)
nextButton.addEventListener('click',() =>{
  currentQuestionIndex++;
  setNextQuestion()
})
restartButton.addEventListener('click', () =>{
  localStorage.removeItem('counter')
  correctAnswers = 0;
  startGame()
})
showScore.addEventListener('click', showResults)