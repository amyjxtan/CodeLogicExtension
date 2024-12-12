/**
 * This code snippet was generated with the help of ChatGPT by OpenAI.
 * For more details, visit https://openai.com.
 */

const vscode = require('vscode');
const axios = require('axios'); // For calling GPT-4 API
require('dotenv').config();

/**
 * Activates the extension
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    let explainCodeCommand = vscode.commands.registerCommand('codelogic.explainCode', async () => {
        console.log('Code Logic command triggered!'); // Debug log

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Please open a file and select some code to explain.");
            return;
        }

        const selection = editor.selection;
        const code = editor.document.getText(selection);

        if (!code.trim()) {
            vscode.window.showErrorMessage("No code selected. Please highlight a portion of code.");
            return;
        }

        try {
            const fullCode = editor.document.getText();
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fetching code explanation...",
                cancellable: false
            }, async (progress) => {
                const explanation = await fetchCodeExplanation(code, fullCode);
                displayExplanation(explanation);
                await saveQueryHistory(code, explanation, context);
            });

        } catch (error) {
            vscode.window.showErrorMessage("Error fetching explanation: " + error.message);
        }
    });

    let viewHistoryCommand = vscode.commands.registerCommand('codelogic.viewHistory', () => {
        const history = getQueryHistory(context);
        const panel = vscode.window.createWebviewPanel(
            'codeLogicHistory',
            'Code Logic Query History',
            vscode.ViewColumn.One,
            {}
        );

        const historyHtml = history.map(entry =>
            `<div><strong>Code:</strong><pre>${entry.code}</pre><strong>Explanation:</strong><pre>${entry.explanation}</pre><strong>Time:</strong> ${entry.timestamp}</div><hr>`
        ).join('');

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head><title>Query History</title></head>
            <body>${historyHtml}</body>
            </html>
        `;
    });

    context.subscriptions.push(explainCodeCommand, viewHistoryCommand);

    vscode.workspace.onDidSaveTextDocument((document) => {
        console.log(`File saved: ${document.fileName}`);
    });
}

/**
 * Fetches a code explanation from GPT-4 API
 * @param {string} code The selected code
 * @param {string} fullCode The full content of the file
 * @returns {Promise<string>} The explanation of the code
 */
async function fetchCodeExplanation(code, fullCode) {
    const apiKey = "Input API key";
    if (!apiKey) {
        throw new Error('API key is missing. Please add it to the .env file.');
    }
    const endpoint = 'https://api.openai.com/v1/chat/completions';

    const response = await axios.post(
        endpoint,
        {
            model: 'gpt-4',
            messages: [
                { role: 'system', content: "You are a helpful assistant explaining code to beginners." },
                { role: 'user', content: `Here is the entire file content for context:\n\n${fullCode}\n\nExplain the highlighted code step-by-step and provide an example input and output:\n\n${code}` }
            ]
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data.choices[0].message.content.trim();
}

/**
 * Displays the explanation in a VS Code webview sidebar
 * @param {string} explanation The explanation text
 */
function displayExplanation(explanation) {
    const panel = vscode.window.createWebviewPanel(
        'codeLogicExplanation',
        'Code Logic Explanation',
        vscode.ViewColumn.Beside,
        {}
    );

    panel.webview.html = generateWebviewContent(explanation);
}

/**
 * Generates HTML content for the webview
 * @param {string} explanation The explanation
 * @returns {string} HTML content
 */
function generateWebviewContent(explanation) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Logic Explanation</title>
    </head>
    <body>
        <h1>Code Logic Explanation</h1>
        <p>${explanation.replace(/\n/g, '<br>')}</p>
    </body>
    </html>`;
}

/**
 * Saves the query history
 * @param {string} code The code selected by the user
 * @param {string} explanation The explanation generated
 * @param {vscode.ExtensionContext} context The extension context for global state
 */
async function saveQueryHistory(code, explanation, context) {
    const history = context.globalState.get('queryHistory') || [];
    history.push({ code, explanation, timestamp: new Date().toISOString() });
    await context.globalState.update('queryHistory', history);
}

/**
 * Retrieves the query history
 * @param {vscode.ExtensionContext} context The extension context for global state
 * @returns {Array} The history array
 */
function getQueryHistory(context) {
    return context.globalState.get('queryHistory') || [];
}

/**
 * Deactivates the extension
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
