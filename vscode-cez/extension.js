const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('cez.runFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showWarningMessage('Abre un archivo .cez primero.');
    const file = editor.document.uri.fsPath;
    if (path.extname(file).toLowerCase() !== '.cez') return vscode.window.showWarningMessage('El archivo activo debe terminar en .cez.');
    await editor.document.save();
    const folders = (vscode.workspace.workspaceFolders || []).map(folder => folder.uri.fsPath);
    const candidates = folders.flatMap(folder => [path.join(folder, 'cez.py'), path.join(folder, 'Cez', 'cez.py')]);
    const runtime = candidates.find(candidate => fs.existsSync(candidate));
    if (!runtime) return vscode.window.showErrorMessage('No encuentro cez.py. Abre la raíz del repositorio C-ez en VS Code.');
    const command = vscode.workspace.getConfiguration('cez').get('pythonPath', 'py -3');
    const terminal = vscode.window.createTerminal('C ez');
    terminal.show();
    terminal.sendText(command + ' "' + runtime.replace(/"/g, '\\"') + '" run "' + file.replace(/"/g, '\\"') + '"');
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cez.newFile', async () => {
    const name = await vscode.window.showInputBox({prompt: 'Nombre del archivo C ez', value: 'main.cez', validateInput: value => value.trim() ? null : 'Escribe un nombre.'});
    if (!name) return;
    const filename = name.endsWith('.cez') ? name : name + '.cez';
    const workspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
    let uri;
    if (workspace) uri = vscode.Uri.file(path.join(workspace.uri.fsPath, filename));
    else uri = await vscode.window.showSaveDialog({filters: {'C ez': ['cez']}, defaultUri: vscode.Uri.file(filename)});
    if (!uri) return;
    const content = Buffer.from('# Mi programa C ez\nmostrar("Hola, mundo!")\n', 'utf8');
    try { await vscode.workspace.fs.stat(uri); }
    catch (_) { await vscode.workspace.fs.writeFile(uri, content); }
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
  }));
}
function deactivate() {}
module.exports = {activate, deactivate};
