const theme = document.querySelector("#theme");
if (localStorage.theme === "dark") document.body.classList.add("dark");
if (theme) {
  theme.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.theme = document.body.classList.contains("dark") ? "dark" : "light";
  };
}

async function loadMenu() {
  const r = await fetch("/api/menu");
  const items = await r.json();
  document.querySelector("#menuGrid").innerHTML = items.map(x => `
    <article class="card">
      <img src="${x.image}" alt="${x.name}" loading="lazy">
      <div class="cardbody">
        <span class="kicker">${x.category}</span>
        <h3>${x.name}</h3>
        <p>${x.description}</p>
        <div class="price">${x.price} ETB</div>
      </div>
    </article>`).join("");
}
loadMenu().catch(console.error);

const bookingForm = document.querySelector("#bookingForm");
if (bookingForm) {
  bookingForm.onsubmit = async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    d.guests = Number(d.guests);
    const r = await fetch("/api/event-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d)
    });
    const j = await r.json();
    const m = document.querySelector("#bookingMsg");
    if (j.ok) {
      m.innerHTML = `<p class="booking-success">EVENT REQUEST SENT — CODE: <strong>${j.booking.code}</strong></p>`;
      e.target.reset();
      showBookingCard(j.booking.code);
    } else {
      m.textContent = j.error || "Request failed.";
    }
  };
}

function showBookingCard(code) {
  const now = Date.now();
  const expires = now + (30 * 60 * 1000);
  localStorage.setItem("obsinanBookingCard", JSON.stringify({ code, expires }));
  renderBookingCard(code, expires);
}

function renderBookingCard(code, expires) {
  let overlay = document.querySelector("#bookingCardOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "bookingCardOverlay";
    overlay.innerHTML = `
      <div class="card-stage">
        <button class="card-close" aria-label="Close">×</button>
        <div class="booking-playing-card">
          <div class="card-corner">OBSINAN<br>CAFFE</div>
          <img src="/assets/booking-card.png" alt="OBSINAN booking card">
          <div class="card-bottom">EVENT BOOKING <span id="bookingCardCode"></span></div>
        </div>
        <div class="card-timer">This booking card will remain available for <b id="bookingCardTimer">30:00</b></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".card-close").onclick = () => overlay.classList.remove("show");
  }
  overlay.querySelector("#bookingCardCode").textContent = code;
  overlay.classList.add("show");

  clearInterval(window.obsinanCardTimer);
  const tick = () => {
    const left = Math.max(0, expires - Date.now());
    const mins = Math.floor(left / 60000).toString().padStart(2, "0");
    const secs = Math.floor((left % 60000) / 1000).toString().padStart(2, "0");
    const timer = document.querySelector("#bookingCardTimer");
    if (timer) timer.textContent = `${mins}:${secs}`;
    if (left <= 0) {
      clearInterval(window.obsinanCardTimer);
      localStorage.removeItem("obsinanBookingCard");
      if (overlay) overlay.remove();
    }
  };
  tick();
  window.obsinanCardTimer = setInterval(tick, 1000);
}

try {
  const saved = JSON.parse(localStorage.getItem("obsinanBookingCard") || "null");
  if (saved && saved.code && saved.expires > Date.now()) renderBookingCard(saved.code, saved.expires);
  else localStorage.removeItem("obsinanBookingCard");
} catch (_) {}

const obsinanOverlay=document.getElementById("bookingCardOverlay");
const obsinanClose=document.getElementById("bookingCardClose");
const obsinanCode=document.getElementById("cardBookingCode");
const obsinanTimer=document.getElementById("bookingTimer");
let obsinanTimerInterval;

function showObsInanBookingCard(code){
  if(!obsinanOverlay)return;
  if(obsinanCode)obsinanCode.textContent=code||"---";
  obsinanOverlay.classList.add("active");
  let seconds=1800;
  clearInterval(obsinanTimerInterval);
  const tick=()=>{
    const m=Math.floor(seconds/60),s=seconds%60;
    if(obsinanTimer)obsinanTimer.textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    if(seconds<=0){clearInterval(obsinanTimerInterval);obsinanOverlay.classList.remove("active");}
    seconds--;
  };
  tick();
  obsinanTimerInterval=setInterval(tick,1000);
}
if(obsinanClose)obsinanClose.addEventListener("click",()=>obsinanOverlay.classList.remove("active"));
