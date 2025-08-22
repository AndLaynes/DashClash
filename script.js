import { GoogleGenAI } from "@google/genai";

// --- CONFIGURAÇÃO DA API ---
const API_KEY_STORAGE_KEY = 'gemini-api-key';
let ai;

// --- ELEMENTOS DO DOM ---
const generateBtn = document.getElementById('generate-ai-btn');
const exportBtn = document.getElementById('export-csv-btn');
const printBtn = document.getElementById('print-btn');
const aiResponseEl = document.getElementById('ai-response');
const aiLoadingEl = document.getElementById('ai-loading');
const playerTable = document.getElementById('player-data-table');
const playerTableBody = document.getElementById('player-table-body');
const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content-panel');

// Modal de API Key
const settingsBtn = document.getElementById('settings-btn');
const apiKeyModal = document.getElementById('api-key-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const apiKeyInput = document.getElementById('api-key-input');

// --- GESTÃO DA API KEY ---

/**
 * Salva a chave da API no localStorage.
 */
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        alert('Chave de API salva com sucesso!');
        closeSettingsModal();
        initAiInstance(); // Tenta inicializar a IA com a nova chave
    } else {
        alert('Por favor, insira uma chave de API válida.');
    }
}

/**
 * Retorna a chave da API salva no localStorage.
 * @returns {string|null}
 */
function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Inicializa a instância do GoogleGenAI se uma chave de API estiver disponível.
 */
function initAiInstance() {
    const apiKey = getApiKey();
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        if(generateBtn) generateBtn.textContent = 'Gerar Análise';
    } else {
        if(generateBtn) generateBtn.textContent = 'Configurar Chave de IA';
    }
}

/**
 * Abre o modal de configuração da chave de API.
 */
function openSettingsModal() {
    apiKeyInput.value = getApiKey() || '';
    apiKeyModal.style.display = 'flex';
}

/**
 * Fecha o modal de configuração da chave de API.
 */
function closeSettingsModal() {
    apiKeyModal.style.display = 'none';
}


// --- LÓGICA DA PÁGINA ---

/**
 * Coleta os dados da tabela de jogadores.
 * @returns {Array<Object>}
 */
function getPlayerData() {
    if (!playerTableBody) return [];
    const rows = playerTableBody.querySelectorAll('tr');
    return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[0]?.textContent.trim() || '';
        const decks = cells[1]?.textContent.trim() || '';
        const fame = cells[2]?.textContent.trim() || '0';
        const status = cells[3]?.querySelector('.status')?.textContent.trim() || '';
        return { name, decks, fame, status };
    });
}


/**
 * Formata os dados dos jogadores para o prompt da IA.
 * @param {Array<Object>} data
 * @returns {string}
 */
function formatDataForPrompt(data) {
    if (data.length === 0) return "Não há dados de jogadores para analisar.";
    const playerLines = data.map(p => `- ${p.name}: ${p.decks} decks, ${p.fame} fama (Status: ${p.status})`);
    return `Dados de participação na guerra:\n${playerLines.join('\n')}`;
}

/**
 * Gera a análise da IA.
 */
async function handleGenerateAnalysis() {
    if (!ai) {
        openSettingsModal();
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

    const fullPrompt = `Você é um líder assistente de um clã de Clash Royale. Analise os dados de participação na guerra e forneça um resumo pragmático e uma sugestão de ação direta. Use bullet points.

**Análise Requerida:**
1.  **Diagnóstico Rápido:** Um resumo breve da situação (ex: "Muitos jogadores inativos", "Participação sólida", etc.).
2.  **Jogadores Críticos:** Liste os jogadores com 0 ou 1 deck usado, pois são prioridade para ação.
3.  **Destaques de Desempenho:** Se houver, mencione jogadores com alta Fama.
4.  **Sugestão de Ação:** Sugira uma ação clara (ex: "Enviar aviso para jogadores com 0 decks", "Parabenizar o clã pelo desempenho").

**Dados para Análise:**
${formatDataForPrompt(playerData)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        aiResponseEl.textContent = response.text;
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        aiResponseEl.textContent = 'Ocorreu um erro ao gerar a análise. Verifique se sua chave de API é válida e tente novamente.';
    } finally {
        generateBtn.disabled = false;
        aiLoadingEl.style.display = 'none';
    }
}

/**
 * Exporta os dados da tabela para um arquivo CSV.
 */
function handleExportToCSV() {
    const playerData = getPlayerData();
    if (playerData.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    const headers = ['Nome do Jogador', 'Decks Usados', 'Fama', 'Status'];
    const csvContent = [
        headers.join(','),
        ...playerData.map(p => [p.name.replace(/,/g, ''), p.decks, p.fame, p.status].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_guerra_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Dispara a funcionalidade de impressão do navegador.
 */
function handlePrint() {
    window.print();
}

/**
 * Configura a funcionalidade das abas.
 */
function setupTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.tabTarget);
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            if (target) target.classList.add('active');
        });
    });
}

/**
 * Adiciona a funcionalidade de ordenação à tabela de jogadores.
 */
function setupTableSorting() {
    if (!playerTable) return;
    const headers = playerTable.querySelectorAll('th.sortable');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            const sortOrder = header.classList.contains('sort-asc') ? 'desc' : 'asc';
            sortTableByColumn(playerTable, column, sortOrder);
            
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            header.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
        });
    });
}

/**
 * Ordena uma tabela HTML por uma coluna específica.
 * @param {HTMLTableElement} table - O elemento da tabela.
 * @param {string} column - O nome da coluna (do data-column).
 * @param {string} order - 'asc' ou 'desc'.
 */
function sortTableByColumn(table, column, order = 'asc') {
    const tableBody = table.querySelector('tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const columnIndex = Array.from(table.querySelectorAll('th')).findIndex(th => th.dataset.column === column);

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    const direction = order === 'asc' ? 1 : -1;

    rows.sort((a, b) => {
        const aText = a.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
        const bText = b.querySelector(`td:nth-child(${columnIndex + 1})`).textContent.trim();
        return collator.compare(aText, bText) * direction;
    });

    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    initAiInstance();

    if (settingsBtn) settingsBtn.addEventListener('click', openSettingsModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeSettingsModal);
    if (saveApiKeyBtn) saveApiKeyBtn.addEventListener('click', saveApiKey);
    if (apiKeyModal) apiKeyModal.addEventListener('click', (e) => {
        if (e.target === apiKeyModal) closeSettingsModal();
    });

    if (generateBtn) generateBtn.addEventListener('click', handleGenerateAnalysis);
    if (exportBtn) exportBtn.addEventListener('click', handleExportToCSV);
    if (printBtn) printBtn.addEventListener('click', handlePrint);
    if (tabs.length > 0) setupTabs();
    if (playerTable) setupTableSorting();
});
