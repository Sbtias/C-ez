const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { run } = require('./runtime');

function activate(context) {
  const output = vscode.window.createOutputChannel('C ez');
  context.subscriptions.push(output);

  context.subscriptions.push(vscode.commands.registerCommand('cez.runFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showWarningMessage('Abre un archivo .cez primero.');
    if (path.extname(editor.document.fileName).toLowerCase() !== '.cez') {
      return vscode.window.showWarningMessage('El archivo activo debe terminar en .cez.');
    }
    await editor.document.save();
    output.clear();
    output.appendLine('C ez • Ejecutando ' + path.basename(editor.document.fileName));
    try {
      const result = run(editor.document.getText(), editor.document.fileName);
      if (result.output) output.appendLine(result.output);
      else output.appendLine('(sin salida)');
      output.appendLine('');
      output.appendLine('Ejecución terminada.');
      output.show(true);
    } catch (error) {
      output.appendLine('ERROR: ' + error.message);
      output.show(true);
      vscode.window.showErrorMessage('C ez: ' + error.message);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cez.newFile', async () => {
    const uri = await vscode.window.showSaveDialog({
      filters: { 'C ez': ['cez'] },
      defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '.', 'main.cez'))
    });
    if (!uri) return;
    try {
      await vscode.workspace.fs.stat(uri);
      const choice = await vscode.window.showWarningMessage('El archivo ya existe. ¿Abrirlo?', 'Abrir');
      if (choice !== 'Abrir') return;
    } catch (_) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(
        '# Mi primer programa C ez\n' +
        'clase Persona:\n' +
        '    funcion iniciar(nombre):\n' +
        '        yo.nombre = nombre\n' +
        '    funcion saludar():\n' +
        '        mostrar("Hola, " + yo.nombre)\n' +
        '\npersona = Persona("mundo")\n' +
        'persona.saludar()\n', 'utf8'));
    }
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cez.showLanguageInfo', () => {
    vscode.window.showInformationMessage('C ez: variables, funciones, clases, condiciones, bucles y colecciones. No requiere Python.');
  }));
}
function deactivate() {}
module.exports = { activate, deactivate };
