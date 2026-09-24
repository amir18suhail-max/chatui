const now=()=>new Date();
const fmt=d=>d.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
const ago=m=>new Date(Date.now()-m*60000);
const chats=[
 {id:1,name:"Manoj sir",color:"#5b6fd6",online:true,unread:2,replies:["Sounds good, I'll update the file.","Can we review this after lunch?","Shared the latest mockups in the folder."],
  msgs:[["them","Morning! The new onboarding screens are ready.",ago(95)],["me","Great, sending feedback shortly.",ago(90)],["them","Take your time, no rush.",ago(20)],["them","Also, we need a decision on the icon set.",ago(18)]]},
 {id:2,name:"DEEPAK",color:"#c2578a",online:true,unread:0,replies:["Haha, yes!","Let me check and get back to you.","Perfect, see you then."],
  msgs:[["them","Are you joining the study group tonight?",ago(300)],["me","Yes, 7 pm works for me.",ago(290)],["them","Bring the notes from last week.",ago(285)]]},
 {id:3,name:"AKASH",color:"#2f8f83",online:false,unread:1,replies:["Got it.","I'll push the fix in a bit.","Thanks for the heads up."],
  msgs:[["me","Did the build pass?",ago(1500)],["them","Yes, all green now.",ago(1490)],["them","Ready for review when you are.",ago(1480)]]},
 {id:4,name:"AMMA",color:"#d4823a",online:false,unread:0,replies:["Call me when you're free.","Take care, eat on time.","Love you!"],
  msgs:[["them","Did you have dinner?",ago(2900)],["me","Yes, just finished.",ago(2890)]]},
 {id:5,name:"Anudip placement",color:"#6b7789",online:false,unread:0,replies:["This channel is read-only."],
  msgs:[["them","Library hours extended till 10 pm this week.",ago(4300)]]}
];
let active=null,filter="";
const $=s=>document.querySelector(s);
const initials=n=>n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function stamp(d){const diff=(Date.now()-d)/86400000;return diff<1?fmt(d):diff<2?"Yesterday":d.toLocaleDateString([], {month:"short",day:"numeric"})}
function renderList(){
  const ul=$("#list");ul.innerHTML="";
  chats.filter(c=>c.name.toLowerCase().includes(filter)).forEach(c=>{
    const last=c.msgs[c.msgs.length-1];
    const li=document.createElement("li");
    li.innerHTML=`<button class="item" ${active===c.id?'aria-current="true"':""}>
      <span class="av" style="background:${c.color}">${initials(c.name)}${c.online?'<span class="dot"></span>':""}</span>
      <span class="meta"><span class="row"><span class="name">${esc(c.name)}</span><span class="time">${stamp(last[2])}</span></span>
      <span class="row"><span class="prev">${last[0]==="me"?"You: ":""}${esc(last[1])}</span>${c.unread?`<span class="badge">${c.unread}</span>`:""}</span></span></button>`;
    li.firstChild.onclick=()=>open(c.id);
    ul.appendChild(li);
  });
  if(!ul.children.length)ul.innerHTML='<li class="empty" style="color:var(--side-mute)">No chats match your search.</li>';
}
function bubble(m,anim){
  const d=document.createElement("div");
  d.className="msg"+(m[0]==="me"?" me":"")+(anim?" new":"");
  d.innerHTML=`${esc(m[1])}<span class="t">${fmt(m[2])}</span>`;
  return d;
}
function open(id){
  active=id;const c=chats.find(x=>x.id===id);c.unread=0;
  $("#app").classList.add("open");
  $("#chat").innerHTML=`
   <div class="top"><button class="icon-btn back" id="back" aria-label="Back to chats"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
    <span class="av" style="background:${c.color}">${initials(c.name)}${c.online?'<span class="dot"></span>':""}</span>
    <div><h2>${esc(c.name)}</h2><small>${c.online?"Online":"Offline"}</small></div></div>
   <div class="msgs" id="msgs" aria-live="polite"></div>
   <form class="composer" id="form" autocomplete="off"><input id="input" placeholder="Write a message" aria-label="Message"><button class="send" id="send" disabled>Send</button></form>`;
  const box=$("#msgs");
  box.innerHTML='<div class="day">Today</div>';
  c.msgs.forEach(m=>box.appendChild(bubble(m)));
  box.scrollTop=box.scrollHeight;
  $("#back").onclick=()=>{$("#app").classList.remove("open");active=null;renderList()};
  const input=$("#input"),send=$("#send");
  input.oninput=()=>send.disabled=!input.value.trim();
  $("#form").onsubmit=e=>{e.preventDefault();const t=input.value.trim();if(!t)return;input.value="";send.disabled=true;post(c,t)};
  if(matchMedia("(min-width:761px)").matches)input.focus();
  renderList();
}
function post(c,text){
  const m=["me",text,now()];c.msgs.push(m);
  if(active===c.id){const b=$("#msgs");b.appendChild(bubble(m,true));b.scrollTop=b.scrollHeight}
  renderList();
  if(c.id===5)return;
  setTimeout(()=>{
    if(active!==c.id)return;
    const b=$("#msgs"),ty=document.createElement("div");
    ty.className="typing";ty.innerHTML="<i></i><i></i><i></i>";ty.setAttribute("aria-label",c.name+" is typing");
    b.appendChild(ty);b.scrollTop=b.scrollHeight;
    setTimeout(()=>{
      ty.remove();
      const r=["them",c.replies[Math.floor(Math.random()*c.replies.length)],now()];
      c.msgs.push(r);
      if(active===c.id){const bb=$("#msgs");if(bb){bb.appendChild(bubble(r,true));bb.scrollTop=bb.scrollHeight}}
      else c.unread++;
      renderList();
    },1100+Math.random()*900);
  },500);
}
$("#q").oninput=e=>{filter=e.target.value.trim().toLowerCase();renderList()};
$("#theme").onclick=()=>{
  const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme=dark?"light":"dark";
};
$("#chat").innerHTML='<div class="empty">Select a chat to start messaging.</div>';
renderList();
if(matchMedia("(min-width:761px)").matches)open(1);