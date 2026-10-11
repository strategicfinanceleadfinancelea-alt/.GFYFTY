const MON=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];let M=[],KEYS=[];
let IN=[],OUT=[];
let SALDO=0;

let TX=[];
const $=s=>document.querySelector(s), sum=a=>a.reduce((x,y)=>x+y,0);
const R=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const R0=v=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const pc=(a,b)=>b?(a-b)/b*100:null;
const st={view:'Visão geral',n:1,q:''};
const BASE=['Visão geral','Movimentações','DRE','Contas a pagar','Contas a receber'];
const views=()=>S?[...BASE,...(S.admin?['Novo lançamento','Clientes']:[]),'Minha conta',...(S.admin?['Administração']:[])]:BASE;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('s');clearTimeout(toast.k);toast.k=setTimeout(()=>t.classList.remove('s'),2600)}
function rng(n){const e=6,s=e-n;return{i:IN.slice(s),o:OUT.slice(s),m:M.slice(s),pi:s-n>=0?IN.slice(s-n,s):null,po:s-n>=0?OUT.slice(s-n,s):null}}
function chip(p,bad){if(p===null)return '<span class="chip n">sem comparação</span>';const up=p>=0,good=bad?!up:up;return `<span class="chip ${Math.abs(p)<.05?'n':good?'g':'r'}">${up?'▲':'▼'} ${Math.abs(p).toFixed(1).replace('.',',')}%</span>`}
function chart(r){
 const W=700,H=250,l=44,b=28,t=10,ih=H-t-b,mx=Math.max(5000,Math.ceil(Math.max(...IN,...OUT)/5000)*5000),gw=(W-l-8)/r.m.length;let s='';
 for(let v=0;v<=mx;v+=mx/5){const y=t+ih-v/mx*ih;s+=`<line x1="${l}" x2="${W-8}" y1="${y}" y2="${y}" stroke="#e6e6e6"/><text x="${l-8}" y="${y+4}" text-anchor="end" font-size="11" fill="#6b6b6b">${Math.round(v/1000)}k</text>`}
 r.m.forEach((m,k)=>{const x=l+k*gw,bw=Math.min(30,gw/3);
  [[r.i[k],'#111','Entradas'],[r.o[k],'#FFC800','Saídas']].forEach(([v,c,n],j)=>{const h=v/mx*ih;s+=`<rect x="${x+gw/2-bw-2+j*(bw+4)}" y="${t+ih-h}" width="${bw}" height="${h}" rx="4" fill="${c}"><title>${m} · ${n}: ${R(v)}</title></rect>`});
  s+=`<text x="${x+gw/2}" y="${H-8}" text-anchor="middle" font-size="12" fill="#6b6b6b">${m}</text>`});
 return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Entradas e saídas por mês">${s}</svg>`}
function dre(n){const ks=KEYS.slice(6-n),sm=(t,c)=>sum(cur().tx.filter(x=>x.s==='pago'&&x.t===t&&ks.includes(x.d.slice(0,7))&&(!c||x.c===c)).map(x=>x.v));
 const rb=sm('in'),ded=sm('out','Impostos sobre vendas'),cmv=sm('out','CMV'),pes=sm('out','Despesa com pessoal'),adm=sm('out','Despesa administrativa'),fin=sm('out','Despesa financeira');
 const rl=rb-ded,lb=rl-cmv,ro=lb-pes-adm,ll=ro-fin;
 return [['Receita bruta',rb,'sub'],['(−) Impostos sobre vendas',-ded,'ind'],['(=) Receita líquida',rl,'sub'],['(−) Custo das mercadorias (CMV)',-cmv,'ind'],['(=) Lucro bruto',lb,'sub'],['(−) Despesas com pessoal',-pes,'ind'],['(−) Despesas administrativas',-adm,'ind'],['(=) Resultado operacional',ro,'sub'],['(−) Despesas financeiras',-fin,'ind'],['(=) Lucro líquido do período',ll,'tot']]}
function overview(){
 const r=rng(st.n),ti=sum(r.i),to=sum(r.o),tn=ti-to,pi=r.pi&&sum(r.pi),po=r.po&&sum(r.po);
 const pn=r.pi?pc(tn,pi-po):null,mg=ti?tn/ti*100:0;
 const pag=TX.filter(x=>x.t==='out'&&x.s==='pendente'),rec=TX.filter(x=>x.t==='in'&&x.s==='pendente');
 const label=st.n===1?M[5]+'/'+KEYS[5].slice(0,4):`Últimos ${st.n} meses`;
 return `<div class="head"><div><h1>Visão geral</h1><p class="sub">${label} · atualizado em ${new Date().toLocaleDateString('pt-BR')}</p></div>
 <div class="seg" role="group" aria-label="Período">${[[1,'Este mês'],[3,'3 meses'],[6,'6 meses']].map(([n,t])=>`<button data-n="${n}" class="${st.n===n?'on':''}">${t}</button>`).join('')}</div></div>
 <section class="hero"><div><small>Saldo em caixa</small><div class="big num">${R(SALDO)}</div></div>
 <div class="side"><div>A receber<b class="num in" style="color:#5fe3b0">${R0(sum(rec.map(x=>x.v)))}</b></div><div>A pagar<b class="num" style="color:#ff8f94">${R0(sum(pag.map(x=>x.v)))}</b></div></div></section>
 <div class="grid4">
 <div class="card kpi"><small>Entradas</small><div class="v num">${R(ti)}</div>${chip(r.pi?pc(ti,pi):null)} <span class="sub">vs. período anterior</span></div>
 <div class="card kpi"><small>Saídas</small><div class="v num">${R(to)}</div>${chip(r.po?pc(to,po):null,true)} <span class="sub">vs. período anterior</span></div>
 <div class="card kpi"><small>Resultado · margem ${mg.toFixed(1).replace('.',',')}%</small><div class="v num">${R(tn)}</div>${chip(pn)} <span class="sub">vs. período anterior</span></div></div>
 <div class="cols"><section class="card"><h2>Fluxo de caixa</h2><p class="sub">Entradas e saídas por mês</p>
 <div class="leg"><span><i style="background:#111"></i>Entradas</span><span><i style="background:#FFC800"></i>Saídas</span></div>${chart(rng(6))}
 <div class="sumrow"><div>Total de entradas · 6 meses<b class="num">${R(sum(IN))}</b></div><div>Resultado acumulado · 6 meses<b class="num">${R(sum(IN)-sum(OUT))}</b></div></div>
 <button class="btn o" id="csv">Exportar CSV</button></section>
 <div class="stack"><section class="card"><h2>Últimas movimentações</h2>${TX.filter(x=>x.s==='pago').slice(0,4).map(row).join('')||'<div class="empty">Nenhum lançamento ainda. '+(S.admin?'Use "Novo lançamento".':'')+'</div>'}<p style="margin:14px 0 0"><button class="btn" data-go="Movimentações">Ver todas</button></p></section></div></div>
 ${cur().demo?'<p class="note">Dados ilustrativos para demonstração. Não representam movimentações reais.</p>':''}`}
function row(x){return `<div class="row"><span class="ic ${x.t}">${x.t==='in'?'+':'−'}</span><div class="t"><b>${x.n}</b><span>${x.d} · ${x.c}</span></div><b class="num ${x.t}">${x.t==='in'?'+':'−'} ${R(x.v)}</b></div>`}
function list(title,items,sub){
 const q=st.q.toLowerCase(),f=items.filter(x=>(x.n+x.c).toLowerCase().includes(q));
 const tot=sum(f.map(x=>x.t==='in'?x.v:-x.v));
 return `<div class="head"><div><h1>${title}</h1><p class="sub">${sub}</p></div></div>
 <div class="tools"><input id="q" placeholder="Buscar por descrição ou categoria" value="${st.q}" aria-label="Buscar"></div>
 <section class="card scroll">${f.length?`<table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Status</th><th class="r">Valor</th>${S.admin?'<th></th>':''}</tr></thead><tbody>${f.map(x=>`<tr><td>${x.d}</td><td><b>${x.n}</b></td><td>${x.c}</td><td><span class="pill ${x.s}">${x.s==='pago'?'Pago':'Pendente'}</span></td><td class="r num ${x.t}">${x.t==='in'?'+':'−'} ${R(x.v)}</td>${S.admin?`<td class="r" style="white-space:nowrap">${x.s==='pendente'?`<button class="btn o sm" data-act="pay" data-id="${x.id}">Dar baixa</button> `:''}<button class="btn d sm" data-act="deltx" data-id="${x.id}" aria-label="Excluir lançamento">Excluir</button></td>`:''}</tr>`).join('')}<tr class="tot"><td colspan="4">Total</td><td class="r num">${R(tot)}</td>${S.admin?'<td></td>':''}</tr></tbody></table>`:'<div class="empty">Nenhum lançamento encontrado. Tente outro termo de busca.</div>'}</section>`}
function dreView(){
 const rows=dre(st.n),rb=rows[0][1];
 return `<div class="head"><div><h1>DRE</h1><p class="sub">Demonstração do Resultado do Exercício · ${esc(cur().name)}</p></div>
 <div class="seg" role="group" aria-label="Período">${[[1,'Este mês'],[3,'3 meses'],[6,'6 meses']].map(([n,t])=>`<button data-n="${n}" class="${st.n===n?'on':''}">${t}</button>`).join('')}</div></div>
 <section class="card scroll"><table><thead><tr><th>Conta</th><th class="r">Valor</th><th class="r">% da receita bruta</th></tr></thead><tbody>
 ${rows.map(([n,v,c])=>`<tr class="${c==='ind'?'':c}"><td class="${c==='ind'?'ind':''}">${n}</td><td class="r num ${v<0?'out':c==='tot'?(v>=0?'in':'out'):''}">${R(v)}</td><td class="r num">${(rb?v/rb*100:0).toFixed(1).replace('.',',')}%</td></tr>`).join('')}</tbody></table></section>
 <p class="note">Estrutura conforme a Lei 6.404/76. Calculada a partir dos lançamentos pagos da empresa no período, agrupados por categoria (regime de caixa).</p>`}
function render(){
 if(!S)return;
 $('#uName').textContent=U().u+(S.admin?' · Administrador':' · '+cur().name);const sel=$('#coSel');sel.hidden=!S.admin;sel.innerHTML=A.co.map(c=>`<option value="${c.id}"${c.id===S.co?' selected':''}>${esc(c.name)}</option>`).join('');
 $('#nav').innerHTML=views().map(v=>`<button class="${v===st.view?'on':''}" data-v="${v}">${v}</button>`).join('');
 const v=st.view;
 $('#app').innerHTML=(!S.admin?`<div class="demo">Acesso somente para visualização${cur().snap?' · dados de '+new Date(cur().snap).toLocaleDateString('pt-BR'):''}. Dúvidas? Use o botão Suporte.</div>`:'')+(v==='Visão geral'&&cur().demo?'<div class="demo">Você está vendo <b>dados de demonstração</b>. Os valores são fictícios.</div>':'')+
  (v==='Visão geral'?overview():v==='Movimentações'?list('Movimentações',TX,'Todos os lançamentos da empresa'):v==='DRE'?dreView():v==='Administração'&&S.admin?adminView():v==='Minha conta'?acctView():v==='Novo lançamento'&&S.admin?newTxView():v==='Clientes'&&S.admin?clientsView():
  v==='Contas a pagar'?list('Contas a pagar',TX.filter(x=>x.t==='out'&&x.s==='pendente'),'Compromissos pendentes'):
  list('Contas a receber',TX.filter(x=>x.t==='in'&&x.s==='pendente'),'Recebimentos pendentes'));
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-v],[data-n],[data-go],#csv');if(!b)return;
 if(b.dataset.v||b.dataset.go){st.view=b.dataset.v||b.dataset.go;st.q='';scrollTo(0,0)}
 if(b.dataset.n)st.n=+b.dataset.n;
 if(b.id==='csv'){const rows=[['Mês','Entradas','Saídas','Resultado'],...M.map((m,i)=>[m,IN[i],OUT[i],IN[i]-OUT[i]])];
  const u=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.join(';')).join('\n')],{type:'text/csv'}));const a=document.createElement('a');a.href=u;a.download='yfm-fluxo-de-caixa.csv';a.click();URL.revokeObjectURL(u);toast('Arquivo CSV baixado.');return}
 render()});
document.addEventListener('input',e=>{if(e.target.id==='q'){st.q=e.target.value;const p=e.target.selectionStart;render();const q=$('#q');q.focus();q.setSelectionRange(p,p)}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
addEventListener('error',e=>{const L=document.getElementById('lock');if(L){L.hidden=false;L.innerHTML='<div class="lk"><h1>Algo deu errado</h1><p class="sub">'+String(e.message).replace(/</g,'&lt;')+'</p><p class="sub">Tire um print desta tela e envie ao suporte.</p></div>'}});
const DEF_MAIL='strategicfinanceleadfinancelea@gmail.com';let KEY='yfm_auth_v3',CL=false;const SRC='<!DOCTYPE html>\n'+document.documentElement.outerHTML;const IDLE=15*60*1000,DUMMY={s:'00'.repeat(16),h:''};let A=null,S=null,last=0;
const U=()=>A.us.find(x=>x.id===S.u),cur=()=>A.co.find(c=>c.id===S.co);
const okMail=m=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m),nk=s=>s.trim().toLowerCase();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(A))}catch(e){toast('Não foi possível salvar neste navegador.')}}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function dk(pw,s){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:s,iterations:600000,hash:'SHA-256'},k,256))}
async function mk(pw){const s=crypto.getRandomValues(new Uint8Array(16));return{s:hex(s),h:await dk(pw,s)}}
async function chk(pw,e){return !!e&&await dk(pw,new Uint8Array(e.s.match(/../g).map(x=>parseInt(x,16))))===e.h}

const CATS={in:['Receita de vendas'],out:['Impostos sobre vendas','CMV','Despesa com pessoal','Despesa administrativa','Despesa financeira']};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
function derive(){const d0=new Date(),co=cur();KEYS=[...Array(6)].map((_,i)=>iso(new Date(d0.getFullYear(),d0.getMonth()-5+i,1)));M=KEYS.map(k=>MON[+k.slice(5)-1]);
 const pg=co.tx.filter(x=>x.s==='pago'),mo=(m,t)=>sum(pg.filter(x=>x.t===t&&x.d.slice(0,7)===m).map(x=>x.v));
 IN=KEYS.map(m=>mo(m,'in'));OUT=KEYS.map(m=>mo(m,'out'));SALDO=(co.s0||0)+sum(pg.map(x=>x.t==='in'?x.v:-x.v));
 TX=[...co.tx].sort((a,b)=>b.d.localeCompare(a.d)).map(x=>({...x,d:x.d.slice(8)+'/'+x.d.slice(5,7)+'/'+x.d.slice(0,4)}))}
function seedCo(id,name,k,demo){const f=v=>Math.round(v*k*100)/100,tx=[];let n=0;
 const add=(d,nm,c,v,t,s)=>{if(v)tx.push({id:id+'_'+(n++),d,n:nm,c,v:f(v),t,s})};
 SB.i.forEach((v,i)=>{const d='2026-'+String(5+i).padStart(2,'0')+'-05';add(d,'Vendas do mês','Receita de vendas',v,'in','pago');
  [['Impostos sobre vendas',.08,'Simples Nacional (DAS)'],['CMV',.42,'Compra de insumos'],['Despesa com pessoal',.28,'Folha de pagamento'],['Despesa administrativa',.14,'Aluguel, energia e outros'],['Despesa financeira',.08,'Tarifas e juros']].forEach(([c,p,nm])=>add(d,nm,c,SB.o[i]*p,'out','pago'))});
 SB.p.forEach(x=>add('2026-10-'+x[0],x[1],x[2],x[3],x[4],'pendente'));
 return {id,name,demo,s0:f(10761),tx}}
const SB={i:[17400,18100,19200,20450,18600,20450],o:[12900,13000,13100,13200,12850,14770],p:[['12','Fornecedor de laticínios','CMV',1320,'out'],['14','Café da manhã corporativo','Receita de vendas',5800,'in'],['15','Folha de pagamento','Despesa com pessoal',6200,'out'],['18','Encomenda de buffet','Receita de vendas',4200,'in'],['20','Simples Nacional (DAS)','Impostos sobre vendas',1650,'out'],['25','Cartão de crédito a receber','Receita de vendas',4300,'in'],['28','Aluguel do ponto','Despesa administrativa',2800,'out']]};
const pv=t=>{t=t.trim();return t.includes(',')?parseFloat(t.replace(/\./g,'').replace(',','.')):parseFloat(t)};
function newTxView(){const t=st.nt||'in',h=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
 return `<div class="head"><div><h1>Novo lançamento</h1><p class="sub">${esc(cur().name)}</p></div></div><section class="card"><div class="g3">
 <div><label class="f" for="tt">Tipo</label><select class="in2" id="tt"><option value="in"${t==='in'?' selected':''}>Receita (entrada)</option><option value="out"${t==='out'?' selected':''}>Despesa (saída)</option></select></div>
 <div><label class="f" for="tc">Categoria</label><select class="in2" id="tc">${CATS[t].map(c=>`<option>${c}</option>`).join('')}</select></div>
 <div><label class="f" for="tn">Descrição</label><input class="in2" id="tn" maxlength="80" placeholder="Ex.: Venda de bolos"></div>
 <div><label class="f" for="tv">Valor (R$)</label><input class="in2" id="tv" inputmode="decimal" placeholder="1.250,00"></div>
 <div><label class="f" for="td">Data</label><input class="in2" id="td" type="date" value="${h}"></div>
 <div><label class="f" for="ts">Situação</label><select class="in2" id="ts"><option value="pago">Já pago / recebido</option><option value="pendente">Pendente (a pagar / a receber)</option></select></div></div>
 <button class="btn" data-act="addtx">Adicionar lançamento</button></section>`}
function clientFile(us){const c=A.co.find(x=>x.id===us.co),seed={id:'k'+Date.now().toString(36),support:A.support,co:[{...c,snap:Date.now()}],us:[us],log:[],f:{}};
 const j=JSON.stringify(seed).replace(/</g,'\\u003c');
 return {name:'YFM-Finance-'+c.name.normalize('NFD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'')+'.html',html:SRC.replace('</head>','<scr'+'ipt id="yfm-seed" type="application/json">'+j+'</scr'+'ipt>\n</head>')}}
function save(name,html,type){const u=URL.createObjectURL(new Blob([html],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function pwErr(p,u){if(p.length<10)return 'A senha precisa ter pelo menos 10 caracteres.';if(!/[a-zA-Z]/.test(p)||!/\d/.test(p))return 'Use letras e números na senha.';if(u&&p.toLowerCase().includes(nk(u).replace(/\s/g,'')))return 'A senha não pode conter o nome de usuário.';return ''}
function log(e,u){A.log.unshift({t:Date.now(),u:String(u).slice(0,40),e});A.log.length=Math.min(A.log.length,40)}
function useCo(){st.view='Visão geral';st.q='';derive()}
function enter(u){const admin=u.role==='admin';S={u:u.id,admin,co:admin?A.co[0].id:u.co};useCo();last=Date.now();$('#lock').hidden=true;scrollTo(0,0);render()}
function support(why){const to=(A&&A.support)||DEF_MAIL;if(!to){toast('E-mail de suporte não configurado. Peça ao administrador.');return}
 const body=`Olá, preciso de ajuda com o YFM Finance.\n\nAssunto: ${why}\nUsuário: ${S?U().u:'(sem login)'}\nEmpresa: ${S?cur().name:'-'}\n\nPor segurança, não envie senhas neste e-mail.`;
 open('https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(to)+'&su='+encodeURIComponent('Suporte YFM Finance: '+why)+'&body='+encodeURIComponent(body),'_blank','noopener')}
function lockView(msg=''){const L=$('#lock');L.hidden=false;S=null;$('#app').innerHTML='';
 const brand='<div class="logo" style="color:#000"><i>YFM</i>Finance</div>';
 if(!A){L.innerHTML=`<form class="lk" id="setup">${brand}<h1>Criar conta de administrador</h1><p class="sub">Esta conta acessa todas as empresas e cria as contas dos clientes.</p>
 <label class="f" for="an">Nome da conta</label><input class="in2" id="an" value="YFM Finance" maxlength="40" autocomplete="username">
 <label class="f" for="p1">Senha</label><input class="in2" id="p1" type="password" autocomplete="new-password"><div class="pw-h">Mínimo 10 caracteres, com letras e números.</div>
 <label class="f" for="p2">Repita a senha</label><input class="in2" id="p2" type="password" autocomplete="new-password">
 <label class="f" for="em">E-mail de suporte (Gmail)</label><input class="in2" id="em" type="email" value="strategicfinanceleadfinancelea@gmail.com" placeholder="seuemail@gmail.com">
 <div class="err" id="err"></div><button class="btn">Criar e entrar</button></form>`;return}
 L.innerHTML=`<form class="lk" id="login">${brand}<h1>Entrar</h1><p class="sub">Use o usuário e a senha da sua conta.</p>
 <label class="f" for="us">Usuário</label><input class="in2" id="us" maxlength="40" autocomplete="username">
 <label class="f" for="pw">Senha</label><input class="in2" id="pw" type="password" autocomplete="current-password">
 <div class="err" id="err" role="alert">${esc(msg)}</div><button class="btn">Entrar</button>
 <button type="button" class="lnk" data-act="sup2">${CL?'Esqueci minha senha / ajuda':'Preciso de ajuda'}</button>${CL?'':'<button type="button" class="lnk" data-act="reset">Esqueci a senha do administrador</button>'}</form>`;
 $('#us').focus()}
function pwForm(){return `<div class="g3"><input class="in2" id="c0" type="password" placeholder="Senha atual" autocomplete="current-password" aria-label="Senha atual"><input class="in2" id="c1" type="password" placeholder="Nova senha" autocomplete="new-password" aria-label="Nova senha"><input class="in2" id="c2" type="password" placeholder="Repita a nova senha" autocomplete="new-password" aria-label="Repita a nova senha"></div><button class="btn" data-act="chpw">Alterar minha senha</button>`}
function acctView(){const u=U();return `<div class="head"><div><h1>Minha conta</h1><p class="sub">${esc(u.u)} · ${S.admin?'Administrador, acessa todas as empresas':'Somente visualização de '+esc(cur().name)}</p></div></div><section class="card"><h2>Alterar senha</h2><p class="sub">Mínimo 10 caracteres, com letras e números.</p>${pwForm()}</section>`}
function clientsView(){const cl=A.us.filter(u=>u.role==='empresa');
 return `<div class="head"><div><h1>Clientes</h1><p class="sub">Crie o acesso de cada cliente. Ele só visualiza a própria empresa; quem lança os dados é você.</p></div></div><div class="adm">
 <section class="card"><h2>Nova conta de cliente</h2><div class="g3"><div><label class="f" for="cn">Usuário do cliente</label><input class="in2" id="cn" maxlength="40" placeholder="Ex.: Juca do Café"></div><div><label class="f" for="cp">Senha (mín. 10, letras e números)</label><input class="in2" id="cp" type="password" autocomplete="new-password"></div><div><label class="f" for="ce">Empresa</label><select class="in2" id="ce"><option value="new">Criar empresa nova com esse nome</option>${A.co.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div></div>
 <button class="btn" data-act="addcli">Criar conta do cliente</button><div class="pw-h">Depois: clique em <b>Lançar dados</b>, cadastre as movimentações e baixe o <b>Arquivo do cliente</b> para enviar.</div></section>
 <section class="card"><h2>Contas de clientes (${cl.length})</h2>${cl.length?cl.map(u=>`<div class="ln"><div><b>${esc(u.u)}</b><br><span class="chip n" style="margin-top:6px">${esc((A.co.find(c=>c.id===u.co)||{}).name||'?')}</span></div><input class="in2" id="rp_${u.id}" type="password" placeholder="Nova senha" autocomplete="new-password" aria-label="Nova senha de ${esc(u.u)}"><button class="btn sm" data-act="rpw" data-id="${u.id}">Definir senha</button><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="golaunch" data-id="${u.id}">Lançar dados</button><button class="btn o sm" data-act="dl" data-id="${u.id}">Arquivo do cliente</button><button class="btn d sm" data-act="deluser" data-id="${u.id}">Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum cliente ainda. Crie o primeiro acima.</div>'}</section></div>`}
function adminView(){const lab=u=>u.role==='admin'?'Administrador (todas)':'Somente: '+esc((A.co.find(c=>c.id===u.co)||{}).name||'?');
 return `<div class="head"><div><h1>Administração</h1><p class="sub">Contas de acesso, empresas e suporte. Só administradores veem esta área.</p></div></div><div class="adm">
 <section class="card"><h2>Administradores</h2><p class="sub">Contas com acesso total. As contas dos clientes ficam no painel <b>Clientes</b>.</p>
 ${A.us.filter(u=>u.role==='admin').map(u=>`<div class="ln"><div><b>${esc(u.u)}</b><br><span class="chip ${u.role==='admin'?'g':'n'}" style="margin-top:6px">${lab(u)}</span></div><input class="in2" id="rp_${u.id}" type="password" placeholder="Nova senha (mín. 10)" autocomplete="new-password" aria-label="Nova senha de ${esc(u.u)}"><button class="btn sm" data-act="rpw" data-id="${u.id}">Definir senha</button><div style="display:flex;gap:6px;flex-wrap:wrap">${u.role==='empresa'?`<button class="btn o sm" data-act="dl" data-id="${u.id}">Arquivo do cliente</button>`:''}${u.id===S.u?'<span class="sub">Você</span>':`<button class="btn d sm" data-act="deluser" data-id="${u.id}">Excluir</button>`}</div></div>`).join('')}
 <h2 style="margin-top:22px">Novo administrador</h2><div class="g3"><input class="in2" id="nu" maxlength="40" placeholder="Nome de usuário (ex.: Juca do Café)" aria-label="Nome de usuário"><input class="in2" id="np" type="password" placeholder="Senha (mín. 10)" autocomplete="new-password" aria-label="Senha"></div><button class="btn" data-act="adduser">Criar administrador</button></section>
 <section class="card"><h2>Empresas</h2>${A.co.map(c=>`<div class="ln" style="grid-template-columns:1fr auto"><input class="in2" id="nm_${c.id}" value="${esc(c.name)}" aria-label="Nome da empresa"><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn o sm" data-act="renco" data-id="${c.id}">Renomear</button>${c.demo?`<button class="btn o sm" data-act="clr" data-id="${c.id}">Limpar demonstração</button>`:''}<button class="btn d sm" data-act="delco" data-id="${c.id}">Excluir</button></div></div>`).join('')}
 <div class="tools" style="margin:16px 0 0"><input class="in2" id="new" placeholder="Nome da nova empresa" aria-label="Nome da nova empresa" style="flex:1"><button class="btn" data-act="addco">Adicionar empresa</button></div></section>
 <section class="card"><h2>Suporte por Gmail</h2><div class="tools" style="margin:14px 0 0"><input class="in2" id="sm" type="email" value="${esc(A.support||'')}" placeholder="seuemail@gmail.com" aria-label="E-mail de suporte" style="flex:1"><button class="btn" data-act="mail">Salvar e-mail</button><button class="btn o" data-act="tmail">Testar</button></div></section>
 <section class="card scroll"><h2>Atividade recente</h2><table><thead><tr><th>Quando</th><th>Usuário</th><th>Evento</th></tr></thead><tbody>${A.log.slice(0,15).map(l=>`<tr><td>${new Date(l.t).toLocaleString('pt-BR')}</td><td>${esc(l.u)}</td><td>${esc(l.e)}</td></tr>`).join('')}</tbody></table></section></div>
 <p class="note">Senhas protegidas por PBKDF2 e salvas só neste navegador. Contas travam após 5 erros e a sessão expira em 15 minutos sem uso. É proteção de demonstração: para dados reais, a verificação precisa ficar em um servidor.</p>`}
document.addEventListener('submit',async e=>{e.preventDefault();const f=e.target.id,err=m=>{$('#err').textContent=m};
 if(f==='setup'){const n=$('#an').value.trim(),p=$('#p1').value,em=$('#em').value.trim();
  if(n.length<3)return err('Informe o nome da conta (mínimo 3 letras).');
  const pe=pwErr(p,n);if(pe)return err(pe);
  if(p!==$('#p2').value)return err('As senhas não são iguais.');
  if(em&&!okMail(em))return err('E-mail de suporte inválido.');
  const u={id:'u1',u:n,role:'admin',co:null,p:await mk(p)};
  A={support:em,co:[seedCo('c1','Padaria Estrela Ltda',1,true),seedCo('c2','Juca do Café',.35,true),{id:'c3',name:'Empresa C — Nova',s0:0,tx:[]}],us:[u],log:[],f:{}};log('Conta de administrador criada',n);persist();enter(u)}
 if(f==='login'){const name=$('#us').value,pw=$('#pw').value,k=nk(name);A.f=A.f||{};const fl=A.f[k]||{n:0,t:0};
  if(Date.now()<fl.t)return err('Muitas tentativas. Tente de novo em '+Math.ceil((fl.t-Date.now())/1000)+' s.');
  const u=A.us.find(x=>nk(x.u)===k),ok=await chk(pw,u?u.p:DUMMY);
  if(!u||!ok||(u.role!=='admin'&&!A.co.some(c=>c.id===u.co))){fl.n++;if(fl.n%5===0)fl.t=Date.now()+Math.min(900,30*2**(fl.n/5-1))*1000;A.f[k]=fl;const ks=Object.keys(A.f);if(ks.length>30)delete A.f[ks[0]];log('Falha de login',name||'(vazio)');persist();return err('Usuário ou senha incorretos.')}
  delete A.f[k];log('Entrou',u.u);persist();enter(u)}});
document.addEventListener('change',e=>{if(e.target.id==='tt'){st.nt=e.target.value;render();return}
 if(e.target.id==='coSel'&&S&&S.admin&&A.co.some(c=>c.id===e.target.value)){S.co=e.target.value;useCo();render()}});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id,co=A&&A.co.find(x=>x.id===id),us=A&&A.us.find(x=>x.id===id),v=i=>$('#'+i).value;
 if(a==='out')return lockView();
 if(a==='sup'||a==='sup2')return support('Dúvida de uso');
 if(a==='reset'){if(confirm('Isto apaga TODAS as contas e senhas salvas neste navegador. Você precisará criar um novo administrador. Continuar?')){try{localStorage.removeItem(KEY)}catch(x){}A=null;lockView()}return}
 if(!S)return;
 const mine=cur();
 if(a==='addtx'){if(!S.admin)return;const t=v('tt'),n=v('tn').trim(),val=pv(v('tv')),d=v('td'),c=v('tc');
  if(!n)return toast('Informe a descrição.');if(!(val>0&&val<1e9))return toast('Informe um valor maior que zero.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||+d.slice(0,4)<2000||+d.slice(0,4)>2100)return toast('Informe uma data válida.');
  if(!CATS[t]||!CATS[t].includes(c))return toast('Categoria inválida.');if(mine.tx.length>=5000)return toast('Limite de lançamentos atingido.');
  mine.tx.push({id:'t'+Date.now()+Math.random().toString(36).slice(2,6),d,n,c,v:Math.round(val*100)/100,t,s:v('ts')==='pendente'?'pendente':'pago'});persist();derive();render();return toast('Lançamento adicionado.')}
 if(a==='pay'||a==='deltx'){if(!S.admin)return;const x=mine.tx.find(y=>y.id===id);if(!x)return;
  if(a==='pay')x.s='pago';else{if(!confirm('Excluir este lançamento?'))return;mine.tx=mine.tx.filter(y=>y!==x)}persist();derive();render();return}
 if(a==='chpw'){if(!await chk(v('c0'),U().p))return toast('Senha atual incorreta.');const pe=pwErr(v('c1'),U().u);if(pe)return toast(pe);if(v('c1')!==v('c2'))return toast('As senhas novas não são iguais.');U().p=await mk(v('c1'));log('Senha alterada',U().u);persist();render();return toast('Senha alterada.')}
 if(!S.admin)return;
if(a==='golaunch'){if(!us||!A.co.some(c=>c.id===us.co))return;S.co=us.co;useCo();st.view='Novo lançamento';render();return}
 if(a==='addcli'){const n=v('cn').trim(),pw=v('cp'),e=v('ce');if(n.length<3)return toast('Informe o usuário do cliente (mínimo 3 letras).');if(A.us.some(x=>nk(x.u)===nk(n)))return toast('Já existe uma conta com esse nome.');const pe=pwErr(pw,n);if(pe)return toast(pe);
  let cid=e;if(e==='new'){cid='c'+Date.now();A.co.push({id:cid,name:n,s0:0,tx:[]})}else if(!A.co.some(c=>c.id===e))return toast('Escolha uma empresa válida.');
  A.us.push({id:'u'+Date.now(),u:n,role:'empresa',co:cid,p:await mk(pw)});log('Conta de cliente criada: '+n,U().u);persist();render();return toast('Conta do cliente criada.')}
 if(a==='dl'){if(!us||us.role!=='empresa')return;const f=clientFile(us);save(f.name,f.html,'text/html');log('Arquivo do cliente gerado: '+us.u,U().u);persist();return toast('Arquivo baixado. Envie só para essa pessoa.')}
 if(a==='clr'){if(!confirm('Apagar os dados de demonstração de "'+co.name+'"?'))return;co.tx=[];co.s0=0;co.demo=false;persist();if(S.co===id)derive();render();return toast('Dados de demonstração apagados.')}
 if(a==='rpw'){const pe=pwErr(v('rp_'+id),us.u);if(pe)return toast(pe);us.p=await mk(v('rp_'+id));log('Senha redefinida para '+us.u,U().u);persist();render();toast('Senha definida.')}
 if(a==='deluser'){if(id===S.u||!confirm('Excluir a conta "'+us.u+'"?'))return;A.us=A.us.filter(x=>x.id!==id);log('Conta excluída: '+us.u,U().u);persist();render();toast('Conta excluída.')}
 if(a==='adduser'){const n=v('nu').trim(),pw=v('np'),t=$('#nt')?v('nt'):'admin';if(n.length<3)return toast('Informe o nome de usuário (mínimo 3 letras).');if(A.us.some(x=>nk(x.u)===nk(n)))return toast('Já existe uma conta com esse nome.');const pe=pwErr(pw,n);if(pe)return toast(pe);if(t!=='admin'&&!A.co.some(c=>c.id===t))return toast('Escolha uma empresa válida.');A.us.push({id:'u'+Date.now(),u:n,role:t==='admin'?'admin':'empresa',co:t==='admin'?null:t,p:await mk(pw)});log('Conta criada: '+n,U().u);persist();render();toast('Conta criada.')}
 if(a==='renco'){const n=v('nm_'+id).trim();if(!n)return toast('Informe o nome da empresa.');co.name=n;persist();render();toast('Empresa renomeada.')}
 if(a==='delco'){if(A.co.length<2)return toast('Mantenha pelo menos uma empresa.');if(!confirm('Excluir "'+co.name+'" e as contas ligadas a ela?'))return;A.co=A.co.filter(x=>x.id!==id);A.us=A.us.filter(x=>x.co!==id);if(S.co===id){S.co=A.co[0].id;useCo()}log('Empresa excluída: '+co.name,U().u);persist();render();toast('Empresa excluída.')}
 if(a==='addco'){const n=v('new').trim();if(!n)return toast('Informe o nome da empresa.');A.co.push({id:'c'+Date.now(),name:n,s0:0,tx:[]});persist();render();toast('Empresa adicionada.')}
 if(a==='mail'||a==='tmail'){const m=v('sm').trim();if(!okMail(m))return toast('Digite um e-mail válido.');A.support=m;persist();if(a==='tmail')support('Teste de suporte');else toast('E-mail de suporte salvo.')}});
['click','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{last=Date.now()},{passive:true}));
setInterval(()=>{if(S&&Date.now()-last>IDLE)lockView('Sessão encerrada por inatividade.')},30000);
function boot(){if(!(window.crypto&&crypto.subtle)){$('#lock').innerHTML='<div class="lk"><h1>Navegador sem suporte</h1><p class="sub">Abra este arquivo direto no Chrome, Edge ou Firefox (clique duas vezes no arquivo). Ele não funciona dentro de pré-visualizações de apps ou de sites.</p></div>';return}
 let sd=null;try{const e=document.getElementById('yfm-seed');if(e)sd=JSON.parse(e.textContent)}catch(e){}
 CL=!!sd;KEY=sd?'yfm_c_'+sd.id:'yfm_auth_v3';
 try{['yfm_auth_v1','yfm_auth_v2'].forEach(k=>localStorage.removeItem(k));A=JSON.parse(localStorage.getItem(KEY))||sd}catch(e){A=sd}
 lockView()}
boot();
