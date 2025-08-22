# Painel de Controle para Clãs de Clash Royale

Este é um painel de controle de código aberto para clãs de Clash Royale, projetado para fornecer insights sobre a participação e o desempenho dos membros, com foco especial nas Guerras de Clãs.

## 🚀 Funcionalidades Principais

*   **Visão Geral do Clã:** Métricas essenciais como número de membros, pontuações, tendências de desempenho e histórico recente.
*   **Análise de Guerra Detalhada:** Um painel completo com métricas de participação, relatórios visuais e uma tabela de jogadores interativa.
*   **Tabela Interativa:** Ordene os dados da guerra por nome, decks usados, fama ou status para uma análise rápida e eficiente.
*   **Análise com IA:** IA gera resumos e sugestões de ação com base nos dados da guerra.

### 🔑 Usando a Análise com IA

Para ativar a funcionalidade de análise por IA, é necessário configurar uma chave de API do Google AI Studio.

1.  Clique no ícone de **engrenagem (⚙️)** no canto superior direito do painel.
2.  Cole sua chave de API do **Google AI Studio** no campo indicado.
3.  Clique em "Salvar".

> **Nota de Segurança:** Sua chave de API é salva de forma segura **apenas no seu navegador** (`localStorage`) e nunca é exposta no repositório ou a outros usuários.

## 🛠️ Como Funciona

Este projeto consiste em arquivos HTML, CSS e JavaScript estáticos que são servidos diretamente pelo GitHub Pages.

Os dados exibidos nos painéis são gerados por um processo externo (um script Python, não incluído neste repositório) que consome a API oficial da Supercell, processa os dados e os injeta nos arquivos HTML.

## 📂 Estrutura do Projeto

-   `online/index.html`: **Visão Geral**.
-   `online/war_analysis.html`: **Análise de Guerra**.
-   `online/leaderboard.html`: **Leaderboard**.
-   `online/style.css`: Folha de estilo unificada.
-   `online/script.js`: Script para todas as funcionalidades interativas.
