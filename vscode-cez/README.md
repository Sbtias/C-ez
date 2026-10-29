# C ez Language Support

Extensión de VS Code para archivos `.cez`, con intérprete integrado.

## Instalar

Descarga el artefacto `cez-language-vsix` desde la ejecución más reciente de GitHub Actions en https://github.com/Sbtias/C-ez/actions. En VS Code, usa **Extensiones → ... → Instalar desde VSIX...**.

## Ejecutar

Abre un archivo `.cez` y pulsa **Ctrl+F5** en Windows/Linux o **Cmd+F5** en macOS. La salida y los errores aparecen en el canal de salida **C ez**.

No requiere Python ni dependencias externas en tiempo de ejecución.

## Sintaxis rápida

```cez
funcion sumar(a, b):
    retornar a + b

si sumar(2, 3) es 5:
    mostrar("Todo funciona")
sino:
    mostrar("Revisa el programa")

para i en rango(3):
    mostrar(i)
```

Incluye resaltado, snippets, creación de archivos, ejecución integrada, funciones, clases, condiciones, bucles y utilidades básicas. C ez está en desarrollo y solo implementa el subconjunto documentado.
