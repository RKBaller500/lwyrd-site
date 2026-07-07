;(function(){
try{

  const nav=document.getElementById('nav');
  const header=nav||document.querySelector('header.nav');
  document.querySelectorAll('a[href="#"],a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  let activeScrollFrame=0;
  function smoothScrollTo(targetY,duration=650){
    if(activeScrollFrame)cancelAnimationFrame(activeScrollFrame);
    const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(reduce){window.scrollTo({top:targetY,left:0,behavior:'auto'});return;}
    const start=window.scrollY,dist=targetY-start,t0=performance.now();
    function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
    function step(now){
      const p=Math.min((now-t0)/duration,1);
      window.scrollTo({top:start+dist*ease(p),left:0,behavior:'auto'});
      if(p<1)activeScrollFrame=requestAnimationFrame(step);
      else activeScrollFrame=0;
    }
    activeScrollFrame=requestAnimationFrame(step);
  }
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(a=>{
    a.addEventListener('click',e=>{
      const target=document.querySelector(a.getAttribute('href'));
      if(!target)return;
      e.preventDefault();
      header.classList.remove('nav-menu-open');
      const offset=(nav?.offsetHeight||0)+18;
      const y=target.getBoundingClientRect().top+window.scrollY-offset;
      smoothScrollTo(Math.max(0,y));
    });
  });
  const scrollArrow=document.getElementById('scrollArrow');
  if(scrollArrow){
    scrollArrow.setAttribute('role','button');
    scrollArrow.setAttribute('tabindex','0');
    scrollArrow.setAttribute('aria-label','Scroll to the journey section');
    const scrollToJourney=()=>{
      const target=document.getElementById('journey');
      if(!target)return;
      const offset=(nav?.offsetHeight||0)+18;
      const y=target.getBoundingClientRect().top+window.scrollY-offset;
      smoothScrollTo(Math.max(0,y));
    };
    scrollArrow.addEventListener('click',scrollToJourney);
    scrollArrow.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();scrollToJourney();}
    });
  }

  const segments=[...document.querySelectorAll('[data-seg]')];
  const openSegment=seg=>{
    segments.forEach(s=>{
      const open=s===seg;
      s.classList.toggle('is-open',open);
      s.setAttribute('aria-expanded',open?'true':'false');
    });
  };
  segments.forEach(seg=>{
    seg.addEventListener('pointerenter',()=>openSegment(seg));
    seg.addEventListener('mouseover',()=>openSegment(seg));
    seg.addEventListener('focus',()=>openSegment(seg));
    seg.addEventListener('click',()=>openSegment(seg));
    seg.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openSegment(seg);}
    });
  });

  document.querySelectorAll('.qa button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const qa=btn.parentElement;
      const open=qa.classList.contains('open');
      document.querySelectorAll('.qa').forEach(q=>{q.classList.remove('open');q.querySelector('button').setAttribute('aria-expanded','false');});
      if(!open){qa.classList.add('open');btn.setAttribute('aria-expanded','true');}
    });
  });

  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv, .rv-seq').forEach(el=>io.observe(el));

  /* ---------- full-bleed hero maze ---------- */
  (function(){
    const box=document.getElementById('heroMaze');
    if(!box)return;
    box.replaceChildren();
    const NS='http://www.w3.org/2000/svg';
    const REDUCE=matchMedia('(prefers-reduced-motion:reduce)').matches;
    const NAVY='#002B55';
    const el=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};

    // small seeded PRNG so the maze (and therefore the path) is identical every load
    function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
    function makeMaze(cols,rows,rng){
      const c=[];
      for(let r=0;r<rows;r++){const row=[];for(let x=0;x<cols;x++)row.push({n:1,e:1,s:1,w:1,v:0});c.push(row);}
      const dirs=[['n',-1,0],['s',1,0],['e',0,1],['w',0,-1]],opp={n:'s',s:'n',e:'w',w:'e'};
      let cur=[0,0];c[0][0].v=1;let cnt=1;const tot=cols*rows,st=[];
      while(cnt<tot){
        const [r,x]=cur;
        const nb=dirs.filter(([d,dr,dx])=>{const nr=r+dr,nx=x+dx;return nr>=0&&nr<rows&&nx>=0&&nx<cols&&!c[nr][nx].v;});
        if(nb.length){const [d,dr,dx]=nb[(rng()*nb.length)|0];const nr=r+dr,nx=x+dx;
          c[r][x][d]=0;c[nr][nx][opp[d]]=0;c[nr][nx].v=1;cnt++;st.push(cur);cur=[nr,nx];}
        else cur=st.pop();
      }
      return {cols,rows,c};
    }
    function solve(m,s,g){
      const {cols,c}=m,key=(r,x)=>r*cols+x,prev=new Map();
      const q=[s];prev.set(key(s[0],s[1]),null);
      const dirs=[['n',-1,0],['s',1,0],['e',0,1],['w',0,-1]];
      while(q.length){const [r,x]=q.shift();if(r===g[0]&&x===g[1])break;
        for(const [d,dr,dx] of dirs){if(c[r][x][d])continue;const nr=r+dr,nx=x+dx,k=key(nr,nx);if(prev.has(k))continue;prev.set(k,[r,x]);q.push([nr,nx]);}}
      const path=[];let cu=g;while(cu){path.push(cu);cu=prev.get(key(cu[0],cu[1]));}
      return path.reverse();
    }
    function wallsD(m,s){
      let d='';const {cols,rows,c}=m;
      for(let r=0;r<rows;r++)for(let x=0;x<cols;x++){
        const px=x*s,py=r*s;
        if(c[r][x].n)d+=`M${px} ${py}h${s}`;
        if(c[r][x].w)d+=`M${px} ${py}v${s}`;
        if(x===cols-1&&c[r][x].e)d+=`M${px+s} ${py}v${s}`;
        if(r===rows-1&&c[r][x].s)d+=`M${px} ${py+s}h${s}`;
      }
      return d;
    }
    const pts=(p,s)=>p.map(([r,x])=>[x*s+s/2,r*s+s/2]);
    const dStr=p=>p.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join('');

    function travel(pathEl,dotEl,trailEl,o){
      o=o||{};const len=pathEl.getTotalLength();
      const dur=o.dur||3400,delay=o.delay||0;
      trailEl.style.strokeDasharray=`0 ${len}`;trailEl.style.strokeDashoffset=0;
      if(REDUCE){trailEl.style.strokeDasharray=`${len} ${len}`;trailEl.style.strokeDashoffset=0;const p=pathEl.getPointAtLength(len);dotEl.setAttribute('cx',p.x);dotEl.setAttribute('cy',p.y);dotEl.style.opacity=1;o.onArrive&&o.onArrive();return;}
      let s0=null;
      function fr(ts){
        if(s0===null)s0=ts+delay;
        const e=ts-s0;
        if(e<0)return requestAnimationFrame(fr);
        const t=Math.min(e/dur,1);
        const te=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;   // easeInOut: gentle slow finish
        const p=pathEl.getPointAtLength(len*te);
        dotEl.setAttribute('cx',p.x);dotEl.setAttribute('cy',p.y);dotEl.style.opacity=1;
        const head=len*te;
        const maxLit=len*.52;
        const tail=Math.max(0,head-maxLit);
        trailEl.style.strokeDasharray=`${Math.max(0.1,head-tail)} ${len}`;
        trailEl.style.strokeDashoffset=-tail;
        if(t<1)requestAnimationFrame(fr);
        else o.onArrive&&o.onArrive();
      }
      requestAnimationFrame(fr);
    }

    const cols=26,rows=12,s=54,W=cols*s,H=rows*s;
    const m=makeMaze(cols,rows,mulberry32(4997));   // fixed seed: a long maze route that wraps once around the page into the button
    const cta=document.getElementById('heroCta');

    const arrow=document.getElementById('scrollArrow');
    const spineTrack=document.getElementById('spineTrack');

    // project between the sliced maze SVG space and the screen (xMidYMid slice crops on the wide axis)
    function proj(){const bx=box.getBoundingClientRect();const scale=Math.max(bx.width/W,bx.height/H);
      return {bx,scale,offX:(bx.width-W*scale)/2,offY:(bx.height-H*scale)/2};}
    function svgToScreen(sx,sy){const {bx,scale,offX,offY}=proj();return [bx.left+offX+sx*scale,bx.top+offY+sy*scale];}
    function screenXToCol(x){const {bx,scale,offX}=proj();const svgX=(x-bx.left-offX)/scale;
      return Math.max(1,Math.min(cols-2,Math.round((svgX-s/2)/s)));}

    // the whole point: the hero path exits straight DOWN the maze column that lines up with the spine,
    // so the maze, the arrow, and the spine all share one vertical axis (no diagonals, nothing floating).
    let railX;
    {const r=spineTrack?spineTrack.getBoundingClientRect():null;const bx=box.getBoundingClientRect();
     railX=(r&&(r.width||r.height))?(r.left+r.width/2):(bx.left+bx.width*0.12);}
    const exitCol=screenXToCol(railX);
    const exX=exitCol*s+s/2;               // svg x of the exit column (the shared axis)
    const grow=rows-2;                     // land the arrow a little above the hero's bottom edge

    function carve(a,b){const c=m.c;const [r,x]=a,[nr,nx]=b;
      if(nr===r-1){c[r][x].n=0;c[nr][nx].s=0;}else if(nr===r+1){c[r][x].s=0;c[nr][nx].n=0;}
      else if(nx===x-1){c[r][x].w=0;c[nr][nx].e=0;}else if(nx===x+1){c[r][x].e=0;c[nr][nx].w=0;}}
    const wrng=mulberry32(97);
    const startR=Math.max(1,grow-4);       // enter close to the arrow: keep the path short and on the left
    const cur={r:startR,c:0};
    let cells=[[cur.r,cur.c]];
    const push=()=>cells.push([cur.r,cur.c]);
    // advance `prim` toward target one cell at a time, throwing perpendicular teeth of random depth
    function weaveEdge(prim,target,perp,base,perpDir,maxDepth){
      const step=Math.sign(target-cur[prim]),startVal=cur[prim];
      if(step===0){while(cur[perp]!==base){cur[perp]-=perpDir;push();}return;}
      while(cur[prim]!==target){
        const done=Math.abs(cur[prim]-startVal),rem=Math.abs(target-cur[prim]);
        const depth=(done<2||rem<2)?0:(1+((wrng()*maxDepth)|0));
        for(let k=0;k<depth;k++){cur[perp]+=perpDir;push();}
        let adv=1+((wrng()*3)|0);
        for(let k=0;k<adv&&cur[prim]!==target;k++){cur[prim]+=step;push();}
        while(cur[perp]!==base){cur[perp]-=perpDir;push();}
        let adv2=2+((wrng()*3)|0);
        for(let k=0;k<adv2&&cur[prim]!==target;k++){cur[prim]+=step;push();}
      }
      while(cur[perp]!==base){cur[perp]-=perpDir;push();}
    }
    const jog=Math.min(cols-2,exitCol+4);      // a small excursion to the right, staying on the left side
    weaveEdge('c',jog,'r',startR,+1,2);        // enter and weave a few cells right
    weaveEdge('r',grow-1,'c',jog,+1,1);        // drop down a little, dipping right
    weaveEdge('c',exitCol,'r',grow-1,-1,1);    // come back to the exit column
    weaveEdge('r',grow,'c',exitCol,+1,1);      // final short drop straight into the arrow
    for(let i=0;i<cells.length-1;i++)carve(cells[i],cells[i+1]);   // open the walls along the route
    for(let r=grow;r<rows-1;r++)carve([r,exitCol],[r+1,exitCol]);   // continue the arrow column into a real maze exit
    m.c[rows-1][exitCol].s=0;                  // open the outside wall so the arrow points through an actual exit
    let P=pts(cells,s);
    P.unshift([-s*0.7,P[0][1]]);          // enter from off the left edge
    const gp=[exX,grow*s+s/2];            // the light lands here: the exit column, dead centre of the arrow
    P.push(gp);                            // final leg is pure vertical (same x as the last cell), no diagonal

    // pin the arrow, the connecting stub, and the spine's rail to the exact axis where the path lands
    const stub=document.getElementById('exitStub');
    (function alignAxis(){
      const heroSec=document.querySelector('.hero'),spine=document.getElementById('spine');
      const [ax,ay]=svgToScreen(exX,grow*s+s/2);   // ay = the landing point / arrow centre
      if(heroSec){
        const hr=heroSec.getBoundingClientRect(),localX=ax-hr.left;
        if(arrow){arrow.style.left=localX+'px';arrow.style.bottom=((hr.bottom-ay)-27)+'px';}   // centre the 54px arrow on the landing
        if(stub){                                   // a guide line from just below the arrow down to the hero's edge
          const topFromHero=(ay-hr.top)+27;
          stub.style.left=localX+'px';stub.style.top=topFromHero+'px';stub.style.height=Math.max(0,hr.height-topFromHero)+'px';
        }
      }
      if(spine){const sr=spine.getBoundingClientRect();
        spine.style.setProperty('--rail',Math.max(6,ax-sr.left)+'px');}   // spine line continues straight below the arrow
    })();
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,preserveAspectRatio:'xMidYMid slice'});
    const f=el('filter',{id:'heroGlow',x:'-90%',y:'-90%',width:'280%',height:'280%'});
    f.innerHTML='<feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>';
    svg.appendChild(f);
    // vivid colored glow gradient for the destination
    const grad=el('radialGradient',{id:'glowGrad'});
    grad.innerHTML='<stop offset="0%" stop-color="#DCEEFF" stop-opacity="0.98"/><stop offset="24%" stop-color="#6BAAF0" stop-opacity="0.8"/><stop offset="55%" stop-color="#2E77D0" stop-opacity="0.4"/><stop offset="100%" stop-color="#2E77D0" stop-opacity="0"/>';
    svg.appendChild(grad);
    svg.appendChild(el('path',{class:'mz-walls',d:wallsD(m,s)}));
    const trail=el('path',{class:'mz-sol',d:dStr(P)});svg.appendChild(trail);
    // destination: colored glow halo (behind), ripple rings, hot core
    const glow=el('circle',{cx:gp[0],cy:gp[1],r:6,fill:'url(#glowGrad)'});glow.style.opacity='0';svg.appendChild(glow);
    const rings=[0,1,2].map(()=>{const r=el('circle',{cx:gp[0],cy:gp[1],fill:'none',stroke:'#4F94E0','stroke-width':1.6,r:4});r.style.opacity='0';svg.appendChild(r);return r;});
    const dot=el('circle',{r:5,fill:NAVY,filter:'url(#heroGlow)'});dot.style.opacity=0;svg.appendChild(dot);
    box.appendChild(svg);

    // brief arrival flash where the light reaches the button, then the light dissolves
    function arriveFlash(){
      trail.style.stroke='#5D9BE8';trail.style.strokeWidth='3';   // the line brightens as it lands
      if(REDUCE){glow.style.opacity='0';return;}
      const t0=performance.now();
      (function b(now){
        const e=now-t0;
        dot.style.opacity=String(Math.max(0,1-e/200));   // the arriving dot dissolves into the button
        let gr,go;
        if(e<260){const k=e/260;gr=6+40*(1-Math.pow(1-k,3));go=0.9*k;}
        else{const k=Math.min((e-260)/420,1);gr=46*(1-k)+8;go=0.9*(1-k);}
        glow.setAttribute('r',gr.toFixed(1));glow.style.opacity=go.toFixed(3);
        if(e<700)requestAnimationFrame(b);
        else{glow.style.opacity='0';}
      })(performance.now());
      rings.forEach(r=>r.style.opacity='0');
    }

    // keep the maze in place; only the solved blue route dissolves after arrival.
    function revealArrow(){
      trail.style.transition='opacity .9s ease,stroke .5s ease,stroke-width .5s ease';
      trail.style.opacity='0';
      if(arrow)arrow.classList.add('show');
      if(stub)stub.classList.add('show');
    }

    function onArrive(){arriveFlash();revealArrow();}
    travel(trail,dot,trail,{dur:4200,delay:450,onArrive:onArrive});
  })();

  /* ---------- the spine draws in on scroll; dots light in sequence ---------- */
  (function(){
    const spine=document.getElementById('spine');
    const track=document.getElementById('spineTrack');
    const beam=document.getElementById('spineBeam');
    if(!spine||!track||!beam)return;
    const REDUCE=matchMedia('(prefers-reduced-motion:reduce)').matches;
    const nodes=[...spine.querySelectorAll('[data-node]')];
    const stub=document.getElementById('exitStub'),stubBeam=document.getElementById('exitStubBeam');
    function litArrow(){spine.classList.add('arr-lit');}
    if(REDUCE){                                   // no scroll animation: draw the whole line, light everything
      beam.style.height=track.getBoundingClientRect().height+'px';
      if(stub&&stubBeam)stubBeam.style.height=stub.getBoundingClientRect().height+'px';
      nodes.forEach(n=>n.classList.add('lit'));litArrow();return;
    }
    let ticking=false;
    function update(){
      ticking=false;
      const anchor=window.innerHeight*0.62;       // the light reaches this line on screen as you scroll
      // the connecting stub fills first (it sits above the spine), so the blue beam reads as one continuous line
      if(stub&&stubBeam){const sr=stub.getBoundingClientRect();
        stubBeam.style.height=Math.max(0,Math.min(sr.height,anchor-sr.top))+'px';}
      const tr=track.getBoundingClientRect();
      let h=Math.max(0,Math.min(tr.height,anchor-tr.top));
      beam.style.height=h+'px';
      nodes.forEach(n=>{                           // a dot lights once the beam passes it, and stays lit
        const dr=n.querySelector('.node-dot').getBoundingClientRect();
        if((dr.top+dr.height/2 - tr.top)<=h) n.classList.add('lit');
      });
      if(h>=tr.height-2) litArrow();
    }
    function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update);}}
    update();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
  })();

  /* ---------- on-ramp: pre-route the intake to the chosen track ---------- */
  (function(){
    const btn=document.getElementById('getMatched'),sel=document.getElementById('trackSelect');
    if(!btn||!sel)return;
    btn.addEventListener('click',e=>{
      e.preventDefault();
      const t=sel.value;
      window.location.href=t?('/intake?track='+t):'/intake';   // no selection -> generic intake
    });
  })();

  /* ---------- stats count up when the proof node comes into view ---------- */
  (function(){
    const REDUCE=matchMedia('(prefers-reduced-motion:reduce)').matches;
    const nums=[...document.querySelectorAll('.node-stats .n')];
    if(!nums.length)return;
    const parsed=nums.map(el=>{
      const m=el.textContent.trim().match(/^(\D*)([\d.]+)(.*)$/);   // prefix, number, suffix (e.g. $ 10 M+)
      return m?{el,pre:m[1],target:parseFloat(m[2]),suf:m[3]}:null;
    });
    if(REDUCE)return;   // leave the final values in place
    nums.forEach(el=>{el.style.fontVariantNumeric='tabular-nums';});
    parsed.forEach(p=>{if(p)p.el.textContent=p.pre+'0'+p.suf;});
    let done=false;
    function run(){
      if(done)return;done=true;
      const DUR=2400,t0=performance.now();
      (function fr(now){
        const k=Math.min((now-t0)/DUR,1),e=1-Math.pow(1-k,3);   // easeOutCubic
        parsed.forEach(p=>{if(!p)return;
          const v=Math.round(p.target*e);
          p.el.textContent=p.pre+v+p.suf;
        });
        if(k<1)requestAnimationFrame(fr);
      })(t0);
    }
    const target=document.querySelector('.node-stats');
    const io=new IntersectionObserver((ents)=>{
      ents.forEach(en=>{if(en.isIntersecting){run();io.disconnect();}});
    },{threshold:.4});
    io.observe(target);
  })();


}catch(e){console.error("Marketing page script error (home):", e);}
})();
