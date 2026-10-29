const vm = require('vm');

function compile(source) {
  const lines = source.replace(/\r/g, '').split('\n');
  const out = [];
  const stack = [];
  let inClassIndent = null;
  const indentOf = line => line.match(/^[ \t]*/)[0].replace(/\t/g, '    ').length;
  const expression = value => value
    .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||')
    .replace(/\bnot\s+is\b/g, '!==').replace(/\bis\b/g, '===')
    .replace(/\bnot\s+/g, '!').replace(/\bmostrar\s*\(/g, 'Console.WriteLine(')
    .replace(/\bconsola\.escribir\b/g, 'Console.WriteLine')
    .replace(/\bconsola\.advertir\b/g, 'Console.WriteWarning')
    .replace(/\bconsola\.error\b/g, 'Console.WriteError')
    .replace(/\bconsola\.limpiar\b/g, 'Console.Clear')
    .replace(/\blongitud\s*\(/g, 'Cez.length(').replace(/\brango\s*\(/g, 'Cez.range(')
    .replace(/\btexto\s*\(/g, 'String(').replace(/\bnumero\s*\(/g, 'Number(')
    .replace(/\btipo\s*\(/g, 'typeof (');

  function closeTo(indent) {
    while (stack.length && stack[stack.length - 1].indent >= indent) {
      out.push('  '.repeat(stack.length) + '}');
      stack.pop();
    }
  }

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index];
    const trimmed = raw.trim().replace(/;\s*$/, '');
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') ||
        /^using\s+[A-Za-z_$][\w$.]*$/.test(trimmed) || /^\/import(?:ar)?\b/.test(trimmed)) continue;
    const indent = indentOf(raw);
    const isElse = /^(else|elseif|else_if|sino|sino_si\b)/.test(trimmed);
    closeTo(isElse ? indent + 1 : indent);
    let code = trimmed;
    const pad = '  '.repeat(stack.length);

    code = code.replace(/^(?:(?:public|private|protected|static)\s+)+/, '');
    code = code.replace(/^(?:int|double|float|string|bool|var|let|const)\s+([A-Za-z_$][\w$]*\s*=)/, '$1');

    const classMatch = code.match(/^(?:class|clase)\s+([A-Za-z_$][\w$]*)\s*:?$/);
    if (classMatch) {
      out.push(pad + 'class ' + classMatch[1] + ' {');
      stack.push({ indent, type: 'class' });
      inClassIndent = indent;
      continue;
    }

    const fn = code.match(/^(?:(?:void|int|string|double|bool|static)\s+)*(?:funcion|function|fn)\s+([A-Za-z_$][\w$]*)\s*\((.*?)\)\s*:?$/)
      || code.match(/^(?:void|int|string|double|bool)\s+([A-Za-z_$][\w$]*)\s*\((.*?)\)\s*:?$/);
    if (fn) {
      const isMethod = stack.some(item => item.type === 'class') && indent > (inClassIndent ?? -1);
      const name = fn[1] === 'iniciar' ? 'constructor' : fn[1];
      out.push(pad + (isMethod ? '' : 'function ') + name + '(' + fn[2] + ') {');
      stack.push({ indent, type: 'function' });
      continue;
    }

    if (/^(?:if|si)\s+.+:$/.test(code)) {
      out.push(pad + 'if (' + expression(code.replace(/^(?:if|si)\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^(?:else if|elseif|else_if|sino_si)\s+.+:$/.test(code)) {
      out.push(pad + '} else if (' + expression(code.replace(/^(?:else if|elseif|else_if|sino_si)\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^(?:else|sino)\s*:$/.test(code)) {
      out.push(pad + '} else {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^(?:while|mientras)\s+.+:$/.test(code)) {
      out.push(pad + 'while (' + expression(code.replace(/^(?:while|mientras)\s+/, '').replace(/:\s*$/, '')) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }
    if (/^(?:for|para)\s+\w+\s+(?:in|en)\s+.+:$/.test(code)) {
      const match = code.match(/^(?:for|para)\s+(\w+)\s+(?:in|en)\s+(.+):$/);
      out.push(pad + 'for (const ' + match[1] + ' of ' + expression(match[2]) + ') {');
      stack.push({ indent, type: 'block' }); continue;
    }

    code = code.replace(/^(?:return|retornar)\b/, 'return')
      .replace(/^(?:break|romper)\b/, 'break')
      .replace(/^(?:continue|continuar)\b/, 'continue');
    code = expression(code);
    if (/^(?:if|else|elseif|while|for|repeat|class|funcion|function|func|fn|si|sino|sino_si|mientras|para)\b/.test(code)) {
      throw new Error('Syntax error on line ' + (index + 1) + ': incomplete or unrecognized statement: ' + trimmed + '. Check parentheses, colons, and indentation.');
    }
    out.push(pad + code + ';');
  }
  closeTo(-1);
  out.push('if (typeof main === "function") { main(); }');
  return out.join('\n');
}

function createLibraries(write) {
  return {
    Console: {
      WriteLine: (...args) => write(...args),
      WriteError: (...args) => write('ERROR:', ...args),
      WriteWarning: (...args) => write('WARNING:', ...args),
      Clear: () => write('[Console.Clear called]')
    },
    System: { Name: 'C ez', Version: '0.6.0' },
    Random: {
      Next(min = 0, max = 1) { return Math.floor(Math.random() * (max - min)) + min; },
      Float() { return Math.random(); },
      Choice(items) { if (!Array.isArray(items) || !items.length) throw new Error('Random.Choice expects a non-empty array.'); return items[Math.floor(Math.random() * items.length)]; }
    },
    Text: {
      ToUpper: value => String(value).toUpperCase(),
      ToLower: value => String(value).toLowerCase(),
      Trim: value => String(value).trim(),
      Contains: (value, part) => String(value).includes(String(part)),
      Replace: (value, search, replacement) => String(value).replaceAll(String(search), String(replacement)),
      Split: (value, separator = ' ') => String(value).split(separator)
    },
    Dates: {
      Now: () => new Date().toISOString(),
      Year: () => new Date().getFullYear(),
      Month: () => new Date().getMonth() + 1,
      Day: () => new Date().getDate(),
      Timestamp: () => Date.now()
    },
    Collections: {
      Count: value => value == null ? 0 : (value.length ?? Object.keys(value).length),
      Add(list, value) { if (!Array.isArray(list)) throw new Error('Collections.Add expects an array.'); list.push(value); return list.length; },
      Remove(list, value) { if (!Array.isArray(list)) throw new Error('Collections.Remove expects an array.'); const i = list.indexOf(value); if (i >= 0) list.splice(i, 1); return i >= 0; },
      Contains: (list, value) => list != null && list.includes(value),
      Sort(list) { if (!Array.isArray(list)) throw new Error('Collections.Sort expects an array.'); return [...list].sort((a, b) => a - b); }
    },
    Json: { Stringify: value => JSON.stringify(value), Parse: value => JSON.parse(value) },
    Cez: {
      length(value) { if (value == null) return 0; if (typeof value === 'string' || Array.isArray(value)) return value.length; return Object.keys(value).length; },
      range(start, end, step = 1) {
        if (end === undefined) { end = start; start = 0; }
        if (!step) throw new Error('Cez.range step cannot be zero.');
        const values = [];
        if (step > 0) for (let i = start; i < end; i += step) values.push(i);
        else for (let i = start; i > end; i += step) values.push(i);
        return values;
      }
    }
  };
}

function run(source, filename = 'main.cez') {
  const js = compile(source);
  const output = [];
  const write = (...args) => output.push(args.map(value => {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value); } catch (_) { return String(value); }
  }).join(' '));
  const libraries = createLibraries(write);
  const sandbox = { ...libraries, console: libraries.Console, Math, Date, JSON, Number, String, Boolean, Array, Object, parseInt, parseFloat, isNaN, Infinity, NaN };
  vm.createContext(sandbox, { name: 'C ez' });
  try {
    new vm.Script(js, { filename }).runInContext(sandbox, { timeout: 3000 });
    return { output: output.join('\n'), javascript: js };
  } catch (error) {
    const wrapped = new Error(error.message + '\nFile: ' + filename + (error.stack ? '\nDetails: ' + error.stack.split('\n').slice(1, 3).join(' | ') : ''));
    wrapped.sourceLine = Number((error.message.match(/line (\d+)/i) || [])[1]) || null;
    wrapped.stack = error.stack;
    throw wrapped;
  }
}
module.exports = { compile, run };
