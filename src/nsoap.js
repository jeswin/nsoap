const identifierRegex = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

/*
  If the part is a function, we need to get the actual value of the parameters.
  A parameter x or y in func(x, y) may be
    a) Assigned a value in one of the dicts
    b) OR should be treated as a string literal "x" or "y"
*/
function getArgumentValue(dicts) {
  return a =>
    a === "true" || a === "false"
      ? { value: a === "true" }
      : isNaN(a)
        ? identifierRegex.test(a)
          ? (() => {
              for (const i = 0; i < dicts.length; i++) {
                const dict = dicts[i];
                if (dict.hasOwnProperty(a)) {
                  return { value: dict[a] };
                }
              }
              return { value: a };
            })()
          : { error: `${a} is not a valid identifier.` }
        : { value: +a };
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
  return parts.map(part => {
    const openingBracket = part.indexOf("(");
    const isFunction = openingBracket > -1;
    return isFunction
      ? (() => {
          const closingBracket = part.indexOf(")");
          const identifier = part.substring(0, openingBracket);
          const argsString = part.substring(openingBracket + 1, closingBracket);
          const args = argsString
            .split(",")
            .map(a => a.trim())
            .map(getArgumentValue(dicts));
          return { type: "function", identifier, args };
        })()
      : { type: "object", identifier: part };
  });
}

export default async function route(
  app,
  rawPath,
  dicts = [],
  options = {},
  then
) {
  const expression = rawPath.startsWith("/") ? rawPath.substring(1) : rawPath;

  const parts = expression ? analyzePath(expression, dicts) : [];

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
            result = await Promise.resolve(
              fn.apply(result, part.args.map(a => a.value))
            );
          } else {
            error = `${obj}.${part.identifier} is not a function. Was ${typeof fn}.`;
          }
        } else {
          const ref = result[part.identifier];
          result = await Promise.resolve(
            typeof ref === "function" ? ref.call(result) : ref
          );
        }
      }
    } else {
      error = `${obj} is undefined.`;
    }
  }

  const finalResult =
    typeof result === "object" &&
    result.hasOwnProperty(options.index) &&
    typeof result[options.index] === "function"
      ? await Promise.resolve(result[options.index].call(result))
      : result;

  return await Promise.resolve(
    then ? (error ? then(undefined, error) : then(finalResult)) : finalResult
  );
}
