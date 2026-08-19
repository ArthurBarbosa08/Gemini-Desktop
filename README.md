# Gemini Desktop

Cliente desktop não-oficial do Google Gemini com integração de workspace local — selecione uma pasta do seu projeto, injete o código no chat e comece a desenvolver com contexto completo.

## O que faz

- Carrega o Gemini em uma janela Electron desktop com sessão de login persistente (não precisa logar toda vez)
- Injeta um botão flutuante na interface do Gemini ("📁 Inserir Pasta do Projeto")
- Ao clicar, abre o seletor nativo de pastas do Windows
- Lê os arquivos de código da pasta selecionada recursivamente (ignora `node_modules`, `.git`, `dist`, etc.)
- Formata tudo em um prompt Markdown pronto para enviar ao Gemini

## Como funciona

```
Usuário → App Electron → Gemini Web → IA com contexto
```

1. Você clica no botão "Inserir Pasta do Projeto"
2. O seletor de pastas nativo do Windows abre
3. O app varre a estrutura, ignora diretórios pesados e lê arquivos de código (JS, TS, Python, Rust, Go, Java, C/C++, etc.) limitados a 100KB cada
4. Monta um prompt com a estrutura e o conteúdo de cada arquivo
5. Insere tudo na caixa de chat do Gemini
6. Você envia e o Gemini analisa o projeto com contexto completo

## Instalação e uso

```bash
npm install
npm start
```

Isso abre o app. Faça login no Google quando pedido (sessão é mantida entre execuções). O botão de injeção aparece após o Gemini carregar.

## Gerar executável

```bash
npm run dist
```

Gera o `gemini-desktop 1.0.1.exe` portable na pasta `dist/` — sem necessidade de instalação.

## Tecnologias

- Electron 31
- Node.js
- JavaScript
- electron-builder

## Estrutura

```
gemini-desktop/
├── main.js          # Processo principal Electron, janela e IPC
├── preload.js       # Ponte segura entre processos
├── injector.js      # Script injetado na página do Gemini
├── package.json     # Dependências e configuração de build
├── icon.png         # Ícone do app
└── dist/            # Build gerado
```

## Configurações relevantes

| Campo | Valor |
|---|---|
| `appId` | `com.gemini.desktop` |
| `target` | `portable` |
| `partition` | `persist:gemini` (sessão persistente) |
| `contextIsolation` | true |
| `nodeIntegration` | false |

## Limitações

- **Não-oficial:** Não é afiliado ao Google. Mudanças na interface web do Gemini podem quebrar a injeção de scripts.
- **Windows apenas:** Seletor de arquivos implementado para Windows. Mac/Linux não suportados no build atual.
- **Login manual:** Requer login no Google na primeira execução.
- **Filtros:** Ignora `node_modules`, `.git`, `dist`, `build`, `.next`, `.agents`, `.gemini`, `brain` e arquivos acima de 100KB.

## Aviso

Uso pessoal. Não afiliado ao Google.
