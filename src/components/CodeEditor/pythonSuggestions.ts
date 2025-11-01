import * as monaco from "monaco-editor";

export const getPythonSuggestions = (
  range: monaco.IRange,
  monacoInstance: typeof monaco
): monaco.languages.CompletionItem[] => {
  return [
    // Built-in functions
    { label: 'int', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: int(x, base=10)', insertText: 'int', range },
    { label: 'input', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: input(prompt)', insertText: 'input', range },
    { label: 'print', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: print(*values, sep=" ", end="\\n")', insertText: 'print', range },
    { label: 'len', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: len(object)', insertText: 'len', range },
    { label: 'str', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: str(object)', insertText: 'str', range },
    { label: 'float', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: float(x)', insertText: 'float', range },
    { label: 'list', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: list(iterable)', insertText: 'list', range },
    { label: 'dict', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: dict(**kwargs)', insertText: 'dict', range },
    { label: 'range', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: range(stop) or range(start, stop[, step])', insertText: 'range', range },
    { label: 'sorted', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: sorted(iterable, key=None, reverse=False)', insertText: 'sorted', range },
    { label: 'min', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: min(iterable, *[, key, default])', insertText: 'min', range },
    { label: 'max', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: max(iterable, *[, key, default])', insertText: 'max', range },
    { label: 'sum', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: sum(iterable, start=0)', insertText: 'sum', range },
    { label: 'abs', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: abs(x)', insertText: 'abs', range },
    { label: 'round', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: round(number, ndigits=None)', insertText: 'round', range },
    { label: 'any', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: any(iterable)', insertText: 'any', range },
    { label: 'all', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: all(iterable)', insertText: 'all', range },
    { label: 'enumerate', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: enumerate(iterable, start=0)', insertText: 'enumerate', range },
    { label: 'zip', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: zip(*iterables)', insertText: 'zip', range },
    { label: 'map', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: map(function, iterable, ...)', insertText: 'map', range },
    { label: 'filter', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: filter(function, iterable)', insertText: 'filter', range },
    { label: 'reversed', kind: monacoInstance.languages.CompletionItemKind.Function, detail: 'Built-in function: reversed(seq)', insertText: 'reversed', range },
    
    // List methods
    { label: 'append', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.append(item)', insertText: 'append', range },
    { label: 'extend', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.extend(iterable)', insertText: 'extend', range },
    { label: 'insert', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.insert(index, item)', insertText: 'insert', range },
    { label: 'remove', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.remove(item)', insertText: 'remove', range },
    { label: 'pop', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.pop([index])', insertText: 'pop', range },
    { label: 'index', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.index(item, start, end)', insertText: 'index', range },
    { label: 'count', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.count(item)', insertText: 'count', range },
    { label: 'sort', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.sort(key=None, reverse=False)', insertText: 'sort', range },
    { label: 'reverse', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'List method: list.reverse()', insertText: 'reverse', range },
    
    // String methods
    { label: 'split', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.split(sep=None, maxsplit=-1)', insertText: 'split', range },
    { label: 'join', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.join(iterable)', insertText: 'join', range },
    { label: 'strip', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.strip(chars=None)', insertText: 'strip', range },
    { label: 'replace', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.replace(old, new, count=-1)', insertText: 'replace', range },
    { label: 'lower', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.lower()', insertText: 'lower', range },
    { label: 'upper', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.upper()', insertText: 'upper', range },
    { label: 'startswith', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.startswith(prefix, start, end)', insertText: 'startswith', range },
    { label: 'endswith', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.endswith(suffix, start, end)', insertText: 'endswith', range },
    { label: 'find', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'String method: str.find(sub, start, end)', insertText: 'find', range },
    
    // Dict methods
    { label: 'keys', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'Dict method: dict.keys()', insertText: 'keys', range },
    { label: 'values', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'Dict method: dict.values()', insertText: 'values', range },
    { label: 'items', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'Dict method: dict.items()', insertText: 'items', range },
    { label: 'get', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'Dict method: dict.get(key, default=None)', insertText: 'get', range },
    { label: 'pop', kind: monacoInstance.languages.CompletionItemKind.Method, detail: 'Dict method: dict.pop(key, default)', insertText: 'pop', range },
    
    // Keywords
    { label: 'if', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'if', range },
    { label: 'else', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'else', range },
    { label: 'elif', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'elif', range },
    { label: 'for', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'for', range },
    { label: 'while', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'while', range },
    { label: 'def', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'def', range },
    { label: 'return', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'return', range },
    { label: 'class', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'class', range },
    { label: 'import', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'import', range },
    { label: 'from', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'from', range },
    { label: 'as', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'as', range },
    { label: 'with', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'with', range },
    { label: 'try', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'try', range },
    { label: 'except', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'except', range },
    { label: 'finally', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'finally', range },
    { label: 'raise', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'raise', range },
    { label: 'yield', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'yield', range },
    { label: 'lambda', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'lambda', range },
    { label: 'and', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'and', range },
    { label: 'or', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'or', range },
    { label: 'not', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'not', range },
    { label: 'in', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'in', range },
    { label: 'is', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'is', range },
    { label: 'None', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'None', range },
    { label: 'True', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'True', range },
    { label: 'False', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'False', range },
    { label: 'break', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'break', range },
    { label: 'continue', kind: monacoInstance.languages.CompletionItemKind.Keyword, detail: 'Python keyword', insertText: 'continue', range },
    
    // Common modules
    { label: 'collections', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: collections', insertText: 'collections', range },
    { label: 'heapq', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: heapq', insertText: 'heapq', range },
    { label: 'bisect', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: bisect', insertText: 'bisect', range },
    { label: 'itertools', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: itertools', insertText: 'itertools', range },
    { label: 'math', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: math', insertText: 'math', range },
    { label: 'string', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: string', insertText: 'string', range },
    { label: 're', kind: monacoInstance.languages.CompletionItemKind.Module, detail: 'Python module: re', insertText: 're', range },
  ];
};

