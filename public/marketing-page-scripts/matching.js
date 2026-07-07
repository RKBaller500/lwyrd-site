;(function(){
try{

  const nav=document.getElementById('nav');
  const header=nav||document.querySelector('header.nav');
  document.querySelectorAll('a[href="#"],a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));

  /* ---------- track-switchable intake mockup ---------- */
  (function(){
    const sel=document.getElementById('trkSel');
    const opts=document.getElementById('intakeOpts');
    if(!sel||!opts)return;
    const tracks={
      startup:['Formation &amp; structure','IP &amp; trademarks','Fundraising &amp; securities','Employment &amp; equity','Commercial contracts'],
      smb:['Formation &amp; restructuring','Commercial contracts','Employment law','IP &amp; licensing','Disputes &amp; litigation'],
      individual:['Family law','Estate planning &amp; wills','Real estate','Immigration','Personal injury']
    };
    const order=['startup','smb','individual'];
    let cur='startup',userActed=false,timer=null;
    function paint(trk){
      sel.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.trk===trk));
      opts.style.opacity='0';
      setTimeout(()=>{
        opts.innerHTML=tracks[trk].map(x=>'<span class="chip">'+x+'</span>').join('')+'<span class="chip chip-more">and more</span>';
        opts.style.opacity='1';
      },150);
      cur=trk;
    }
    sel.querySelectorAll('button').forEach(b=>{
      b.addEventListener('click',()=>{userActed=true;if(timer){clearInterval(timer);timer=null;}paint(b.dataset.trk);});
    });
    paint('startup');
    const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!reduce){
      timer=setInterval(()=>{
        if(userActed){clearInterval(timer);timer=null;return;}
        paint(order[(order.indexOf(cur)+1)%order.length]);
      },3200);
    }
  })();


}catch(e){console.error("Marketing page script error (matching):", e);}
})();
