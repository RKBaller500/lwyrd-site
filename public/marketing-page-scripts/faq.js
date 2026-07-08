;(function(){
try{

  const nav=document.getElementById('nav');
  const header=nav||document.querySelector('header.nav');
  document.querySelectorAll('a[href="#"],a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

  /* accordion: one open at a time */
  function closeQa(qa){
    const ans=qa.querySelector('.ans');
    const btn=qa.querySelector('button');
    ans.style.height=ans.scrollHeight+'px';
    ans.offsetHeight;
    qa.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    requestAnimationFrame(()=>{ans.style.height='0px';});
  }
  function openQa(qa){
    const ans=qa.querySelector('.ans');
    const btn=qa.querySelector('button');
    qa.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    ans.style.height='0px';
    ans.offsetHeight;
    requestAnimationFrame(()=>{ans.style.height=ans.scrollHeight+'px';});
    ans.addEventListener('transitionend',function done(e){
      if(e.propertyName==='height'&&qa.classList.contains('open'))ans.style.height='auto';
      ans.removeEventListener('transitionend',done);
    });
    setTimeout(()=>{if(qa.classList.contains('open'))ans.style.height='auto';},300);
  }
  document.querySelectorAll('.qa button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const qa=btn.parentElement;
      if(qa.classList.contains('open'))closeQa(qa);else openQa(qa);
    });
  });

  /* smooth scroll for category jump links */
  let raf=0;
  function smoothTo(y,d=560){
    if(raf)cancelAnimationFrame(raf);
    if(matchMedia('(prefers-reduced-motion:reduce)').matches){window.scrollTo(0,y);return;}
    const s=window.scrollY,dist=y-s,t0=performance.now();
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const step=n=>{const p=Math.min((n-t0)/d,1);window.scrollTo(0,s+dist*ease(p));if(p<1)raf=requestAnimationFrame(step);else raf=0;};
    raf=requestAnimationFrame(step);
  }
  const sideLinks=[...document.querySelectorAll('#sideNav a')];
  sideLinks.forEach(a=>a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(!t)return;e.preventDefault();
    smoothTo(Math.max(0,t.getBoundingClientRect().top+window.scrollY-90));
  }));

  /* highlight active category on scroll */
  const groups=[...document.querySelectorAll('.faq-group[id]')];
  const spy=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        const id=en.target.id;
        sideLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));
      }
    });
  },{rootMargin:'-20% 0px -70% 0px',threshold:0});
  groups.forEach(g=>spy.observe(g));


}catch(e){console.error("Marketing page script error (faq):", e);}
})();
