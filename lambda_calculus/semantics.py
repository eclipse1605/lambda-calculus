from lambda_calculus.syntax import Expr, Variable, Abstraction, Application


def is_beta_redex(expr):
    return isinstance(expr, Application) and isinstance(expr.left, Abstraction)


def beta_reduce_once(expr):
    if isinstance(expr, Variable):
        return expr, False
    
    elif isinstance(expr, Abstraction):
        body_reduced, was_reduced = beta_reduce_once(expr.body)
        if was_reduced:
            return Abstraction(expr.param, body_reduced), True
        return expr, False
    
    elif isinstance(expr, Application):
        if is_beta_redex(expr):
            abstraction = expr.left
            argument = expr.right
            return abstraction.body.substitute(abstraction.param, argument), True
        
        left_reduced, was_reduced = beta_reduce_once(expr.left)
        if was_reduced:
            return Application(left_reduced, expr.right), True
        
        right_reduced, was_reduced = beta_reduce_once(expr.right)
        if was_reduced:
            return Application(expr.left, right_reduced), True
        
        return expr, False
    
    raise TypeError(f"Unknown expression type: {type(expr)}")


def beta_reduce_normal_order(expr, max_steps=1000):
    steps = 0
    current_expr = expr
    
    while steps < max_steps:
        reduced_expr, was_reduced = beta_reduce_once(current_expr)
        if not was_reduced:
            return current_expr, steps, True
        
        current_expr = reduced_expr
        steps += 1
    return current_expr, steps, False


def beta_reduce_applicative_order(expr, max_steps=1000):
    def find_innermost_redex(expr):
        if isinstance(expr, Variable):
            return None, None
        
        elif isinstance(expr, Abstraction):
            path, found_expr = find_innermost_redex(expr.body)
            if path is not None:
                return ['body'] + path, found_expr
            return None, None
        
        elif isinstance(expr, Application):
            path, found_expr = find_innermost_redex(expr.right)
            if path is not None:
                return ['right'] + path, found_expr
            
            path, found_expr = find_innermost_redex(expr.left)
            if path is not None:
                return ['left'] + path, found_expr
            
            if is_beta_redex(expr):
                return [], expr
            
            return None, None
    
    def replace_at_path(expr, path, replacement):
        if not path:
            return replacement
        
        if isinstance(expr, Abstraction) and path[0] == 'body':
            return Abstraction(expr.param, replace_at_path(expr.body, path[1:], replacement))
        
        if isinstance(expr, Application):
            if path[0] == 'left':
                return Application(replace_at_path(expr.left, path[1:], replacement), expr.right)
            elif path[0] == 'right':
                return Application(expr.left, replace_at_path(expr.right, path[1:], replacement))
        
        raise ValueError(f"Invalid path {path} for expression {expr}")
    
    steps = 0
    current_expr = expr
    
    while steps < max_steps:
        path, redex = find_innermost_redex(current_expr)
        if redex is None:
            return current_expr, steps, True
        
        abstraction = redex.left
        argument = redex.right
        reduced_redex = abstraction.body.substitute(abstraction.param, argument)
        
        current_expr = replace_at_path(current_expr, path, reduced_redex)
        steps += 1
    
    return current_expr, steps, False


def is_normal_form(expr):
    if isinstance(expr, Variable):
        return True
    
    elif isinstance(expr, Abstraction):
        return is_normal_form(expr.body)
    
    elif isinstance(expr, Application):
        if isinstance(expr.left, Abstraction):
            return False
        
        return is_normal_form(expr.left) and is_normal_form(expr.right)
    
    raise TypeError(f"Unknown expression type: {type(expr)}")


def reduce_to_normal_form(expr, strategy="normal", max_steps=1000):
    if strategy == "normal":
        return beta_reduce_normal_order(expr, max_steps)
    elif strategy == "applicative":
        return beta_reduce_applicative_order(expr, max_steps)
    else:
        raise ValueError(f"Unknown evaluation strategy: {strategy}")
