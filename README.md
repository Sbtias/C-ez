# C ez

**C ez** is a lightweight, object-oriented programming language with a C#-inspired style. Source files use the .cez extension. It keeps indentation-based blocks while adding familiar ideas such as using directives, typed variable declarations, classes, and Console.WriteLine().

## Visual Studio Code extension

The vscode-cez folder contains the language extension and an integrated JavaScript runtime. You do not need Python or a separate runtime to use the VS Code extension.

1. Open the repository's Actions tab: https://github.com/Sbtias/C-ez/actions
2. Open the latest Build C ez VS Code extension run.
3. Download the cez-language-vsix artifact.
4. In VS Code, open Extensions, select ..., then choose Install from VSIX...
5. Open a .cez file and press Ctrl+F5 (Windows/Linux) or Cmd+F5 (macOS).

## Quick start

```cez
using System;
using Text;
using Random;

public class Player:
    public function constructor(name):
        this.name = name

    public function Greet():
        Console.WriteLine("Hello, " + Text.ToUpper(this.name))

function main():
    Console.WriteLine("Welcome to C ez!")
    Console.WriteLine("Random number: " + Random.Next(1, 101))

    player = new Player("Alex")
    player.Greet()
```

C ez uses indentation for blocks, so a colon starts a class, function, or control-flow block. Semicolons are optional. It is not a full C# compiler, and braces-based C# syntax is not supported.

## Standard library

Library modules are built in. Add a using line at the top of a file, then call the module's methods.

| Import | Example | Purpose |
| --- | --- | --- |
| using System; | Console.WriteLine("Hello") | Console output and runtime information |
| using Random; | Random.Next(1, 10) | Random numbers and random selection |
| using Text; | Text.ToUpper("hello") | Text conversion, trimming, searching, splitting |
| using Dates; | Dates.Now() | Date/time values and timestamps |
| using Collections; | Collections.Add(items, 5) | Common array/list operations |
| using Json; | Json.Stringify(data) | JSON parsing and serialization |

These modules are available in the integrated runtime. using documents which modules a program depends on; it does not download packages from the internet.

## Language features

- Variables and expressions, including typed declarations such as int score = 10 and string title = "Game".
- Functions and return values: function, return, and main().
- Classes, constructors, and object members.
- Conditions: if, else if, else.
- Loops: while, for item in collection, break, and continue.
- Arrays with [] and objects with {}.
- Boolean and null values: true, false, null.
- Operators: and, or, not, is, and not is.
- Legacy Spanish keywords remain supported for compatibility.

## Project status

C ez is an evolving language, not a native compiler or a drop-in replacement for C#. The VS Code extension executes the supported language subset in its integrated runtime.
