# C ez Language Support

Extensión de desarrollo para archivos .cez: resaltado de sintaxis, snippets y comandos.

## Probar
1. Abre esta carpeta en VS Code.
2. Pulsa F5 para abrir una ventana Extension Development Host.
3. En esa ventana, abre la raíz del repositorio C-ez y un archivo .cez.
4. Usa Ctrl+F5 (Windows/Linux) o Cmd+F5 (macOS), o el comando C ez: Ejecutar archivo.

## Empaquetar
Con Node.js instalado, ejecuta:
    npm install -g @vscode/vsce
    vsce package

En VS Code usa Extensiones > menú ... > Instalar desde VSIX para instalar el paquete generado.

En Windows el comando Python predeterminado es py -3. Cámbialo en Ajustes con cez.pythonPath si es necesario.
