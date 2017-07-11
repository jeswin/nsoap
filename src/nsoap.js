function parseArg(a, dicts) {
  return a === "true" || a === "false"
    ? a === "true"
    : isNaN(a)
      ? (() => {
          //this is a string which can be a key or a literal.
          //See if any of the dicts define this key. Else treat is as a literal.
          for (const i = 0; i < dicts.length; i++) {
            const dict = dicts[i];
            if (dict.hasOwnProperty(a)) {
              return dict[a];
            }
          }
          return a;
        })()
      : +a;
}

function analyzeUrl(url, dicts) {
  const queryPos = url.indexOf("?");
  const path = url.substring(0, queryPos);
  const parts = path.split(".");
  return parts.map(
    part =>
      part.indexOf("(")
        ? (() => {
            const openingBracket = part.indexOf("(");
            const closingBracket = part.indexOf(")");
            const identifier = part.substring(0, openingBracket);
            const argsString = part.substring(
              openingBracket,
              closingBracket - openingBracket
            );
            const args = argsString.split(",").map(a => a.trim()).map(parseArg);
            return { type: "function", identifier, args };
          })()
        : { type: "object", identifier: part }
  );
}

export default function route(app, url, then, dicts = [], options = {}) {
  const prefix = options.prefix || "/";

  const urlExpressionRaw = url.substring(url.lastIndexOf("/") + 1);
  const expression = urlExpressionRaw || (options.index || "index");

  const parts = analyzeUrl(expression, dicts);

  let obj,
    error,
    result = app;

  for (const i = 0; i < parts.length; i++) {
    const part = parts[i];
    obj = obj ? `${obj}.${part.identifier}` : `${part.identifier}`;
    if (typeof result !== "undefined") {
      if (!error) {
        if (part.type === "function") {
          const fn = acc[part.identifier];
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
