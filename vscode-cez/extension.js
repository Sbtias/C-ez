const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { run } = require('./runtime');

async function expandImports(source, filename, visited = new Set()) {
  const absolute = path.resolve(filename);
  if (visited.has(absolute)) {
    throw new Error('Circular import detected in: ' + path.basename(absolute));
  }
  visited.add(absolute);
  const lines = source.replace(/\r/g, '').split('\n');
  const expanded = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const match = trimmed.match(/^\/import(?:ar)?\s+["']?([^"'\s]+)["']?\s*$/);
    if (!match) {
      expanded.push(lines[i]);
      continue;
    }
    let importPath = match[1];
    if (!path.extname(importPath)) importPath += '.cez';
    const target = path.resolve(path.dirname(absolute), importPath);
    let imported;
    try {
      imported = await fs.promises.readFile(target, 'utf8');
    } catch (error) {
      throw new Error('Could not import "' + importPath + '" from ' + path.basename(absolute) + ':' + (i + 1) + '. Make sure the file exists. ' + error.message);
    }
    expanded.push('# --- Imported: ' + path.basename(target) + ' ---');
    expanded.push(await expandImports(imported, target, new Set(visited)));
    expanded.push('# --- End of ' + path.basename(target) + ' ---');
  }
  return expanded.join('\n');
}

function activate(context) {
  const output = vscode.window.createOutputChannel('C ez');
  const diagnostics = vscode.languages.createDiagnosticCollection('cez');
  context.subscriptions.push(output, diagnostics);

  async function runActiveFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showWarningMessage('Open a .cez file first.');
    const document = editor.document;
    if (path.extname(document.fileName).toLowerCase() !== '.cez') {
      return vscode.window.showWarningMessage('The active file must have a .cez extension.');
    }
    await document.save();
    output.clear();
    diagnostics.delete(document.uri);
    output.appendLine('C ez • Running ' + path.basename(document.fileName));
    try {
      const source = await expandImports(document.getText(), document.fileName);
      const result = run(source, document.fileName);
      if (result.output) output.appendLine(result.output);
      else output.appendLine('(no output)');
      output.appendLine('');
      output.appendLine('✓ Execution completed successfully.');
      output.show(true);
      vscode.window.setStatusBarMessage('C ez: execution completed', 3000);
    } catch (error) {
      const message = String(error.message || error);
      output.appendLine('✖ C EZ ERROR');
      output.appendLine(message);
      output.appendLine('');
      output.appendLine('Tip: check syntax and variable names on the reported line.');
      const match = message.match(/línea\s+(\d+)/i);
      if (match) {
        const line = Math.max(0, Number(match[1]) - 1);
        const safeLine = Math.min(line, document.lineCount - 1);
        const range = new vscode.Range(safeLine, 0, safeLine, Math.max(1, document.lineAt(safeLine).text.length));
        diagnostics.set(document.uri, [new vscode.Diagnostic(range, message.split('\n')[0], vscode.DiagnosticSeverity.Error)]);
        const position = new vscode.Position(safeLine, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
      }
      output.show(true);
      vscode.window.showErrorMessage('C ez: ' + message.split('\n')[0]);
    }
  }


  // Completion for keywords, built-in functions, and file symbols.
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
          ['class', 'Define a class', 'class ${1:Name}:\n    ${0}'],
          ['return', 'Return a value'],
          ['if', 'Conditional statement', 'if ${1:condition}:\n    ${0}'],
          ['else', 'Alternative branch', 'else:\n    ${0}'],
          ['while', 'Loop while a condition is true', 'while ${1:condition}:\n    ${0}'],
          ['for', 'Iterate through a collection', 'for ${1:item} in ${2:items}:\n    ${0}'],
          ['using', 'Import a built-in library module', 'using ${1|System,Random,Text,Dates,Collections,Json|};'],
          ['true', 'Boolean true'], ['false', 'Boolean false'], ['null', 'Null value'], ['this', 'Current object reference'],
          ['public', 'Public access modifier'], ['private', 'Private access modifier'], ['int', 'Integer type'], ['string', 'String type'], ['bool', 'Boolean type'], 
          ['funcion', 'Palabra clave para declarar una función'],
          ['function', 'Alias en inglés de funcion'],
          ['iniciar', 'Constructor de una clase', 'funcion iniciar(${1}):\n    ${0}'],
          ['main', 'Nombre de la función principal'],
          ['retornar', 'Devuelve un valor from una función'],
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
          item.detail = 'C ez · keyword';
          item.documentation = new vscode.MarkdownString(description);
          if (snippet) item.insertText = new vscode.SnippetString(snippet);
          items.push(item);
        }

        const consoleMethods = [
          ['escribir', 'Escribe texto o valores en la consola', 'escribir(' + '$' + '{1:valor})'],
          ['log', 'Alias de escribir', 'log(' + '$' + '{1:valor})'],
          ['error', 'Escribe un mensaje de error', 'error(' + '$' + '{1:mensaje})'],
          ['advertir', 'Escribe una advertencia', 'advertir(' + '$' + '{1:mensaje})'],
          ['limpiar', 'Limpia la salida de la ejecución', 'limpiar()']
        ];
        const linePrefix = document.lineAt(position).text.slice(0, position.character);
        const inConsole = linePrefix.includes('Console.') || linePrefix.includes('consola.') || linePrefix.includes('console.');
        const inImport = linePrefix.trimStart().startsWith('/import ') || linePrefix.trimStart().startsWith('/importar ');
        for (const [label, description, snippet] of consoleMethods) {
          const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Function);
          item.detail = 'C ez · console method';
          item.documentation = new vscode.MarkdownString(description);
          item.insertText = new vscode.SnippetString(snippet);
          item.filterText = inConsole ? label : 'consola.' + label;
          if (inConsole) item.range = new vscode.Range(position.line, linePrefix.lastIndexOf('.') + 1, position.line, position.character);
          items.push(item);
        }
        if (inImport) {
          const item = new vscode.CompletionItem('archivo.cez', vscode.CompletionItemKind.File);
          item.detail = 'Ruta de un archivo que se importará';
          item.insertText = new vscode.SnippetString('"utilidades.cez"');
          item.documentation = new vscode.MarkdownString('Escribe el nombre de otro archivo .cez de esta carpeta.');
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
          item.detail = 'C ez · built-in function';
          item.documentation = new vscode.MarkdownString(description);
          item.insertText = new vscode.SnippetString(snippet);
          items.push(item);
        }

        if (/\bmostrar\s*\([^)]*$/.test(linePrefix)) {
          const item = new vscode.CompletionItem('Hola, mundo!', vscode.CompletionItemKind.Value);
          item.detail = 'Texto de ejemplo';
          item.insertText = new vscode.SnippetString('"Hola, mundo!"');
          items.push(item);
        }

        // Suggest variables, functions, and classes declared in the document.
        const source = document.getText();
        const seen = new Set();
        const patterns = [
          { regex: /^\s*(?:funcion|function|clase|class)\s+([A-Za-z_$][\w$]*)/gm, kind: vscode.CompletionItemKind.Function, detail: 'Declaración de C ez' },
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
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_/'.split(''), '.', '('
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
      const choice = await vscode.window.showWarningMessage('The file already exists. Open it?', 'Open');
      if (choice !== 'Open') return;
    } catch (_) {
      await vscode.workspace.fs.writeFile(uri, Buffer.from(
        '# My first C ez program\n' +
        'using System;\n' +
        'function main():\n' +
        '    Console.WriteLine("Hello, world!")\n', 'utf8'));
    }
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cez.showLanguageInfo', () => {
    vscode.window.showInformationMessage('C ez includes variables, functions, classes, conditions, loops, and an integrated runtime without Python.');
  }));

  context.subscriptions.push(vscode.commands.registerCommand('cez.clearErrors', () => {
    diagnostics.clear();
    output.clear();
    vscode.window.showInformationMessage('C ez output and errors cleared.');
  }));
}
function deactivate() {}
module.exports = { activate, deactivate };
