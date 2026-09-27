import {
    QUESTIONS,
    TOPIC_META,
    TERMS
} from './questions.js';
import { SITE_SCHOOL_ID } from './site-school.js';
import { getPublicTerms, getPublicTopicsForTerm, getPublicQuestions } from './public-content.js';
import { listPdfsForSchool, pdfPublicUrl } from './pdfs.js';
const state={term:null,topicCode:null,topicName:null,mode:null,items:[],choices:{},answers:{},revisionMarks:{},typedDetail:{},marked:false,correct:0,wrong:0};
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const home=document.querySelector('main#home'),quiz=$('#quiz'),result=$('#result');
const modeNames={choice:{ar:'اختيار الإجابة',en:'Multiple choice'},typing:{ar:'كتابة الإجابة',en:'Write the answer'},revision:{ar:'المراجعة والحفظ',en:'Revision & memorisation'}};
let lang=localStorage.getItem('iusUILang')||'ar';

const t={
 ar:{
  utility:'Study smarter. Remember more. Improve your results.',navHome:'الرئيسية',navSubjects:'المواد',navHow:'كيف تعمل؟',navProgress:'تقدمي',
  brandSub:'منصة المراجعة والحفظ',
  startLearning:'ابدأ المراجعة',kicker:'REVISION • MEMORISATION • QUIZ',heroTitle:'تعلّم. راجع. احفظ.<br>واختبر نفسك.',
  heroText:'منصة جسر الوصول تساعدك على مراجعة دروسك، حفظ الإجابات، والتدرّب على الأسئلة بطريقة بسيطة وواضحة.',
  learnHow:'تعرّف على الطريقة',heroProof:'راجع على طريقتك — واخدم هدفك قبل الامتحان.',readyQuestions:'سؤال جاهز',sampleScore:'تقدّم المراجعة',
  memoryMode:'الحفظ',memoryModeSub:'استرجع الإجابة',questions:'أسئلة',studyModes:'طرق للمراجعة',localProgress:'تقدم محفوظ على جهازك',available:'متاح للمراجعة',
  ourSubjects:'التاريخ الإسلامي',chooseSubject:'اختر الفصل الدراسي وابدأ المراجعة',subjectsText:'اختر الفصل الدراسي، ثم الموضوع، ثم طريقة المراجعة المناسبة لك.',totalQuestions:'سؤال',
  stepTerm:'الفصل الدراسي',stepTopic:'الموضوع',stepMode:'طريقة المراجعة',backToTerms:'رجوع للفصول',backToTopics:'رجوع للمواضيع',
  secondTermEmpty:'سيتم إضافة الموضوعات قريباً',chooseTopicFor:'اختر موضوعاً من',chooseModeFor:'اختر طريقة المراجعة لموضوع',
  featComprehensive:'تغطية شاملة لكل مواضيع المنهج',featComprehensiveSub:'الخلفاء الراشدون حتى انهيار الدولة في الأندلس',
  featPaper:'ورقة كاملة لكل موضوع',featPaperSub:'أجب عن كل الأسئلة ثم صحّح دفعة واحدة',
  featModes:'ثلاث طرق للمراجعة',featModesSub:'اختيار، كتابة، أو حفظ ومراجعة',
  featProgress:'تتبع تقدمك أولاً بأول',featProgressSub:'إحصاءات محفوظة على جهازك',
  featNoLogin:'بدون تسجيل دخول',featNoLoginSub:'افتح الموقع وابدأ مباشرة',
  termCta:'ابدأ من هنا ←',
  simpleMethod:'طريقة بسيطة',threeWays:'ثلاث طرق تساعدك على الاستعداد',threeWaysText:'صمّمنا الصفحة لتكون واضحة وسريعة على الهاتف والكمبيوتر.',
  choiceTitle:'اختر الإجابة',choiceText:'اختر الإجابة الصحيحة من الخيارات المعروضة، وستظهر لك النتيجة مباشرة.',
  typingTitle:'اكتب الإجابة',typingText:'اكتب الإجابة بنفسك ثم دع النظام يقارنها بالإجابة المعتمدة.',
  revisionTitle:'المراجعة والحفظ',revisionText:'حاول تذكّر الإجابة أولاً، ثم أظهرها وحدد هل تذكرتها أم تحتاج إلى مراجعة.',
  tryMode:'جرّب الطريقة ←',yourProgress:'تقدمك',progressTitle:'اعرف أين وصلت قبل الامتحان.',
  progressText:'يحفظ الموقع إحصاءات المراجعة على جهازك حتى تستطيع متابعة أدائك دون حساب أو تسجيل دخول.',
  resetProgress:'إعادة ضبط التقدم',overallProgress:'التقدم العام',answered:'أُجيب عنها',correct:'صحيحة',wrong:'خاطئة',
  ready:'جاهز؟',ctaTitle:'ابدأ الآن وراجع قبل أن يبدأ الامتحان.',back:'العودة',questionLabel:'السؤال',typeHere:'اكتب إجابتك هنا...',
  paperInstructions:'أجب عن كل الأسئلة، ثم اضغط "تصحيح الورقة" لعرض النتيجة الكاملة.',markPaper:'تصحيح الورقة',viewResult:'عرض النتيجة',reviewPaper:'مراجعة الورقة',
  showAnswer:'إظهار الإجابة',remembered:'تذكرت الإجابة',needsReview:'أحتاج إلى مراجعة',next:'السؤال التالي',skip:'تخطي',
  roundComplete:'اكتملت الجولة',resultTitle:'أحسنت على إكمال المراجعة.',score:'النتيجة',total:'المجموع',again:'إعادة الاختبار',home:'الرئيسية',
  footerText:'منصة بسيطة للمراجعة والحفظ والتدرب على الأسئلة.',quickLinks:'روابط سريعة',language:'اللغة',rights:'جميع الحقوق محفوظة',
  yourAnswer:'إجابتك',correctAnswerLabel:'الإجابة الصحيحة',notAnswered:'لم تتم الإجابة',notReviewed:'لم تراجَع',
  correctMsg:'إجابة صحيحة.',rememberedMsg:'أحسنت، تذكرت الإجابة.',
  matchedPoints:'النقاط التي ذكرتها',missedPoints:'النقاط الناقصة',typingHint:'لا يشترط حفظ الإجابة كاملة كلمة بكلمة — يكفي أن تذكر النقاط الأساسية للإجابة.',
  navPdfs:'ملفات PDF',navAdmin:'دخول الإدارة',pdfsEyebrow:'ملفات ومراجع',pdfsTitle:'ملفات PDF للتحميل',pdfsText:'ملخصات ومراجع أضافها المعلم — يمكنك تحميلها مباشرة دون تسجيل دخول.',
  excellent:'ممتاز. واصل المراجعة للحفاظ على مستواك.',good:'جيد. راجع الأسئلة التي أخطأت فيها ثم أعد الاختبار.',needsWork:'تحتاج إلى مراجعة أكثر. استخدم وضع المراجعة والحفظ ثم أعد الاختبار.'
 },
 en:{
  utility:'Study smarter. Remember more. Improve your results.',navHome:'Home',navSubjects:'Subjects',navHow:'How it works',navProgress:'My progress',
  brandSub:'Revision & memorisation platform',
  startLearning:'Start revision',kicker:'REVISION • MEMORISATION • QUIZ',heroTitle:'Learn. Review. Remember.<br>Then test yourself.',
  heroText:'Jisr Al Wusool helps you review lessons, remember answers and practise questions in a simple, clear way.',
  learnHow:'See how it works',heroProof:'Study your way — and prepare before the exam.',readyQuestions:'ready questions',sampleScore:'revision progress',
  memoryMode:'Memorisation',memoryModeSub:'Recall the answer',questions:'questions',studyModes:'study modes',localProgress:'progress saved on device',available:'available 24/7',
  ourSubjects:'Islamic History',chooseSubject:'Choose a term and start',subjectsText:'Choose a term, then a topic, then the revision mode that suits you.',totalQuestions:'questions',
  stepTerm:'Term',stepTopic:'Topic',stepMode:'Revision mode',backToTerms:'Back to terms',backToTopics:'Back to topics',
  secondTermEmpty:'Topics coming soon',chooseTopicFor:'Choose a topic from',chooseModeFor:'Choose a revision mode for',
  featComprehensive:'Comprehensive syllabus coverage',featComprehensiveSub:'From the Rightly-Guided Caliphs to the fall of Al-Andalus',
  featPaper:'One full paper per topic',featPaperSub:'Answer everything, then mark it all at once',
  featModes:'Three revision modes',featModesSub:'Choice, typing, or recall & review',
  featProgress:'Track your progress',featProgressSub:'Stats saved on your device',
  featNoLogin:'No login needed',featNoLoginSub:'Open the site and start right away',
  termCta:'Start here →',
  simpleMethod:'Simple method',threeWays:'Three ways to prepare',threeWaysText:'A clean interface designed to work well on phones and computers.',
  choiceTitle:'Choose the answer',choiceText:'Select the correct answer from the choices and see your result immediately.',
  typingTitle:'Write the answer',typingText:'Write the answer yourself and let the system compare it with the accepted answer.',
  revisionTitle:'Revision & memorisation',revisionText:'Try to remember the answer first, reveal it, then mark whether you remembered it.',
  tryMode:'Try this mode →',yourProgress:'Your progress',progressTitle:'Know where you stand before the exam.',
  progressText:'Your revision statistics are saved on your device, so you can track your work without an account.',
  resetProgress:'Reset progress',overallProgress:'Overall progress',answered:'answered',correct:'correct',wrong:'wrong',
  ready:'Ready?',ctaTitle:'Start now and revise before the exam starts.',back:'Back',questionLabel:'Question',typeHere:'Write your answer here...',
  paperInstructions:'Answer every question, then tap "Mark paper" to see the full result.',markPaper:'Mark paper',viewResult:'View result',reviewPaper:'Review paper',
  showAnswer:'Show answer',remembered:'I remembered it',needsReview:'I need to review',next:'Next question',skip:'Skip',
  roundComplete:'ROUND COMPLETE',resultTitle:'Well done on completing the revision.',score:'Score',total:'Total',again:'Try again',home:'Home',
  footerText:'A simple platform for revision, memorisation and question practice.',quickLinks:'Quick links',language:'Language',rights:'All rights reserved',
  yourAnswer:'Your answer',correctAnswerLabel:'Correct answer',notAnswered:'Not answered',notReviewed:'Not reviewed',
  correctMsg:'Correct answer.',rememberedMsg:'Well done, you remembered the answer.',
  matchedPoints:'Key points you covered',missedPoints:'Key points missing',typingHint:'You don\u2019t need to memorise the answer word-for-word — just cover the key points.',
  navPdfs:'PDF files',navAdmin:'Admin login',pdfsEyebrow:'Files & resources',pdfsTitle:'Downloadable PDF files',pdfsText:'Summaries and references added by the teacher — download directly, no login needed.',
  excellent:'Excellent. Keep revising to maintain your level.',good:'Good. Review the questions you missed and try again.',needsWork:'You need more revision. Use revision mode, then try the quiz again.'
 }
};

function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function norm(s){return (s||'').trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[\u200f\u200e]/g,'').replace(/\s+/g,' ')}

/* ---------- key-point detection for typed answers ---------- */
/* Full-sentence answers are hard to memorise word-for-word, so typed answers are graded
   by whether the key points of the model answer appear in what the student wrote,
   not by exact string matching. */
const STOPWORDS=new Set(['من','في','الى','إلى','على','عن','ما','هو','هي','هم','كان','كانت','التي','الذي','ثم','ان','أن','إن','قد','لم','لن','او','أو','بعد','قبل','عند','حتى','مع','هذا','هذه','ذلك','تلك','لا','كل','بين','كما','حيث','اذا','إذا','كي','لكي','به','لها','له','لهم','منها','منه','فيها','فيه','اي','أي','كانوا','يكون','تكون','رضي','الله','عنه','عنها','عنهم','تعالى','صلى','وسلم','عليه','ﷺ']);
function lightStem(w){
  for(let i=0;i<2;i++){
    if(/^ال/.test(w)&&w.length>4)w=w.slice(2);
    else if(/^[وفبكل]/.test(w)&&w.length>3)w=w.slice(1);
    else break;
  }
  return w;
}
function segmentAnswer(answer){
  const text=(answer||'').replace(/[.\u061B]+$/,'').trim();
  let segs=text.split(/[،,]/).map(s=>s.trim()).filter(Boolean);
  segs=segs.map(s=>s.replace(/^و(?=[ء-ي]{2,})/,'').trim()).filter(s=>s.length>=2);
  return segs.length?segs:[text];
}
function keyWordsOf(phrase){
  return norm(phrase).split(/\s+/).map(lightStem).filter(w=>w.length>=2&&!STOPWORDS.has(w));
}
function getKeyPoints(q){
  return segmentAnswer(q.answer).map(seg=>({text:seg,words:keyWordsOf(seg)})).filter(k=>k.words.length>0);
}
function gradeTyped(q,raw){
  raw=raw||'';
  const accepted=(q.acceptable||[]).map(norm);
  if(raw.trim()!==''&&(accepted.includes(norm(raw))||norm(raw)===norm(q.answer))){
    return {ok:true,matched:[],missed:[]};
  }
  const keyPoints=getKeyPoints(q);
  if(raw.trim()===''||!keyPoints.length)return {ok:false,matched:[],missed:keyPoints.map(k=>k.text)};
  const typedWords=new Set(norm(raw).split(/\s+/).map(lightStem).filter(w=>w.length>=2));
  const matched=[],missed=[];
  keyPoints.forEach(k=>{
    const hits=k.words.filter(w=>typedWords.has(w));
    const need=Math.max(1,Math.ceil(k.words.length*0.5));
    (hits.length>=need?matched:missed).push(k.text);
  });
  const required=keyPoints.length<=2?keyPoints.length:Math.ceil(keyPoints.length*0.6);
  return {ok:matched.length>=required,matched,missed};
}
function stats(){return JSON.parse(localStorage.getItem('iusStats')||'{"answered":0,"correct":0,"wrong":0}')}
function updateStats(){
  const s=stats(),p=s.answered?Math.round(s.correct/s.answered*100):0;
  $('#statAnswered').textContent=s.answered;$('#statCorrect').textContent=s.correct;$('#statWrong').textContent=s.wrong;
  $('#homePercent').textContent=p+'%';$('#homeMeter').style.width=p+'%';
}
function addStat(ok){const s=stats();s.answered++;ok?s.correct++:s.wrong++;localStorage.setItem('iusStats',JSON.stringify(s));updateStats()}
function showHome(){home.style.display='block';quiz.classList.remove('active');result.classList.remove('active');window.scrollTo({top:0,behavior:'smooth'});updateStats()}
function showQuiz(){home.style.display='none';quiz.classList.add('active');result.classList.remove('active');window.scrollTo({top:0,behavior:'smooth'})}
function showResult(){home.style.display='none';quiz.classList.remove('active');result.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}

/* ---------- language ---------- */
function applyLanguage(){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;if(t[lang][key])el.innerHTML=t[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key=el.dataset.i18nPlaceholder;if(t[lang][key])el.placeholder=t[lang][key];
  });
  const other=lang==='ar'?'English':'العربية';
  $('#langToggle').textContent=other;$('#footerLang').textContent=other;
  if(state.mode)$('#quizMode').textContent=modeNames[state.mode][lang];
  if(state.topicName)$('#quizSubject').textContent=state.topicName;
  renderTerms();
  if(state.term)renderTopics(state.term);
}
function toggleLanguage(){lang=lang==='ar'?'en':'ar';localStorage.setItem('iusUILang',lang);applyLanguage()}

/* ---------- wizard: term -> topic -> mode ---------- */
function topicQuestions(code){
  const meta=TOPIC_META.find(m=>m.code===code);
  if(!meta)return [];
  return QUESTIONS.filter(q=>q.subject===meta.subject);
}
function setWizardStep(step){
  $$('.wizard-step').forEach(el=>el.classList.remove('active'));
  $$('.crumb').forEach(el=>el.classList.remove('active'));
  $(`#${step}Step`).classList.add('active');
  $(`.crumb[data-step="${step}"]`).classList.add('active');
}
function renderTerms(){
  const box=$('#termGrid');box.innerHTML='';
  TERMS.forEach((term,i)=>{
    const qCount=term.topics.reduce((sum,c)=>sum+topicQuestions(c).length,0);
    const empty=term.topics.length===0;
    const b=document.createElement('button');
    b.type='button';b.className='term-card'+(empty?' term-card-empty':'');
    b.disabled=empty;
    b.innerHTML=`<span class="term-number">${String(i+1).padStart(2,'0')}</span>`+
      `<span class="term-icon">▤</span>`+
      `<span class="term-name">${term[lang]}</span>`+
      (empty?`<span class="term-soon">${t[lang].secondTermEmpty}</span>`
            :`<span class="term-meta">${term.topics.length} ${lang==='ar'?'مواضيع':'topics'} • ${qCount} ${t[lang].totalQuestions}</span>
              <span class="term-cta">${t[lang].termCta}</span>`);
    if(!empty)b.onclick=()=>{state.term=term.id;renderTopics(term.id);setWizardStep('topic')};
    box.appendChild(b);
  });
  $('#heroQuestionCount').textContent=QUESTIONS.length;$('#questionTotal').textContent=QUESTIONS.length;$('#statTopQuestions').textContent=QUESTIONS.length;
}
function renderTopics(termId){
  const term=TERMS.find(x=>x.id===termId);if(!term)return;
  const box=$('#topicGrid');box.innerHTML='';
  term.topics.forEach(code=>{
    const meta=TOPIC_META.find(m=>m.code===code);
    const count=topicQuestions(code).length;
    const b=document.createElement('button');b.className='subject-btn';b.type='button';
    b.innerHTML=`<span class="subject-index">${meta.code}</span><span class="subject-name">${meta.subject}</span><span class="subject-count">${count} ${t[lang].totalQuestions}</span>`;
    b.onclick=()=>{state.topicCode=code;state.topicName=meta.subject;setWizardStep('mode')};
    box.appendChild(b);
  });
}
function bindModeButtons(){
  document.querySelectorAll('#modeGrid .mode-card').forEach(b=>b.onclick=()=>{
    if(!state.topicCode)return;
    start(b.dataset.mode);
  });
}
$('#backToTerm').onclick=()=>setWizardStep('term');
$('#backToTopic').onclick=()=>setWizardStep('topic');
function openWizard(){setWizardStep('term');document.getElementById('subjects').scrollIntoView({behavior:'smooth'})}

/* ---------- quiz: full paper ---------- */
function buildChoicesForItem(q){
  let pool=QUESTIONS.filter(x=>x.subject===q.subject && x.id!==q.id);
  if(pool.length<3)pool=pool.concat(QUESTIONS.filter(x=>x.subject!==q.subject && x.id!==q.id));
  const distractors=shuffle(pool).slice(0,3).map(x=>x.answer);
  return shuffle([q.answer,...distractors]);
}
function start(mode){
  state.mode=mode;
  state.items=topicQuestions(state.topicCode);
  state.choices={};state.answers={};state.revisionMarks={};state.typedDetail={};state.marked=false;state.correct=0;state.wrong=0;
  if(mode==='choice')state.items.forEach(q=>{state.choices[q.id]=buildChoicesForItem(q)});
  $('#quizMode').textContent=modeNames[mode][lang];$('#quizSubject').textContent=state.topicName;
  $('#quizCounter').textContent=`${state.items.length} ${t[lang].totalQuestions}`;
  $('#progressBar').style.width='0%';
  $('#markPaperBtn').classList.remove('hidden');$('#paperSubmitBar').classList.remove('hidden');
  $('#finishPaperBtn').classList.add('hidden');
  showQuiz();renderPaper();
}
function questionCard(q,i,inner){
  return `<article class="paper-card" data-qid="${q.id}">
    <div class="paper-q-head"><span class="paper-q-num">${i+1}</span><h3 class="paper-q-text">${q.question}</h3></div>
    ${inner}
    <div class="paper-feedback hidden" data-fb></div>
  </article>`;
}
function renderPaper(){
  const box=$('#paperList');box.innerHTML='';
  if(state.mode==='typing'){
    box.insertAdjacentHTML('beforeend',`<p class="typing-hint">${t[lang].typingHint}</p>`);
  }
  state.items.forEach((q,i)=>{
    let inner='';
    if(state.mode==='choice'){
      const choices=state.choices[q.id];
      inner=`<div class="paper-choices">${choices.map((a,ci)=>`<button class="choice" type="button" data-qid="${q.id}" data-answer="${encodeURIComponent(a)}">${String.fromCharCode(65+ci)}. ${a}</button>`).join('')}</div>`;
    }else if(state.mode==='typing'){
      inner=`<textarea class="paper-input" rows="3" data-qid="${q.id}" placeholder="${t[lang].typeHere}"></textarea>`;
    }else{
      inner=`<div class="revision-block" data-qid="${q.id}">
        <button class="btn btn-outline show-answer-btn" type="button" data-qid="${q.id}">${t[lang].showAnswer}</button>
        <div class="answer-box hidden" data-answer-box>${q.answer}</div>
        <div class="revision-actions hidden" data-revision-actions>
          <button class="correct-btn" type="button" data-qid="${q.id}" data-remember="1">${t[lang].remembered}</button>
          <button class="wrong-btn" type="button" data-qid="${q.id}" data-remember="0">${t[lang].needsReview}</button>
        </div>
      </div>`;
    }
    box.insertAdjacentHTML('beforeend',questionCard(q,i,inner));
  });
  if(state.mode==='choice'){
    box.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{
      if(state.marked)return;
      const qid=b.dataset.qid;
      box.querySelectorAll(`.choice[data-qid="${qid}"]`).forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      state.answers[qid]=decodeURIComponent(b.dataset.answer);
      updatePaperProgress();
    });
  }else if(state.mode==='typing'){
    box.querySelectorAll('.paper-input').forEach(el=>el.oninput=()=>{
      state.answers[el.dataset.qid]=el.value;
      updatePaperProgress();
    });
  }else{
    box.querySelectorAll('.show-answer-btn').forEach(b=>b.onclick=()=>{
      const wrap=b.closest('.revision-block');
      wrap.querySelector('[data-answer-box]').classList.remove('hidden');
      wrap.querySelector('[data-revision-actions]').classList.remove('hidden');
      b.classList.add('hidden');
    });
    box.querySelectorAll('[data-remember]').forEach(b=>b.onclick=()=>{
      if(state.marked)return;
      const qid=b.dataset.qid,ok=b.dataset.remember==='1';
      state.revisionMarks[qid]=ok;
      const wrap=b.closest('.revision-block');
      wrap.querySelectorAll('[data-remember]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      updatePaperProgress();
    });
  }
  updatePaperProgress();
}
function answeredCount(){
  if(state.mode==='choice')return Object.keys(state.answers).length;
  if(state.mode==='typing')return Object.values(state.answers).filter(v=>v&&v.trim()).length;
  return Object.keys(state.revisionMarks).length;
}
function updatePaperProgress(){
  const total=state.items.length,done=answeredCount();
  $('#paperAnsweredCount').textContent=done;$('#paperTotalCount').textContent=total;
  $('#progressBar').style.width=(total?done/total*100:0)+'%';
}
function markPaper(){
  if(state.marked)return;
  state.marked=true;state.correct=0;state.wrong=0;state.typedDetail={};
  state.items.forEach(q=>{
    let ok=false,given=null;
    if(state.mode==='choice'){
      given=state.answers[q.id]||null;ok=given===q.answer;
    }else if(state.mode==='typing'){
      given=state.answers[q.id]||'';
      const g=gradeTyped(q,given);
      ok=g.ok;state.typedDetail[q.id]=g;
    }else{
      ok=state.revisionMarks[q.id]===true;given=state.revisionMarks[q.id];
    }
    ok?state.correct++:state.wrong++;
    addStat(ok);
    paintCardResult(q,ok,given);
  });
  $('#markPaperBtn').classList.add('hidden');
  $('#finishPaperBtn').classList.remove('hidden');
  $('#progressBar').style.width='100%';
  quiz.scrollIntoView({behavior:'smooth'});
}
function paintCardResult(q,ok,given){
  const card=$(`.paper-card[data-qid="${q.id}"]`);if(!card)return;
  card.classList.add(ok?'is-correct':'is-wrong');
  const fb=card.querySelector('[data-fb]');fb.classList.remove('hidden');
  if(state.mode==='choice'){
    card.querySelectorAll('.choice').forEach(b=>{
      b.classList.add('disabled');
      if(decodeURIComponent(b.dataset.answer)===q.answer)b.classList.add('correct');
      else if(decodeURIComponent(b.dataset.answer)===given)b.classList.add('wrong');
    });
    fb.textContent=ok?t[lang].correctMsg||'':`${t[lang].correctAnswerLabel}: ${q.answer}`;
    if(ok)fb.classList.add('hidden');
  }else if(state.mode==='typing'){
    const ta=card.querySelector('.paper-input');if(ta)ta.disabled=true;
    const detail=state.typedDetail[q.id]||{matched:[],missed:[]};
    let html=`<div><b>${t[lang].yourAnswer}:</b> ${given||t[lang].notAnswered}</div>`;
    if(!ok){
      html+=`<div class="fb-answer"><b>${t[lang].correctAnswerLabel}:</b> ${q.answer}</div>`;
      if(detail.missed.length)html+=`<div class="fb-missed"><b>${t[lang].missedPoints}:</b> ${detail.missed.join(' • ')}</div>`;
      if(detail.matched.length)html+=`<div class="fb-matched"><b>${t[lang].matchedPoints}:</b> ${detail.matched.join(' • ')}</div>`;
    }else if(detail.matched.length){
      html+=`<div class="fb-matched"><b>${t[lang].matchedPoints}:</b> ${detail.matched.join(' • ')}</div>`;
    }
    fb.innerHTML=html;
  }else{
    card.querySelectorAll('[data-remember]').forEach(b=>b.classList.add('disabled'));
    if(given===undefined){fb.textContent=t[lang].notReviewed;}
    else{fb.textContent=given?t[lang].rememberedMsg||'':`${t[lang].correctAnswerLabel}: ${q.answer}`;}
  }
}
$('#markPaperBtn').onclick=markPaper;
$('#finishPaperBtn').onclick=showResultPage;

function showResultPage(){
  const term=TERMS.find(x=>x.id===state.term);
  $('#resultSubject').textContent=`${state.topicName} • ${term?term[lang]:''} • ${modeNames[state.mode][lang]}`;
  $('#resultCorrect').textContent=state.correct;$('#resultWrong').textContent=state.wrong;$('#resultTotal').textContent=state.items.length;
  const p=state.items.length?Math.round(state.correct/state.items.length*100):0;$('#resultPercent').textContent=p+'%';
  $('#resultMessage').textContent=p>=90?t[lang].excellent:p>=70?t[lang].good:t[lang].needsWork;
  showResult();
}
function goHome(){setWizardStep('term');showHome()}
function resetProgress(){localStorage.removeItem('iusStats');updateStats()}

/* ---------- boot splash (portrait vs landscape video) ---------- */
function closeBootSplash(){
  const el=$('#bootSplash');if(!el||el.classList.contains('hide'))return;
  el.classList.add('hide');
  sessionStorage.setItem('iusBootSeen','1');
  setTimeout(()=>{el.style.display='none';
    $$('.boot-video').forEach(v=>{try{v.pause()}catch(e){}});
  },500);
}
function initBootSplash(){
  const el=$('#bootSplash');
  if(!el)return;
  if(sessionStorage.getItem('iusBootSeen')){el.style.display='none';return;}
  const portrait=window.matchMedia('(orientation: portrait)').matches;
  const activeVideo=$(portrait?'#bootVideoPortrait':'#bootVideoLandscape');
  const otherVideo=$(portrait?'#bootVideoLandscape':'#bootVideoPortrait');
  otherVideo.style.display='none';
  try{otherVideo.pause()}catch(e){}
  activeVideo.style.display='block';
  const playPromise=activeVideo.play();
  if(playPromise&&playPromise.catch)playPromise.catch(()=>closeBootSplash());
  activeVideo.addEventListener('ended',closeBootSplash);
  setTimeout(closeBootSplash,6000);
  $('#skipBoot').onclick=closeBootSplash;
}

/* ---------- cloud content merge (additive — never removes the built-in bank) ---------- */
async function mergeCloudContent(){
  if(!SITE_SCHOOL_ID)return;
  try{
    const cloudTerms=await getPublicTerms(SITE_SCHOOL_ID);
    for(const ct of cloudTerms){
      const localTerm=TERMS[(ct.sort_order||1)-1];
      if(!localTerm)continue;
      const topics=await getPublicTopicsForTerm(SITE_SCHOOL_ID,ct.id);
      for(const topic of topics){
        if(TOPIC_META.some(m=>m.subject===topic.subject))continue; // already have this subject (e.g. re-imported built-in set)
        TOPIC_META.push({code:topic.id,subject:topic.subject});
        if(!localTerm.topics.includes(topic.id))localTerm.topics.push(topic.id);
        const qs=await getPublicQuestions(SITE_SCHOOL_ID,topic.id);
        qs.forEach(q=>{
          QUESTIONS.push({id:'cloud-'+q.id,subject:topic.subject,question:q.question,answer:q.answer,acceptable:q.acceptable||[]});
        });
      }
    }
  }catch(e){
    console.warn('Cloud content failed to load — showing the built-in question bank only.',e);
  }
}
async function loadPublicPdfs(){
  if(!SITE_SCHOOL_ID)return;
  try{
    const pdfs=await listPdfsForSchool(SITE_SCHOOL_ID);
    if(!pdfs.length)return;
    const box=$('#pdfList');
    box.innerHTML=pdfs.map(p=>`<a class="pdf-item" href="${pdfPublicUrl(p.storage_path)}" target="_blank" rel="noopener">
       <span class="pdf-icon">▤</span><span><b>${p.title}</b>${p.subject?`<small>${p.subject}</small>`:''}</span>
     </a>`).join('');
    $('#pdfs').style.display='block';
  }catch(e){
    console.warn('PDF list failed to load.',e);
  }
}

/* ---------- bindings ---------- */
$('#langToggle').onclick=toggleLanguage;$('#footerLang').onclick=toggleLanguage;
$('#mobileMenu').onclick=()=>$('#mobileMenu').previousElementSibling.classList.toggle('open');
document.querySelectorAll('.main-nav a').forEach(a=>a.onclick=()=>$('.main-nav').classList.remove('open'));
$('#brandHome').onclick=e=>{e.preventDefault();goHome()};
$('#headerStart').onclick=openWizard;$('#heroStart').onclick=openWizard;$('#ctaStart').onclick=openWizard;$('#howStart').onclick=openWizard;
$('#backBtn').onclick=goHome;$('#resultHomeBtn').onclick=goHome;
$('#reviewPaperBtn').onclick=showQuiz;
$('#againBtn').onclick=()=>start(state.mode);
$('#resetProgressHome').onclick=resetProgress;
$('#year').textContent=new Date().getFullYear();

(async function init(){
  await mergeCloudContent();
  bindModeButtons();setWizardStep('term');applyLanguage();updateStats();initBootSplash();
  loadPublicPdfs();
})();
