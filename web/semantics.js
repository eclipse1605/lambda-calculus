function isBetaRedex(expr) {
    return expr instanceof Application && expr.left instanceof Abstraction;
}

function betaReduceOnce(expr) {
    if (expr instanceof Variable) {
        return [expr, false];
    }
    
    else if (expr instanceof Abstraction) {
        const [bodyReduced, wasReduced] = betaReduceOnce(expr.body);
        if (wasReduced) {
            return [new Abstraction(expr.param, bodyReduced), true];
        }
        return [expr, false];
    }
    
    else if (expr instanceof Application) {
        if (isBetaRedex(expr)) {
            const abstraction = expr.left;
            const argument = expr.right;
            return [abstraction.body.substitute(abstraction.param, argument), true];
        }
        
        const [leftReduced, leftWasReduced] = betaReduceOnce(expr.left);
        if (leftWasReduced) {
            return [new Application(leftReduced, expr.right), true];
        }
        
        const [rightReduced, rightWasReduced] = betaReduceOnce(expr.right);
        if (rightWasReduced) {
            return [new Application(expr.left, rightReduced), true];
        }
        
        return [expr, false];
    }
    
    throw new TypeError(`Unknown expression type: ${expr.constructor.name}`);
}

function betaReduceNormalOrder(expr, maxSteps = 1000) {
    let steps = 0;
    let currentExpr = expr;
    let reductionSteps = [];
    
    while (steps < maxSteps) {
        const [reducedExpr, wasReduced] = betaReduceOnce(currentExpr);
        
        if (!wasReduced) {
            return [currentExpr, steps, true, reductionSteps];
        }
        
        reductionSteps.push(reducedExpr.toString());
        currentExpr = reducedExpr;
        steps++;
    }
    
    return [currentExpr, steps, false, reductionSteps];
}
function betaReduceApplicativeOrder(expr, maxSteps = 1000) {
    function findInnermostRedex(expr) {
        if (expr instanceof Variable) {
            return [null, null];
        }
        
        else if (expr instanceof Abstraction) {
            const [path, foundExpr] = findInnermostRedex(expr.body);
            if (path !== null) {
                return [['body', ...path], foundExpr];
            }
            return [null, null];
        }
        
        else if (expr instanceof Application) {
            const [rightPath, rightFoundExpr] = findInnermostRedex(expr.right);
            if (rightPath !== null) {
                return [['right', ...rightPath], rightFoundExpr];
            }
            
            const [leftPath, leftFoundExpr] = findInnermostRedex(expr.left);
            if (leftPath !== null) {
                return [['left', ...leftPath], leftFoundExpr];
            }
            
            if (isBetaRedex(expr)) {
                return [[], expr];
            }
            
            return [null, null];
        }
    }
    
    function replaceAtPath(expr, path, replacement) {
        if (path.length === 0) {
            return replacement;
        }
        
        if (expr instanceof Abstraction && path[0] === 'body') {
            return new Abstraction(
                expr.param,
                replaceAtPath(expr.body, path.slice(1), replacement)
            );
        }
        
        if (expr instanceof Application) {
            if (path[0] === 'left') {
                return new Application(
                    replaceAtPath(expr.left, path.slice(1), replacement),
                    expr.right
                );
            } else if (path[0] === 'right') {
                return new Application(
                    expr.left,
                    replaceAtPath(expr.right, path.slice(1), replacement)
                );
            }
        }
        
        throw new Error(`Invalid path ${path} for expression ${expr}`);
    }
    
    let steps = 0;
    let currentExpr = expr;
    let reductionSteps = [];
    
    while (steps < maxSteps) {
        const [path, redex] = findInnermostRedex(currentExpr);
        
        if (redex === null) {
            return [currentExpr, steps, true, reductionSteps];
        }
        
        const abstraction = redex.left;
        const argument = redex.right;
        const reducedRedex = abstraction.body.substitute(abstraction.param, argument);
        
        currentExpr = replaceAtPath(currentExpr, path, reducedRedex);
        reductionSteps.push(currentExpr.toString());
        steps++;
    }
    
    return [currentExpr, steps, false, reductionSteps];
}

function isNormalForm(expr) {
    if (expr instanceof Variable) {
        return true;
    }
    
    else if (expr instanceof Abstraction) {
        return isNormalForm(expr.body);
    }
    
    else if (expr instanceof Application) {
        if (expr.left instanceof Abstraction) {
            return false;
        }
        
        return isNormalForm(expr.left) && isNormalForm(expr.right);
    }
    
    throw new TypeError(`Unknown expression type: ${expr.constructor.name}`);
}

function reduceToNormalForm(expr, strategy = "normal", maxSteps = 1000) {
    if (strategy === "normal") {
        return betaReduceNormalOrder(expr, maxSteps);
    } else if (strategy === "applicative") {
        return betaReduceApplicativeOrder(expr, maxSteps);
    } else {
        throw new Error(`Unknown evaluation strategy: ${strategy}`);
    }
}
