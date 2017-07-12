/*
  If the part is a function, we need to get the actual value of the parameters.
  A parameter x or y in func(x, y) may be
    a) Assigned a value in one of the dicts
    b) OR should be treated as a string literal "x" or "y"
*/
function getArgumentValue(a, dicts) {
  return a === "true" || a === "false"
    ? a === "true"
    : isNaN(a)
      ? isIdentifier(a)
        ? () => {
            for (const i = 0; i < dicts.length; i++) {
              const dict = dicts[i];
              if (dict.hasOwnProperty(a)) {
                return dict[a];
              }
            }
            return a;
          }
        : JSON.parse(a)
      : +a;
}

/*
    Split path expression into
      a) objects
      b) functions and their parameters
*/
function analyzePath(encodedPath, dicts) {
  //The path would be url encoded
  const path = decodeURI(encodedPath);
  const parts = path.indexOf(".") ? path.split(".") : [path];
  const openingBracket = path.indexOf("(");
  const isFunction = openingBracket > -1;
  return parts.map(
    part =>
      isFunction
        ? (() => {
            const closingBracket = part.indexOf(")");
            const identifier = part.substring(0, openingBracket);
            const argsString = part.substring(
              openingBracket,
              closingBracket - openingBracket
            );
            const args = argsString
              .split(",")
              .map(a => a.trim())
              .map(getArgumentValue);
            return { type: "function", identifier, args };
          })()
        : { type: "object", identifier: part }
  );
}

export default function route(app, path, then, dicts = [], options = {}) {
  const expression = path || (options.index || "index");
  const parts = analyzePath(expression, dicts);

  let obj,
    error,
    result = app;

  for (const i = 0; i < parts.length; i++) {
    const part = parts[i];
    obj = obj ? `${obj}.${part.identifier}` : `${part.identifier}`;
    if (typeof result !== "undefined") {
      if (!error) {
        if (part.type === "function") {
          const fn = result[part.identifier];
          if (typeof fn === "function") {
            result = fn.apply(result, args);
          } else {
            error = `${obj}.${part.identifier} is not a function. Was ${typeof fn}.`;
          }
        } else {
          const ref = result[part.identifier];
          result = typeof ref === "function" ? ref.call(result) : ref;
        }
      }
    } else {
      error = `${obj} is undefined.`;
    }
  }

  if (error) {
    then(undefined, error);
  } else {
    then(result);
  }
}
