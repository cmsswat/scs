/* settings.js */
document.addEventListener('DOMContentLoaded',()=>{
  if(!App.init('Settings','Shop details, login and data')) return;
  const s=DB.settings();
  ['shopName','address','phone','currency','lowStock','username','password'].forEach(k=>{
    const el=document.getElementById(k); if(el) el.value=s[k];
  });
  document.getElementById('shopForm').addEventListener('submit',e=>{
    e.preventDefault(); const n=DB.settings();
    n.shopName=document.getElementById('shopName').value.trim()||n.shopName;
    n.address=document.getElementById('address').value.trim();
    n.phone=document.getElementById('phone').value.trim();
    n.currency=document.getElementById('currency').value.trim()||'Rs';
    n.lowStock=Utils.num(document.getElementById('lowStock').value)||5;
    DB.saveSettings(n); App.renderSidebar(); Utils.toast('Settings saved.');
  });
  document.getElementById('userForm').addEventListener('submit',e=>{
    e.preventDefault(); const n=DB.settings();
    const u=document.getElementById('username').value.trim(), p=document.getElementById('password').value;
    if(!u||!p){ Utils.toast('Username and password required.','err'); return; }
    n.username=u; n.password=p; DB.saveSettings(n); Utils.toast('Login updated.');
  });
  document.getElementById('resetBtn').onclick=()=>{
    if(!confirm('Delete all products, purchases and sales from this browser?')) return;
    Object.values(DB.keys).forEach(k=>localStorage.removeItem(k));
    DB.seed(); Utils.toast('Data reset to sample data.'); setTimeout(()=>location.reload(),800);
  };
});
