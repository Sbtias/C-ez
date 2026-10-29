const vm = require('vm');

function compile(source) {
  const lines = source.replace(/\r/g, '').split('\n');
  const out = [];
  const stack = [];
  let inClassIndent = null;
  let lastIndent = 0;

  const indentOf = (line) => {
    const match = line.match(/^[ \t]*/)[0];
    return match.replace(/\t/g, '    ').length;
  };
  const expression = (value) => value
    .replace(/\bverdadero\b/g, 'true')
    .replace(/\bfalso\b/g, 'false')
    .replace(/\bnada\b/g, 'null')
    .replace(/\byo\b/g, 'this')
    .replace(/\by\b/g, '&&')
    .replace(/\bo\b/g, '||')
    .replace(/\bno\s+/g, '!')
    .replace(/\bes\b/g, '===')
    .replace(/\bno\s+es\b/g, '!==')
    .replace(/\bmostrar\s*\(/g, 'console.log(')
    .replace(/\blongitud\s*\(/g, 'cezLength(')
    .replace(/\btexto\s*\(/g, 'String(')
    .replace(/\bnumero\s*\(/g, 'Number(')
    .replace(/\btipo\s*\(/g, 'typeof (');

  function closeTo(indent) {
    while (stack.length && stack[stack.length - 1].indent >= indent) {
      out.push('  '.repeat(stack.length) + '}');
      stack.pop();
    }
  }

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index];
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const indent = indentOf(raw);
    const next = lines.slice(index + 1).find(line => line.trim() && !line.trim().startsWith('#'));
    const nextIndent = next === undefined ? -1 : indentOf(next);
    const lineNo = index + 1;

    const isElse = /^(sino|sino_si\b)/.test(trimmed);
    closeTo(isElse ? indent + 1 : indent);
    let code = trimmed;
    const pad = '  '.repeat(stack.length);

    if (/^clase\s+[A-Za-z_$][\w$]*\s*:$/.test(code)) {
      const name = code.match(/^clase\s+([\w$]+)/)[1];
      out.push(pad + 'class ' + name + ' {');
      stack.push({indent, type:'class'});
      inClassIndent = indent;
      continue;
    }

    let fn = code.match(/^funcion\s+([A-Za-z_$][\w$]*)\s*\((.*?)\)\s*:\s*$/);
    if (fn) {
      const isMethod = stack.some(item => item.type === 'class') && indent > (inClassIndent ?? -1);
      const name = fn[1] === 'iniciar' ? 'constructor' : fn[1];
      out.push(pad + (isMethod ? '' : 'function ') + name + '(' + fn[2] + ') {');
      stack.push({indent, type:'function'});
      continue;
    }

    if (/^si\s+.+:$/.test(code)) {
      out.push(pad + 'if (' + expression(code.replace(/^si\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({indent, type:'block'}); continue;
    }
    if (/^sino_si\s+.+:$/.test(code)) {
      out.push(pad + '} else if (' + expression(code.replace(/^sino_si\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({indent, type:'block'}); continue;
    }
    if (/^sino\s*:$/.test(code)) {
      out.push(pad + '} else {');
      stack.push({indent, type:'block'}); continue;
    }
    if (/^mientras\s+.+:$/.test(code)) {
      out.push(pad + 'while (' + expression(code.replace(/^mientras\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({indent, type:'block'}); continue;
    }
    if (/^para\s+\w+\s+en\s+.+:$/.test(code)) {
      const match = code.match(/^para\s+(\w+)\s+en\s+(.+):$/);
      out.push(pad + 'for (const ' + match[1] + ' of ' + expression(match[2]) + ') {');
      stack.push({indent, type:'block'}); continue;
    }

    code = code.replace(/^retornar\b/, 'return')
      .replace(/^romper\b/, 'break')
      .replace(/^continuar\b/, 'continue')
      .replace(/^importar\s+/, 'const ');
    code = expression(code);
    if (/^(?:si|sino|sino_si|mientras|para|clase|funcion)\b/.test(code)) {
      throw new Error('Sintaxis no válida en la línea ' + lineNo);
    }
    out.push(pad + code + ';');
  }
  closeTo(-1);
  return out.join('\n');
}

function cezLength(value) {
  if (value == null) return 0;
  return value.length ?? Object.keys(value).length;
}

function run(source, filename = 'main.cez') {
  const js = compile(source);
  const output = [];
  const sandbox = {
    console: { log: (...args) => output.push(args.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ')) },
    cezLength,
    Math, Date, JSON, Number, String, Boolean, Array, Object,
    parseInt, parseFloat, isNaN,
  };
  vm.createContext(sandbox, { name: 'C ez' });
  try {
    new vm.Script(js, { filename }).runInContext(sandbox, { timeout: 3000 });
    return { output: output.join('\n'), javascript: js };
  } catch (error) {
    const wrapped = new Error(error.message);
    wrapped.stack = error.stack;
    throw wrapped;
  }
}

module.exports = { compile, run };
