# C ez Language Support · v0.5.0

<p align="center"><strong>C EZ · LANGUAGE SUPPORT</strong></p>

**Extension version: 0.5.0**

VS Code support for .cez files, with syntax highlighting, autocomplete, an integrated runtime, console output, and built-in library modules.

## Install

Download the cez-language-vsix artifact from the latest GitHub Actions run: https://github.com/Sbtias/C-ez/actions. In VS Code, choose Extensions → ... → Install from VSIX....

## Run a program

Open a .cez file and press Ctrl+F5 on Windows/Linux or Cmd+F5 on macOS. Output and errors appear in the C ez Output channel.

The main() function runs automatically when present:

```cez
using System;

function main():
    Console.WriteLine("Hello, world!")
    Console.WriteWarning("This is a warning")
```

## Built-in libraries

Use C#-style using directives to make module dependencies clear. No package download is needed.

- using System; provides Console.WriteLine(), Console.WriteWarning(), and Console.WriteError().
- using Random; provides Random.Next(min, max), Random.Float(), and Random.Choice(array).
- using Text; provides Text.ToUpper(), Text.ToLower(), Text.Trim(), Text.Contains(), Text.Replace(), and Text.Split().
- using Dates; provides Dates.Now(), Dates.Year(), Dates.Month(), Dates.Day(), and Dates.Timestamp().
- using Collections; provides Collections.Count(), Collections.Add(), Collections.Remove(), Collections.Contains(), and Collections.Sort().
- using Json; provides Json.Stringify() and Json.Parse().

## Syntax

C ez borrows selected ideas from C#, including using, class and access modifiers, familiar type names, and Console.WriteLine(). Blocks remain indentation-based and begin with a colon. Semicolons are optional. C# braces-based syntax is not supported.

English keywords are preferred: class, function, return, if, else if, else, while, for item in items, true, false, null, and, or, and not. Previous Spanish keywords remain supported.

## Import project files

Use /import "utilities.cez" on its own line to include another local C ez file. The path is relative to the importing file, and the extension is optional.

```cez
/import "utilities.cez"

function main():
    greet("world")
```

## File icons and autocomplete

The extension includes the C ez File Icons theme for .cez files. Enable it through Preferences: File Icon Theme → C ez File Icons. Press Ctrl+Space to show completions.

C ez is under active development and implements a documented subset of a programming language, not full C# compatibility.
