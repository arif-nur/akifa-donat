const PRODUCTS = [
  ["Donat Keju","Taburan keju melimpah.","✦","ChatGPT Image Nov 14, 2026, 05_01_51 AM.png"],
  ["Donat Oreo","Krim dan remahan Oreo.","●","ChatGPT Image Nov 14, 2026, 05_01_19 AM.png"],
  ["Donat Greentea","Glaze greentea yang khas.","✦","ChatGPT Image Nov 14, 2026, 05_02_04 AM.png"],
  ["Donat Red Velvet","Tampilan merah yang menggoda.","●","ChatGPT Image Nov 14, 2026, 05_02_13 AM.png"],
  ["Donat Tiramisu","Perpaduan krim dan cokelat.","✦","ChatGPT Image Nov 14, 2026, 05_02_19 AM.png"],
  ["Donat Blueberry","Glaze blueberry yang manis.","●","ChatGPT Image Nov 14, 2026, 05_02_28 AM.png"],
  ["Donat Taro","Glaze taro berwarna ungu.","✦","ChatGPT Image Nov 14, 2026, 05_02_35 AM.png"],
  ["Donat Strawberry","Rasa stroberi yang manis.","●","ChatGPT Image Nov 14, 2026, 05_02_41 AM.png"],
  ["Donat Meses","Taburan meses cokelat.","✦","ChatGPT Image Nov 14, 2026, 05_02_48 AM.png"],
  ["Donat Chococrunchy","Cokelat dengan topping crunchy.","●","ChatGPT Image Nov 14, 2026, 05_02_55 AM.png"]
];
const PRICE = 10000;
const WA_NUMBER = "6281578444386";
const grid = document.getElementById("productGrid");
const dialog = document.getElementById("orderDialog");

grid.innerHTML = PRODUCTS.map((p,i)=>`
  <article class="product-card">
    <div class="product-visual"><img src="image/${encodeURIComponent(p[3])}" alt="${p[0]}" loading="lazy"></div>
    <h3>${p[0]}</h3><p>${p[1]}</p>
    <div class="product-meta"><strong>Bagian dari paket</strong><button type="button" data-flavor="${i}">Pilih ↗</button></div>
  </article>`).join("");

const selectOptions = PRODUCTS.map(p=>`<option>${p[0]}</option>`).join("");
document.querySelectorAll('.flavor-fields select').forEach(el=>el.innerHTML=selectOptions);

function showOrder(index=null){
  if(index!==null){
    const chosen = PRODUCTS[index][0];
    const first = dialog.querySelector('[name="flavor1"]');
    first.value = chosen;
  }
  dialog.showModal();
}
document.getElementById("openOrder").addEventListener("click",()=>showOrder());
grid.addEventListener("click",e=>{
  const btn=e.target.closest("[data-flavor]");
  if(btn) showOrder(Number(btn.dataset.flavor));
});
document.getElementById("closeOrder").addEventListener("click",()=>dialog.close());
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("navMenu").classList.toggle("open"));
document.querySelectorAll("#navMenu a").forEach(a=>a.addEventListener("click",()=>document.getElementById("navMenu").classList.remove("open")));

const qtyInput=document.querySelector('[name="qty"]');
qtyInput.addEventListener("input",()=>document.getElementById("orderTotal").textContent=
  "Rp"+(Math.max(1,Number(qtyInput.value)||1)*PRICE).toLocaleString("id-ID"));

document.getElementById("orderForm").addEventListener("submit",e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  const qty=Math.max(1,Number(f.get("qty"))||1);
  const order={
    id:"AKF-"+Date.now(),
    customer:f.get("customer"), phone:f.get("phone"), qty,
    flavors:[f.get("flavor1"),f.get("flavor2"),f.get("flavor3")],
    note:f.get("note"), total:qty*PRICE,
    createdAt:new Date().toLocaleString("id-ID"),
    status:"Menunggu"
  };
  const orders=JSON.parse(localStorage.getItem("akifaOrders")||"[]");
  orders.unshift(order);
  localStorage.setItem("akifaOrders",JSON.stringify(orders));
  const message=[
    "Halo Akifa Donat, saya mau pesan:",
    `Nama: ${order.customer}`,
    `No. WhatsApp: ${order.phone}`,
    `Jumlah paket: ${qty}`,
    `Varian: ${order.flavors.join(", ")}`,
    `Total: Rp${order.total.toLocaleString("id-ID")}`,
    `Catatan: ${order.note||"-"}`,
    `Kode pesanan: ${order.id}`
  ].join("\n");
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`,"_blank");
  dialog.close();
  e.currentTarget.reset();
  document.getElementById("orderTotal").textContent="Rp10.000";
});
