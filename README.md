# C ez

C ez is a small, beginner-friendly programming language inspired by a few ideas from C#. It is **not C# with a different name**: C ez keeps simple indentation-based blocks, optional semicolons, and short commands that are easy to read.

## Quick start

```cez
using System;
using Text;

func greet(name):
    say("Hello, " + Text.ToUpper(name))

func main():
    greet("world")

    repeat 3 times:
        say("Let's build something!")
```

Save this as `main.cez` and run it with the C ez VS Code extension. The `main()` function runs automatically.

## Easy syntax

- Use `func` to create a function. `function` also works.
- Use `say(...)` to print a message. `print(...)` and `Console.WriteLine(...)` also work.
- Start a block with a colon and indent its contents. No braces needed.
- Semicolons are optional.
- Use `if condition:`, `else:`, `while condition:`, and `for item in items:`.
- Use `repeat 5 times:` to repeat a block a fixed number of times.
- Use `class Player:` when you need objects, but simple programs do not need classes.

## Built-in libraries

Add a `using` directive to show which built-in library your program uses. These modules are included with the runtime; `using` does not download external packages.

| Library | What it does | Example |
| --- | --- | --- |
| `System` | Console output | `say("Hello")` |
| `Text` | Text helpers | `Text.ToUpper("hello")` |
| `Random` | Random values | `Random.Next(1, 10)` |
| `Dates` | Date and time | `Dates.Now()` |
| `Collections` | List helpers | `Collections.Add(items, "apple")` |
| `Json` | JSON data | `Json.Stringify(data)` |

## Visual Studio Code

1. Open [GitHub Actions](https://github.com/Sbtias/C-ez/actions).
2. Open the latest build and download the `cez-language-vsix` artifact.
3. In VS Code, select **Extensions → ... → Install from VSIX...**.
4. Open a `.cez` file and press **Ctrl+F5** (Windows/Linux) or **Cmd+F5** (macOS).

C ez is still evolving. It borrows selected ideas from C# while prioritizing readable code for beginners.
