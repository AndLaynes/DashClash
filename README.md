# Painel de Acompanhamento - Joji Clã

Este repositório contém os arquivos estáticos para o painel de dados do clã **Joji** no jogo Clash Royale.

## 🚀 Acessando o Painel

O painel está publicado e pode ser acessado através do seguinte link:

**[https://andlaynes.github.io/DashClash/](https://andlaynes.github.io/DashClash/)**

## 📖 Sobre o Projeto

O objetivo deste painel é fornecer uma visão clara e objetiva sobre o desempenho dos membros do clã, com foco especial na participação em guerras. Ele serve como uma ferramenta para a gestão e para a tomada de decisões estratégicas.

As diferentes seções incluem:
- **Painel de Gestão:** A página principal com métricas, análise de IA e uma tabela de ação rápida.
- **Visão Geral:** Métricas gerais do clã e histórico de desempenho.
- **Leaderboard:** Um ranking competitivo dos membros.
- **Relatórios de Guerra:** Análises detalhadas da participação em guerras.


## ⚙️ Como Funciona (Fluxo de Trabalho de Atualização)

O processo é simples e robusto, garantindo que você tenha total controle sobre os dados.

1.  **No seu PC (Local):**
    *   Execute seu script para baixar os dados mais recentes da Supercell API (ex: `main.py`). Os arquivos JSON serão salvos na pasta `temp_clan_data/`.
    *   Execute o script unificado **`gerar_relatorios.py`**. Ele processará os dados e irá gerar/sobrescrever **TODOS** os arquivos HTML (`index.html`, `relatorio_guerra_visual.html`, etc.) dentro da pasta `online/`.

2.  **No Site do GitHub (Publicar):**
    *   Navegue até seu repositório.
    *   Use a opção **`Add file -> Upload files`**.
    *   Arraste **todos os arquivos atualizados** da sua pasta `online/` local para a janela de upload.
    *   Confirme o upload (`Commit changes`). O GitHub Pages irá atualizar o site público automaticamente em poucos minutos.
