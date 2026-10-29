# C ez

**C ez** es un lenguaje de programación en español, de sintaxis sencilla y con orientación a objetos. Los programas usan la extensión `.cez`.

## Extensión autónoma para Visual Studio Code

La carpeta `vscode-cez` contiene la extensión con intérprete JavaScript integrado. **No necesita instalar Python ni descargar un runtime por separado.**

1. Abre la pestaña **Actions** del repositorio: https://github.com/Sbtias/C-ez/actions
2. Entra en la ejecución más reciente de **Build C ez VS Code extension**.
3. Descarga el artefacto `cez-language-vsix`.
4. En VS Code, abre Extensiones, pulsa `...` y selecciona **Instalar desde VSIX...**.
5. Abre o crea un archivo `.cez` y pulsa **Ctrl+F5** (Windows/Linux) o **Cmd+F5** (macOS).

El build se ejecuta automáticamente al cambiar archivos de la extensión. El paquete VSIX contiene el intérprete y el soporte del lenguaje.

## Ejemplo

```cez
clase Persona:
    funcion iniciar(nombre):
        yo.nombre = nombre

    funcion saludar():
        mostrar("Hola, " + yo.nombre)

persona = Persona("mundo")
persona.saludar()

para numero en rango(1, 4):
    mostrar(numero)
```

Salida:

```text
Hola, mundo
1
2
3
```

## Funciones actuales

- Variables y expresiones.
- Funciones con `funcion` y `retornar`.
- Clases, constructor `iniciar` y `yo` para referirse al objeto.
- Condiciones: `si`, `sino_si`, `sino`.
- Bucles: `mientras`, `para ... en ...`, `romper`, `continuar`.
- Colecciones JavaScript: listas con `[]` y objetos con `{}`.
- Valores: `verdadero`, `falso`, `nada`.
- Operadores: `y`, `o`, `no`, `es`, `no es`.
- Utilidades: `mostrar()`, `longitud()`, `rango()`, `texto()`, `numero()`, `tipo()`.

## Estado

C ez sigue siendo un lenguaje en desarrollo. La extensión ejecuta el subconjunto del lenguaje implementado por su intérprete integrado; no es todavía un compilador nativo ni promete compatibilidad con todas las bibliotecas de JavaScript o Python.
