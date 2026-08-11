/* sale.js — point of sale: add items to a bill, auto total & profit */
document.addEventListener('DOMContentLoaded',()=>{
  if(!App.init('New Sale','Create a bill and print the invoice')) return;
  let cart=[];
  const sel=document.getElementById('productSel');

  function loadProducts(){
    const list=DB.products().filter(p=>p.qty>0);
    sel.innerHTML='<option value="">— select product —</option>'+
      list.map(p=>`<option value="${p.id}">${p.name} (${p.qty} in stock • ${Utils.money(p.price)})</option>`).join('');
  }
  loadProducts();
  document.getElementById('date').value=Utils.today();

  document.getElementById('addItem').onclick=()=>{
    const p=DB.product(sel.value);
    const qty=Utils.num(document.getElementById('itemQty').value);
    if(!p){ Utils.toast('Select a product first.','err'); return; }
    if(qty<=0){ Utils.toast('Enter a valid quantity.','err'); return; }
    const inCart=cart.find(c=>c.id===p.id);
    if((inCart?inCart.qty:0)+qty>p.qty){ Utils.toast('Only '+p.qty+' units in stock.','err'); return; }
    if(inCart) inCart.qty+=qty;
    else cart.push({id:p.id,name:p.name,qty,price:p.price,cost:p.cost});
    document.getElementById('itemQty').value=1; sel.value='';
    renderCart();
  };

  function totals(){
    const sub=cart.reduce((a,i)=>a+i.qty*i.price,0);
    const discount=Utils.num(document.getElementById('discount').value);
    const total=Math.max(0,sub-discount);
    const profit=cart.reduce((a,i)=>a+i.qty*(i.price-i.cost),0)-discount;
    return {sub,discount,total,profit};
  }

  function renderCart(){
    const t=totals();
    document.getElementById('cart').innerHTML = cart.length? `
      <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Amount</th><th></th></tr></thead>
      <tbody>${cart.map((i,x)=>`<tr><td>${i.name}</td><td>${i.qty}</td><td>${Utils.money(i.price)}</td>
        <td>${Utils.money(i.qty*i.price)}</td><td><button class="btn red sm" data-rm="${x}">✕</button></td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No items in this bill yet.</div>';
    document.getElementById('sub').textContent=Utils.money(t.sub);
    document.getElementById('total').textContent=Utils.money(t.total);
    document.getElementById('profit').textContent=Utils.money(t.profit);
    document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ cart.splice(+b.dataset.rm,1); renderCart(); });
  }
  document.getElementById('discount').addEventListener('input',renderCart);
  renderCart();

  document.getElementById('saveSale').onclick=()=>{
    if(!cart.length){ Utils.toast('Add at least one item.','err'); return; }
    const t=totals();
    const sale={ id:Utils.id('INV'), date:document.getElementById('date').value||Utils.today(),
      customer:document.getElementById('customer').value.trim()||'Walk-in Customer',
      phone:document.getElementById('phone').value.trim(),
      items:cart, discount:t.discount, total:t.total, profit:t.profit };
    DB.addSale(sale);
    cart=[]; document.getElementById('discount').value=0;
    document.getElementById('customer').value=''; document.getElementById('phone').value='';
    loadProducts(); renderCart(); renderSales();
    Utils.toast('Sale saved. Invoice '+sale.id);
    if(confirm('Sale saved. Open printable invoice now?')) location.href='invoice/invoice.html?id='+sale.id;
  };

  function renderSales(){
    const list=DB.sales().slice(0,10);
    document.getElementById('salesList').innerHTML = list.length? `
      <table><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Profit</th><th></th></tr></thead>
      <tbody>${list.map(x=>`<tr><td>${x.id}</td><td>${Utils.date(x.date)}</td><td>${x.customer}</td>
        <td>${x.items.reduce((a,i)=>a+i.qty,0)}</td><td>${Utils.money(x.total)}</td><td>${Utils.money(x.profit)}</td>
        <td><a class="btn ghost sm" href="invoice/invoice.html?id=${x.id}">Invoice</a></td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No sales yet.</div>';
  }
  renderSales();
});
