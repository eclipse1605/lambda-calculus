const TRUE = parse("λx.λy.x");
const FALSE = parse("λx.λy.y");

const AND = parse("λp.λq.p q p");
const OR = parse("λp.λq.p p q");
const NOT = parse("λp.λa.λb.p b a");
const IF_THEN_ELSE = parse("λp.λa.λb.p a b");

const ZERO = parse("λf.λx.x");
const ONE = parse("λf.λx.f x");
const TWO = parse("λf.λx.f (f x)");
const THREE = parse("λf.λx.f (f (f x))");

const SUCC = parse("λn.λf.λx.f (n f x)");
const PLUS = parse("λm.λn.λf.λx.m f (n f x)");
const MULT = parse("λm.λn.λf.m (n f)");
const POW = parse("λm.λn.n m");

const PRED = parse("λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u)");
const SUB = parse("λm.λn.n PRED m");
const IS_ZERO = parse("λn.n (λx.FALSE) TRUE");
const LEQ = parse("λm.λn.IS_ZERO (SUB m n)")
const EQ = parse("λm.λn.AND (LEQ m n) (LEQ n m)");

const PAIR = parse("λx.λy.λf.f x y");
const FIRST = parse("λp.p (λx.λy.x)");
const SECOND = parse("λp.p (λx.λy.y)");

const NIL = parse("λx.TRUE");
const IS_NIL = parse("λl.l (λh.λt.λd.FALSE)");
const CONS = parse("λh.λt.λc.c h t");
const HEAD = parse("λl.l (λh.λt.h)");
const TAIL = parse("λl.l (λh.λt.t)");

function churchNumeral(n) {
    if (n < 0) {
        throw new Error("Church numerals only represent natural numbers");
    }
    
    if (n === 0) {
        return ZERO;
    }
    
    let result = ZERO;
    for (let i = 0; i < n; i++) {
        result = new Application(SUCC, result);
    }
    
    return result;
}

function extractChurchNumeral(expr) {
    if (!(expr instanceof Abstraction) || !(expr.body instanceof Abstraction)) {
        return null;
    }
    
    const fParam = expr.param;
    const xParam = expr.body.param;
    let body = expr.body.body;
    
    let count = 0;
    let current = body;
    
    while (current instanceof Application) {
        if (!(current.left instanceof Variable) || current.left.name !== fParam) {
            return null;
        }
        
        current = current.right;
        count++;
    }
    
    if (!(current instanceof Variable) || current.name !== xParam) {
        return null;
    }
    
    return count;
}

function toBoolean(expr) {
    const [reduced, _, __] = reduceToNormalForm(expr);
    
    if (reduced.isAlphaEquivalent(TRUE)) {
        return true;
    } else if (reduced.isAlphaEquivalent(FALSE)) {
        return false;
    } else {
        return null;
    }
}

function createChurchList(items, encoderFn = null) {
    let result = NIL;
    
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const encodedItem = encoderFn ? encoderFn(item) : item;
        
        result = new Application(
            new Application(CONS, encodedItem),
            result
        );
    }
    
    return result;
}
