let token=sessionStorage.getItem("obsinanToken");
const $=s=>document.querySelector(s);

function initTheme(){
  const t=$("#theme");
  if(!t)return;
  if(localStorage.theme==="dark")document.body.classList.add("dark");
  t.onclick=()=>{document.body.classList.toggle("dark");localStorage.theme=document.body.classList.contains("dark")?"dark":"light"};
}
initTheme();

if(token) show();

$("#loginForm").onsubmit=async e=>{
  e.preventDefault();
  const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("#pass").value})});
  const j=await r.json();
  if(j.ok){token=j.token;sessionStorage.setItem("obsinanToken",token);show()}
  else $("#err").textContent=j.error||"Login failed";
};

function show(){
  $("#login").hidden=true;
  $("#dash").hidden=false;
  initTheme();
  load();
}

async function api(url,opt={}){
  opt.headers={...(opt.headers||{}),Authorization:token,"Content-Type":"application/json"};
  return fetch(url,opt);
}

async function load(){
  const br=await api("/api/admin/bookings");
  const bs=await br.json();
  const mr=await fetch("/api/menu");
  const ms=await mr.json();

  $("#stats").innerHTML=[
    ["Total Bookings",bs.length],
    ["Pending",bs.filter(x=>x.status==="Pending").length],
    ["Confirmed",bs.filter(x=>x.status==="Confirmed").length],
    ["Menu Items",ms.length]
  ].map(x=>`<div class="card"><div class="cardbody"><span class="kicker">${x[0]}</span><h3 style="font-size:40px">${x[1]}</h3></div></div>`).join("");

  $("#bookings").innerHTML=bs.length?bs.map(b=>`
    <article class="card"><div class="cardbody">
      <span class="kicker">${b.code}</span><h3>${escapeHtml(b.name)}</h3>
      <p>${escapeHtml(b.phone)} · ${escapeHtml(b.network||"")}<br>
      ${b.guests} guests · ${escapeHtml(b.date)} · ${escapeHtml(b.time)}<br>
      ${escapeHtml(b.request||"No special request")}</p>
      <b>${escapeHtml(b.status)}</b><br><br>
      <button onclick="setStatus(${b.id},'Confirmed')">Confirm</button>
      <button onclick="setStatus(${b.id},'Pending')">Pending</button>
      <button onclick="setStatus(${b.id},'Cancelled')">Cancel</button>
    </div></article>`).join(""):"<p>No bookings yet.</p>";

  $("#adminMenu").innerHTML=ms.map(x=>`
    <article class="card"><img src="${x.image||""}" style="width:100%;height:180px;object-fit:cover">
    <div class="cardbody">
      <input id="n${x.id}" value="${attr(x.name)}" placeholder="Name">
      <input id="c${x.id}" value="${attr(x.category)}" placeholder="Category">
      <input id="p${x.id}" type="number" value="${x.price}" placeholder="Price">
      <input id="i${x.id}" value="${attr(x.image||"")}" placeholder="Photo URL">
      <textarea id="d${x.id}" placeholder="Description">${escapeHtml(x.description||"")}</textarea>
      <button class="btn" onclick="saveItem(${x.id})">Save Item</button>
      <button onclick="del(${x.id})">Delete</button>
    </div></article>`).join("");
}

function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function attr(v){return escapeHtml(v)}

async function setStatus(id,status){
  await api("/api/admin/bookings/"+id,{method:"PATCH",body:JSON.stringify({status})});
  load();
}

async function saveItem(id){
  await api("/api/admin/menu/"+id,{method:"PATCH",body:JSON.stringify({
    name:$("#n"+id).value,
    category:$("#c"+id).value,
    price:Number($("#p"+id).value),
    image:$("#i"+id).value,
    description:$("#d"+id).value
  })});
  load();
}

async function del(id){
  if(confirm("Delete this menu item?")){
    await api("/api/admin/menu/"+id,{method:"DELETE"});
    load();
  }
}

$("#menuForm").onsubmit=async e=>{
  e.preventDefault();
  await api("/api/admin/menu",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});
  e.target.reset();
  load();
};

$("#pw").onsubmit=async e=>{
  e.preventDefault();
  if($("#newp").value!==$("#confirm").value){
    $("#pwmsg").textContent="Passwords do not match.";
    return;
  }
  const r=await api("/api/admin/change-password",{method:"POST",body:JSON.stringify({
    currentPassword:$("#current").value,
    newPassword:$("#newp").value
  })});
  const j=await r.json();
  $("#pwmsg").textContent=j.ok?"Password changed successfully.":j.error||"Failed.";
};

function logout(){
  sessionStorage.removeItem("obsinanToken");
  location.href="/admin.html";
}
