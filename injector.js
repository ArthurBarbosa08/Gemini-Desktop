(function() {
  // Evitar injeção duplicada
  if (document.getElementById('gemini-desktop-helper-btn')) return;

  console.log("Gemini Desktop Helper ativo.");

  function initHelper() {
    // Procurar a área do prompt para injetar o botão de anexar arquivos do projeto
    const searchSelectors = [
      'div.input-area-container',
      'div.text-input-field-container',
      'rich-textarea',
      'div.ql-editor',
      'div.input-area'
    ];

    let targetContainer = null;
    for (const selector of searchSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        targetContainer = el;
        break;
      }
    }

    if (!targetContainer) {
      // Se a página ainda estiver carregando, tentar novamente em breve
      setTimeout(initHelper, 1000);
      return;
    }

    // Criar o botão flutuante de envio de projetos
    const btn = document.createElement('button');
    btn.id = 'gemini-desktop-helper-btn';
    btn.innerHTML = '📁 Inserir Pasta do Projeto';
    btn.style.cssText = `
      position: absolute;
      right: 80px;
      bottom: 12px;
      z-index: 9999;
      background: linear-gradient(135deg, #4285f4, #1a73e8);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-family: 'Google Sans', Roboto, sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    `;

    btn.addEventListener('mouseover', () => {
      btn.style.background = 'linear-gradient(135deg, #1a73e8, #1557b0)';
      btn.style.transform = 'translateY(-1px)';
    });

    btn.addEventListener('mouseout', () => {
      btn.style.background = 'linear-gradient(135deg, #4285f4, #1a73e8)';
      btn.style.transform = 'translateY(0)';
    });

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.electronAPI || !window.electronAPI.selectFolder) {
        alert("Erro: API do Electron não encontrada no contexto!");
        return;
      }

      btn.innerHTML = '⚡ Carregando arquivos...';
      try {
        const result = await window.electronAPI.selectFolder();
        if (!result) {
          btn.innerHTML = '📁 Inserir Pasta do Projeto';
          return;
        }

        // Formatar o conteúdo dos arquivos do projeto em Markdown
        let promptText = `Estou enviando os arquivos do meu projeto local de: \`${result.path}\`.\n\n`;
        promptText += `Aqui está a estrutura de arquivos e o código correspondente para você me auxiliar:\n\n`;

        result.files.forEach(file => {
          promptText += `### Arquivo: \`${file.path}\`\n`;
          promptText += `\`\`\`${getFileLanguage(file.name)}\n`;
          promptText += file.content;
          promptText += `\n\`\`\`\n\n`;
        });

        promptText += `Por favor, analise a estrutura e responda "Projeto carregado com sucesso!". Pergunte em que posso te ajudar sobre esse código.`;

        // Colar na caixa de texto do Gemini
        const editor = document.querySelector('rich-textarea div.ql-editor') || document.querySelector('textarea');
        if (editor) {
          if (editor.tagName === 'TEXTAREA') {
            editor.value = promptText;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            editor.innerHTML = `<p>${promptText.replace(/\n/g, '<br>')}</p>`;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          }
          btn.innerHTML = '✅ Projeto Injetado!';
          setTimeout(() => {
            btn.innerHTML = '📁 Inserir Pasta do Projeto';
          }, 3000);
        } else {
          alert("Não foi possível encontrar a caixa de chat para colar o código. Por favor, tente clicar de novo.");
          btn.innerHTML = '📁 Inserir Pasta do Projeto';
        }
      } catch (err) {
        console.error(err);
        alert("Ocorreu um erro ao carregar os arquivos: " + err.message);
        btn.innerHTML = '📁 Inserir Pasta do Projeto';
      }
    });

    // Inserir o botão no container de input do Gemini
    targetContainer.style.position = 'relative';
    targetContainer.appendChild(btn);
  }

  function getFileLanguage(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    };
    return map[ext] || '';
  }

  // Inicializar o helper após um breve momento
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initHelper, 2000);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(initHelper, 2000));
  }
})();
