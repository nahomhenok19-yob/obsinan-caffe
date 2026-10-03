const express=require("express"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const app=express(),PORT=process.env.PORT||3000,DATA=path.join(__dirname,"data.json");
app.use(express.json({limit:"2mb"}));app.use(express.static(path.join(__dirname,"../public")));
app.get("/admin.html",(req,res)=>res.sendFile(path.join(__dirname,"../public/admin.html")));
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"../public/admin.html")));
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"../public/index.html")));
const hash=p=>crypto.createHash("sha256").update(p).digest("hex");
if(!fs.existsSync(DATA))fs.writeFileSync(DATA,JSON.stringify({
 adminPasswordHash:hash("obsinan.nahom"),
 bookings:[],
 menu:[
  {id:1,name:"Cappuccino",category:"Coffee",price:120,description:"Silky espresso with steamed milk and a delicate finish.",image:"https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=85"},
  {id:2,name:"Cheese Burger",category:"Burgers",price:350,description:"Juicy burger with fresh vegetables and melted cheese.",image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85"},
  {id:3,name:"Chicken Pizza",category:"Pizza",price:450,description:"Crispy base, chicken, cheese and house toppings.",image:"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85"},
  {id:4,name:"Tibs",category:"Ethiopian",price:420,description:"Hot Ethiopian-style tibs prepared fresh to order.",image:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"},
  {id:5,name:"Fresh Juice",category:"Drinks",price:150,description:"Fresh seasonal fruit juice served chilled.",image:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85"}
 ]},null,2));
const read=()=>JSON.parse(fs.readFileSync(DATA));const save=d=>fs.writeFileSync(DATA,JSON.stringify(d,null,2));
const auth=(req,res,next)=>req.headers.authorization==="OBSINAN_ADMIN_SESSION"?next():res.status(401).json({error:"Unauthorized"});
app.post("/api/admin/login",(q,s)=>hash(q.body.password||"")===read().adminPasswordHash?s.json({ok:true,token:"OBSINAN_ADMIN_SESSION"}):s.status(401).json({error:"Wrong password"}));
app.post("/api/admin/change-password",auth,(q,s)=>{let d=read();if(hash(q.body.currentPassword||"")!==d.adminPasswordHash)return s.status(400).json({error:"Current password is incorrect"});if(!q.body.newPassword||q.body.newPassword.length<8)return s.status(400).json({error:"Use at least 8 characters"});d.adminPasswordHash=hash(q.body.newPassword);save(d);s.json({ok:true})});
app.get("/api/menu",(q,s)=>s.json(read().menu));
app.post("/api/bookings",(q,s)=>{let d=read(),b=q.body;if(!b.name||!b.phone||!b.guests||!b.date||!b.time)return s.status(400).json({error:"Complete the required fields"});if(!/^(09|07)\d{8}$/.test(b.phone))return s.status(400).json({error:"Enter a valid Ethiopian mobile number"});let booking={id:Date.now(),code:"OBS-"+crypto.randomBytes(3).toString("hex").toUpperCase(),...b,status:"Pending",createdAt:new Date().toISOString()};d.bookings.unshift(booking);save(d);s.json({ok:true,booking})});
app.post("/api/event-bookings",(req,res)=>{const d=read(),b=req.body;if(!b.name||!b.phone||!b.guests||!b.date||!b.time||!b.eventType)return res.status(400).json({error:"Complete the required event fields"});if(!/^(09|07)\\d{8}$/.test(b.phone))return res.status(400).json({error:"Enter a valid Ethiopian mobile number"});const booking={id:Date.now(),code:"OBS-EVT-"+crypto.randomBytes(3).toString("hex").toUpperCase(),type:"EVENT",eventType:b.eventType,name:b.name,phone:b.phone,network:b.network||"",guests:Number(b.guests),date:b.date,time:b.time,dietary:b.dietary||"",accessibility:b.accessibility||"",notes:b.notes||"",status:"Pending",createdAt:new Date().toISOString()};d.bookings.unshift(booking);save(d);res.json({ok:true,booking});});
app.get("/api/admin/bookings",auth,(q,s)=>s.json(read().bookings));
app.patch("/api/admin/bookings/:id",auth,(q,s)=>{let d=read(),b=d.bookings.find(x=>String(x.id)===String(q.params.id));if(!b)return s.status(404).json({error:"Not found"});Object.assign(b,q.body);save(d);s.json({ok:true,booking:b})});
app.post("/api/admin/menu",auth,(q,s)=>{let d=read(),x={id:Date.now(),name:q.body.name,category:q.body.category,price:Number(q.body.price),description:q.body.description||"",image:q.body.image||""};if(!x.name||!x.category||!x.price)return s.status(400).json({error:"Name, category and price required"});d.menu.push(x);save(d);s.json({ok:true,item:x})});
app.patch("/api/admin/menu/:id",auth,(q,s)=>{let d=read(),x=d.menu.find(x=>String(x.id)===String(q.params.id));if(!x)return s.status(404).json({error:"Not found"});Object.assign(x,q.body);save(d);s.json({ok:true,item:x})});
app.delete("/api/admin/menu/:id",auth,(q,s)=>{let d=read();d.menu=d.menu.filter(x=>String(x.id)!==String(q.params.id));save(d);s.json({ok:true})});
app.listen(PORT,()=>console.log("OBSINAN CAFFE: http://localhost:"+PORT));