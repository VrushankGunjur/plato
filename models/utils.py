import ast
import re

def get_python_file_parts(filename):
    # Read file contents into a string
    with open(filename, 'r') as f:
        file_contents = f.read()

    # Parse file contents into AST
    tree = ast.parse(file_contents)

    # Extract module-level information
    imports = []
    classes = []
    functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.extend([alias.name for alias in node.names])
        elif isinstance(node, ast.ImportFrom):
            imports.extend([node.module + '.' + alias.name for alias in node.names])
        elif isinstance(node, ast.ClassDef):
            classes.append(node.name)
        elif isinstance(node, ast.FunctionDef):
            functions.append(node.name)

    # Return tuple of all parts
    return (imports, classes, functions)

def split_file_by_function(filename):
    # Read file contents into a string
    with open(filename, 'r') as f:
        file_contents = f.read()

    # Use regular expression to match function definitions
    pattern = r'^\s*def\s+(\w+)\s*\((.*)\):(.+?)(?=^\s*def|\Z)'
    matches = re.findall(pattern, file_contents, re.DOTALL | re.MULTILINE)

    # Extract each function definition and its code
    functions = []
    for match in matches:
        function_name = match[0]
        function_args = match[1]
        function_code = match[2]
        functions.append((function_name, function_args, function_code.strip()))

    # Return list of (name, args, code) tuples for each function
    return functions