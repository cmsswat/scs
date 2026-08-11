/* reports.js — date-range sales / purchase / profit report */
document.addEventListener('DOMContentLoaded',()=>{
  if(!App.init('Reports','Sales, purchases and profit for any date range')) return;
  const from=document.getElementById('from'), to=document.getElementById('to');
  const d=new Date(); d.setDate(d.getDate()-30);
  from.value=d.toISOString().slice(0,10); to.value=Utils.today();

  function inRange(dt){ return (!from.value||dt>=from.value) && (!to.value||dt<=to.value); }

  function render(){
    const sales=DB.sales().filter(s=>inRange(s.date));
    const purchases=DB.purchases().filter(p=>inRange(p.date));
    const totalSales=sales.reduce((a,s)=>a+s.total,0);
    const totalProfit=sales.reduce((a,s)=>a+s.profit,0);
    const totalPurchase=purchases.reduce((a,p)=>a+p.qty*p.cost,0);
    const units=sales.reduce((a,s)=>a+s.items.reduce((b,i)=>b+i.qty,0),0);

    document.getElementById('cards').innerHTML=[
      ['green','💰',Utils.money(totalSales),'Sales in period'],
      ['orange','📈',Utils.money(totalProfit),'Profit in period'],
      ['blue','📥',Utils.money(totalPurchase),'Purchases in period'],
      ['blue','🧾',sales.length+' bills / '+units+' units','Invoices']
    ].map(([c,i,v,l])=>`<div class="stat ${c}"><div class="ic">${i}</div><div><b>${v}</b><small>${l}</small></div></div>`).join('');

    document.getElementById('salesTable').innerHTML = sales.length? `
      <table><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Discount</th><th>Total</th><th>Profit</th><th></th></tr></thead>
      <tbody>${sales.map(s=>`<tr><td>${s.id}</td><td>${Utils.date(s.date)}</td><td>${s.customer}</td>
        <td>${s.items.map(i=>i.name+' ×'+i.qty).join(', ')}</td><td>${Utils.money(s.discount)}</td>
        <td>${Utils.money(s.total)}</td><td>${Utils.money(s.profit)}</td>
        <td class="no-print"><a class="btn ghost sm" href="invoice/invoice.html?id=${s.id}">Invoice</a></td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No sales in this period.</div>';

    /* best selling products */
    const map={};
    sales.forEach(s=>s.items.forEach(i=>{ map[i.name]=map[i.name]||{qty:0,amount:0,profit:0};
      map[i.name].qty+=i.qty; map[i.name].amount+=i.qty*i.price; map[i.name].profit+=i.qty*(i.price-i.cost); }));
    const best=Object.entries(map).sort((a,b)=>b[1].qty-a[1].qty).slice(0,8);
    document.getElementById('bestTable').innerHTML = best.length? `
      <table><thead><tr><th>Product</th><th>Units sold</th><th>Sales</th><th>Profit</th></tr></thead>
      <tbody>${best.map(([n,v])=>`<tr><td>${n}</td><td>${v.qty}</td><td>${Utils.money(v.amount)}</td><td>${Utils.money(v.profit)}</td></tr>`).join('')}</tbody></table>`
      : '<div class="empty">No data.</div>';

    document.getElementById('exportBtn').onclick=()=>Utils.csv(
      [['Invoice','Date','Customer','Total','Profit']].concat(sales.map(s=>[s.id,s.date,s.customer,s.total,s.profit])),
      'sales-report.csv');
  }
  [from,to].forEach(el=>el.addEventListener('change',render));
  document.getElementById('printBtn').onclick=()=>window.print();
  render();
});
