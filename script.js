/* entry screen: clear it once the sequence finishes, remember for this session */
(function(){
  const el=document.getElementById('preload'), root=document.documentElement;
  const done=()=>{root.classList.remove('preloading');if(el&&el.parentNode)el.remove();};
  if(!el||root.classList.contains('preloaded')){done();return;}
  try{sessionStorage.setItem('sas-entry','1');}catch(e){}
  el.addEventListener('animationend',e=>{if(e.animationName==='preload-out')done();});
  setTimeout(done,4200); /* safety net if the animation never fires */
})();

/* nav */
(function(){
  const h=document.querySelector('header'), t=document.getElementById('navtoggle');
  if(!h||!t) return;
  const close=()=>{h.classList.remove('open');t.setAttribute('aria-expanded','false');t.setAttribute('aria-label','Open menu');};
  t.addEventListener('click',()=>{
    const open=h.classList.toggle('open');
    t.setAttribute('aria-expanded',String(open));
    t.setAttribute('aria-label',open?'Close menu':'Open menu');
  });
  document.querySelectorAll('#navmenu a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&h.classList.contains('open')){close();t.focus();}
  });
  document.addEventListener('click',e=>{
    if(h.classList.contains('open')&&!h.contains(e.target)) close();
  });
  matchMedia('(min-width:981px)').addEventListener('change',e=>{if(e.matches) close();});
})();

/* scroll reveal */
(function(){
  const io = new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.14});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
})();

/* the header floats over the film hero and settles into its glass once the hero is past */
(function(){
  const hero=document.querySelector('.hero.has-video'), head=document.querySelector('header');
  if(!hero||!head) return;
  let queued=false;
  const flip=()=>{
    queued=false;
    /* the hero still sits under the bar while its bottom edge is below the bar */
    head.classList.toggle('on-hero',hero.getBoundingClientRect().bottom>head.offsetHeight);
  };
  const onScroll=()=>{ if(!queued){ queued=true; requestAnimationFrame(flip); } };
  flip();
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
})();

/* Hero film. Two clips take turns, and nothing loads until we know the visitor
   wants motion and can afford the bytes. The loop can always be stopped, since it
   runs past five seconds (WCAG 2.2.2) - the control is clipped until focused. */
(function(){
  const vids=[...document.querySelectorAll('.hero-video')], btn=document.getElementById('vidtoggle');
  if(!vids.length||!btn) return;
  const label=document.getElementById('vidlabel');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const conn=navigator.connection||navigator.webkitConnection||{};
  const thin=conn.saveData===true||/(^|-)2g$/.test(conn.effectiveType||'');
  let wired=false, at=0;

  function wire(){
    if(wired) return;
    const small=matchMedia('(max-width:700px)').matches;
    for(const v of vids){
      const add=(src,type)=>{const s=document.createElement('source');s.src=src;s.type=type;v.appendChild(s);};
      add(small?v.dataset.webmSmall:v.dataset.webm,'video/webm');
      add(small?v.dataset.mp4Small:v.dataset.mp4,'video/mp4');
      v.load();
    }
    wired=true;
  }
  function state(playing){
    btn.dataset.state=playing?'playing':'paused';
    label.textContent=playing?'Pause background':'Play background';
    btn.setAttribute('aria-label',playing?'Pause the background video':'Play the background video');
  }
  const playing=()=>btn.dataset.state==='playing';
  function run(i){
    vids.forEach((v,n)=>v.classList.toggle('is-on',n===i));
    const p=vids[i].play(); if(p&&p.catch) p.catch(()=>state(false));
    at=i;
  }
  function start(){ wire(); state(true); run(at); }
  function stop(){ vids.forEach(v=>v.pause()); state(false); }

  /* each clip hands over to the next as it finishes; the outgoing one rewinds and
     waits out the crossfade before it stops, so no half-faded still frame shows */
  vids.forEach((v,i)=>v.addEventListener('ended',()=>{
    if(!playing()) return;
    const next=(i+1)%vids.length;
    vids[next].currentTime=0;
    run(next);
    setTimeout(()=>{ if(at!==i){ v.pause(); v.currentTime=0; } },1200);
  }));

  let pref=null;
  try{ pref=sessionStorage.getItem('sas-herovid'); }catch(e){}
  if(pref==='off'||(pref!=='on'&&(reduce.matches||thin))) state(false); else start();

  btn.addEventListener('click',()=>{
    const on=playing();
    if(on) stop(); else start();
    try{ sessionStorage.setItem('sas-herovid',on?'off':'on'); }catch(e){}
  });
  reduce.addEventListener('change',e=>{ if(e.matches) stop(); });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) vids.forEach(v=>v.pause());
    else if(playing()) vids[at].play().catch(()=>{});
  });
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ if(playing()) vids[at].play().catch(()=>{}); }
    else vids.forEach(v=>v.pause());
  }),{threshold:.01}).observe(vids[0]);
})();

/* pattern cards: press one and it turns over to its shift line */
(function(){
  const cards=document.querySelectorAll('.pcard');
  if(!cards.length) return;
  cards.forEach(card=>{
    card.addEventListener('click',()=>{
      const open=card.getAttribute('aria-expanded')==='true';
      /* only one open at a time, so the row never reads as five separate answers */
      if(!open) cards.forEach(c=>c.setAttribute('aria-expanded','false'));
      card.setAttribute('aria-expanded',open?'false':'true');
    });
  });
})();

/* closing form */
(function(){
  const form=document.getElementById('form');
  if(!form) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const email=document.getElementById('email'), note=document.getElementById('formnote');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){
      email.setAttribute('aria-invalid','true');
      note.textContent='That email looks incomplete. Check it and send again.';
      email.focus(); return;
    }
    email.removeAttribute('aria-invalid');
    document.getElementById('submit').innerHTML='Sent';
    note.textContent='Got it. Sharon will send times to '+email.value.trim()+', usually within one business day.';
    email.disabled=true;
  });
})();

/* footer newsletter */
(function(){
  const form=document.getElementById('newsform');
  if(!form) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const email=document.getElementById('newsemail'), note=document.getElementById('newsnote');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){
      email.setAttribute('aria-invalid','true');
      note.textContent='That email looks incomplete. Check it and send again.';
      email.focus(); return;
    }
    email.removeAttribute('aria-invalid');
    document.getElementById('newssubmit').textContent='Joined';
    note.textContent='You’re in. The newsletter will land at '+email.value.trim()+'.';
    email.disabled=true;
  });
})();
