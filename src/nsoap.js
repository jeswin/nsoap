function isFunction(url) {
  return true;
}

function getFunction(url, dicts) {

}

function getValue(url) {
  
}

export default function route(app, url, dicts) {
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
