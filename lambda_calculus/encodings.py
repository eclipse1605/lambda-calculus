from lambda_calculus.syntax import Variable, Abstraction, Application
from lambda_calculus.parser import parse

TRUE = parse("λx.λy.x")          
FALSE = parse("λx.λy.y")         

AND = parse("λp.λq.p q p")       
OR = parse("λp.λq.p p q")        
NOT = parse("λp.λa.λb.p b a")    
IF_THEN_ELSE = parse("λp.λa.λb.p a b")  

ZERO = parse("λf.λx.x")            
ONE = parse("λf.λx.f x")           
TWO = parse("λf.λx.f (f x)")       
THREE = parse("λf.λx.f (f (f x))") 

SUCC = parse("λn.λf.λx.f (n f x)")     
PLUS = parse("λm.λn.λf.λx.m f (n f x)") 
MULT = parse("λm.λn.λf.m (n f)")        
POW = parse("λm.λn.n m")                
PRED = parse("λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u)")
SUB = parse("λm.λn.n PRED m")

IS_ZERO = parse("λn.n (λx.FALSE) TRUE")  
LEQ = parse("λm.λn.IS_ZERO (SUB m n)")   
EQ = parse("λm.λn.AND (LEQ m n) (LEQ n m)")


PAIR = parse("λx.λy.λf.f x y")     
FIRST = parse("λp.p (λx.λy.x)")    
SECOND = parse("λp.p (λx.λy.y)")   


NIL = parse("λx.TRUE")               
IS_NIL = parse("λl.l (λh.λt.λd.FALSE)") 
CONS = parse("λh.λt.λc.c h t")       
HEAD = parse("λl.l (λh.λt.h)")       
TAIL = parse("λl.l (λh.λt.t)")       


def church_numeral(n):
    if n < 0:
        raise ValueError("Church numerals only represent natural numbers")
    
    if n == 0:
        return ZERO
    
    result = ZERO
    for _ in range(n):
        result = Application(SUCC, result)
    
    return result


def extract_church_numeral(expr):
    if not isinstance(expr, Abstraction) or not isinstance(expr.body, Abstraction):
        return None
    
    f_param = expr.param
    x_param = expr.body.param
    body = expr.body.body
    
    count = 0
    current = body
    
    while isinstance(current, Application):
        if not isinstance(current.left, Variable) or current.left.name != f_param:
            return None
        
        current = current.right
        count += 1
    
    if not isinstance(current, Variable) or current.name != x_param:
        return None
    
    return count


def to_boolean(expr):
    from lambda_calculus.semantics import reduce_to_normal_form
    
    reduced, _, _ = reduce_to_normal_form(expr)
    if reduced.is_alpha_equivalent(TRUE):
        return True
    elif reduced.is_alpha_equivalent(FALSE):
        return False
    else:
        return None


def create_church_list(items, encoder_fn=None):
    result = NIL
    
    for item in reversed(items):
        if encoder_fn:
            encoded_item = encoder_fn(item)
        else:
            encoded_item = item
        
        result = Application(
            Application(CONS, encoded_item),
            result
        )
    
    return result
