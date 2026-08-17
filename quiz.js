/* ------------------------------------------------------------------
   Primary Pressure Pattern quiz
   25 statements, five categories, five statements each.
   Fixed mixed display order — never reshuffled per participant.
   Category labels and internal source numbers stay out of the DOM.
------------------------------------------------------------------- */
(function(){
  const root = document.getElementById('assess');
  if(!root) return;

  /* display order is intentional and fixed; `c` is the scoring category */
  const STATEMENTS = [
    {t:'When I make a mistake, I am harder on myself than I would be on someone else.', c:'achieve'},
    {t:'I say yes to things even when I don’t have the time or energy.', c:'give'},
    {t:'I tell people “I’m fine,” because I’d rather handle things alone than burden anyone.', c:'indep'},
    {t:'I replay conversations in my mind and wonder if I said or did the wrong thing.', c:'think'},
    {t:'I push myself until my body leaves me no choice but to slow down.', c:'extend'},
    {t:'I have a hard time saying no because I feel like I’m letting someone down.', c:'give'},
    {t:'Before making a decision, I replay every possible scenario that could go wrong.', c:'think'},
    {t:'I put pressure on myself to go above and beyond in almost everything I do.', c:'achieve'},
    {t:'I put off taking care of myself because something else always seems more urgent.', c:'extend'},
    {t:'I downplay my stress by telling myself, “It’s no big deal, I can handle it.”', c:'indep'},
    {t:'Even after making a decision, I wonder if I made the right choice.', c:'think'},
    {t:'When someone I care about has a problem, I immediately start thinking of ways to fix it.', c:'give'},
    {t:'Even when my body shows signs of physical exhaustion and tension, I keep pushing through.', c:'extend'},
    {t:'Even when others say I did a good job, I notice what I could have done better.', c:'achieve'},
    {t:'I handle things myself even when help would make it easier.', c:'indep'},
    {t:'I feel guilty relaxing when I think I should be getting something done.', c:'extend'},
    {t:'As soon as I reach a goal, I move on to the next without appreciating what I’ve accomplished.', c:'achieve'},
    {t:'I keep thinking about unresolved issues long after I should let them go.', c:'think'},
    {t:'I make sure others have what they need before thinking about what I need.', c:'give'},
    {t:'When someone offers to help, I say, “Thanks, but I’m good,” even when I could use the help.', c:'indep'},
    {t:'Even after a productive day, I feel like I should have done more.', c:'achieve'},
    {t:'I tell myself I’ll enjoy life more once things finally settle down.', c:'extend'},
    {t:'I’d rather do something myself than risk someone else not doing it the way I would.', c:'indep'},
    {t:'When someone I care about is upset or hurting, I feel responsible for helping them feel better.', c:'give'},
    {t:'I have a hard time making decisions because I keep doubting which choice is best.', c:'think'}
  ];

  const SCALE = [
    {label:'Never', v:1},
    {label:'Rarely', v:2},
    {label:'Sometimes', v:3},
    {label:'Often', v:4},
    {label:'Almost Always', v:5}
  ];

  /* pattern copy. `pressure` lines are the approved tie-breaker descriptions. */
  const PATTERNS = {
    achieve:{
      name:'Overachieving',
      field:'Overachieving',
      pressure:'Pressure to do more, achieve more, or make things better.',
      body:'You hold yourself to a standard you would never hand to anyone else. The work is genuinely good, which is part of why the bar keeps moving before you get a chance to stand still on it.',
      shift:'Presence here often begins with letting something be finished, and letting that count.'
    },
    give:{
      name:'Overgiving',
      field:'Overgiving',
      pressure:'Pressure to keep other people comfortable, satisfied, or okay.',
      body:'You are tuned to what everyone around you needs, often before they say it out loud. That care is real. The pattern is that your own needs keep waiting for a quieter moment that rarely comes.',
      shift:'Presence here often begins with letting your own name onto the list.'
    },
    indep:{
      name:'Overindependent',
      field:'Overindependent',
      pressure:'Pressure to handle things yourself and avoid needing help.',
      body:'Somewhere along the way, handling it alone became the safest option. It made you steady and reliable. It also means support can be sitting right beside you and still go unused.',
      shift:'Presence here often begins with letting one thing be shared.'
    },
    think:{
      name:'Overthinking',
      field:'Overthinking',
      pressure:'Pressure to anticipate problems, analyze possibilities, and make the best choice.',
      body:'Your mind works hard to keep you and the people you love safe from what could go wrong. The cost is that decisions stay open long after they are made, and rest keeps getting postponed.',
      shift:'Presence here often begins with letting a decision be decided.'
    },
    extend:{
      name:'Overextending',
      field:'Overextended',
      pressure:'Pressure to keep going beyond what your time and energy realistically allow.',
      body:'You keep going past the point your energy actually reaches, and you have gotten very good at making it work. Your body has usually been signalling for a while before anything slows down.',
      shift:'Presence here often begins with letting a limit be a limit.'
    }
  };
  const ORDER = ['give','achieve','think','extend','indep'];   /* the canonical order, matching the home page */

  /* ---------- state ---------- */
  const answers = new Array(STATEMENTS.length).fill(null);
  let index = 0;
  let locked = false;      // true during the advance animation, so a fast
                           // double-tap can't answer twice or skip a statement
  let primary = null;      // category key
  let tieChoice = null;    // category key when a tie-breaker was answered
  let tied = [];

  /* ---------- elements ---------- */
  const bar     = document.getElementById('qbar');
  const count   = document.getElementById('qcount');
  const stepQ   = document.getElementById('step-q');
  const stepTie = document.getElementById('step-tie');
  const stepCon = document.getElementById('step-contact');
  const stepRes = document.getElementById('step-result');
  const qtext   = document.getElementById('qtext');
  const qopts   = document.getElementById('qopts');
  const qback   = document.getElementById('qback');
  const tieopts = document.getElementById('tieopts');

  function show(el){
    [stepQ,stepTie,stepCon,stepRes].forEach(s=>{ if(s) s.hidden = s!==el; });
  }

  /* ---------- questions ---------- */
  function progress(){
    const answered = answers.filter(a=>a!==null).length;
    if(bar) bar.style.width = Math.round((answered/STATEMENTS.length)*100)+'%';
    if(count) count.textContent = 'Question '+(index+1)+' of '+STATEMENTS.length;
  }

  function renderQuestion(){
    show(stepQ);
    qtext.textContent = STATEMENTS[index].t;
    qopts.innerHTML = '';
    SCALE.forEach(opt=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qopt';
      b.setAttribute('role','radio');
      const chosen = answers[index] === opt.v;
      b.setAttribute('aria-checked', String(chosen));
      if(chosen) b.classList.add('on');
      b.innerHTML = '<span class="box"></span><span>'+opt.label+'</span>';
      b.addEventListener('click',()=>choose(opt.v));
      qopts.appendChild(b);
    });
    qback.disabled = index === 0;
    progress();
  }

  function choose(v){
    if(locked) return;
    locked = true;
    answers[index] = v;
    [...qopts.children].forEach(b=>{
      const on = b.textContent.trim() === SCALE.find(s=>s.v===v).label;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
    progress();
    setTimeout(()=>{
      locked = false;
      if(index < STATEMENTS.length-1){ index++; renderQuestion(); }
      else finishQuestions();
    }, 220);
  }

  qback.addEventListener('click',()=>{
    if(locked) return;
    if(index > 0){ index--; renderQuestion(); }
  });

  /* ---------- scoring ---------- */
  function scores(){
    const s = {achieve:0, give:0, indep:0, think:0, extend:0};
    STATEMENTS.forEach((st,i)=>{ s[st.c] += answers[i] || 0; });
    return s;
  }

  function finishQuestions(){
    const s = scores();
    const top = Math.max(...ORDER.map(k=>s[k]));
    tied = ORDER.filter(k=>s[k]===top);
    if(tied.length > 1){ renderTie(); }
    else { primary = tied[0]; show(stepCon); focusFirst(stepCon); }
  }

  /* ---------- tie-breaker ---------- */
  function renderTie(){
    show(stepTie);
    tieopts.innerHTML = '';
    tied.forEach(k=>{
      const p = PATTERNS[k];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qopt tie';
      b.setAttribute('role','radio');
      b.setAttribute('aria-checked','false');
      b.innerHTML = '<span class="box"></span><span><b>The '+p.name+' Pattern</b><i>'+p.pressure+'</i></span>';
      b.addEventListener('click',()=>{
        primary = k; tieChoice = k;
        [...tieopts.children].forEach(x=>{x.classList.remove('on');x.setAttribute('aria-checked','false');});
        b.classList.add('on'); b.setAttribute('aria-checked','true');
        setTimeout(()=>{ show(stepCon); focusFirst(stepCon); }, 220);
      });
      tieopts.appendChild(b);
    });
  }

  /* ---------- contact, then result ---------- */
  function focusFirst(step){
    const f = step.querySelector('input,button');
    if(f) f.focus();
  }

  const qform = document.getElementById('qform');
  if(qform){
    qform.addEventListener('submit',e=>{
      e.preventDefault();
      const name = document.getElementById('qname');
      const mail = document.getElementById('qemail');
      const note = document.getElementById('qnote');
      if(!name.value.trim()){
        name.setAttribute('aria-invalid','true');
        note.textContent = 'Please add your first name so your result can be addressed to you.';
        name.focus(); return;
      }
      name.removeAttribute('aria-invalid');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim())){
        mail.setAttribute('aria-invalid','true');
        note.textContent = 'That email looks incomplete. Check it and try again.';
        mail.focus(); return;
      }
      mail.removeAttribute('aria-invalid');
      note.textContent = '';
      renderResult(name.value.trim(), mail.value.trim());
    });
  }

  function renderResult(name, email){
    const s = scores();
    const p = PATTERNS[primary];

    /* payload shaped to the CRM fields this quiz maps to */
    const payload = {
      'Pressure Pattern Quiz – Primary Pattern': p.field,
      'Pressure Pattern Quiz – Tie-Breaker Selection': tieChoice ? PATTERNS[tieChoice].field : '',
      'Pressure Pattern Quiz – Overachieving Score': s.achieve,
      'Pressure Pattern Quiz – Overgiving Score': s.give,
      'Pressure Pattern Quiz – Overindependent Score': s.indep,
      'Pressure Pattern Quiz – Overthinking Score': s.think,
      'Pressure Pattern Quiz – Overextended Score': s.extend,
      firstName: name,
      email: email
    };
    root.dataset.result = JSON.stringify(payload);

    document.getElementById('r-hello').textContent = name + ', your primary pressure pattern is';
    document.getElementById('r-name').textContent = p.name;
    document.getElementById('r-pressure').textContent = p.pressure;
    document.getElementById('r-body').textContent = p.body;
    document.getElementById('r-shift').textContent = p.shift;
    document.getElementById('r-note').textContent =
      'The full breakdown is on its way to ' + email + '.';

    /* every category score, so nothing is hidden behind the headline result */
    const list = document.getElementById('r-scores');
    list.innerHTML = '';
    ORDER.forEach(k=>{
      const li = document.createElement('li');
      li.className = 'rscore' + (k===primary ? ' on' : '');
      li.innerHTML = '<span>'+PATTERNS[k].name+'</span><b>'+s[k]+'<i>/25</i></b>';
      list.appendChild(li);
    });

    const tieLine = document.getElementById('r-tie');
    if(tieChoice){
      tieLine.hidden = false;
      tieLine.textContent = 'Your scores tied, so this result reflects the pattern you chose as the one you feel most often right now.';
    } else {
      tieLine.hidden = true;
    }

    show(stepRes);
    stepRes.scrollIntoView({behavior:'smooth', block:'start'});
  }

  renderQuestion();
})();
