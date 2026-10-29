# C ez

C ez es un lenguaje sencillo y orientado a objetos para crear scripts y aplicaciones. Usa archivos .cez y sintaxis inspirada en Python.

Estado: prototipo v0.1. El runtime traduce C ez a Python 3; todavía no es un compilador nativo ni un lenguaje de producción.

## Requisitos
- Python 3.10+
- Visual Studio Code (opcional)

## Ejecutar en Windows
    py -3 cez.py run ejemplos/hola.cez
    py -3 cez.py build ejemplos/hola.cez

En macOS/Linux usa python3. El comando build genera Python en la carpeta build/.

## Ejemplo
    mostrar("Hola, mundo!")

    clase Persona:
        funcion iniciar(nombre):
            yo.nombre = nombre
        funcion saludar():
            mostrar("Hola, " + yo.nombre)

    persona = Persona("Sbtias")
    persona.saludar()

Palabras clave: mostrar, clase, funcion, retornar, si, sino, sino_si, mientras, para, en, verdadero, falso, nada, y, o, no, es, yo. La indentación sigue el estilo Python y los comentarios empiezan con #.

## Extensión VS Code
La carpeta vscode-cez incluye resaltado, snippets, creación de archivos y ejecución con Ctrl+F5 (macOS: Cmd+F5). Abre la raíz del repositorio como workspace para que la extensión encuentre cez.py.

Para probarla, abre vscode-cez en VS Code y pulsa F5. Para empaquetar, instala Node.js y ejecuta npm install -g @vscode/vsce; después, dentro de vscode-cez, ejecuta vsce package. Instala el .vsix desde Extensiones > ... > Instalar desde VSIX.

Próximas metas: intérprete propio, biblioteca estándar, módulos, mejores errores, pruebas, depurador y empaquetado de aplicaciones.