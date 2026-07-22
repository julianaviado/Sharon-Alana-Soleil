/* pressure pattern check */
(function(){
  const wrapEl=document.getElementById('stmts');
  if(!wrapEl) return;

  const statements=[
    {k:'think', t:'At 11pm I’m still replaying a conversation.'},
    {k:'think', t:'I’m kinder to a stranger than I am to myself.'},
    {k:'give', t:'My yes is out before I check if I have the room.'},
    {k:'give', t:'Everyone comes to me. I go to no one.'},
    {k:'achieve', t:'Rest is something I have to earn first.'},
    {k:'achieve', t:'I hit the goal. By that evening it has moved.'},
    {k:'extend', t:'I take on what I don’t have room for, then make it work.'},
    {k:'extend', t:'Once things calm down, I’ll make time for what matters.'},
    {k:'indep', t:'Asking for help feels harder than just doing it myself.'},
    {k:'indep', t:'I’m the one who holds it together. I don’t get to fall apart.'}
  ];
  const results={
    give:{ t:'Overgiving', q:'I’d rather be tired than let someone down.',
      b:'The generosity is real. The pattern is that your own name never makes the list. Somewhere along the way, being needed started doing the job that being known is supposed to do.',
      c:'<b>What it costs:</b> the energy for the people and passions you would actually choose.', n:'Start with The Power of Your Presence.', o:'The Power of Your Presence, 3 hours, one to one.'},
    achieve:{ t:'Overachieving', q:'I’ll relax after this next thing.',
      b:'The finish line has moved for so long you stopped expecting to reach it. You’re excellent at this. That’s why nobody has questioned it, including you.',
      c:'<b>What it costs:</b> the enjoyment of everything you already built.', n:'Your Present Paths tends to fit this one.', o:'Your Present Paths, 8 weeks, hybrid group.'},
    extend:{ t:'Overextending', q:'I’ll find a way. I always find a way.',
      b:'You take on what you don’t have room for, and then you make it work. You always do. Which is exactly why nobody treats the room you don’t have as real, including you.',
      c:'<b>What it costs:</b> the margin that would let you enjoy any of it.', n:'The Real MVP Mentorship is built for this.', o:'The Real MVP Mentorship, 12 months, one to one.'},
    think:{ t:'Overthinking', q:'I should have handled that better.',
      b:'The loudest voice in your life is the one nobody else can hear. It gets unlimited airtime and no supervision. You’d never speak to a friend this way.',
      c:'<b>What it costs:</b> your confidence in your own judgment, one small doubt at a time.', n:'Go With Your Flow Privé gets you out of the room.', o:'Go With Your Flow Privé, a private retreat.'},
    indep:{ t:'Over-independent', q:'I’ve got it. I always have.',
      b:'You learned early that the surest way not to be let down was to need no one. It made you dependable. It also made you alone in a way most people never notice, because you are so good at carrying it.',
      c:'<b>What it costs:</b> the support that is sitting right there, if you would let it in.', n:'Your Present Paths puts you back in a room of people.', o:'Your Present Paths, 8 weeks, hybrid group.'},
    all:{ t:'Over Syndrome™, all five at once', q:'Where did the time go?',
      b:'Overthinking, overgiving, overachieving, overextending, over-independent. Together. This is what most people call burnout right before they push through it again. Four ways of coping that each made sense alone, never meant to run at the same time.',
      c:'<b>What it costs:</b> the answer to “where did the time go?”', n:'Start with a call. We’ll find the first thread to pull.', o:'The What Matters Most Call, 30 minutes.'}
  };

  statements.forEach((s)=>{
    const b=document.createElement('button');
    b.className='stmt'; b.type='button'; b.setAttribute('aria-pressed','false'); b.dataset.k=s.k;
    b.innerHTML='<span class="box"></span><span>'+s.t+'</span>';
    b.addEventListener('click',()=>{
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')==='true'?'false':'true');
      tally();
    });
    wrapEl.appendChild(b);
  });

  const revealBtn=document.getElementById('reveal');
  const countEl=document.getElementById('count');
  const answerEl=document.getElementById('answer');

  function selected(){return [...document.querySelectorAll('.stmt[aria-pressed="true"]')]}
  function tally(){
    const n=selected().length;
    revealBtn.disabled = n===0;
    countEl.textContent = n===0 ? 'Nothing selected yet' : n+' of 10 selected';
    answerEl.classList.remove('show');
  }

  revealBtn.addEventListener('click',()=>{
    const counts={think:0,give:0,achieve:0,extend:0,indep:0};
    selected().forEach(s=>counts[s.dataset.k]++);
    const scored=Object.entries(counts).filter(([,v])=>v>0);
    const top=Math.max(...Object.values(counts));
    const leaders=scored.filter(([,v])=>v===top);
    const strongEverywhere = scored.length>=4 && top>=2;
    const key = strongEverywhere || leaders.length>2 ? 'all' : leaders[0][0];
    const d=results[key];
    document.getElementById('a-title').textContent=d.t;
    document.getElementById('a-quote').textContent='“'+d.q+'”';
    document.getElementById('a-body').textContent=d.b;
    document.getElementById('a-cost').innerHTML=d.c+' <span style="opacity:.7">Where to start: '+d.o+'</span>';
    document.getElementById('a-note').textContent=d.n;
    answerEl.classList.add('show');
    answerEl.scrollIntoView({behavior:'smooth',block:'center'});
  });
})();
