const Q=window.QUESTIONS,byId=Object.fromEntries(Q.map(q=>[q.id,q]));
const CH={ch2:'第2章 信号·标志·标线',ch3:'第3章 学开车',ch4:'第4章 驾驶记录·酒驾'};
const LV=10,NL=Math.ceil(Q.length/LV);
const S=JSON.parse(localStorage.getItem('paGame')||'{}');
S.p=S.p||{};S.lv=S.lv||{};S.hard=S.hard||{};S.wrong=S.wrong||{};S.tot=S.tot||{a:0,c:0};S.best=S.best||0;
const save=()=>localStorage.setItem('paGame',JSON.stringify(S));
const $=s=>document.querySelector(s),V=()=>$('#view');
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const DAY=864e5,INT=[0,10*60e3,DAY,3*DAY,7*DAY,16*DAY];
function rec(id,ok){const p=S.p[id]||(S.p[id]={box:0,due:0,a:0,c:0,w:0});p.a++;S.tot.a++;
 if(ok){p.c++;S.tot.c++;p.box=Math.min(5,p.box+1)}else{p.w++;p.box=0;S.wrong[id]=(S.wrong[id]||0)+1}
 let iv=INT[p.box];if(S.hard[id])iv/=2;p.due=Date.now()+iv;save()}
function dueList(){const now=Date.now();return Q.filter(q=>{const p=S.p[q.id];return (p&&p.due<=now&&(p.w>0||S.hard[q.id]))||(S.hard[q.id]&&!p)})
 .sort((a,b)=>score(b)-score(a))}
function score(q){const p=S.p[q.id]||{w:0,box:0};return p.w*2+(S.hard[q.id]?3:0)-p.box+Math.random()}
function toast(e){const t=$('#toast');t.textContent=e;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),600)}
function rain(){for(let i=0;i<14;i++){const d=document.createElement('div');d.className='fall';d.textContent=['🌸','⭐','🥕','💖','🍬'][i%5];d.style.left=Math.random()*100+'vw';d.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),2000)}}
function hud(t){$('#hud').innerHTML=t||`⭐${Object.values(S.lv).reduce((a,b)=>a+b,0)} 🔥${S.best}`}
function go(v,a){window.scrollTo(0,0);({home,levels,quiz,flash,review,book,stats})[v](a)}
function home(){hud();const due=dueList().length,w=Object.keys(S.wrong).length;
 V().innerHTML=`<div class="card"><div class="mascot">🐰🚗💨</div><h2 style="text-align:center">嗨宝宝！一起考 PA 驾照吧～</h2>
 <p style="text-align:center;margin:0">题库共 <b>${Q.length}</b> 题（来自 PA Driver's Manual 第2-4章复习题）</p></div>
 <div class="grid"><button class="btn mode" onclick="go('levels')"><b>🗺️</b>闯关模式<small>${NL}关 · 3颗❤️</small></button>
 <button class="btn mode mint" onclick="go('quiz')"><b>⚡</b>快速测验<small>模拟考 18题</small></button>
 <button class="btn mode sky" onclick="go('flash')"><b>🃏</b>翻牌记忆<small>翻一翻记一记</small></button>
 <button class="btn mode lav" onclick="go('review')"><b>🔁</b>智能复习<small>待复习 ${due} 题</small></button>
 <button class="btn mode yel" onclick="go('book')"><b>📒</b>错题本<small>${w} 题</small></button>
 <button class="btn mode" onclick="go('stats')"><b>📊</b>学习进度<small>正确率 ${S.tot.a?Math.round(S.tot.c/S.tot.a*100):0}%</small></button></div>`}
function levels(){hud();let h='<div class="card"><h2>🗺️ 闯关地图</h2><div class="levels">';
 for(let i=0;i<NL;i++){const st=S.lv[i]||0,lock=i>0&&S.lv[i-1]===undefined;
  h+=`<button class="lv ${st?'done':''} ${lock?'lock':''}" ${lock?'disabled':''} onclick="startLevel(${i})">${lock?'🔒':i+1}<span class="st">${'⭐'.repeat(st)||'　'}</span></button>`}
 V().innerHTML=h+'</div><p style="font-size:13px">每关10题，答错扣一颗❤️，❤️用完就失败哦。答对率决定⭐数。</p></div>'}
let G=null;
function startLevel(i){G={mode:'level',lv:i,list:Q.slice(i*LV,i*LV+LV),i:0,hearts:3,streak:0,ok:0};ask()}
function quiz(){G={mode:'quiz',list:shuf(Q).slice(0,18),i:0,hearts:99,streak:0,ok:0};ask()}
function review(){const l=dueList();if(!l.length){V().innerHTML=`<div class="card"><div class="mascot">🐻💤</div><h2 style="text-align:center">现在没有要复习的题啦！</h2><p style="text-align:center">答错的题和标记为“难”的题会按记忆曲线回来找你～</p><div class="row"><button class="btn" onclick="go('home')">🏠 回家</button><button class="btn mint" onclick="reviewAll()">把错题全部再练一遍</button></div></div>`;return}
 G={mode:'review',list:l.slice(0,15),i:0,hearts:99,streak:0,ok:0};ask()}
function reviewAll(){const l=shuf(Q.filter(q=>S.wrong[q.id]||S.hard[q.id]));if(!l.length)return toast('🌈');G={mode:'review',list:l,i:0,hearts:99,streak:0,ok:0};ask()}
function hudG(){hud(`${G.mode=='level'?'❤️'.repeat(G.hearts)+'🤍'.repeat(3-G.hearts):''} 🔥${G.streak} · ${G.i+1}/${G.list.length}`)}
function storyHTML(q){return `<div class="story">📖 <b>宝宝小故事</b><br>${q.story}<div class="tip">💡 记忆口诀：${q.tip}</div>${q.flag?`<div class="flag">⚠️ ${q.flag}</div>`:''}</div>`}
function qHead(q){return `<div><span class="tag">${CH[q.ch]} #${q.num}</span>${q.tricky?'<span class="tag">🌀易错</span>':''}${S.hard[q.id]?'<span class="tag">🔥难</span>':''}</div>
 <div class="q" style="margin-top:8px">${q.q}</div><div class="qz">${q.qz}</div>${q.img?`<img class="qimg" src="${q.img}" alt="题图">`:''}`}
function ask(){const q=G.list[G.i];hudG();const ord=q.opts.some(o=>/above/i.test(o))?[0,1,2,3]:shuf([0,1,2,3]);
 V().innerHTML=`<div class="bar"><i style="width:${G.i/G.list.length*100}%"></i></div><div class="card" id="qc">${qHead(q)}
 <div id="opts">${ord.map((k,n)=>`<button class="opt" data-k="${k}" onclick="pick(${k})">${'ABCD'[n]}. ${q.opts[k]}<span class="z">${q.oz[k]}</span></button>`).join('')}</div><div id="fb"></div></div>`}
function pick(k){const q=G.list[G.i];if(G.done)return;G.done=1;const ok=k===q.ans;rec(q.id,ok);
 document.querySelectorAll('.opt').forEach(b=>{b.disabled=true;const kk=+b.dataset.k;if(kk===q.ans)b.classList.add('ok');else if(kk===k)b.classList.add('bad')});
 if(ok){G.ok++;G.streak++;S.best=Math.max(S.best,G.streak);save();toast(G.streak>=3?'🔥':'💖');if(G.streak%5==0)rain()}else{G.streak=0;G.hearts--;toast('🥺')}
 hudG();const last=G.i+1>=G.list.length||G.hearts<=0;
 $('#fb').innerHTML=(ok?`<p><b>答对啦！真棒～ 🎉</b></p>${q.tricky?`<details><summary>🌀 这题容易错，看看小故事</summary>${storyHTML(q)}</details>`:`<details><summary>📖 看小故事</summary>${storyHTML(q)}</details>`}`
  :`<p><b>哎呀，答错了～ 正确答案是：</b>${q.opts[q.ans]}（${q.oz[q.ans]}）</p>${storyHTML(q)}`)+
  `<div class="row"><button class="btn small yel" id="hardBtn" onclick="toggleHard('${q.id}')">${S.hard[q.id]?'✅ 已标记难':'🔥 标记为难'}</button><button class="btn mint" id="next" onclick="next()">${last?'看结果 🎁':'下一题 ➡️'}</button></div>`}
function toggleHard(id){S.hard[id]?delete S.hard[id]:S.hard[id]=1;save();$('#hardBtn').textContent=S.hard[id]?'✅ 已标记难':'🔥 标记为难'}
function next(){G.done=0;G.i++;if(G.i>=G.list.length||G.hearts<=0)return end();ask()}
function end(){const n=G.list.length,pct=G.ok/Math.max(1,G.i);let msg,em;
 if(G.mode=='level'){if(G.hearts<=0){em='😿';msg='❤️用完啦，再挑战一次吧！'}else{const st=pct>=.95?3:pct>=.8?2:1;S.lv[G.lv]=Math.max(S.lv[G.lv]||0,st);save();em='🏆';msg=`过关！获得 ${'⭐'.repeat(st)}`;rain()}}
 else if(G.mode=='quiz'){const pass=G.ok>=15;em=pass?'🎓':'📚';msg=`${G.ok}/18 ${pass?'通过！(≥15题正确)':'没通过，需要15题正确，加油！'}`;if(pass)rain()}
 else{em='🌈';msg=`复习完成！答对 ${G.ok}/${n}`}
 hud();V().innerHTML=`<div class="card" style="text-align:center"><div class="mascot">${em}</div><h2>${msg}</h2><div class="row" style="justify-content:center">
 ${G.mode=='level'?`<button class="btn" onclick="startLevel(${G.lv})">再玩一次</button>${G.hearts>0&&G.lv+1<NL?`<button class="btn mint" onclick="startLevel(${G.lv+1})">下一关 ➡️</button>`:''}`:''}
 <button class="btn sky" onclick="go('home')">🏠 回家</button><button class="btn lav" onclick="go('book')">📒 错题本</button></div></div>`}
let F=null;
function flash(ch){F={list:shuf(ch?Q.filter(q=>q.ch==ch):Q),i:0};card()}
function card(){const q=F.list[F.i];hud(`🃏 ${F.i+1}/${F.list.length}`);
 V().innerHTML=`<div class="row" style="justify-content:flex-start">${Object.keys(CH).map(c=>`<button class="btn small sky" onclick="flash('${c}')">${CH[c].slice(0,3)}</button>`).join('')}<button class="btn small" onclick="flash()">全部</button></div>
 <div class="flip" id="fl" onclick="this.classList.toggle('on')"><div class="in"><div class="face">${qHead(q)}<p style="text-align:center;opacity:.6">👆 点我翻面</p></div>
 <div class="face back"><div class="q">✅ ${q.opts[q.ans]}</div><div class="qz">${q.oz[q.ans]}</div>${storyHTML(q)}</div></div></div>
 <div class="row"><button class="btn small" onclick="fc(0)">😵 不熟</button><button class="btn small yel" onclick="toggleHard2('${q.id}')">${S.hard[q.id]?'✅ 难':'🔥 标难'}</button><button class="btn small mint" onclick="fc(1)">😊 记住了</button></div>`}
function toggleHard2(id){S.hard[id]?delete S.hard[id]:S.hard[id]=1;save();card()}
function fc(ok){const q=F.list[F.i];if(!ok){S.hard[q.id]=1;save()}else{const p=S.p[q.id];if(p){p.box=Math.min(5,p.box+1);p.due=Date.now()+INT[p.box];save()}}
 toast(ok?'🥕':'💪');F.i=(F.i+1)%F.list.length;card()}
function book(){hud();const ids=Object.keys(S.wrong).sort((a,b)=>S.wrong[b]-S.wrong[a]),hard=Object.keys(S.hard).filter(i=>!S.wrong[i]);
 const it=id=>{const q=byId[id];return `<div class="it"><details><summary>${S.wrong[id]?`❌×${S.wrong[id]} `:''}${S.hard[id]?'🔥':''} ${q.qz}</summary><div class="q" style="font-size:14px">${q.q}</div>
 <p>✅ ${q.opts[q.ans]}（${q.oz[q.ans]}）</p>${storyHTML(q)}<button class="btn small" onclick="delW('${id}')">🗑️ 我会了，移出错题本</button></details></div>`};
 V().innerHTML=`<div class="card"><h2>📒 错题本</h2>${ids.length?'':'<p>还没有错题，真厉害！🌟</p>'}<div class="list">${ids.map(it).join('')}</div>
 ${hard.length?`<h3>🔥 标记为难</h3><div class="list">${hard.map(it).join('')}</div>`:''}<div class="row"><button class="btn sky" onclick="go('home')">🏠 回家</button>${ids.length+hard.length?'<button class="btn lav" onclick="reviewAll()">🔁 全部再练</button>':''}</div></div>`}
function delW(id){delete S.wrong[id];delete S.hard[id];save();book()}
function stats(){hud();const seen=Object.keys(S.p).length,mast=Object.values(S.p).filter(p=>p.box>=3).length;
 const chs=Object.keys(CH).map(c=>{const qs=Q.filter(q=>q.ch==c),a=qs.reduce((s,q)=>s+((S.p[q.id]||{}).a||0),0),k=qs.reduce((s,q)=>s+((S.p[q.id]||{}).c||0),0);
  return `<p>${CH[c]}（${qs.length}题）· 正确率 ${a?Math.round(k/a*100):0}%</p><div class="bar"><i style="width:${qs.filter(q=>S.p[q.id]).length/qs.length*100}%"></i></div>`}).join('');
 V().innerHTML=`<div class="card"><h2>📊 学习进度</h2><div class="grid"><div class="stat">${seen}/${Q.length}<small>做过的题</small></div><div class="stat">${mast}<small>已掌握(连对3次+)</small></div>
 <div class="stat">${S.tot.a?Math.round(S.tot.c/S.tot.a*100):0}%<small>总正确率 (${S.tot.c}/${S.tot.a})</small></div><div class="stat">🔥${S.best}<small>最高连击</small></div>
 <div class="stat">${Object.keys(S.wrong).length}<small>错题</small></div><div class="stat">${dueList().length}<small>待复习</small></div></div>${chs}
 <div class="row"><button class="btn sky" onclick="go('home')">🏠 回家</button><button class="btn small" onclick="if(confirm('确定清空所有进度？')){localStorage.removeItem('paGame');location.reload()}">清空进度</button></div></div>`}
home();
