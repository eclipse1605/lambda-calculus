import re
from lambda_calculus.syntax import Variable, Abstraction, Application


class ParseError(Exception):
    pass


class Parser:    
    def __init__(self):
        self.lambda_symbol_pattern = r'[λ\\]'
        self.variable_pattern = r'[a-zA-Z][a-zA-Z0-9_]*'
        self.token_pattern = re.compile(
            f'{self.lambda_symbol_pattern}|'
            r'\.|'   
            r'\(|\)|'
            f'{self.variable_pattern}'
        )
    
    def tokenize(self, input_string):
        tokens = self.token_pattern.findall(input_string)
        tokens = [token.strip() for token in tokens if token.strip()]
        return tokens
    
    def parse(self, input_string):
        tokens = self.tokenize(input_string)
        if not tokens:
            raise ParseError("Empty input")
        expr, remaining = self._parse_expr(tokens)
        if remaining:
            raise ParseError(f"Unexpected tokens at end: {' '.join(remaining)}")
        
        return expr
    
    def _parse_expr(self, tokens):
        if not tokens:
            raise ParseError("Unexpected end of input")
        left, tokens = self._parse_atom(tokens)
        while tokens and tokens[0] not in [')', '.']:
            right, tokens = self._parse_atom(tokens)
            left = Application(left, right)
        
        return left, tokens
    
    def _parse_atom(self, tokens):
        if not tokens:
            raise ParseError("Unexpected end of input")
        
        token = tokens[0]
        
        if token == '(':
            _, tokens = tokens[0], tokens[1:]
            expr, tokens = self._parse_expr(tokens)
            if not tokens or tokens[0] != ')':
                raise ParseError("Missing closing parenthesis")
            _, tokens = tokens[0], tokens[1:]
            
            return expr, tokens
        
        elif token == 'λ' or token == '\\':
            _, tokens = tokens[0], tokens[1:]
            if not tokens or not re.match(self.variable_pattern, tokens[0]):
                raise ParseError("Expected variable after lambda")
            
            param, tokens = tokens[0], tokens[1:]
            
            if not tokens or tokens[0] != '.':
                raise ParseError("Expected dot after lambda parameter")
            
            _, tokens = tokens[0], tokens[1:]
            
            body, tokens = self._parse_expr(tokens)
            
            return Abstraction(param, body), tokens
        elif re.match(self.variable_pattern, token):
            return Variable(token), tokens[1:]
        else:
            raise ParseError(f"Unexpected token: {token}")


def parse(input_string):
    parser = Parser()
    return parser.parse(input_string)
