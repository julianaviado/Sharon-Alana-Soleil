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
