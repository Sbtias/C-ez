const vscode = require('vscode');
const path = require('path');
const { run } = require('./runtime');

function activate(context) {
  const output = vscode.window.createOutputChannel('C ez');
  const diagnostics = vscode.languages.createDiagnosticCollection('cez');
  context.subscriptions.push(output, diagnostics);

  async function runActiveFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showWarningMessage('Abre un archivo .cez primero.');
    const document = editor.document;
    if (path.extname(document.fileName).toLowerCase() !== '.cez') {
      return vscode.window.showWarningMessage('El archivo activo debe terminar en .cez.');
    }
    await document.save();
    output.clear();
    diagnostics.delete(document.uri);
    output.appendLine('C ez • Ejecutando ' + path.basename(document.fileName));
    try {
      const result = run(document.getText(), document.fileName);
      if (result.output) output.appendLine(result.output);
      else output.appendLine('(sin salida)');
      output.appendLine('');
      output.appendLine('✓ Ejecución terminada sin errores.');
      output.show(true);
      vscode.window.setStatusBarMessage('C ez: ejecución terminada', 3000);
    } catch (error) {
      const message = String(error.message || error);
      output.appendLine('✖ ERROR DE C EZ');
      output.appendLine(message);
      output.appendLine('');
      output.appendLine('Consejo: revisa la sintaxis y los nombres de variables de la línea indicada.');
      const match = message.match(/línea\s+(\d+)/i);
      if (match) {
        const line = Math.max(0, Number(match[1]) - 1);
        const range = new vscode.Range(line, 0, line, Math.max(1, document.lineAt(line).text.length));
        diagnostics.set(document.uri, [new vscode.Diagnostic(range, message.split('\n')[0], vscode.DiagnosticSeverity.Error)]);
        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      }
      output.show(true);
      vscode.window.showErrorMessage('C ez: ' + message.split('\n')[0]);
    }
  }

  context.subscriptions.push(vscode.commands.registerCommand('cez.runFile', runActiveFile));

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
    vscode.window.showInformationMessage('C ez incluye variables, funciones, clases, condiciones, bucles y ejecución integrada sin Python.');
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cez.clearErrors', () => {
    diagnostics.clear();
    output.clear();
    vscode.window.showInformationMessage('Panel de errores de C ez limpiado.');
  }));
}
function deactivate() {}
module.exports = { activate, deactivate };
