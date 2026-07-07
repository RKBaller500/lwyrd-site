;(function(){
try{

  const nav=document.getElementById('nav');
  const header=nav||document.querySelector('header.nav');
  document.querySelectorAll('a[href="#"],a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

  /* ---------- booking scheduler ---------- */
  (function(){
    const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const TODAY=new Date(2026,6,6);            // reference "today"
    TODAY.setHours(0,0,0,0);
    const MIN=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);
    const MAXV=new Date(TODAY.getFullYear(),TODAY.getMonth()+3,1); // book up to 3 months out

    let view=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);
    let selDate=null,selTime=null;

    const grid=document.getElementById('calGrid');
    const title=document.getElementById('calTitle');
    const prev=document.getElementById('calPrev');
    const next=document.getElementById('calNext');
    const timesHead=document.getElementById('timesHead');
    const timesList=document.getElementById('timesList');
    const selectedEl=document.getElementById('bkSelected');
    const confirm=document.getElementById('bkConfirm');
    const main=document.getElementById('bkMain');
    const whenEl=document.getElementById('bkWhen');

    function sameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
    function isAvailable(d){
      if(d<TODAY)return false;
      const dow=d.getDay();
      if(dow===0||dow===6)return false;        // weekdays only
      return (d.getDate()*7+d.getMonth())%5!==0; // a few days fully booked
    }
    function slotsFor(d){
      const base=['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:30 AM','1:00 PM','1:30 PM','2:30 PM','3:30 PM','4:00 PM'];
      const seed=d.getDate()+d.getMonth();
      return base.filter((s,i)=>(seed+i)%3!==0);
    }
    function fmtDate(d){return DOW[d.getDay()]+', '+MONTHS[d.getMonth()].slice(0,3)+' '+d.getDate();}

    function renderCal(){
      title.textContent=MONTHS[view.getMonth()]+' '+view.getFullYear();
      prev.disabled=(view.getFullYear()===MIN.getFullYear()&&view.getMonth()===MIN.getMonth());
      next.disabled=(view.getFullYear()===MAXV.getFullYear()&&view.getMonth()===MAXV.getMonth());
      let html='';
      DOW.forEach(d=>html+='<div class="cal-dow">'+d[0]+'</div>');
      const first=new Date(view.getFullYear(),view.getMonth(),1);
      const start=first.getDay();
      const days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
      for(let i=0;i<start;i++)html+='<div class="cal-day pad"></div>';
      for(let day=1;day<=days;day++){
        const d=new Date(view.getFullYear(),view.getMonth(),day);
        let cls='cal-day';
        if(isAvailable(d))cls+=' avail';else cls+=' off';
        if(sameDay(d,TODAY))cls+=' today';
        if(sameDay(d,selDate))cls+=' sel';
        html+='<button type="button" class="'+cls+'" data-day="'+day+'">'+day+'</button>';
      }
      grid.innerHTML=html;
      grid.querySelectorAll('.cal-day.avail').forEach(btn=>{
        btn.addEventListener('click',()=>{
          selDate=new Date(view.getFullYear(),view.getMonth(),+btn.dataset.day);
          selTime=null;
          renderCal();renderTimes();updateFoot();
        });
      });
    }

    function renderTimes(){
      if(!selDate){
        timesHead.textContent='Select a date';
        timesList.innerHTML='<p class="times-empty">Pick an available day on the calendar to see open times.</p>';
        return;
      }
      timesHead.innerHTML='Times for <span>'+fmtDate(selDate)+'</span>';
      const slots=slotsFor(selDate);
      if(!slots.length){
        timesList.innerHTML='<p class="times-empty">No open times this day. Try another date.</p>';
        return;
      }
      timesList.innerHTML=slots.map(s=>'<button type="button" class="time-slot'+(s===selTime?' sel':'')+'" data-time="'+s+'">'+s+'</button>').join('');
      timesList.querySelectorAll('.time-slot').forEach(btn=>{
        btn.addEventListener('click',()=>{
          selTime=btn.dataset.time;
          renderTimes();updateFoot();
        });
      });
    }

    function updateFoot(){
      if(selDate&&selTime){
        selectedEl.classList.remove('empty');
        selectedEl.innerHTML='<strong>'+fmtDate(selDate)+'</strong> at <strong>'+selTime+'</strong>';
        confirm.disabled=false;
      }else{
        selectedEl.classList.add('empty');
        selectedEl.textContent='No time selected yet';
        confirm.disabled=true;
      }
    }

    prev.addEventListener('click',()=>{if(prev.disabled)return;view=new Date(view.getFullYear(),view.getMonth()-1,1);renderCal();});
    next.addEventListener('click',()=>{if(next.disabled)return;view=new Date(view.getFullYear(),view.getMonth()+1,1);renderCal();});
    confirm.addEventListener('click',()=>{
      if(!selDate||!selTime)return;
      whenEl.textContent=fmtDate(selDate)+' at '+selTime;
      main.classList.add('done');
    });
    document.getElementById('bkAgain').addEventListener('click',e=>{
      e.preventDefault();
      main.classList.remove('done');
    });

    renderCal();renderTimes();updateFoot();
  })();


}catch(e){console.error("Marketing page script error (consultations):", e);}
})();
