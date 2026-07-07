;(function(){
try{

  const nav=document.getElementById('nav');
  const header=nav||document.querySelector('header.nav');
  document.querySelectorAll('a[href="#"],a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  document.querySelector('.contact-form').addEventListener('submit',e=>e.preventDefault());


}catch(e){console.error("Marketing page script error (contact):", e);}
})();
