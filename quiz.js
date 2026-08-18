// quiz.js — implements a 15-question MCQ quiz with some interactive angle questions
const quizContainer = document.getElementById('quiz');
const prevBtn = document.getElementById('prevQ');
const nextBtn = document.getElementById('nextQ');
const submitBtn = document.getElementById('submitQuiz');
const resultDiv = document.getElementById('quizResult');

// Build 15 questions (mix of static and generated interactive ones)
const staticQuestions = [
  {text: 'Which angle is a right angle?', options: ['45°', '90°', '180°', '360°'], answer: 1, explanation: 'A right angle measures 90°.'},
  {text: 'Which of these is an obtuse angle?', options: ['60°', '120°', '30°', '45°'], answer: 1, explanation: 'An obtuse angle is between 90° and 180°, so 120° is obtuse.'},
  {text: 'What is a straight angle?', options: ['0°', '90°', '180°', '270°'], answer: 2, explanation: 'A straight angle measures 180°.'},
  {text: 'Which angle is acute?', options: ['100°', '95°', '85°', '180°'], answer: 2, explanation: 'An acute angle is less than 90°, so 85° is acute.'},
  {text: 'Two right angles together equal:', options: ['90°', '180°', '270°', '360°'], answer: 1, explanation: '90° + 90° = 180°.'},
  {text: 'Which is not a full rotation?', options: ['360°', '180°', '90°', '45°'], answer: 1, explanation: 'A full rotation is 360°, so the others are not full.'},
  {text: 'Which pair could be complementary angles?', options: ['30° and 60°', '100° and 80°', '120° and 60°', '200° and 160°'], answer: 0, explanation: 'Complementary angles add up to 90° (30 + 60 = 90).'},
  {text: 'An angle of 0° is called:', options: ['Right angle','Straight angle','Reflex angle','Zero angle'], answer: 3, explanation: '0° is a zero angle.'},
  {text: 'A reflex angle is:', options: ['Less than 90°','Between 90° and 180°','Between 180° and 360°','Exactly 360°'], answer: 2, explanation: 'A reflex angle is greater than 180° but less than 360°.'},
  {text: 'Which shows a full angle?', options: ['90°','180°','360°','270°'], answer: 2, explanation: '360° is a full angle.'}
];

// We'll create 5 interactive questions that show a random angle on the canvas and ask for its measure (rounded to nearest degree).
function makeInteractiveQuestion(id){
  const ang = Math.floor(Math.random()*160)+10; // 10..169
  // generate 3 distractors
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
  return {text: `Look at the drawing above. What is the angle shown? (Question ${id})`, options: opts.map(v=>v+'°'), answer: answerIndex, angleToShow: ang, explanation: `The drawn angle is ${ang}°.`};
}

const interactiveQuestions = [1,2,3,4,5].map(i=>makeInteractiveQuestion(i));

const questions = [];
// interleave static and interactive to reach 15 total
for(let i=0;i<15;i++){
  if(i%3===2 && interactiveQuestions.length) questions.push(interactiveQuestions.shift());
  else questions.push(staticQuestions[i%staticQuestions.length]);
}

let current = 0;
const answers = Array(questions.length).fill(null);

function renderQuestion(index){
  const q = questions[index];
  quizContainer.innerHTML = '';
  const f = document.createElement('form');
  f.className = 'questionForm';
  f.addEventListener('submit', e=>{ e.preventDefault(); });

  const field = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = `Question ${index+1} of ${questions.length}`;
  field.appendChild(legend);

  const p = document.createElement('p'); p.className='question'; p.textContent = q.text; field.appendChild(p);

  // If interactive, set the simulator angle for student to view
  if(q.angleToShow !== undefined){
    window.setAngle(q.angleToShow);
  }

  const ul = document.createElement('ul'); ul.className = 'options';
  q.options.forEach((opt,i)=>{
    const li = document.createElement('li');
    const id = `q${index}_opt${i}`;
    const input = document.createElement('input');
    input.type='radio'; input.name='option'; input.id=id; input.value=i; input.checked = answers[index]===i;
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
  nextBtn.disabled = index===questions.length-1;
}

function saveAnswer(){
  const sel = document.querySelector('.questionForm input[name="option"]:checked');
  if(sel) answers[current]=Number(sel.value);
}

prevBtn.addEventListener('click', ()=>{ saveAnswer(); if(current>0){ current--; renderQuestion(current); }});
nextBtn.addEventListener('click', ()=>{ saveAnswer(); if(current<questions.length-1){ current++; renderQuestion(current); }});

submitBtn.addEventListener('click', ()=>{
  saveAnswer(); // grade
  let score = 0;
  quizContainer.innerHTML = '';
  questions.forEach((q,i)=>{
    const div = document.createElement('div');
    const h = document.createElement('h3'); h.textContent = `Q${i+1}: ${q.text}`; div.appendChild(h);
    const list = document.createElement('ul'); list.className='options';
    q.options.forEach((opt,j)=>{
      const li = document.createElement('li');
      li.textContent = opt;
      if(j===q.answer){ li.classList.add('correct'); li.textContent = opt + ' ✓ (correct)'; }
      if(answers[i]===j && j!==q.answer){ li.classList.add('incorrect'); li.textContent = opt + ' ✗ (your answer)'; }
      list.appendChild(li);
    });
    div.appendChild(list);
    const ex = document.createElement('div'); ex.className='explanation'; ex.textContent = q.explanation || (q.angleToShow!==undefined?`Measured angle: ${q.angleToShow}°`:'');
    div.appendChild(ex);
    quizContainer.appendChild(div);
    if(answers[i]===q.answer) score++;
  });
  resultDiv.textContent = `You scored ${score} out of ${questions.length}`;
  // scroll to result
  resultDiv.scrollIntoView({behavior:'smooth'});
});

// initial render
renderQuestion(current);
