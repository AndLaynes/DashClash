# Painel de Acompanhamento - Joji Clã

Este repositório contém os arquivos estáticos para o painel de dados do clã **Joji** no jogo Clash Royale.

## 🚀 Acessando o Painel

O painel foi reestruturado para uma melhor experiência e pode ser acessado através do seguinte link:

**[https://andlaynes.github.io/DashClash/](https://andlaynes.github.io/DashClash/)**

## 📖 Sobre o Projeto

O objetivo deste painel é fornecer uma visão clara e objetiva sobre o desempenho dos membros do clã, com foco especial na participação em guerras. Ele serve como uma ferramenta para a gestão e para a tomada de decisões estratégicas.

As seções agora estão organizadas de forma mais intuitiva:
- **Visão Geral:** A página principal (`index.html`) com as métricas gerais do clã e destaques.
- **Análise de Guerra:** Um painel de gestão completo com análise de IA, relatórios visuais e uma tabela detalhada para ação rápida.
- **Leaderboard:** Um ranking competitivo dos membros.


## ⚙️ Como Funciona (Fluxo de Trabalho de Atualização)

O processo é simples e robusto, garantindo que você tenha total controle sobre os dados.

1.  **No seu PC (Local):**
    *   Execute seu script para baixar os dados mais recentes da Supercell API (ex: `main.py`). Os arquivos JSON serão salvos na pasta `temp_clan_data/`.
    *   Execute o script unificado **`gerar_relatorios.py`**. Ele processará os dados e irá gerar/sobrescrever **TODOS** os arquivos HTML (`index.html`, `war_analysis.html`, `leaderboard.html`) dentro da pasta `online/`.

2.  **No Site do GitHub (Publicar):**
    *   Navegue até seu repositório.
    *   Use a opção **`Add file -> Upload files`**.
    *   Arraste **todos os arquivos atualizados** da sua pasta `online/` local para a janela de upload.
    *   Confirme o upload (`Commit changes`). O GitHub Pages irá atualizar o site público automaticamente em poucos minutos.