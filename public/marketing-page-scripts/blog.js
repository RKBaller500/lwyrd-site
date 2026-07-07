;(function(){
try{

  const nav=document.getElementById('nav');
  const header=nav||document.querySelector('header.nav');
  document.querySelectorAll('a[href="#"],a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  document.querySelector('.email-row').addEventListener('submit',e=>e.preventDefault());
  const blogSearch=document.getElementById('blogSearch');
  const blogEmpty=document.getElementById('blogEmpty');
  let activeFilter='all';
  function filterPosts(){
    const q=blogSearch.value.trim().toLowerCase();
    let any=false;
    document.querySelectorAll('.post-card').forEach(card=>{
      const category=card.dataset.category;
      const text=card.textContent.toLowerCase();
      const categoryMatch=activeFilter==='all'||category===activeFilter;
      const searchMatch=!q||text.includes(q);
      const show=categoryMatch&&searchMatch;
      card.style.display=show?'flex':'none';
      if(show)any=true;
    });
    blogEmpty.classList.toggle('show',!any);
  }
  blogSearch.addEventListener('input',filterPosts);
  document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter=btn.dataset.filter;
    filterPosts();
  }));


}catch(e){console.error("Marketing page script error (blog):", e);}
})();
