// Teste de fumaça: cria o administrador, percorre todas as telas, cria um cliente,
// gera o "Arquivo do cliente" e confere que ele só vê (e só tem) a própria empresa.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { webcrypto } = require('crypto');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const erros = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function abrir(src) {
  const w = new JSDOM(src, {
    runScripts: 'dangerously', url: 'http://localhost/',
    beforeParse(w) {
      Object.defineProperty(w, 'crypto', { value: webcrypto });
      w.TextEncoder = TextEncoder; w.scrollTo = () => {}; w.confirm = () => true;
      w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = () => {}; w.open = () => {};
    }
  }).window;
  w.addEventListener('error', e => erros.push(e.message));
  const $ = s => w.document.querySelector(s);
  return {
    w, $,
    all: s => [...w.document.querySelectorAll(s)],
    enviar: id => w.document.getElementById(id).dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })),
    clicar: s => $(s).dispatchEvent(new w.MouseEvent('click', { bubbles: true })),
    abas: () => [...w.document.querySelectorAll('nav button')].map(b => b.textContent),
  };
}

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? 'OK     ' : 'FALHOU ') + msg); if (!cond) falhas++; };

(async () => {
  const adm = abrir(html);
  adm.$('#p1').value = 'Segura12345'; adm.$('#p2').value = 'Segura12345';
  adm.enviar('setup'); await sleep(1500);
  ok(adm.abas().includes('Clientes') && adm.abas().includes('Administração'), 'administrador vê as abas Clientes e Administração');
  ok(/45\.141,00/.test(adm.$('.hero .big').textContent), 'saldo da empresa de demonstração calculado (R$ 45.141,00)');

  for (const aba of adm.abas()) { adm.clicar(`[data-v="${aba}"]`); await sleep(40); }
  adm.clicar('[data-v="DRE"]'); await sleep(30);
  ok(/5\.680,00/.test(adm.all('tr.tot td')[1].textContent), 'DRE: lucro líquido do mês = R$ 5.680,00');

  adm.clicar('[data-v="Clientes"]'); await sleep(30);
  adm.$('#cn').value = 'Maria Doces'; adm.$('#cp').value = 'Doces123456!'; adm.$('#ce').value = 'new';
  adm.clicar('[data-act="addcli"]'); await sleep(1500);
  const A = adm.w.eval('A');
  const cli = A.us.find(u => u.role === 'empresa');
  ok(!!cli, 'conta de cliente criada');

  const arq = adm.w.clientFile(cli);
  const c = abrir(arq.html);
  ok(c.w.eval('A.co.length') === 1, 'arquivo do cliente contém só 1 empresa');
  ok(!arq.html.includes(A.us[0].p.h), 'arquivo do cliente não contém a senha do administrador');

  c.$('#us').value = 'maria doces'; c.$('#pw').value = 'errada12345'; c.enviar('login'); await sleep(1500);
  ok(/incorretos/.test(c.$('#err').textContent), 'senha errada é recusada');
  c.$('#pw').value = 'Doces123456!'; c.enviar('login'); await sleep(1500);
  ok(!c.abas().includes('Administração') && !c.abas().includes('Clientes') && !c.abas().includes('Novo lançamento'),
     'cliente não vê abas de administração nem de lançamento');
  for (const aba of c.abas()) { c.clicar(`[data-v="${aba}"]`); await sleep(40); }
  c.clicar('[data-v="Movimentações"]'); await sleep(30);
  ok(c.all('[data-act=deltx],[data-act=pay]').length === 0, 'cliente não tem botões de editar lançamentos');

  ok(erros.length === 0, 'nenhum erro de JavaScript durante o teste' + (erros.length ? ': ' + erros.join('; ') : ''));
  console.log(falhas ? `\n${falhas} falha(s)` : '\nTodos os testes passaram.');
  process.exit(falhas ? 1 : 0);
})();
