import { GoogleGenAI } from "@google/genai";

// --- CONFIGURAÇÃO DA API ---
// A chave da API é obtida da variável de ambiente `process.env.API_KEY`
// que deve ser configurada no ambiente de execução.
const API_KEY = process.env.API_KEY;
let ai;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

// --- ELEMENTOS DO DOM ---
const generateBtn = document.getElementById('generate-ai-btn');
const exportBtn = document.getElementById('export-csv-btn');
const aiResponseEl = document.getElementById('ai-response');
const aiLoadingEl = document.getElementById('ai-loading');
const playerTableBody = document.getElementById('player-table-body');

// --- FUNÇÕES ---

/**
 * Coleta os dados da tabela de jogadores e os retorna como um array de objetos.
 * @returns {Array<{name: string, decks: string, status: string}>}
 */
function getPlayerData() {
    const rows = playerTableBody.querySelectorAll('tr');
    const data = [];
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 3) {
            const name = cells[0].textContent.trim();
            const decks = cells[1].textContent.trim();
            const status = cells[2].querySelector('.status').textContent.trim();
            if (name && !name.includes('(Aguardando dados...)')) {
                data.push({ name, decks, status });
            }
        }
    });
    return data;
}


/**
 * Formata os dados dos jogadores em uma string de texto para o prompt da IA.
 * @param {Array<Object>} data - Dados dos jogadores.
 * @returns {string} - String formatada para o prompt.
 */
function formatDataForPrompt(data) {
    if (data.length === 0) {
        return "Não há dados de jogadores para analisar.";
    }
    const playerLines = data.map(p => `- ${p.name}: ${p.decks} decks usados (Status: ${p.status})`);
    return `Dados de participação na guerra:\n${playerLines.join('\n')}`;
}

/**
 * Função principal para gerar a análise da IA.
 */
async function handleGenerateAnalysis() {
    if (!ai) {
        aiResponseEl.textContent = 'A chave da API do Gemini não foi configurada. Não é possível gerar a análise.';
        return;
    }
    
    const playerData = getPlayerData();
    if (playerData.length === 0) {
        aiResponseEl.innerHTML = '<small>Não há dados na tabela para analisar.</small>';
        return;
    }

    generateBtn.disabled = true;
    aiLoadingEl.style.display = 'flex';
    aiResponseEl.innerHTML = '';

    const promptData = formatDataForPrompt(playerData);
    const fullPrompt = `
        Você é um líder assistente de um clã de Clash Royale chamado "Joji Clã".
        Sua tarefa é analisar os dados de participação na guerra do dia e fornecer um resumo claro e uma sugestão de ação direta.
        Seja conciso, pragmático e direto. Use formatação com bullet points.

        **Análise Requerida:**
        1.  **Diagnóstico Rápido:** Forneça um resumo muito breve da situação (ex: "Muitos jogadores não participaram", "A maioria participou bem", etc.).
        2.  **Jogadores Críticos:** Liste os jogadores com 0 ou 1 deck usado, pois eles são a prioridade para uma ação (cobrança ou expulsão).
        3.  **Sugestão de Ação:** Com base nos dados, sugira uma ação clara e direta para o líder do clã (ex: "Enviar um aviso final para os jogadores com 0 decks", "Monitorar os jogadores com participação parcial", "Parabenizar o clã pelo bom desempenho").

        **Dados para Análise:**
        ${promptData}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        aiResponseEl.textContent = response.text;
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        aiResponseEl.textContent = 'Ocorreu um erro ao tentar gerar a análise. Verifique o console para mais detalhes.';
    } finally {
        generateBtn.disabled = false;
        aiLoadingEl.style.display = 'none';
    }
}

/**
 * Exporta os dados da tabela de jogadores para um arquivo CSV.
 */
function handleExportToCSV() {
    const playerData = getPlayerData();
    if (playerData.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    const headers = ['Nome do Jogador', 'Decks Usados', 'Status'];
    const csvContent = [
        headers.join(','),
        ...playerData.map(p => [p.name.replace(/,/g, ''), p.decks, p.status].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().slice(0, 10);
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_guerra_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateAnalysis);
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportToCSV);
    }
});