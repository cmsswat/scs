/* app.js — layout, auth guard, navigation (loaded on every inner page) */
const NAV = [
  {href:'dashboard.html',ico:'🏠',label:'Dashboard'},
  {href:'purchase.html',ico:'📥',label:'Purchase Products'},
  {href:'products.html',ico:'📦',label:'Product Stock'},
  {href:'sale.html',ico:'🧾',label:'New Sale'},
  {href:'reports.html',ico:'📊',label:'Reports'},
  {href:'settings.html',ico:'⚙️',label:'Settings'}
];

const App = {
  init(pageTitle,subtitle){
    DB.seed();
    const user=DB.currentUser();
    if(!user){ location.replace('index.html'); return null; }
    this.renderSidebar();
    this.renderTopbar(pageTitle,subtitle,user);
    return user;
  },
  renderSidebar(){
    const s=DB.settings(), here=location.pathname.split('/').pop()||'dashboard.html';
    const el=document.getElementById('sidebar'); if(!el) return;
    el.innerHTML=`
      <div class="brand">
        <img src="images/logo.png" alt="Shop logo">
        <div><h1>${s.shopName}</h1><span>Management System</span></div>
      </div>
      <nav class="nav">
        ${NAV.map(n=>`<a href="${n.href}" class="${here===n.href?'active':''}"><span class="ico">${n.ico}</span>${n.label}</a>`).join('')}
      </nav>
      <div class="logout nav"><a href="#" id="logoutBtn"><span class="ico">🚪</span>Logout</a></div>`;
    document.getElementById('logoutBtn').onclick=e=>{ e.preventDefault(); DB.logout(); location.replace('index.html'); };
  },
  renderTopbar(title,subtitle,user){
    const el=document.getElementById('topbar'); if(!el) return;
    el.innerHTML=`<div><h2>${title}</h2><p>${subtitle||''}</p></div>
      <div class="user-chip"><img src="images/avatar.png" alt="User avatar">
        <div><b>${user.username}</b><br><small>${Utils.date(Utils.today())}</small></div></div>`;
  }
};
