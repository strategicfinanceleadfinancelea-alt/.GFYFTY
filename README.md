# YFM Finance

Painel de gestão financeira com **DRE** e **fluxo de caixa**, feito para donos de pequenas empresas e escritórios de contabilidade. O administrador lança os dados de cada empresa e cada cliente tem uma conta própria, protegida por senha, para **visualizar somente a sua empresa**.

![YFM Finance](assets/yfm-finance-produto.png)

> **Estado do projeto:** demonstração/protótipo. Tudo roda no navegador, sem servidor. Veja [Limitações](#limitações) antes de usar com dados reais.

## Demonstração

Depois de publicar no GitHub Pages (passo a passo abaixo), o endereço será:
`https://SEU-USUARIO.github.io/yfm-finance/`

Ou, localmente: dê dois cliques em `index.html` (use Chrome, Edge ou Firefox).

## Funcionalidades

- **Visão geral:** saldo em caixa, entradas, saídas, resultado e margem, com variação sobre o período anterior e gráfico mensal.
- **DRE** conforme a estrutura da Lei 6.404/76, da receita bruta ao lucro líquido, com análise vertical, por mês, 3 meses ou 6 meses.
- **Movimentações, contas a pagar e contas a receber**, com busca, total e baixa de lançamentos.
- **Novo lançamento** (receita ou despesa) com categoria, valor, data e situação.
- **Contas separadas:**
  - *Administrador*: acessa todas as empresas, lança e altera dados, cria clientes e administradores.
  - *Cliente*: entra com usuário e senha próprios e só **visualiza** a própria empresa.
- **Painel Clientes:** cria a conta do cliente (e a empresa, se for nova), redefine senhas e gera o **Arquivo do cliente**.
- **Arquivo do cliente:** um HTML com apenas a empresa e o acesso daquele cliente, para enviar a ele.
- **Suporte por Gmail:** o botão Suporte abre uma mensagem pronta no Gmail.
- **Segurança básica:** senhas com PBKDF2 (600 mil iterações), política de senha forte, bloqueio progressivo após 5 erros, sessão que expira em 15 minutos, registro de atividade e CSP.

## Como usar

1. Abra `index.html`.
2. No primeiro acesso, crie a conta de **administrador** (nome, senha e e-mail de suporte).
3. Em **Clientes**, crie a conta do cliente e escolha a empresa (ou crie uma nova).
4. Clique em **Lançar dados** e cadastre as movimentações. Para começar do zero, use **Limpar demonstração** em Administração.
5. Clique em **Arquivo do cliente** e envie o arquivo ao cliente. Mande a senha por outro canal.
6. Sempre que atualizar os lançamentos, gere e envie o arquivo novamente.

## Estrutura do projeto

```
yfm-finance/
├── index.html        # aplicação final, arquivo único (é o que roda e o que vai ao Pages)
├── src/
│   ├── template.html # estrutura HTML
│   ├── styles.css    # estilos
│   └── app.js        # lógica (dados, DRE, contas, segurança)
├── build.py          # junta src/ em index.html
├── tests/            # teste automático de fumaça
├── assets/           # imagens do projeto
├── package.json
└── LICENSE
```

**Por que `index.html` é um arquivo único?** O recurso *Arquivo do cliente* gera o HTML do cliente a partir do próprio código da página. Por isso o CSS e o JavaScript ficam embutidos no arquivo final.

### Editando o código

1. Altere os arquivos em `src/`.
2. Rode `python3 build.py` para regenerar o `index.html`.
3. Rode os testes: `npm install` e depois `npm test`.

O e-mail de suporte padrão está na constante `DEF_MAIL`, em `src/app.js`. Troque por o seu antes de publicar, se quiser outro endereço.

## Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (por exemplo, `yfm-finance`) e envie estes arquivos.
2. Em **Settings > Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
3. Em alguns minutos o site fica em `https://SEU-USUARIO.github.io/yfm-finance/`.

## Limitações

Este projeto **não tem servidor**. Por isso:

- As contas e os lançamentos ficam salvos **só no navegador** (localStorage) de quem os criou. O que o cliente vê é uma cópia do dia em que o arquivo foi gerado.
- O bloqueio de edição para clientes é feito na tela. Quem tem conhecimento técnico pode alterar a própria cópia do arquivo, sem afetar as dos outros.
- O link "Esqueci a senha do administrador" apaga as contas salvas no navegador de quem tem o arquivo.
- Os dados da empresa de demonstração são fictícios.

**Não use com dados reais de clientes** sem antes mover a autenticação e os dados para um servidor.

## Próximos passos

- [ ] Back-end com autenticação e banco de dados (por exemplo, Supabase com Row Level Security), para os clientes verem os dados atualizados em qualquer aparelho.
- [ ] Importação de extratos (OFX/CSV).
- [ ] Exportação do DRE em PDF e Excel.
- [ ] Fluxo de caixa projetado e cenários.
- [ ] Gráfico em cascata e análise horizontal no DRE.

## Licença

[MIT](LICENSE)
