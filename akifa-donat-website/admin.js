const PASS="akifa123";
const loginCard=document.getElementById("loginCard"), dashboard=document.getElementById("dashboard");
function loadDashboard(){
  const orders=JSON.parse(localStorage.getItem("akifaOrders")||"[]");
  document.getElementById("totalOrders").textContent=orders.length;
  document.getElementById("totalPacks").textContent=orders.reduce((s,o)=>s+Number(o.qty||0),0);
  document.getElementById("revenue").textContent="Rp"+orders.reduce((s,o)=>s+Number(o.total||0),0).toLocaleString("id-ID");
  document.getElementById("ordersBody").innerHTML=orders.length?orders.map(o=>`<tr><td><b>${o.id}</b><br>${o.createdAt||"-"}</td><td>${escapeHtml(o.customer)}<br>${escapeHtml(o.phone)}</td><td>${(o.flavors||[]).map(escapeHtml).join(", ")}</td><td>${o.qty}</td><td>Rp${Number(o.total).toLocaleString("id-ID")}</td><td><span class="status">${escapeHtml(o.status||"Menunggu")}</span></td></tr>`).join(""):'<tr><td colspan="6">Belum ada pesanan.</td></tr>';
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.getElementById("loginForm").addEventListener("submit",e=>{e.preventDefault();if(document.getElementById("password").value===PASS){loginCard.hidden=true;dashboard.hidden=false;loadDashboard();}else document.getElementById("loginError").textContent="Kata sandi belum benar.";});
document.getElementById("logout").addEventListener("click",()=>{dashboard.hidden=true;loginCard.hidden=false;document.getElementById("password").value="";});
document.getElementById("clearOrders").addEventListener("click",()=>{if(confirm("Yakin ingin menghapus semua pesanan di browser ini?")){localStorage.removeItem("akifaOrders");loadDashboard();}});
