export function doSort(toSort, sortKey, customSort, sortOrder) {
  let local = [...toSort];

  return local.sort((a, b) => {
    if (typeof customSort === "function") {
      return customSort(a, b) * sortOrder;
    }

    let val1;
    let val2;

    if (typeof sortKey === "function") {
      val1 = sortKey(a, sortOrder);
      val2 = sortKey(b, sortOrder);
    } else {
      val1 = getPropertyValue(a, sortKey);
      val2 = getPropertyValue(b, sortKey);
    }

    if (val1 === null || val1 === undefined) val1 = "";
    if (val2 === null || val2 === undefined) val2 = "";

    if (isNumeric(val1) && isNumeric(val2)) {
      return (val1 - val2) * sortOrder;
    }

    const str1 = val1.toString();
    const str2 = val2.toString();

    return str1.localeCompare(str2) * sortOrder;
  });
}

export function doFilter(toFilter, filters) {
  let filteredData = [];

  for (let item of toFilter) {
    let passed = true;

    for (let filterName in filters) {
      if (!filters.hasOwnProperty(filterName)) {
        continue;
      }

      let filter = filters[filterName];

      if (!passFilter(item, filter)) {
        passed = false;
        break;
      }
    }

    if (passed) {
      filteredData.push(item);
    }
  }

  return filteredData;
}

export function doPaginate(toPaginate, pageSize, currentPage) {
  if (toPaginate.length <= pageSize || pageSize <= 0 || currentPage <= 0) {
    return toPaginate;
  }

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return [...toPaginate].slice(start, end);
}

export function calculateTotalPages(totalItems, pageSize) {
  return totalItems <= pageSize ? 1 : Math.ceil(totalItems / pageSize);
}

export function passFilter(item, filter) {
  if (
    typeof filter.custom === "function" &&
    !filter.custom(filter.value, item)
  ) {
    return false;
  }

  if (
    filter.value === null ||
    filter.value === undefined ||
    filter.value.length === 0 ||
    !Array.isArray(filter.keys)
  ) {
    return true;
  }

  for (let key of filter.keys) {
    const value = getPropertyValue(item, key);

    if (value !== null && value !== undefined) {
      const filterStrings = Array.isArray(filter.value)
        ? filter.value
        : [filter.value];

      for (const filterString of filterStrings) {
        if (filter.exact) {
          if (value.toString() === filterString.toString()) {
            return true;
          }
        } else {
          if (
            value
              .toString()
              .toLowerCase()
              .includes(filterString.toString().toLowerCase())
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function getPropertyValue(object, keyPath) {
  keyPath = keyPath.replace(/\[(\w+)\]/g, ".$1");
  keyPath = keyPath.replace(/^\./, "");
  const a = keyPath.split(".");
  for (let i = 0, n = a.length; i < n; ++i) {
    let k = a[i];
    if (k in object) {
      object = object[k];
    } else {
      return;
    }
  }
  return object;
}

export function isNumeric(toCheck) {
  return (
    !Array.isArray(toCheck) && !isNaN(parseFloat(toCheck)) && isFinite(toCheck)
  );
}

export function uuid() {
  return (
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
}

export function exportExcel(columns, rows, title) {
  const mimeType = "data:application/vnd.ms-excel";
  const html = renderTable(columns, rows).replace(/ /g, "%20");

  const documentPrefix = title != "" ? title.replace(/ /g, "-") : "Sheet";
  const d = new Date();

  var dummy = document.createElement("a");
  dummy.href = mimeType + ", " + html;
  dummy.download =
    documentPrefix +
    "-" +
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getDate() +
    "-" +
    d.getHours() +
    "-" +
    d.getMinutes() +
    "-" +
    d.getSeconds() +
    ".xls";
  dummy.click();
}

function renderTable(columns, rows) {
  let table = "<table><thead>";

  table += "<tr>";
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    table += "<th>";
    table += column.label;
    table += "</th>";
  }
  table += "</tr>";

  table += "</thead><tbody>";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    table += "<tr>";
    for (let j = 0; j < columns.length; j++) {
      const column = columns[j];
      table += "<td>";
      table += collect(row, column.field);
      table += "</td>";
    }
    table += "</tr>";
  }

  table += "</tbody></table>";
  return table;
}
