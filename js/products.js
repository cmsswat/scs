/* products.js — stock list, search, edit, delete */
document.addEventListener('DOMContentLoaded',()=>{
  if(!App.init('Product Stock','Search, update and monitor your inventory')) return;
  const s=DB.settings();
  const search=document.getElementById('search'), cat=document.getElementById('catFilter'), stat=document.getElementById('statusFilter');

  const cats=[...new Set(DB.products().map(p=>p.category))].sort();
  cat.innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${c}</option>`).join('');

  function filtered(){
    const q=search.value.toLowerCase();
    return DB.products().filter(p=>{
      if(q && !(p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))) return false;
      if(cat.value && p.category!==cat.value) return false;
      if(stat.value==='low' && !(p.qty>0&&p.qty<=s.lowStock)) return false;
      if(stat.value==='out' && p.qty>0) return false;
      if(stat.value==='ok' && p.qty<=s.lowStock) return false;
      return true;
    });
  }

  function render(){
    const list=filtered();
    document.getElementById('summary').textContent=
      `${list.length} product(s) • ${list.reduce((a,p)=>a+p.qty,0)} units • stock value ${Utils.money(list.reduce((a,p)=>a+p.qty*p.cost,0))}`;
    document.getElementById('table').innerHTML = list.length? `
      <table><thead><tr><th>Product</th><th>Category</th><th>Qty</th><th>Cost</th><th>Sale price</th>
      <th>Profit / unit</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${list.map(p=>`<tr>
        <td><b>${p.name}</b></td><td>${p.category}</td><td>${p.qty}</td>
        <td>${Utils.money(p.cost)}</td><td>${Utils.money(p.price)}</td><td>${Utils.money(p.price-p.cost)}</td>
        <td>${Utils.stockTag(p.qty,s.lowStock)}</td>
        <td><button class="btn ghost sm" data-edit="${p.id}">Edit</button>
            <button class="btn red sm" data-del="${p.id}">Delete</button></td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No products match your search.</div>';

    document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
      if(confirm('Delete this product from stock?')){ DB.deleteProduct(b.dataset.del); render(); Utils.toast('Product deleted.'); }});
    document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEdit(b.dataset.edit));
  }

  function openEdit(id){
    const p=DB.product(id); if(!p) return;
    document.getElementById('editBox').style.display='block';
    document.getElementById('eid').value=p.id;
    document.getElementById('ename').value=p.name;
    document.getElementById('ecat').value=p.category;
    document.getElementById('eqty').value=p.qty;
    document.getElementById('ecost').value=p.cost;
    document.getElementById('eprice').value=p.price;
    document.getElementById('editBox').scrollIntoView({behavior:'smooth'});
  }
  document.getElementById('cancelEdit').onclick=()=>document.getElementById('editBox').style.display='none';
  document.getElementById('editForm').addEventListener('submit',e=>{
    e.preventDefault();
    const p=DB.product(document.getElementById('eid').value); if(!p) return;
    p.name=document.getElementById('ename').value.trim()||p.name;
    p.category=document.getElementById('ecat').value.trim()||p.category;
    p.qty=Utils.num(document.getElementById('eqty').value);
    p.cost=Utils.num(document.getElementById('ecost').value);
    p.price=Utils.num(document.getElementById('eprice').value);
    DB.upsertProduct(p); document.getElementById('editBox').style.display='none';
    render(); Utils.toast('Product updated.');
  });

  document.getElementById('exportBtn').onclick=()=>{
    const rows=[['Product','Category','Qty','Cost','Sale price','Profit/unit']]
      .concat(filtered().map(p=>[p.name,p.category,p.qty,p.cost,p.price,p.price-p.cost]));
    Utils.csv(rows,'product-stock.csv');
  };
  [search,cat,stat].forEach(el=>el.addEventListener('input',render));
  render();
});
