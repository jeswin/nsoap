const identifierRegex = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

/*
  If the part is a function, we need to get the actual value of the parameters.
  A parameter x or y in func(x, y) may be
    a) Assigned a value in one of the dicts
    b) OR should be treated as a string literal "x" or "y"
*/
function getArgumentValue(dicts: Array<Dict>) {
  return (a: string) =>
    a === "true" || a === "false"
      ? { value: a === "true" }
      : isNaN(Number(a))
        ? identifierRegex.test(a)
          ? (() => {
              for (const dict of dicts) {
                if (typeof dict === "function") {
                  const val = dict(a);
                  if (val) {
                    return val;
                  }
                } else {
                  if (hasOwnProperty(dict, a)) {
                    return { value: dict[a] };
                  }
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
function analyzePath(
  encodedPath: string,
  dicts: Array<Dict>
): Array<FunctionPart | ObjectPart> {
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
          const result: FunctionPart = { type: "function", identifier, args };
          return result;
        })()
      : ({ type: "object", identifier: part } as ObjectPart);
  });
}

export type FunctionPart = {
  type: "function";
  identifier: string;
  args: Array<any>;
};
export type ObjectPart = { type: "object"; identifier: string };

export class RoutingError {
  message: string;
  type: string;

  constructor(message: string, type: string) {
    this.message = message;
    this.type = type;
  }
}

function isIterable(gen: any): gen is Iterable<any> {
  return (
    (gen[Symbol.iterator] && typeof gen[Symbol.iterator] === "function") ||
    ((Symbol as any).asyncIterator &&
      gen[(Symbol as any).asyncIterator] &&
      typeof gen[(Symbol as any).asyncIterator] === "function")
  );
}

function __isIterable(gen: any): gen is Generator {
  return gen.next && typeof gen.next === "function";
}

function hasOwnProperty(obj: Object, prop: string): boolean {
  return (
    typeof obj === "object" && Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

export type NSoapOptions = {
  modifyHandler?: Function;
  useSlash?: boolean;
  index?: string;
  onNextValue?: Function;
  args?: Array<any>;
  prependArgs?: boolean;
};

export type Dict =
  | {
      [key: string]: any;
    }
  | Function;

export default async function route(
  _app: Function | Object,
  _expression: string,
  dicts: Array<Dict> = [],
  _options: NSoapOptions = {}
) {
  const options = { ..._options, index: _options.index || "index" }
  async function iterateToEnd(resultOrGenerator: any, current: any) {
    if (__isIterable(resultOrGenerator)) {
      const gen = resultOrGenerator;
      while (true) {
        const nextVal = await gen.next();
        if (options.onNextValue && !nextVal.done) {
          options.onNextValue(await nextVal.value, current);
        }
        if (nextVal.done) {
          return await nextVal.value;
        }
      }
    } else {
      return resultOrGenerator;
    }
  }

  const app = typeof _app === "function" ? _app() : _app;
  const expression = options.useSlash
    ? _expression.replace(/\//g, ".")
    : _expression;
  const additionalArgs = options.args || [];
  const parts = expression ? analyzePath(expression, dicts) : [];

  let obj,
    error,
    current = app;

  for (const part of parts) {
    obj = obj ? `${obj}.${part.identifier}` : `${part.identifier}`;
    if (typeof current !== "undefined") {
      if (options.modifyHandler) {
        current = options.modifyHandler(part.identifier, current);
      }
      if (hasOwnProperty(current, part.identifier)) {
        if (part.type === "function") {
          const fn = current[part.identifier];
          if (typeof fn === "function") {
            const resultOrGenerator = await fn.apply(
              current,
              options.prependArgs
                ? additionalArgs.concat(part.args.map(a => a.value))
                : part.args.map(a => a.value).concat(additionalArgs)
            );
            current = await iterateToEnd(resultOrGenerator, current);
          } else if (typeof fn === "undefined") {
            error = new RoutingError(
              "The requested path was not found.",
              "NOT_FOUND"
            );
            break;
          } else {
            const ref = current[part.identifier];
            const resultOrGenerator = await (typeof ref === "function"
              ? ref.apply(current, additionalArgs)
              : ref);
            current = await iterateToEnd(resultOrGenerator, current);
          }
        } else {
          const ref = current[part.identifier];
          const resultOrGenerator = await (typeof ref === "function"
            ? ref.apply(current, additionalArgs)
            : ref);
          current = await iterateToEnd(resultOrGenerator, current);
        }
      } else {
        error = new RoutingError(
          "The requested path was not found.",
          "NOT_FOUND"
        );
        break;
      }
    } else {
      break;
    }
  }

  const finalResult = error
    ? error
    : hasOwnProperty(current, options.index)
      ? await (async () => {
          if (options.modifyHandler) {
            current = options.modifyHandler(options.index, current);
          }
          const resultOrGenerator =
            typeof current[options.index] === "function"
              ? current[options.index].apply(current, additionalArgs)
              : current[options.index];
          return await iterateToEnd(resultOrGenerator, current);
        })()
      : current;

  return await finalResult;
}
