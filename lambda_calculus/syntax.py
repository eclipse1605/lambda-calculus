class Expr:
    def __str__(self):
        raise NotImplementedError("Subclasses must implement __str__")
    
    def __eq__(self, other):
        raise NotImplementedError("Subclasses must implement __eq__")
    
    def free_variables(self):
        raise NotImplementedError("Subclasses must implement free_variables")
    
    def bound_variables(self):
        raise NotImplementedError("Subclasses must implement bound_variables")
    
    def substitute(self, var_name, replacement):
        raise NotImplementedError("Subclasses must implement substitute")
    
    def is_alpha_equivalent(self, other):
        raise NotImplementedError("Subclasses must implement is_alpha_equivalent")


class Variable(Expr):
    def __init__(self, name):
        self.name = name
    
    def __str__(self):
        return self.name
    
    def __eq__(self, other):
        if not isinstance(other, Variable):
            return False
        return self.name == other.name
    
    def free_variables(self):
        return {self.name}
    
    def bound_variables(self):
        return set()
    
    def substitute(self, var_name, replacement):

        if self.name == var_name:
            return replacement
        return self
    
    def is_alpha_equivalent(self, other):
        if not isinstance(other, Variable):
            return False
        return self.name == other.name


class Abstraction(Expr):
    def __init__(self, param, body):
        self.param = param
        self.body = body
    
    def __str__(self):
        return f"λ{self.param}.{str(self.body)}"
    
    def __eq__(self, other):
        if not isinstance(other, Abstraction):
            return False
        return self.param == other.param and self.body == other.body
    
    def free_variables(self):
        return self.body.free_variables() - {self.param}
    
    def bound_variables(self):
        return {self.param} | self.body.bound_variables()
    
    def substitute(self, var_name, replacement):
        
        if self.param == var_name:
            return self
        
        if self.param in replacement.free_variables():
            new_param = self._fresh_name(
                self.param, 
                replacement.free_variables() | self.body.free_variables()
            )
            new_body = self.body.substitute(self.param, Variable(new_param))
            final_body = new_body.substitute(var_name, replacement)
            return Abstraction(new_param, final_body)
        
        return Abstraction(self.param, self.body.substitute(var_name, replacement))
    
    def _fresh_name(self, base_name, used_names):
        i = 0
        new_name = base_name
        while new_name in used_names:
            i += 1
            new_name = f"{base_name}{i}"
        return new_name
    
    def is_alpha_equivalent(self, other):
        if not isinstance(other, Abstraction):
            return False
        
        if self.param == other.param:
            return self.body.is_alpha_equivalent(other.body)
        
        fresh_param = self._fresh_name(
            self.param, 
            self.body.free_variables() | other.body.free_variables()
        )
        
        self_body_renamed = self.body.substitute(self.param, Variable(fresh_param))
        other_body_renamed = other.body.substitute(other.param, Variable(fresh_param))
        
        return self_body_renamed.is_alpha_equivalent(other_body_renamed)


class Application(Expr):    
    def __init__(self, left, right):
        self.left = left
        self.right = right
    
    def __str__(self):
        left_str = f"({self.left})" if isinstance(self.left, Abstraction) else str(self.left)
        right_str = f"({self.right})" if isinstance(self.right, (Application, Abstraction)) else str(self.right)
        return f"{left_str} {right_str}"
    
    def __eq__(self, other):
        if not isinstance(other, Application):
            return False
        return self.left == other.left and self.right == other.right
    
    def free_variables(self):
        return self.left.free_variables() | self.right.free_variables()
    
    def bound_variables(self):
        return self.left.bound_variables() | self.right.bound_variables()
    
    def substitute(self, var_name, replacement):
        return Application(
            self.left.substitute(var_name, replacement),
            self.right.substitute(var_name, replacement)
        )
    
    def is_alpha_equivalent(self, other):
        if not isinstance(other, Application):
            return False
        return (self.left.is_alpha_equivalent(other.left) and 
                self.right.is_alpha_equivalent(other.right))
