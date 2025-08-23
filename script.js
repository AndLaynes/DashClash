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

// Modal de API Key (Seleciona em todas as páginas)
const settingsBtns = document.querySelectorAll('#settings-btn');
const apiKeyModal = document.getElementById('api-key-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const saveApiKeyBtn = document.getElementById('save-api-key-btn');
const apiKeyInput = document.getElementById('api-key-input');

// --- GESTÃO DA API KEY ---

function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        alert('Chave de API salva com sucesso!');
        closeSettingsModal();
        initAiInstance();
    } else {
        alert('Por favor, insira uma chave de API válida.');
    }
}

function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
}

function initAiInstance() {
    const apiKey = getApiKey();
    if (apiKey) {
        try {
            ai = new GoogleGenAI({ apiKey });
            if (generateBtn) generateBtn.disabled = false;
        } catch (error) {
            console.error("Erro ao inicializar a IA. A chave pode ser inválida.", error);
            ai = null;
            if (generateBtn) generateBtn.disabled = true;
        }
    } else {
        ai = null;
    }
}

function openSettingsModal() {
    if (apiKeyModal) {
        apiKeyInput.value = getApiKey() || '';
        apiKeyModal.style.display = 'flex';
    }
}

function closeSettingsModal() {
    if (apiKeyModal) {
        apiKeyModal.style.display = 'none';
    }
}


// --- LÓGICA DA PÁGINA ---

/**
 * Determina a meta de decks com base no dia atual da semana para a análise da IA.
 */
function getWarDayTargetForAI() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado

    const targets = {
        4: { name: 'Quinta-feira', goal: 4 },
        5: { name: 'Sexta-feira', goal: 4 },
        6: { name: 'Sábado', goal: 8 },
        0: { name: 'Domingo', goal: 12 },
        1: { name: 'Segunda-feira', goal: 16 },
        2: { name: 'Terça-feira', goal: 16 },
        3: { name: 'Quarta-feira', goal: 16 }
    };
    return targets[dayOfWeek] || targets[1];
}

function getPlayerData() {
    if (!playerTableBody) return [];
    const rows = playerTableBody.querySelectorAll('tr');
    if (rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td')?.colSpan >= 4)) {
        return [];
    }
    return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        const name = cells[0]?.textContent.trim() || '';
        const decks = cells[1]?.textContent.trim() || '';
        const fame = cells[2]?.textContent.trim() || '0';
        const status = cells[3]?.querySelector('.status')?.textContent.trim() || '';
        return { name, decks, fame, status };
    });
}

function formatDataForPrompt(data) {
    if (data.length === 0) return "Não há dados de jogadores para analisar.";
    const playerLines = data.map(p => `- ${p.name}: ${p.decks} decks, ${p.fame} fama (Status: ${p.status})`);
    return `Dados de participação na guerra:\n${playerLines.join('\n')}`;
}

async function handleGenerateAnalysis() {
    if (!ai) {
        alert('Por favor, configure sua chave de API no ícone de engrenagem (⚙️) para usar esta funcionalidade.');
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

    const { name: dayName, goal } = getWarDayTargetForAI();
    const fullPrompt = `Você é um líder assistente de um clã de Clash Royale. Hoje é ${dayName}, então a meta é que cada jogador tenha usado ${goal} decks. Analise os dados de participação na guerra e forneça um resumo pragmático e uma sugestão de ação direta. Use bullet points.

**Análise Requerida:**
1.  **Diagnóstico Rápido:** Um resumo breve da situação com base na meta de ${goal} decks por jogador.
2.  **Jogadores Críticos:** Liste os jogadores com status "Crítico". Eles são a maior prioridade.
3.  **Jogadores em Atenção:** Liste os jogadores com status "Atenção". Eles precisam de um lembrete.
4.  **Sugestão de Ação:** Sugira uma ação clara e segmentada (ex: "Enviar aviso final para jogadores críticos", "Enviar lembrete para jogadores em atenção", "Parabenizar quem já completou").

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

function handleExportToCSV() {
    const playerData = getPlayerData();
    if (playerData.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    const headers = ['Nome do Jogador', 'Decks Usados', 'Fama', 'Status'];
    const csvContent = [
        headers.join(','),
        ...playerData.map(p => [p.name.replace(/,/g, ''), p.decks.replace(/,/g, ''), p.fame, p.status].join(','))
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

function handlePrint() {
    window.print();
}

function setupTabs() {
    if(tabs.length === 0) return;
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSelector = tab.dataset.tabTarget;
            if (!targetSelector) return;
            const target = document.querySelector(targetSelector);

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            if (target) target.classList.add('active');
        });
    });
}

function setupTableSorting() {
    if (!playerTable) return;
    const headers = playerTable.querySelectorAll('th.sortable');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            const sortOrder = header.classList.contains('sort-asc') ? 'desc' : 'asc';
            
            headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
            header.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
            
            sortTableByColumn(playerTable, column, sortOrder);
        });
    });
}

function sortTableByColumn(table, column, order = 'asc') {
    const tableBody = table.querySelector('tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    const columnIndex = Array.from(table.querySelectorAll('th')).findIndex(th => th.dataset.column === column);

    const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
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

    settingsBtns.forEach(btn => btn.addEventListener('click', openSettingsModal));
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeSettingsModal);
    if (saveApiKeyBtn) saveApiKeyBtn.addEventListener('click', saveApiKey);
    if (apiKeyModal) {
        apiKeyModal.addEventListener('click', (e) => {
            if (e.target === apiKeyModal) closeSettingsModal();
        });
        if (apiKeyInput) {
            apiKeyInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') saveApiKey();
            });
        }
    }

    if (generateBtn) generateBtn.addEventListener('click', handleGenerateAnalysis);
    if (exportBtn) exportBtn.addEventListener('click', handleExportToCSV);
    if (printBtn) printBtn.addEventListener('click', handlePrint);
    
    setupTabs();
    setupTableSorting();
});