try:
    import readline
except ImportError:
    try:
        import pyreadline3 as readline
    except ImportError:
        pass 
import sys
from lambda_calculus.syntax import Variable, Abstraction, Application
from lambda_calculus.parser import parse, ParseError
from lambda_calculus.semantics import (
    beta_reduce_once, reduce_to_normal_form, is_normal_form
)
from lambda_calculus.encodings import (
    TRUE, FALSE, AND, OR, NOT,
    ZERO, ONE, TWO, THREE,
    SUCC, PLUS, MULT, POW,
    PAIR, FIRST, SECOND,
    NIL, CONS, HEAD, TAIL,
    church_numeral, extract_church_numeral
)


class LambdaREPL:
    def __init__(self):
        self.variables = {
            'TRUE': TRUE,
            'FALSE': FALSE,
            'AND': AND,
            'OR': OR,
            'NOT': NOT,
            
            'ZERO': ZERO,
            'ONE': ONE,
            'TWO': TWO,
            'THREE': THREE,
            
            'SUCC': SUCC,
            'PLUS': PLUS,
            'MULT': MULT,
            'POW': POW,
            
            'PAIR': PAIR,
            'FIRST': FIRST,
            'SECOND': SECOND,
            
            'NIL': NIL,
            'CONS': CONS,
            'HEAD': HEAD,
            'TAIL': TAIL,
        }
        
        self.commands = {
            'help': self.help,
            'quit': self.quit,
            'exit': self.quit,
            'vars': self.list_variables,
            'step': self.step_reduction,
            'beta': self.beta_reduce,
            'normal': self.evaluate_normal_order,
            'app': self.evaluate_applicative_order,
            'let': self.define_variable,
            'church': self.create_church_numeral,
            'extract': self.extract_numeral,
        }
    
    def help(self, args=None):
        print("\nLambda Calculus REPL - Commands:")
        print("  help           - Show this help information")
        print("  quit, exit     - Exit the REPL")
        print("  vars           - List all defined variables")
        print("  let NAME EXPR  - Define a variable")
        print("  step EXPR      - Perform a single beta-reduction step")
        print("  beta EXPR      - Fully beta-reduce an expression")
        print("  normal EXPR    - Evaluate using normal order (leftmost, outermost)")
        print("  app EXPR       - Evaluate using applicative order (leftmost, innermost)")
        print("  church N       - Create a Church numeral for integer N")
        print("  extract EXPR   - Try to extract a number from a Church numeral")
        print("\nSyntax:")
        print("  Variables:      x, y, z, etc.")
        print("  Abstractions:   λx.M or \\x.M")
        print("  Applications:   M N")
        print("  Parentheses:    (M) for grouping")
        print("\nPredefined variables:")
        print("  Booleans:       TRUE, FALSE, AND, OR, NOT")
        print("  Numbers:        ZERO, ONE, TWO, THREE")
        print("  Arithmetic:     SUCC, PLUS, MULT, POW")
        print("  Pairs:          PAIR, FIRST, SECOND")
        print("  Lists:          NIL, CONS, HEAD, TAIL")
        print("\nExamples:")
        print("  λx.x                  # Identity function")
        print("  (λx.x) y              # Application of identity to y")
        print("  let ID λx.x           # Define a variable ID")
        print("  beta (PLUS ONE TWO)   # Evaluate 1 + 2")
        print("  church 5              # Create Church numeral for 5")
        print("  extract (PLUS TWO THREE) # Extract 5 from 2 + 3")
        return None
    
    def quit(self, args=None):
        print("Goodbye!")
        sys.exit(0)
    
    def list_variables(self, args=None):
        print("\nDefined variables:")
        for name, expr in sorted(self.variables.items()):
            print(f"  {name} = {expr}")
        return None
    
    def define_variable(self, args):
        if len(args) < 2:
            print("Error: let requires a name and an expression")
            return None
        
        name = args[0]
        expr_str = ' '.join(args[1:])
        
        try:
            expr = self.parse_expression(expr_str)
            self.variables[name] = expr
            print(f"Defined {name} = {expr}")
            return None
        except ParseError as e:
            print(f"Parse error: {e}")
            return None
    
    def step_reduction(self, args):
        if not args:
            print("Error: step requires an expression")
            return None
        
        expr_str = ' '.join(args)
        try:
            expr = self.parse_expression(expr_str)
            reduced, was_reduced = beta_reduce_once(expr)
            
            if was_reduced:
                print(f"Result: {reduced}")
            else:
                print("Expression is already in normal form.")
            
            return reduced
        except ParseError as e:
            print(f"Parse error: {e}")
            return None
    
    def beta_reduce(self, args):
        if not args:
            print("Error: beta requires an expression")
            return None
        
        expr_str = ' '.join(args)
        try:
            expr = self.parse_expression(expr_str)
            reduced, steps, normal_form = reduce_to_normal_form(expr, strategy="normal")
            
            print(f"Result: {reduced}")
            print(f"Steps taken: {steps}")
            
            if not normal_form:
                print("Warning: May not be in normal form (reached maximum steps)")
            
            return reduced
        except ParseError as e:
            print(f"Parse error: {e}")
            return None
    
    def evaluate_normal_order(self, args):
        if not args:
            print("Error: normal requires an expression")
            return None
        
        expr_str = ' '.join(args)
        try:
            expr = self.parse_expression(expr_str)
            reduced, steps, normal_form = reduce_to_normal_form(expr, strategy="normal")
            
            print(f"Result: {reduced}")
            print(f"Steps taken: {steps}")
            
            if not normal_form:
                print("Warning: May not be in normal form (reached maximum steps)")
            
            return reduced
        except ParseError as e:
            print(f"Parse error: {e}")
            return None
    
    def evaluate_applicative_order(self, args):
        if not args:
            print("Error: app requires an expression")
            return None
        
        expr_str = ' '.join(args)
        try:
            expr = self.parse_expression(expr_str)
            reduced, steps, normal_form = reduce_to_normal_form(expr, strategy="applicative")
            
            print(f"Result: {reduced}")
            print(f"Steps taken: {steps}")
            
            if not normal_form:
                print("Warning: May not be in normal form (reached maximum steps)")
            
            return reduced
        except ParseError as e:
            print(f"Parse error: {e}")
            return None
    
    def create_church_numeral(self, args):
        if not args or not args[0].isdigit():
            print("Error: church requires a non-negative integer")
            return None
        
        n = int(args[0])
        try:
            result = church_numeral(n)
            print(f"Church numeral for {n}: {result}")
            return result
        except ValueError as e:
            print(f"Error: {e}")
            return None
    
    def extract_numeral(self, args):
        if not args:
            print("Error: extract requires an expression")
            return None
        
        expr_str = ' '.join(args)
        try:
            expr = self.parse_expression(expr_str)
            
            reduced, _, _ = reduce_to_normal_form(expr)
            
            n = extract_church_numeral(reduced)
            
            if n is not None:
                print(f"Extracted value: {n}")
            else:
                print("Could not extract a Church numeral")
            
            return n
        except ParseError as e:
            print(f"Parse error: {e}")
            return None
    
    def parse_expression(self, expr_str):
        if expr_str in self.variables:
            return self.variables[expr_str]
        
        expr = parse(expr_str)
        
        def resolve_variables(e):
            if isinstance(e, Variable) and e.name in self.variables:
                return self.variables[e.name]
            elif isinstance(e, Abstraction):
                return Abstraction(e.param, resolve_variables(e.body))
            elif isinstance(e, Application):
                return Application(resolve_variables(e.left), resolve_variables(e.right))
            else:
                return e
        
        return resolve_variables(expr)
    
    def run(self):
        """Start the REPL."""
        print("Lambda Calculus REPL")
        print('Type "help" for a list of commands.')
        
        while True:
            try:
                user_input = input("\nλ> ").strip()
                
                if not user_input:
                    continue
                
                tokens = user_input.split()
                command = tokens[0].lower()
                args = tokens[1:]
                
                if command in self.commands:
                    result = self.commands[command](args)
                    if result is not None:
                        self.variables['it'] = result
                else:
                    try:
                        expr = self.parse_expression(user_input)
                        print(f"Parsed: {expr}")
                        self.variables['it'] = expr
                    except ParseError as e:
                        print(f"Parse error: {e}")
            
            except KeyboardInterrupt:
                print("\nUse 'quit' or 'exit' to exit the REPL.")
            except EOFError:
                self.quit()
            except Exception as e:
                print(f"Error: {e}")


def main():
    """Main entry point."""
    repl = LambdaREPL()
    repl.run()


if __name__ == "__main__":
    main()
