import babylon from "babylon";
import chimpanzee from "chimpanzee";

/*
  If the part is a function, we need to get the actual value of the parameters.
  A parameter x or y in func(x, y) may be
    a) Assigned a value in one of the dicts
    b) OR should be treated as a string literal "x" or "y"
*/
function parseArg(a, dicts) {
  return a === "true" || a === "false"
    ? a === "true"
    : isNaN(a)
      ? isIdentifier(a)
        ? (() => {
          for (const i = 0; i < dicts.length; i++) {
            const dict = dicts[i];
            if (dict.hasOwnProperty(a)) {
              return dict[a];
            }
          }
          return a;
        })
        : JSON.parse(a)
      : +a;
}

/*
    Pass the path through our grammar, and split it into
      a) objects
      b) functions and parameters
*/
function analyzePath(rawPath, dicts) {
  //The path would be url encoded
  const path = decodeURI(rawPath);

  const parts = [];
  return parts.map(
    part =>
      part.type === "function"
        ? { type: path.type, arguments: getArgumentValues(type.parameters) }
        : part
  );
}

export default function route(app, path, then, dicts = [], options = {}) {
  const expression = path || (options.index || "index");
  const parts = analyzePath(expression, dicts);

  let obj,
    error,
    result = app;

  console.log("PARTS", parts);
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

  console.log("RE::", result, error);

  if (error) {
    then(undefined, error);
  } else {
    then(result);
  }
}
