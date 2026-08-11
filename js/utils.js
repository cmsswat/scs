/* utils.js — helpers shared by all pages */
const Utils = {
  id(prefix='ID'){ return prefix+'-'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*900+100); },
  today(){ const d=new Date(); return d.toISOString().slice(0,10); },
  money(n){ const s=DB.settings(); return s.currency+' '+Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:0}); },
  num(v){ const n=parseFloat(v); return isNaN(n)?0:n; },
  date(str){ if(!str) return '-'; const d=new Date(str); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); },
  toast(msg,type='ok'){
    let t=document.getElementById('toast');
    if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent=msg; t.className='show '+type;
    clearTimeout(this._t); this._t=setTimeout(()=>t.className='',2600);
  },
  stockTag(qty,low){
    if(qty<=0) return '<span class="tag out">Out of stock</span>';
    if(qty<=low) return '<span class="tag low">Low stock</span>';
    return '<span class="tag ok">In stock</span>';
  },
  csv(rows,filename){
    const csv=rows.map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=filename; a.click();
  }
};
