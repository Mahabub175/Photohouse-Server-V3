import config from "../config/config";

export const formatResultImage = <T extends { [key: string]: any }>(
  results: T[] | string,
  fields?: string | string[]
): T[] | string => {
  const normalizeField = (value: any) => {
    if (!value) return value;
    if (Array.isArray(value)) {
      return value.map((v) => `${config.base_url}/${v.replace(/\\/g, "/")}`);
    } else if (typeof value === "string") {
      return `${config.base_url}/${value.replace(/\\/g, "/")}`;
    }
    return value;
  };

  const setNestedField = (obj: any, path: string, value: any) => {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) return;
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];

    if (Array.isArray(current)) {
      current.forEach((item) => {
        if (item[lastKey] !== undefined)
          item[lastKey] = normalizeField(item[lastKey]);
      });
    } else {
      current[lastKey] = normalizeField(current[lastKey]);
    }
  };

  const fieldList = Array.isArray(fields) ? fields : fields ? [fields] : [];

  const formatItem = (item: T): T => {
    const docData = (item as any)._doc || item;
    const newData = { ...docData };

    for (const field of fieldList) {
      setNestedField(newData, field, null);
    }

    return newData as T;
  };

  if (Array.isArray(results)) {
    return results.map(formatItem);
  } else if (typeof results === "string") {
    return `${config.base_url}/${results.replace(/\\/g, "/")}`;
  } else {
    throw new Error("Unexpected results format");
  }
};
