
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// KONFIGURASI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyD5dPg1IgTnYG3nm4-FyQAUbQ9yDHvA8xc",
  authDomain: "akifa-donat.firebaseapp.com",
  projectId: "akifa-donat",
  storageBucket: "akifa-donat.firebasestorage.app",
  messagingSenderId: "561531500492",
  appId: "1:561531500492:web:3c23d25054e1eef742cf69",
  measurementId: "G-DZJLBPZ9MK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
const WA_NUMBER = "082223179650";

const grid = document.getElementById("productGrid");
const dialog = document.getElementById("orderDialog");

grid.innerHTML = PRODUCTS.map((p,i)=>`
  <article class="product-card">
    <div class="product-visual">
      <img src="image/${encodeURIComponent(p[3])}" alt="${p[0]}" loading="lazy">
    </div>
    <h3>${p[0]}</h3>
    <p>${p[1]}</p>
    <div class="product-meta">
      <strong>Bagian dari paket</strong>
      <button type="button" data-flavor="${i}">Pilih ↗</button>
    </div>
  </article>
`).join("");

const selectOptions = PRODUCTS.map(p=>`<option>${p[0]}</option>`).join("");

document.querySelectorAll(".flavor-fields select").forEach(el=>{
  el.innerHTML = selectOptions;
});

function showOrder(index=null){
  if(index !== null){
    const chosen = PRODUCTS[index][0];
    const first = dialog.querySelector('[name="flavor1"]');
    first.value = chosen;
  }
  dialog.showModal();
}

document.getElementById("openOrder").addEventListener("click",()=>showOrder());

grid.addEventListener("click",e=>{
  const btn = e.target.closest("[data-flavor]");
  if(btn) showOrder(Number(btn.dataset.flavor));
});

document.getElementById("closeOrder").addEventListener("click",()=>dialog.close());

document.getElementById("menuToggle").addEventListener("click",()=>{
  document.getElementById("navMenu").classList.toggle("open");
});

document.querySelectorAll("#navMenu a").forEach(a=>{
  a.addEventListener("click",()=>{
    document.getElementById("navMenu").classList.remove("open");
  });
});

const qtyInput = document.querySelector('[name="qty"]');

qtyInput.addEventListener("input",()=>{
  const qty = Math.max(1,Number(qtyInput.value)||1);
  document.getElementById("orderTotal").textContent =
    "Rp"+(qty*PRICE).toLocaleString("id-ID");
});

// SIMPAN PESANAN KE FIRESTORE DAN KIRIM KE WHATSAPP
document.getElementById("orderForm").addEventListener("submit",async e=>{
  e.preventDefault();

  const form = e.currentTarget;
  const submitButton = form.querySelector('[type="submit"]');
  const f = new FormData(form);

  const qty = Math.max(1,Number(f.get("qty"))||1);

  const orderRef = doc(collection(db,"orders"));

  const order = {
    id: "AKF-"+orderRef.id.slice(0,8).toUpperCase(),
    customer: String(f.get("customer") || "").trim(),
    phone: String(f.get("phone") || "").trim(),
    qty,
    flavors: [
      f.get("flavor1"),
      f.get("flavor2"),
      f.get("flavor3")
    ],
    note: String(f.get("note") || "").trim(),
    total: qty*PRICE,
    createdAt: serverTimestamp(),
    status: "Menunggu"
  };

  if(!order.customer || !order.phone){
    alert("Nama dan nomor WhatsApp wajib diisi.");
    return;
  }

  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = "Menyimpan pesanan...";

  // Membuka tab terlebih dahulu agar tidak diblokir browser
  const waWindow = window.open("about:blank","_blank");

  try {
    await setDoc(orderRef,order);

    const message = [
      "Halo Akifa Donat, saya mau pesan:",
      `Nama: ${order.customer}`,
      `No. WhatsApp: ${order.phone}`,
      `Jumlah paket: ${qty}`,
      `Varian: ${order.flavors.join(", ")}`,
      `Total: Rp${order.total.toLocaleString("id-ID")}`,
      `Catatan: ${order.note || "-"}`,
      `Kode pesanan: ${order.id}`
    ].join("\n");

    if(waWindow){
      waWindow.location.href =
        `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    alert("Pesanan berhasil disimpan! Silakan kirim pesan melalui WhatsApp.");

    dialog.close();
    form.reset();
    document.getElementById("orderTotal").textContent = "Rp10.000";

  } catch(error) {
    console.error("Gagal menyimpan pesanan:",error);

    if(waWindow) waWindow.close();

    alert("Pesanan gagal disimpan ke database. Periksa koneksi dan pengaturan Firebase.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});
