#!/usr/bin/env python3
"""C ez v0.1: traductor de sintaxis C ez a Python."""
import argparse
import ast
import re
import sys
from pathlib import Path

KEYWORDS = {
    'clase': 'class', 'funcion': 'def', 'retornar': 'return',
    'si': 'if', 'sino': 'else', 'sino_si': 'elif',
    'mientras': 'while', 'para': 'for', 'en': 'in',
    'romper': 'break', 'continuar': 'continue',
    'verdadero': 'True', 'falso': 'False', 'nada': 'None',
    'y': 'and', 'o': 'or', 'no': 'not', 'es': 'is', 'yo': 'self'
}
TOKEN = re.compile(r'''(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][A-Za-z_0-9]*)''')

def translate_line(line):
    quote = None
    escaped = False
    cut = len(line)
    for i, ch in enumerate(line):
        if escaped:
            escaped = False
            continue
        if ch == '\\' and quote:
            escaped = True
            continue
        if ch in ("'", '"'):
            if quote == ch:
                quote = None
            elif quote is None:
                quote = ch
        elif ch == '#' and quote is None:
            cut = i
            break
    code, comment = line[:cut], line[cut:]
    def replace(match):
        token = match.group(0)
        if token.startswith(('"', "'")):
            return token
        if token == 'mostrar':
            return 'print'
        return KEYWORDS.get(token, token)
    return TOKEN.sub(replace, code) + comment

def translate(source):
    result = '\n'.join(translate_line(line) for line in source.splitlines()) + '\n'
    try:
        ast.parse(result)
    except SyntaxError as exc:
        raise SyntaxError(f'error de sintaxis en línea {exc.lineno}: {exc.msg}') from exc
    return result

def main():
    parser = argparse.ArgumentParser(prog='cez', description='Runtime del lenguaje C ez')
    sub = parser.add_subparsers(dest='command', required=True)
    for name in ('run', 'build'):
        cmd = sub.add_parser(name)
        cmd.add_argument('file')
    args = parser.parse_args()
    src = Path(args.file).resolve()
    if not src.is_file():
        print(f'C ez: no existe el archivo: {src}', file=sys.stderr)
        return 2
    try:
        generated = translate(src.read_text(encoding='utf-8'))
    except (SyntaxError, UnicodeError) as exc:
        print(f'C ez: {exc}', file=sys.stderr)
        return 1
    if args.command == 'build':
        out = Path.cwd() / 'build'
        out.mkdir(parents=True, exist_ok=True)
        target = out / f'{src.stem}.py'
        target.write_text(generated, encoding='utf-8')
        print(f'C ez traducido a: {target}')
        return 0
    sys.path.insert(0, str(src.parent))
    namespace = {'__name__': '__main__', '__file__': str(src)}
    try:
        exec(compile(generated, str(src), 'exec'), namespace)
    except Exception as exc:
        print(f'C ez: error al ejecutar {src.name}: {exc}', file=sys.stderr)
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
