# Lambda Calculus Implementation

A modular implementation of lambda calculus in Python, inspired by the reference lecture notes. The project includes both a command-line REPL and a web-based interface for interacting with lambda calculus expressions.

## Features

- **Expression Representation**: Classes for variables, lambda abstractions, and applications
- **Parser**: Convert lambda calculus notation to syntax tree objects
- **Evaluation Strategies**:
  - Normal order evaluation (leftmost, outermost)
  - Applicative order evaluation (leftmost, innermost)
  - β-reduction
- **Church Encodings**:
  - Booleans (TRUE, FALSE, AND, OR, NOT)
  - Natural numbers (Church numerals)
  - Pairs
  - Lists
- **Interactive Interfaces**:
  - Command-line REPL for experimenting with lambda calculus
  - Web-based interface with an interactive REPL
  - Dark mode toggle functionality
  - Comprehensive help section

## Getting Started

### Prerequisites

- Python 3.6 or higher
- For Windows users: `pyreadline3` module (automatically used as fallback if standard `readline` is unavailable)

### Running the Command-line REPL

To start the interactive command-line REPL for lambda calculus:

```bash
python main.py
```

### Running the Web Interface

To start the web-based interface:

1. Navigate to the web directory:

   ```bash
   cd web
   ```

2. Start a local HTTP server:

   ```bash
   # Using Python 3's built-in server
   python -m http.server
   ```

3. Open your browser and go to: `http://localhost:8000`

## Usage Examples

### Basic Lambda Expressions

```bash
λ> λx.x
Parsed: λx.x

λ> (λx.x) y
Parsed: (λx.x) y

λ> beta (λx.x) y
Result: y
Steps taken: 1
```

### Working with Church Numerals

```bash
λ> church 3
Church numeral for 3: λf.λx.f (f (f x))

λ> beta (PLUS TWO THREE)
Result: λf.λx.f (f (f (f (f x))))
Steps taken: 8

λ> extract (PLUS TWO THREE)
Extracted value: 5
```

### Defining Custom Variables

```bash
λ> let ID λx.x
Defined ID = λx.x

λ> let IDENTITY_COMBINATOR λx.x
Defined IDENTITY_COMBINATOR = λx.x

λ> vars
Defined variables:
  AND = λp.λq.p q p
  CONS = λh.λt.λc.c h t
  FALSE = λx.λy.y
  FIRST = λp.p (λx.λy.x)
  ...
```

## Module Structure

- `lambda_calculus/syntax.py`: Core syntax classes
- `lambda_calculus/parser.py`: Lambda expression parser
- `lambda_calculus/semantics.py`: Evaluation strategies
- `lambda_calculus/encodings.py`: Church encodings
- `lambda_calculus/repl.py`: Interactive command-line REPL
- `web/`: Web-based interface files
  - `index.html`: Main HTML structure
  - `styles.css`: Styling including dark mode
  - `app.js`: JavaScript for web interface functionality

## REPL Commands

- `help`: Show help information
- `quit`, `exit`: Exit the REPL
- `vars`: List all defined variables
- `let NAME EXPR`: Define a variable
- `step EXPR`: Perform a single beta-reduction step
- `beta EXPR`: Fully beta-reduce an expression
- `normal EXPR`: Evaluate using normal order
- `app EXPR`: Evaluate using applicative order
- `church N`: Create a Church numeral for integer N
- `extract EXPR`: Try to extract a number from a Church numeral

## Syntax

The implementation supports the standard lambda calculus syntax:

- Variables: `x`, `y`, `z`, etc.
- Abstractions: `λx.M` or `\x.M` (where λ can be written as \ for convenience)
- Applications: `M N` (with left-associativity)
- Parentheses: `(M)` for explicit grouping

### Web Interface Syntax

In the web interface, you can use backslash (`\`) which will automatically be converted to lambda symbol (λ) in the display. This provides a more convenient way of entering lambda expressions while maintaining proper notation in the output.

## Web Interface Features

- **Interactive REPL**: Type lambda calculus expressions and see results immediately
- **Multiple Evaluation Strategies**: Choose between β-reduction, Normal Order, and Call-by-value
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Comprehensive Help**: Detailed explanations of lambda calculus concepts and syntax
- **Automatic Lambda Symbol Conversion**: Type backslash (`\`) and see it displayed as lambda (λ)
