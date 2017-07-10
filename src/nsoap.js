function parseArg(a) {
  return a === "true" || a === "false"
    ? { type: "boolean", value: a === "true" }
    : isNaN(a) ? { type: "string", value: a } : { type: "number", value: +a };
}

function analyzeUrl(url) {
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
            return { type: "function", args };
          })()
        : { type: "object", identifier: part }
  );
}

export default function route(app, url, dicts = [], options = {}) {
  const prefix = options.prefix || "/";

  const strExpression = url.substring(url.lastIndexOf("/") + 1);
  const expression = strExpression || (options.index || "index");

  const ast = babylon.parseExpression(expression);

  const result = match(ast);

  return isFunction(url)
    ? (() => {
        const { namespace, fnName, args } = getFunction(url, dicts);
        const parentObj = namespace.reduce(
          (acc, key) => (acc ? acc[key] : undefined),
          app
        );
        return parentObj
          ? (() => {
              const fn = parentObj[fnName];
              return fn
                ? { result: fn.apply(parentObj, args) }
                : {
                    error: `${namespace.join(".") ||
                      "app"}.${fnName}' is not a function`
                  };
            })()
          : { error: `${namespace.join(".")} is not a valid namespace.` };
      })()
    : isValue(url)
      ? (() => {
          const { namespace, property } = getProperty(url);
          const parentObj = namespace.reduce(
            (acc, key) => (acc ? acc[key] : undefined),
            app
          );
          return parentObj
            ? { result: parentObj[property] }
            : { error: `${namespace.join(".")} is not a valid namespace.` };
        })()
      : { error: `${url} is not a valid object reference.` };
}
