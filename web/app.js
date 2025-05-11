const variables = {
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
};

const expressionInput = document.getElementById('expression-input');
const evaluateBtn = document.getElementById('evaluate-btn');
const stepBtn = document.getElementById('step-btn');
const normalBtn = document.getElementById('normal-btn');
const applicativeBtn = document.getElementById('applicative-btn');
const clearBtn = document.getElementById('clear-btn');
const evaluationHistory = document.getElementById('evaluation-history');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const specialSymbols = document.querySelectorAll('.special-symbols span');
const variableEntries = document.getElementById('variable-entries');
const varNameInput = document.getElementById('var-name-input');
const varExprInput = document.getElementById('var-expr-input');
const defineVarBtn = document.getElementById('define-var-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

function updateInputDisplay() {
    const preview = document.createElement('div');
    preview.className = 'input-preview';
    preview.textContent = expressionInput.value.replace(/\\/g, 'λ');
    preview.style.display = expressionInput.value ? 'block' : 'none';
    
    const oldPreview = document.querySelector('.input-preview');
    if (oldPreview) {
        oldPreview.remove();
    }
    
    if (expressionInput.value) {
        expressionInput.parentNode.insertBefore(preview, expressionInput.nextSibling);
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function init() {
    initTheme();
    
    themeToggleBtn.addEventListener('click', toggleTheme);
    evaluateBtn.addEventListener('click', evaluateExpression);
    stepBtn.addEventListener('click', () => evaluateExpression('step'));
    normalBtn.addEventListener('click', () => evaluateExpression('normal'));
    applicativeBtn.addEventListener('click', () => evaluateExpression('applicative'));
    clearBtn.addEventListener('click', clearHistory);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    specialSymbols.forEach(symbol => {
        symbol.addEventListener('click', () => {
            insertAtCursor(expressionInput, symbol.innerText);
        });
    });
    
    defineVarBtn.addEventListener('click', defineVariable);
    
    expressionInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            evaluateExpression();
        } else {
            updateInputDisplay();
        }
    });
    
    updateInputDisplay();
    
    updateVariableList();
    
    expressionInput.focus();
}

function insertAtCursor(input, text) {
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    const beforeText = input.value.substring(0, startPos);
    const afterText = input.value.substring(endPos);
    
    input.value = beforeText + text + afterText;
    input.focus();
    input.selectionStart = input.selectionEnd = startPos + text.length;
}

function switchTab(tabId) {
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
    });
    
    tabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === tabId);
    });
}

function parseExpression(exprStr) {
    if (variables[exprStr]) {
        return variables[exprStr];
    }
    
    const expr = parse(exprStr);
    
    function resolveVariables(e) {
        if (e instanceof Variable && variables[e.name]) {
            return variables[e.name];
        } else if (e instanceof Abstraction) {
            return new Abstraction(e.param, resolveVariables(e.body));
        } else if (e instanceof Application) {
            return new Application(resolveVariables(e.left), resolveVariables(e.right));
        } else {
            return e;
        }
    }
    
    return resolveVariables(expr);
}

function evaluateExpression(strategy = 'beta') {
    const exprStr = expressionInput.value.trim();
    if (!exprStr) return;
    
    try {
        const expr = parseExpression(exprStr);
        let result, steps, normalForm, reductionSteps;
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'evaluation-entry';
        
        const inputDiv = document.createElement('div');
        inputDiv.className = 'evaluation-input';
        inputDiv.textContent = exprStr.replace(/\\/g, 'λ');
        entryDiv.appendChild(inputDiv);
        
        const outputDiv = document.createElement('div');
        outputDiv.className = 'evaluation-output';
        
        if (strategy === 'step') {
            const [reduced, wasReduced] = betaReduceOnce(expr);
            
            if (wasReduced) {
                outputDiv.textContent = `Result: ${reduced.toString()}`;
                
                variables['it'] = reduced;
            } else {
                outputDiv.textContent = 'Expression is already in normal form.';
            }
        } else {
            if (strategy === 'normal') {
                [result, steps, normalForm, reductionSteps] = reduceToNormalForm(expr, 'normal');
            } else if (strategy === 'applicative') {
                [result, steps, normalForm, reductionSteps] = reduceToNormalForm(expr, 'applicative');
            } else {
                [result, steps, normalForm, reductionSteps] = reduceToNormalForm(expr, 'normal');
            }
            
            outputDiv.textContent = `Result: ${result.toString()}`;
            
            const stepsDiv = document.createElement('div');
            stepsDiv.className = 'evaluation-steps';
            
            if (steps === 0) {
                stepsDiv.textContent = 'No reduction steps needed (already in normal form).';
            } else {
                stepsDiv.textContent = `Steps taken: ${steps}`;
                
                if (reductionSteps && reductionSteps.length > 0) {
                    const stepsButton = document.createElement('button');
                    stepsButton.textContent = 'Show steps';
                    stepsButton.style.marginLeft = '1rem';
                    stepsButton.addEventListener('click', () => {
                        const stepsListElem = document.createElement('div');
                        stepsListElem.className = 'reduction-steps-list';
                        stepsListElem.style.marginTop = '0.5rem';
                        
                        const initialStep = document.createElement('div');
                        initialStep.textContent = `0: ${expr.toString()}`;
                        stepsListElem.appendChild(initialStep);
                        
                        reductionSteps.forEach((step, index) => {
                            const stepElem = document.createElement('div');
                            stepElem.textContent = `${index + 1}: ${step}`;
                            stepsListElem.appendChild(stepElem);
                        });
                        
                        stepsDiv.appendChild(stepsListElem);
                        stepsButton.style.display = 'none';
                    });
                    stepsDiv.appendChild(stepsButton);
                }
            }
            
            if (!normalForm) {
                const warningDiv = document.createElement('div');
                warningDiv.textContent = 'Warning: May not be in normal form (reached maximum steps)';
                warningDiv.style.color = '#e74c3c';
                stepsDiv.appendChild(warningDiv);
            }
            
            outputDiv.appendChild(stepsDiv);
            
            variables['it'] = result;
            
            const numeralValue = extractChurchNumeral(result);
            if (numeralValue !== null) {
                const numeralDiv = document.createElement('div');
                numeralDiv.textContent = `Church numeral value: ${numeralValue}`;
                numeralDiv.style.marginTop = '0.5rem';
                outputDiv.appendChild(numeralDiv);
            }
            
            const boolValue = toBoolean(result);
            if (boolValue !== null) {
                const boolDiv = document.createElement('div');
                boolDiv.textContent = `Boolean value: ${boolValue}`;
                boolDiv.style.marginTop = '0.5rem';
                outputDiv.appendChild(boolDiv);
            }
        }
        
        entryDiv.appendChild(outputDiv);
        
        evaluationHistory.prepend(entryDiv);
        
        expressionInput.value = '';
        expressionInput.focus();
        
    } catch (e) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'evaluation-entry';
        
        const inputDiv = document.createElement('div');
        inputDiv.className = 'evaluation-input';
        inputDiv.textContent = exprStr;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'evaluation-output';
        errorDiv.textContent = `Error: ${e.message}`;
        errorDiv.style.color = '#e74c3c';
        
        entryDiv.appendChild(inputDiv);
        entryDiv.appendChild(errorDiv);
        evaluationHistory.prepend(entryDiv);
    }
}

function defineVariable() {
    const name = varNameInput.value.trim();
    const exprStr = varExprInput.value.trim();
    
    if (!name || !exprStr) {
        alert('Both variable name and expression are required');
        return;
    }
    
    try {
        const expr = parseExpression(exprStr);
        variables[name] = expr;
        
        const successDiv = document.createElement('div');
        successDiv.className = 'evaluation-entry';
        successDiv.textContent = `Defined ${name} = ${expr.toString()}`;
        successDiv.style.color = '#2ecc71';
        evaluationHistory.prepend(successDiv);
        
        updateVariableList();
        
        varNameInput.value = '';
        varExprInput.value = '';
    } catch (e) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'evaluation-entry';
        errorDiv.textContent = `Error: ${e.message}`;
        errorDiv.style.color = '#e74c3c';
        evaluationHistory.prepend(errorDiv);
    }
}

function updateVariableList() {
    variableEntries.innerHTML = '';
    
    Object.entries(variables).sort((a, b) => a[0].localeCompare(b[0])).forEach(([name, expr]) => {
        const varDiv = document.createElement('div');
        varDiv.className = 'variable-entry';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'variable-name';
        nameSpan.textContent = name;
        
        const exprSpan = document.createElement('span');
        exprSpan.className = 'variable-expr';
        exprSpan.textContent = expr.toString();
        
        varDiv.appendChild(nameSpan);
        varDiv.appendChild(exprSpan);
        variableEntries.appendChild(varDiv);
        
        varDiv.addEventListener('click', () => {
            insertAtCursor(expressionInput, name);
            switchTab('output');
            expressionInput.focus();
        });
    });
}

function clearHistory() {
    evaluationHistory.innerHTML = '';
}
document.addEventListener('DOMContentLoaded', init);
