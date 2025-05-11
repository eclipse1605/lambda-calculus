class Expr {
    toString() {
        throw new Error("Subclasses must implement toString");
    }
    
    freeVariables() {
        throw new Error("Subclasses must implement freeVariables");
    }

    boundVariables() {
        throw new Error("Subclasses must implement boundVariables");
    }
    substitute(varName, replacement) {
        throw new Error("Subclasses must implement substitute");
    }
    isAlphaEquivalent(other) {
        throw new Error("Subclasses must implement isAlphaEquivalent");
    }
}

class Variable extends Expr {
    constructor(name) {
        super();
        this.name = name;
    }
    
    toString() {
        return this.name;
    }
    
    freeVariables() {
        return new Set([this.name]);
    }
    
    boundVariables() {
        return new Set();
    }
    
    substitute(varName, replacement) {
        if (this.name === varName) {
            return replacement;
        }
        return this;
    }
    
    isAlphaEquivalent(other) {
        if (!(other instanceof Variable)) {
            return false;
        }
        return this.name === other.name;
    }
}

class Abstraction extends Expr {

    constructor(param, body) {
        super();
        this.param = param;
        this.body = body;
    }
    
    toString() {
        return `λ${this.param}.${this.body.toString()}`;
    }
    
    freeVariables() {
        const result = new Set(this.body.freeVariables());
        result.delete(this.param);
        return result;
    }
    
    boundVariables() {
        const result = new Set(this.body.boundVariables());
        result.add(this.param);
        return result;
    }
    

    _freshName(baseName, usedNames) {
        let i = 0;
        let newName = baseName;
        while (usedNames.has(newName)) {
            i++;
            newName = `${baseName}${i}`;
        }
        return newName;
    }
    
    substitute(varName, replacement) {
        if (this.param === varName) {
            return this;
        }
        
        if (replacement.freeVariables().has(this.param)) {
            const freeVarsUnion = new Set([
                ...replacement.freeVariables(),
                ...this.body.freeVariables()
            ]);
            const newParam = this._freshName(this.param, freeVarsUnion);
            
            const newBody = this.body.substitute(this.param, new Variable(newParam));
            
            const finalBody = newBody.substitute(varName, replacement);
            return new Abstraction(newParam, finalBody);
        }
        
        return new Abstraction(this.param, this.body.substitute(varName, replacement));
    }
    
    isAlphaEquivalent(other) {
        if (!(other instanceof Abstraction)) {
            return false;
        }
        
        if (this.param === other.param) {
            return this.body.isAlphaEquivalent(other.body);
        }
        
        const freeVarsUnion = new Set([
            ...this.body.freeVariables(),
            ...other.body.freeVariables()
        ]);
        const freshParam = this._freshName(this.param, freeVarsUnion);
        
        const selfBodyRenamed = this.body.substitute(this.param, new Variable(freshParam));
        const otherBodyRenamed = other.body.substitute(other.param, new Variable(freshParam));
        
        return selfBodyRenamed.isAlphaEquivalent(otherBodyRenamed);
    }
}

class Application extends Expr {

    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    
    toString() {
        const leftStr = this.left instanceof Abstraction ? 
            `(${this.left.toString()})` : this.left.toString();
        const rightStr = this.right instanceof Application || this.right instanceof Abstraction ? 
            `(${this.right.toString()})` : this.right.toString();
        return `${leftStr} ${rightStr}`;
    }
    
    freeVariables() {
        return new Set([
            ...this.left.freeVariables(),
            ...this.right.freeVariables()
        ]);
    }
    
    boundVariables() {
        return new Set([
            ...this.left.boundVariables(),
            ...this.right.boundVariables()
        ]);
    }
    
    substitute(varName, replacement) {
        return new Application(
            this.left.substitute(varName, replacement),
            this.right.substitute(varName, replacement)
        );
    }
    
    isAlphaEquivalent(other) {
        if (!(other instanceof Application)) {
            return false;
        }
        return (
            this.left.isAlphaEquivalent(other.left) && 
            this.right.isAlphaEquivalent(other.right)
        );
    }
}
