# C ez Language Support · v0.6.0

**A small, readable language with a few C#-inspired ideas.**

C ez uses indentation and short commands instead of requiring C#-style braces and semicolons.

## Quick start

```cez
using System;

func main():
    say("Hello, world!")

    repeat 3 times:
        say("Easy to read. Easy to build.")
```

Open a `.cez` file and press **Ctrl+F5** on Windows/Linux or **Cmd+F5** on macOS. Output appears in the **C ez** Output channel.

## Simple syntax

- `func name():` declares a function. `function` is an accepted alias.
- `say(value)` and `print(value)` display output.
- `if condition:`, `else:`, `while condition:`, and `for item in items:` control program flow.
- `repeat 5 times:` repeats a block five times.
- Colons and indentation define blocks. Semicolons are optional.
- Classes are available when you need them, but are not required for small programs.

## Built-in libraries

Use `using LibraryName;` to document a dependency on a built-in module:

- `System`: console helpers, including `Console.WriteLine()`.
- `Random`: `Random.Next(min, max)`, `Random.Float()`, `Random.Choice(items)`.
- `Text`: `Text.ToUpper()`, `Text.ToLower()`, `Text.Trim()`, `Text.Contains()`, `Text.Replace()`, `Text.Split()`.
- `Dates`: `Dates.Now()`, `Dates.Year()`, `Dates.Month()`, `Dates.Day()`, `Dates.Timestamp()`.
- `Collections`: `Collections.Count()`, `Collections.Add()`, `Collections.Remove()`, `Collections.Contains()`, `Collections.Sort()`.
- `Json`: `Json.Stringify()`, `Json.Parse()`.

These libraries ship with the runtime; no package manager or internet download is required. The `using` directive currently documents imports, while built-in modules are available in the runtime.

## Install

Download the `cez-language-vsix` artifact from [GitHub Actions](https://github.com/Sbtias/C-ez/actions), then in VS Code choose **Extensions → ... → Install from VSIX...**.

C ez is under development and is not a full C# compiler.
