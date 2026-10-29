const vm = require('vm');

function compile(source) {
  const lines = source.replace(/\r/g, '').split('\n');
  const out = [];
  const stack = [];
  let inClassIndent = null;
  const indentOf = (line) => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
  const expression = (value) => value
    .replace(/\bverdadero\b/g, 'true')
    .replace(/\bfalso\b/g, 'false')
    .replace(/\bnada\b/g, 'null')
    .replace(/\byo\b/g, 'this')
    .replace(/\by\b/g, '&&')
    .replace(/\bo\b/g, '||')
    .replace(/\bno\s+es\b/g, '!==')
    .replace(/\bes\b/g, '===')
    .replace(/\bno\s+/g, '!')
    .replace(/\bmostrar\s*\(/g, 'consola.escribir(')
    .replace(/\blongitud\s*\(/g, 'cezLength(')
    .replace(/\brango\s*\(/g, 'cezRange(')
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
    if (!trimmed || trimmed.startsWith('#') || /^\/importar\b/.test(trimmed)) continue;
    const indent = indentOf(raw);
    const isElse = /^(sino|sino_si\b)/.test(trimmed);
    closeTo(isElse ? indent + 1 : indent);
    let code = trimmed;
    const pad = '  '.repeat(stack.length);

    if (/^clase\s+[A-Za-z_$][\w$]*\s*:$/.test(code)) {
      const name = code.match(/^clase\s+([\w$]+)/)[1];
      out.push(pad + 'class ' + name + ' {');
      stack.push({ indent, type: 'class' });
      inClassIndent = indent;
      continue;
    }

    const fn = code.match(/^funcion\s+([A-Za-z_$][\w$]*)\s*\((.*?)\)\s*:\s*$/);
    if (fn) {
      const isMethod = stack.some(item => item.type === 'class') && indent > (inClassIndent ?? -1);
      const name = fn[1] === 'iniciar' ? 'constructor' : fn[1];
      out.push(pad + (isMethod ? '' : 'function ') + name + '(' + fn[2] + ') {');
      stack.push({ indent, type: 'function' });
      continue;
    }

    if (/^si\s+.+:$/.test(code)) {
      out.push(pad + 'if (' + expression(code.replace(/^si\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^sino_si\s+.+:$/.test(code)) {
      out.push(pad + '} else if (' + expression(code.replace(/^sino_si\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^sino\s*:$/.test(code)) {
      out.push(pad + '} else {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^mientras\s+.+:$/.test(code)) {
      out.push(pad + 'while (' + expression(code.replace(/^mientras\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^para\s+\w+\s+en\s+.+:$/.test(code)) {
      const match = code.match(/^para\s+(\w+)\s+en\s+(.+):$/);
      out.push(pad + 'for (const ' + match[1] + ' of ' + expression(match[2]) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }

    code = code.replace(/^retornar\b/, 'return')
      .replace(/^romper\b/, 'break')
      .replace(/^continuar\b/, 'continue');
    code = expression(code);
    if (/^(?:si|sino|sino_si|mientras|para|clase|funcion)\b/.test(code)) {
      throw new Error('Error de sintaxis en línea ' + (index + 1) + ': instrucción no reconocida: ' + trimmed);
    }
    out.push(pad + code + ';');
  }
  closeTo(-1);
  // Si existe main(), se convierte en el punto de entrada automático.
  out.push('if (typeof main === "function") { main(); }');
  return out.join('\n');
}

function cezRange(start, end, step = 1) {
  if (end === undefined) { end = start; start = 0; }
  if (!step) throw new Error('rango(): el paso no puede ser cero');
  const values = [];
  if (step > 0) for (let i = start; i < end; i += step) values.push(i);
  else for (let i = start; i > end; i += step) values.push(i);
  return values;
}

function cezLength(value) {
  if (value == null) return 0;
  if (typeof value === 'string' || Array.isArray(value)) return value.length;
  return Object.keys(value).length;
}

function run(source, filename = 'main.cez') {
  const js = compile(source);
  const output = [];
  const write = (...args) => output.push(args.map(value => {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }).join(' '));
  const sandbox = {
    console: { log: write, error: (...args) => write('ERROR:', ...args), warn: (...args) => write('AVISO:', ...args) },
    consola: {
      escribir: write,
      log: write,
      error: (...args) => write('ERROR:', ...args),
      advertir: (...args) => write('AVISO:', ...args),
      limpiar: () => { output.length = 0; }
    },
    cezLength, cezRange, Math, Date, JSON, Number, String, Boolean, Array, Object,
    parseInt, parseFloat, isNaN,
  };
  vm.createContext(sandbox, { name: 'C ez' });
  try {
    new vm.Script(js, { filename }).runInContext(sandbox, { timeout: 3000 });
    return { output: output.join('\n'), javascript: js };
  } catch (error) {
    const wrapped = new Error(error.message + '\nArchivo: ' + filename + (error.stack ? '\nDetalles: ' + error.stack.split('\n').slice(1, 3).join(' | ') : ''));
    wrapped.sourceLine = Number((error.message.match(/línea (\d+)/i) || [])[1]) || null;
    wrapped.stack = error.stack;
    throw wrapped;
  }
}

module.exports = { compile, run };
