/* dashboard.js */
document.addEventListener('DOMContentLoaded',()=>{
  if(!App.init('Dashboard','Overview of stock, sales and profit')) return;
  const st=DB.stats(), s=DB.settings();

  document.getElementById('stats').innerHTML=[
    ['blue','📦',st.products+' items','Total products'],
    ['green','💰',Utils.money(st.totalSales),'Total sales'],
    ['orange','📈',Utils.money(st.totalProfit),'Total profit'],
    ['blue','🏷️',Utils.money(st.stockValue),'Stock value'],
    ['green','🧾',st.invoices+' invoices','Bills created'],
    ['orange','📥',Utils.money(st.totalPurchase),'Total purchases'],
    ['red','⚠️',st.low+' items','Low stock (≤'+s.lowStock+')'],
    ['green','🗓️',Utils.money(st.todaySales),"Today's sales"]
  ].map(([c,i,v,l])=>`<div class="stat ${c}"><div class="ic">${i}</div><div><b>${v}</b><small>${l}</small></div></div>`).join('');

  const sales=DB.sales().slice(0,6);
  document.getElementById('recentSales').innerHTML = sales.length? `
    <table><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Total</th><th>Profit</th><th></th></tr></thead>
    <tbody>${sales.map(x=>`<tr><td>${x.id}</td><td>${Utils.date(x.date)}</td><td>${x.customer}</td>
      <td>${Utils.money(x.total)}</td><td>${Utils.money(x.profit)}</td>
      <td><a class="btn ghost sm" href="invoice/invoice.html?id=${x.id}">Invoice</a></td></tr>`).join('')}</tbody></table>`
    : '<div class="empty">No sales yet. Create your first sale.</div>';

  const low=DB.products().filter(p=>p.qty<=s.lowStock).sort((a,b)=>a.qty-b.qty).slice(0,6);
  document.getElementById('lowStock').innerHTML = low.length? `
    <table><thead><tr><th>Product</th><th>Qty</th><th>Status</th></tr></thead>
    <tbody>${low.map(p=>`<tr><td>${p.name}</td><td>${p.qty}</td><td>${Utils.stockTag(p.qty,s.lowStock)}</td></tr>`).join('')}</tbody></table>`
    : '<div class="empty">All products have healthy stock 👍</div>';
});
