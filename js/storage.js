/* storage.js — all localStorage data access for Swat Computer Shop */
const DB = {
  keys:{products:'scs_products',purchases:'scs_purchases',sales:'scs_sales',settings:'scs_settings',user:'scs_user'},

  read(key,fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(e){ return fallback; } },
  write(key,val){ localStorage.setItem(key,JSON.stringify(val)); },

  /* ---- settings ---- */
  settings(){ return this.read(this.keys.settings,{
    shopName:'Swat Computer Shop', address:'Main Bazar, Mingora, Swat', phone:'0946-000000',
    currency:'Rs', lowStock:5, username:'admin', password:'admin123'
  });},
  saveSettings(s){ this.write(this.keys.settings,s); },

  /* ---- products ---- */
  products(){ return this.read(this.keys.products,[]); },
  saveProducts(p){ this.write(this.keys.products,p); },
  product(id){ return this.products().find(p=>p.id===id); },
  upsertProduct(prod){
    const list=this.products(); const i=list.findIndex(p=>p.id===prod.id);
    if(i>-1) list[i]=prod; else list.push(prod);
    this.saveProducts(list); return prod;
  },
  deleteProduct(id){ this.saveProducts(this.products().filter(p=>p.id!==id)); },

  /* ---- purchases ---- */
  purchases(){ return this.read(this.keys.purchases,[]); },
  addPurchase(p){
    const list=this.purchases(); list.unshift(p); this.write(this.keys.purchases,list);
    // update / create stock item
    const prods=this.products();
    const found=prods.find(x=>x.name.toLowerCase()===p.product.toLowerCase());
    if(found){
      found.qty+=p.qty; found.cost=p.cost; found.price=p.price; found.category=p.category||found.category;
    }else{
      prods.push({id:Utils.id('P'),name:p.product,category:p.category||'General',
        qty:p.qty,cost:p.cost,price:p.price,added:p.date});
    }
    this.saveProducts(prods); return p;
  },
  deletePurchase(id){ this.write(this.keys.purchases,this.purchases().filter(p=>p.id!==id)); },

  /* ---- sales ---- */
  sales(){ return this.read(this.keys.sales,[]); },
  addSale(sale){
    const list=this.sales(); list.unshift(sale); this.write(this.keys.sales,list);
    const prods=this.products();
    sale.items.forEach(it=>{ const p=prods.find(x=>x.id===it.id); if(p) p.qty=Math.max(0,p.qty-it.qty); });
    this.saveProducts(prods); return sale;
  },
  sale(id){ return this.sales().find(s=>s.id===id); },
  deleteSale(id){ this.write(this.keys.sales,this.sales().filter(s=>s.id!==id)); },

  /* ---- auth ---- */
  login(u,p){
    const s=this.settings();
    if(u.trim()===s.username && p===s.password){
      sessionStorage.setItem(this.keys.user,JSON.stringify({username:u,at:Date.now()}));
      return true;
    } return false;
  },
  currentUser(){ try{ return JSON.parse(sessionStorage.getItem(this.keys.user)); }catch(e){ return null; } },
  logout(){ sessionStorage.removeItem(this.keys.user); },

  /* ---- stats ---- */
  stats(){
    const s=this.settings(), products=this.products(), sales=this.sales(), purchases=this.purchases();
    const stockValue=products.reduce((a,p)=>a+p.qty*p.cost,0);
    const totalSales=sales.reduce((a,x)=>a+x.total,0);
    const totalProfit=sales.reduce((a,x)=>a+x.profit,0);
    const totalPurchase=purchases.reduce((a,x)=>a+x.qty*x.cost,0);
    const low=products.filter(p=>p.qty>0&&p.qty<=s.lowStock).length;
    const out=products.filter(p=>p.qty<=0).length;
    const today=Utils.today();
    const todaySales=sales.filter(x=>x.date===today).reduce((a,x)=>a+x.total,0);
    return {products:products.length,stockUnits:products.reduce((a,p)=>a+p.qty,0),
      stockValue,totalSales,totalProfit,totalPurchase,low,out,todaySales,invoices:sales.length};
  },

  /* ---- demo data (first run) ---- */
  seed(){
    if(localStorage.getItem(this.keys.products)) return;
    this.saveSettings(this.settings());
    const d=Utils.today();
    const items=[
      ['Dell Latitude Laptop','Laptop',6,52000,61000],
      ['HP 24" Monitor','Monitor',9,18000,22500],
      ['Kingston 8GB DDR4 RAM','RAM',14,4200,5500],
      ['Samsung 512GB SSD','SSD',11,6800,8500],
      ['Logitech Wireless Mouse','Accessories',22,1100,1650],
      ['Dell USB Keyboard','Accessories',4,1500,2200],
      ['HP LaserJet Printer','Printer',3,34000,39500],
      ['Sandisk 32GB USB',' Accessories',2,700,1100]
    ].map(([name,category,qty,cost,price])=>({id:Utils.id('P'),name,category:category.trim(),qty,cost,price,added:d}));
    this.saveProducts(items);
    this.write(this.keys.purchases,items.map(p=>({id:Utils.id('PU'),date:d,supplier:'Hayat Traders',
      product:p.name,category:p.category,qty:p.qty,cost:p.cost,price:p.price})));
    const sale={id:Utils.id('INV'),date:d,customer:'Walk-in Customer',phone:'',
      items:[{id:items[4].id,name:items[4].name,qty:2,price:items[4].price,cost:items[4].cost}],
      discount:0,total:items[4].price*2,profit:(items[4].price-items[4].cost)*2};
    this.write(this.keys.sales,[sale]);
  }
};
