/* purchase.js — buy stock, auto profit calculation */
document.addEventListener('DOMContentLoaded',()=>{
  if(!App.init('Purchase Products','Add new stock and see profit per unit automatically')) return;
  const f=document.getElementById('purchaseForm');
  document.getElementById('date').value=Utils.today();

  const calc=()=>{
    const cost=Utils.num(document.getElementById('cost').value);
    const price=Utils.num(document.getElementById('price').value);
    const qty=Utils.num(document.getElementById('qty').value);
    document.getElementById('unitProfit').textContent=Utils.money(price-cost);
    document.getElementById('totalCost').textContent=Utils.money(cost*qty);
    document.getElementById('expProfit').textContent=Utils.money((price-cost)*qty);
  };
  ['cost','price','qty'].forEach(id=>document.getElementById(id).addEventListener('input',calc));
  calc();

  f.addEventListener('submit',e=>{
    e.preventDefault();
    const p={ id:Utils.id('PU'), date:document.getElementById('date').value||Utils.today(),
      supplier:document.getElementById('supplier').value.trim()||'Unknown supplier',
      product:document.getElementById('product').value.trim(),
      category:document.getElementById('category').value,
      qty:Utils.num(document.getElementById('qty').value),
      cost:Utils.num(document.getElementById('cost').value),
      price:Utils.num(document.getElementById('price').value) };
    if(!p.product||p.qty<=0||p.cost<=0||p.price<=0){ Utils.toast('Fill product, quantity, cost and sale price.','err'); return; }
    if(p.price<p.cost && !confirm('Sale price is lower than cost. Save anyway?')) return;
    DB.addPurchase(p);
    Utils.toast('Purchase saved and stock updated.');
    f.reset(); document.getElementById('date').value=Utils.today(); calc(); render();
  });

  function render(){
    const list=DB.purchases();
    document.getElementById('purchaseList').innerHTML = list.length? `
      <table><thead><tr><th>#</th><th>Date</th><th>Product</th><th>Supplier</th><th>Qty</th>
      <th>Cost</th><th>Sale price</th><th>Expected profit</th><th></th></tr></thead>
      <tbody>${list.map(p=>`<tr><td>${p.id}</td><td>${Utils.date(p.date)}</td><td>${p.product}</td>
        <td>${p.supplier}</td><td>${p.qty}</td><td>${Utils.money(p.cost)}</td><td>${Utils.money(p.price)}</td>
        <td>${Utils.money((p.price-p.cost)*p.qty)}</td>
        <td><button class="btn red sm" data-del="${p.id}">Delete</button></td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No purchases recorded yet.</div>';
    document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
      if(confirm('Delete this purchase record? (stock is not reduced)')){ DB.deletePurchase(b.dataset.del); render(); Utils.toast('Purchase deleted.'); }
    });
  }
  render();
});
