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


  // Autocompletado de palabras clave, funciones integradas y símbolos del archivo.
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    { language: 'cez', scheme: 'file' },
    {
      provideCompletionItems(document, position) {
        const items = [];
        const add = (label, kind, detail, insertText = label, documentation = '') => {
          const item = new vscode.CompletionItem(label, kind);
          item.detail = detail;
          item.insertText = insertText;
          if (documentation) item.documentation = new vscode.MarkdownString(documentation);
          item.sortText = label;
          return items.push(item);
        };

        const keywords = [
          ['clase', 'Define una clase', 'clase ${1:Nombre}:\n    ${0}'],
          ['funcion', 'Define una función', 'funcion ${1:nombre}(${2}):\n    ${0:retornar nada}'],
          ['iniciar', 'Constructor de una clase', 'funcion iniciar(${1}):\n    ${0}'],
          ['retornar', 'Devuelve un valor desde una función'],
          ['si', 'Condición', 'si ${1:condicion}:\n    ${0}'],
          ['sino_si', 'Condición alternativa', 'sino_si ${1:condicion}:\n    ${0}'],
          ['sino', 'Bloque alternativo', 'sino:\n    ${0}'],
          ['mientras', 'Bucle mientras', 'mientras ${1:condicion}:\n    ${0}'],
          ['para', 'Bucle para cada elemento', 'para ${1:item} en ${2:coleccion}:\n    ${0}'],
          ['romper', 'Termina el bucle actual'],
          ['continuar', 'Salta a la siguiente iteración'],
          ['importar', 'Importa o asigna un módulo/valor'],
          ['verdadero', 'Valor booleano verdadero'],
          ['falso', 'Valor booleano falso'],
          ['nada', 'Valor vacío o nulo'],
          ['yo', 'Referencia al objeto actual']
        ];
        for (const [label, description, snippet] of keywords) {
          const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword);
          item.detail = 'C ez · palabra clave';
          item.documentation = new vscode.MarkdownString(description);
          if (snippet) item.insertText = new vscode.SnippetString(snippet);
          items.push(item);
        }

        const builtins = [
          ['mostrar', 'Muestra texto o valores en la salida', 'mostrar(${1:valor})'],
          ['longitud', 'Devuelve la longitud de una lista o texto', 'longitud(${1:coleccion})'],
          ['rango', 'Crea una secuencia de números', 'rango(${1:inicio}, ${2:fin})'],
          ['texto', 'Convierte un valor a texto', 'texto(${1:valor})'],
          ['numero', 'Convierte un valor a número', 'numero(${1:valor})'],
          ['tipo', 'Devuelve el tipo de un valor', 'tipo(${1:valor})']
        ];
        for (const [label, description, snippet] of builtins) {
          const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Function);
          item.detail = 'C ez · función integrada';
          item.documentation = new vscode.MarkdownString(description);
          item.insertText = new vscode.SnippetString(snippet);
          items.push(item);
        }

        const linePrefix = document.lineAt(position).text.slice(0, position.character);
        if (/\bmostrar\s*\([^)]*$/.test(linePrefix)) {
          const item = new vscode.CompletionItem('Hola, mundo!', vscode.CompletionItemKind.Value);
          item.detail = 'Texto de ejemplo';
          item.insertText = new vscode.SnippetString('"Hola, mundo!"');
          items.push(item);
        }

        // Sugiere variables, funciones y clases declaradas en el documento.
        const source = document.getText();
        const seen = new Set();
        const patterns = [
          { regex: /^\s*(?:funcion|clase)\s+([A-Za-z_$][\w$]*)/gm, kind: vscode.CompletionItemKind.Function, detail: 'Declaración de C ez' },
          { regex: /^\s*([A-Za-z_$][\w$]*)\s*=/gm, kind: vscode.CompletionItemKind.Variable, detail: 'Variable del archivo' },
          { regex: /^\s*(?:para)\s+([A-Za-z_$][\w$]*)\s+en\b/gm, kind: vscode.CompletionItemKind.Variable, detail: 'Variable de bucle' }
        ];
        for (const pattern of patterns) {
          let match;
          while ((match = pattern.regex.exec(source)) !== null) {
            const name = match[1];
            if (!seen.has(name) && name !== 'yo') {
              seen.add(name);
              const item = new vscode.CompletionItem(name, pattern.kind);
              item.detail = pattern.detail;
              items.push(item);
            }
          }
        }
        return items;
      }
    },
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split(''), '.', '('
  );
  context.subscriptions.push(completionProvider);

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
