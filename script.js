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
  matchMedia('(min-width:1100px)').addEventListener('change',e=>{if(e.matches) close();});
})();

/* scroll reveal */
(function(){
  const io = new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.14});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
})();

/* the hero film. A <video> picks its source once and never re-picks, so a phone
   turned sideways would otherwise keep playing the portrait clip stretched across
   a landscape frame. This watches the breakpoint and swaps the file instead.
   Nothing is fetched under reduced motion - the poster is the whole hero there. */
(function(){
  const vid=document.getElementById('herofilm');
  if(!vid) return;
  const CLIPS={
    small:{src:'assets/videos/laughing-beach-wheelchair',poster:'assets/videos/hero-tall-poster.webp'},
    large:{src:'assets/videos/beach-hugging-wheelchair', poster:'assets/videos/hero-wide-poster.webp'}
  };
  const wide=matchMedia('(min-width:701px)');
  const still=matchMedia('(prefers-reduced-motion: reduce)');
  let at=null;

  const load=()=>{
    const key=wide.matches?'large':'small';
    if(key===at) return;
    at=key;
    const clip=CLIPS[key];
    vid.poster=clip.poster;
    if(still.matches){ vid.removeAttribute('src'); vid.load(); return; }
    /* webm first where it is understood, mp4 for everyone else */
    vid.innerHTML='';
    for(const [ext,type] of [['webm','video/webm'],['mp4','video/mp4']]){
      const s=document.createElement('source');
      s.src=`${clip.src}.${ext}`; s.type=type;
      vid.appendChild(s);
    }
    vid.preload='auto';
    vid.load();
    /* autoplay can still be refused; the poster stays up if it is */
    const go=vid.play();
    if(go&&go.catch) go.catch(()=>{});
  };

  load();
  wide.addEventListener('change',load);
  still.addEventListener('change',()=>{ at=null; load(); });
})();

/* the header floats over the film hero and settles into its glass once it is past */
(function(){
  const hero=document.querySelector('.hero.has-film'), head=document.querySelector('header');
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

/* on timing: while the tall section passes, each third of the scroll lights one line.
   with reduced motion the CSS unpins the pane and shows all three, so we stay out. */
(function(){
  const sec=document.getElementById('timing');
  if(!sec) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lines=[...sec.querySelectorAll('.stack-line')];
  if(!lines.length) return;
  let queued=false, at=-1, flat=false;

  /* the pinned pane is one viewport tall, so if the longest line needs more room
     than that we unpin the whole thing rather than clip a word off the end */
  const fit=()=>{
    sec.classList.remove('static');
    const room=innerHeight-40;
    const tall=Math.max(...lines.map(l=>l.getBoundingClientRect().height));
    flat=tall>room;
    if(flat){
      sec.classList.add('static');
      lines.forEach(l=>l.classList.remove('is-on'));
      at=-1;
    }
  };

  const step=()=>{
    queued=false;
    if(flat) return;
    const r=sec.getBoundingClientRect();
    const travel=r.height-innerHeight;
    /* 0 as the pane pins, 1 as it lets go */
    const p=travel>0?Math.min(Math.max(-r.top/travel,0),1):0;
    const i=Math.min(Math.floor(p*lines.length),lines.length-1);
    if(i===at) return;
    at=i;
    lines.forEach((l,n)=>l.classList.toggle('is-on',n===i));
  };
  const onScroll=()=>{ if(!queued){ queued=true; requestAnimationFrame(step); } };
  const remeasure=()=>{ fit(); step(); };
  remeasure();
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',remeasure);
  /* the lines can change height after this runs - the webfont lands, the window
     turns, the reader scales the text up - so re-measure whenever they do */
  if(window.ResizeObserver){
    let first=true;
    new ResizeObserver(()=>{ if(first){first=false;return;} remeasure(); }).observe(lines[lines.length-1]);
  }
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(remeasure);
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
    note.textContent='Got it. Your note is on its way to '+email.value.trim()+'.';
    email.disabled=true;
  });
})();

/* footer contact form. Client side checks only - it still needs an endpoint on the
   form before anything actually leaves the page. */
(function(){
  const form=document.getElementById('contactform');
  if(!form) return;
  const status=document.getElementById('cf-status');
  const fields=[
    {el:document.getElementById('cf-name'),   msg:'Please add your name.'},
    {el:document.getElementById('cf-email'),  msg:'That email looks incomplete. Check it and send again.',
     ok:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)},
    {el:document.getElementById('cf-message'),msg:'Let me know what you would like to talk about.'}
  ];
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    for(const f of fields){
      const v=f.el.value.trim();
      const good = v && (f.ok ? f.ok(v) : true);
      if(!good){
        f.el.setAttribute('aria-invalid','true');
        status.textContent=f.msg;
        f.el.focus();
        return;
      }
      f.el.removeAttribute('aria-invalid');
    }
    document.getElementById('cf-submit').textContent='Sent';
    status.textContent='Thank you, '+fields[0].el.value.trim()+'. Your message is on its way.';
    fields.forEach(f=>f.el.disabled=true);
  });
})();
