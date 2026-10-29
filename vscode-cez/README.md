# C ez Language Support

Extensión de VS Code para archivos `.cez`, con intérprete integrado, autocompletado, consola y módulos.

## Instalar

Descarga el artefacto `cez-language-vsix` desde la ejecución más reciente de GitHub Actions en https://github.com/Sbtias/C-ez/actions. En VS Code, usa **Extensiones → ... → Instalar desde VSIX...**.

## Ejecutar y punto de entrada

Abre un archivo `.cez` y pulsa **Ctrl+F5** en Windows/Linux o **Cmd+F5** en macOS. La salida y los errores aparecen en el canal de salida **C ez**.

La función `main()` es el punto de entrada. Si existe, C ez la ejecuta automáticamente:

```cez
funcion main():
    consola.escribir("Hola, mundo!")
    consola.advertir("Esto es una advertencia")
```

No hace falta escribir `main()` al final del archivo.

## Consola

- `consola.escribir(valor)`: muestra texto o valores.
- `consola.error(mensaje)`: muestra un mensaje marcado como error en la salida.
- `consola.advertir(mensaje)`: muestra una advertencia.
- `consola.limpiar()`: limpia la salida generada hasta ese momento.

También se mantiene `mostrar(valor)` como atajo de compatibilidad.

## Importar otros archivos

Usa `/importar` en una línea propia. La ruta es relativa al archivo que hace la importación; la extensión `.cez` es opcional.

Archivo `main.cez`:

```cez
/importar "utilidades.cez"

funcion main():
    saludar("mundo")
```

Archivo `utilidades.cez`:

```cez
funcion saludar(nombre):
    consola.escribir("Hola, " + nombre)
```

Se detectan importaciones circulares y se muestra un error si falta un archivo importado.

## Autocompletado e icono

El autocompletado sugiere palabras clave sin insertar una función completa al elegir `funcion` o `function`. Usa `funcionfn` para insertar la plantilla de una función. También ofrece métodos de consola y `/importar`. Si no aparece, pulsa **Ctrl+Espacio**.

La extensión incluye un tema de iconos llamado **C ez File Icons** para mostrar un logo en archivos `.cez`. Para activarlo, abre la paleta de comandos y elige **Preferences: File Icon Theme → C ez File Icons**.

## Funciones disponibles

Incluye variables, funciones, clases, condiciones, bucles, listas/objetos y utilidades básicas como `longitud()`, `rango()`, `texto()`, `numero()` y `tipo()`. No requiere Python ni dependencias externas en tiempo de ejecución.

C ez sigue en desarrollo y solo implementa el subconjunto documentado.
