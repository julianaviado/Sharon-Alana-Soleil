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
