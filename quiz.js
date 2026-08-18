// quiz.js — implements a 15-question MCQ quiz with some interactive angle questions
// Persist generated interactive questions and answers to localStorage so reloading keeps the same quiz
const quizContainer = document.getElementById('quiz');
const prevBtn = document.getElementById('prevQ');
const nextBtn = document.getElementById('nextQ');
const submitBtn = document.getElementById('submitQuiz');
const resultDiv = document.getElementById('quizResult');

const STORAGE_KEY = 'angles_quiz_v1';

// Build static questions
const staticQuestions = [
  {text: 'Which angle is a right angle?', options: ['45°', '90°', '180°', '360°'], answer: 1, explanation: 'A right angle measures 90°.'},
  {text: 'Which of these is an obtuse angle?', options: ['60°', '120°', '30°', '45°'], answer: 1, explanation: 'An obtuse angle is between 90° and 180°, so 120° is obtuse.'},
  {text: 'What is a straight angle?', options: ['0°', '90°', '180°', '270°'], answer: 2, explanation: 'A straight angle measures 180°.'},
  {text: 'Which angle is acute?', options: ['100°', '95°', '85°', '180°'], answer: 2, explanation: 'An acute angle is less than 90°, so 85° is acute.'},
  {text: 'Two right angles together equal:', options: ['90°', '180°', '270°', '360°'], answer: 1, explanation: '90° + 90° = 180°.'},
  {text: 'Which is not a full rotation?', options: ['360°', '180°', '90°', '45°'], answer: 1, explanation: 'A full rotation is 360°, so the others are not full.'},
  {text: 'Which pair could be complementary angles?', options: ['30° and 60°', '100° and 80°', '120° and 60°', '200° and 160°'], answer: 0, explanation: 'Complementary angles add up to 90°.'},
  {text: 'An angle of 0° is called:', options: ['Right angle','Straight angle','Reflex angle','Zero angle'], answer: 3, explanation: '0° is a zero angle.'},
  {text: 'A reflex angle is:', options: ['Less than 90°','Between 90° and 180°','Between 180° and 360°','Exactly 360°'], answer: 2, explanation: 'A reflex angle is greater than 180° but less than 360°.'},
  {text: 'Which shows a full angle?', options: ['90°','180°','360°','270°'], answer: 2, explanation: '360° is a full angle.'}
];

function makeInteractiveQuestion(id){
  const ang = Math.floor(Math.random()*160)+10; // 10..169
  const distractors = new Set();
  while(distractors.size < 3){
    let delta = Math.floor(Math.random()*25)+2; // 2..26
    if(Math.random() < 0.5) delta = -delta;
    const val = ((ang + delta) % 360 + 360) % 360;
    if(val !== ang) distractors.add(val);
  }
  const opts = [ang, ...Array.from(distractors)];
  // shuffle options
  for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
  const answerIndex = opts.indexOf(ang);
  return {text: `Look at the drawing above. What is the angle shown? (Question ${id})`, options: opts.map(v=>v+'°'), answer: answerIndex, angleToShow: ang, explanation: `The drawn angle is ${ang}°.`}
}

// State (questions, answers, current index)
let state = {
  questions: [],
  answers: [],
  current: 0
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    const parsed = JSON.parse(raw);
    if(parsed && Array.isArray(parsed.questions) && Array.isArray(parsed.answers)){
      state = parsed;
      return true;
    }
  }catch(e){ console.warn('Failed to load quiz state', e); }
  return false;
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){ console.warn('Failed to save quiz state', e); }
}

function initQuestions(){
  // If there's saved state, reuse it (keeps same interactive questions and answers)
  if(loadState()){
    // ensure questions length is 15
    if(state.questions.length === 15){ return; }
    // otherwise fall through to regenerate
  }

  // create interactive questions (5 of them)
  const interactiveQuestions = [1,2,3,4,5].map(i=>makeInteractiveQuestion(i));
  const questions = [];
  for(let i=0;i<15;i++){
    if(i%3===2 && interactiveQuestions.length) questions.push(interactiveQuestions.shift());
    else questions.push(staticQuestions[i%staticQuestions.length]);
  }
  state.questions = questions;
  state.answers = Array(questions.length).fill(null);
  state.current = 0;
  saveState();
}

// Check if all questions are answered
function areAllQuestionsAnswered(){
  return state.answers.every(answer => answer !== null);
}

// Update submit button state
function updateSubmitButtonState(){
  submitBtn.disabled = !areAllQuestionsAnswered();
}

function renderQuestion(index){
  const q = state.questions[index];
  quizContainer.innerHTML = '';
  const f = document.createElement('form');
  f.className = 'questionForm';
  f.addEventListener('submit', e=>{ e.preventDefault(); });

  const field = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = `Question ${index+1} of ${state.questions.length}`;
  field.appendChild(legend);

  const p = document.createElement('p'); p.className='question'; p.textContent = q.text; field.appendChild(p);

  // If interactive, set the simulator angle for student to view
  if(q.angleToShow !== undefined && typeof window.setAngle === 'function'){
    window.setAngle(q.angleToShow);
  }

  const ul = document.createElement('ul'); ul.className = 'options';
  q.options.forEach((opt,i)=>{
    const li = document.createElement('li');
    const id = `q${index}_opt${i}`;
    const input = document.createElement('input');
    input.type='radio'; input.name='option'; input.id=id; input.value=i; input.checked = state.answers[index]===i;
    input.addEventListener('change', ()=>{ state.answers[index]=i; saveState(); updateSubmitButtonState(); });
    const label = document.createElement('label'); label.setAttribute('for', id); label.textContent = opt;
    li.appendChild(input); li.appendChild(label);
    ul.appendChild(li);
  });
  field.appendChild(ul);

  // explanation area shows after submit
  const expl = document.createElement('div'); expl.className='explanation'; expl.id='expl'+index;
  field.appendChild(expl);

  f.appendChild(field);
  quizContainer.appendChild(f);

  // enable/disable nav buttons
  prevBtn.disabled = index===0;
  nextBtn.disabled = index===state.questions.length-1;
}

function saveCurrentAndRender(newIndex){
  state.current = newIndex;
  saveState();
  renderQuestion(state.current);
}

prevBtn.addEventListener('click', ()=>{ if(state.current>0){ saveState(); state.current--; renderQuestion(state.current); }});
nextBtn.addEventListener('click', ()=>{ if(state.current < state.questions.length-1){ saveState(); state.current++; renderQuestion(state.current); }});

submitBtn.addEventListener('click', ()=>{
  saveState(); // ensure latest answer saved
  let score = 0;
  quizContainer.innerHTML = '';
  state.questions.forEach((q,i)=>{
    const div = document.createElement('div');
    const h = document.createElement('h3'); h.textContent = `Q${i+1}: ${q.text}`; div.appendChild(h);
    const list = document.createElement('ul'); list.className='options';
    q.options.forEach((opt,j)=>{
      const li = document.createElement('li');
      li.textContent = opt;
      if(j===q.answer){ li.classList.add('correct'); li.textContent = opt + ' ✓ (correct)'; }
      if(state.answers[i]===j && j!==q.answer){ li.classList.add('incorrect'); li.textContent = opt + ' ✗ (your answer)'; }
      list.appendChild(li);
    });
    div.appendChild(list);
    const ex = document.createElement('div'); ex.className='explanation'; ex.textContent = q.explanation || (q.angleToShow!==undefined?`Measured angle: ${q.angleToShow}°`:'');
    div.appendChild(ex);
    quizContainer.appendChild(div);
    if(state.answers[i]===q.answer) score++;
  });
  resultDiv.textContent = `You scored ${score} out of ${state.questions.length}`;
  // keep state so reloading still shows same questions & answers; mark as completed in storage
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    saved.completedAt = (new Date()).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){}
  resultDiv.scrollIntoView({behavior:'smooth'});
});

// initialization
initQuestions();
// enforce bounds
if(state.current < 0 || state.current >= state.questions.length) state.current = 0;
renderQuestion(state.current);
// Set initial submit button state
updateSubmitButtonState();
