class ParseError extends Error {
    constructor(message) {
        super(message);
        this.name = "ParseError";
    }
}

class Parser {
    constructor() {
        this.lambdaSymbolPattern = /[λ\\]/;
        this.variablePattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        this.tokenPattern = /[λ\\]|\.|[(]|[)]|[a-zA-Z][a-zA-Z0-9_]*/g;
    }
    
    tokenize(inputString) {
        const tokens = inputString.match(this.tokenPattern) || [];
        return tokens.filter(token => token.trim() !== '');
    }
    
    parse(inputString) {
        const tokens = this.tokenize(inputString);
        if (tokens.length === 0) {
            throw new ParseError("Empty input");
        }
        
        const [expr, remaining] = this._parseExpr(tokens);
        if (remaining.length > 0) {
            throw new ParseError(`Unexpected tokens at end: ${remaining.join(' ')}`);
        }
        
        return expr;
    }
    
    _parseExpr(tokens) {
        if (tokens.length === 0) {
            throw new ParseError("Unexpected end of input");
        }
        
        let [left, remainingTokens] = this._parseAtom(tokens);
        
        while (remainingTokens.length > 0 && ![')', '.'].includes(remainingTokens[0])) {
            const [right, newRemaining] = this._parseAtom(remainingTokens);
            left = new Application(left, right);
            remainingTokens = newRemaining;
        }
        
        return [left, remainingTokens];
    }

    _parseAtom(tokens) {
        if (tokens.length === 0) {
            throw new ParseError("Unexpected end of input");
        }
        
        const token = tokens[0];
        
        if (token === '(') {
            const remainingTokens = tokens.slice(1);
            const [expr, afterExpr] = this._parseExpr(remainingTokens);
            
            if (afterExpr.length === 0 || afterExpr[0] !== ')') {
                throw new ParseError("Missing closing parenthesis");
            }
            return [expr, afterExpr.slice(1)];
        }
        
        else if (token === 'λ' || token === '\\') {
            const afterLambda = tokens.slice(1);
            
            if (afterLambda.length === 0 || !this.variablePattern.test(afterLambda[0])) {
                throw new ParseError("Expected variable after lambda");
            }
            
            const param = afterLambda[0];
            const afterParam = afterLambda.slice(1);
            
            if (afterParam.length === 0 || afterParam[0] !== '.') {
                throw new ParseError("Expected dot after lambda parameter");
            }
            
            const afterDot = afterParam.slice(1);
            const [body, afterBody] = this._parseExpr(afterDot);
            
            return [new Abstraction(param, body), afterBody];
        }
        
        else if (this.variablePattern.test(token)) {
            return [new Variable(token), tokens.slice(1)];
        }
        else {
            throw new ParseError(`Unexpected token: ${token}`);
        }
    }
}

function parse(inputString) {
    const parser = new Parser();
    return parser.parse(inputString);
}
