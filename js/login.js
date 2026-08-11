/* login.js */
document.addEventListener('DOMContentLoaded',()=>{
  DB.seed();
  const s=DB.settings();
  document.getElementById('shopName').textContent=s.shopName;
  if(DB.currentUser()) location.replace('dashboard.html');

  document.getElementById('loginForm').addEventListener('submit',e=>{
    e.preventDefault();
    const u=document.getElementById('username').value;
    const p=document.getElementById('password').value;
    const err=document.getElementById('error');
    if(!u||!p){ err.textContent='Please enter username and password.'; return; }
    if(DB.login(u,p)){ err.textContent=''; location.href='dashboard.html'; }
    else err.textContent='Invalid username or password.';
  });
});
