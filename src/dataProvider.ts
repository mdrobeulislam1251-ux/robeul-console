import type { BaseRecord, CrudFilter, DataProvider } from "@refinedev/core";
import { datasets } from "./data";

type Row = BaseRecord & Record<string, unknown>;

const table = (resource: string): Row[] => {
  const rows = (datasets as unknown as Record<string, Row[]>)[resource];
  if (!rows) throw { message: `Unknown resource: ${resource}`, statusCode: 404 };
  return rows;
};

const matches = (row: Row, filter: CrudFilter): boolean => {
  if (!("field" in filter)) {
    const results = filter.value.map((f) => matches(row, f));
    return filter.operator === "or" ? results.some(Boolean) : results.every(Boolean);
  }
  const { field, operator, value } = filter;
  if (value === undefined || value === null || value === "") return true;
  // "q" is a full-text search across every field of the record.
  const haystack = field === "q" ? JSON.stringify(row) : String(row[field] ?? "");
  switch (operator) {
    case "eq":
      return haystack === String(value);
    case "contains":
      return haystack.toLowerCase().includes(String(value).toLowerCase());
    default:
      return true;
  }
};

/** Read-only, in-memory data provider: the profile content is the database. */
export const dataProvider: DataProvider = {
  getApiUrl: () => "local://profile",

  getList: async ({ resource, filters = [], sorters = [], pagination }) => {
    let rows = table(resource).filter((row) => filters.every((f) => matches(row, f)));
    for (const { field, order } of [...sorters].reverse()) {
      rows = [...rows].sort((a, b) => {
        const cmp = String(a[field]).localeCompare(String(b[field]), undefined, { numeric: true });
        return order === "asc" ? cmp : -cmp;
      });
    }
    const total = rows.length;
    if (pagination?.mode !== "off") {
      const current = pagination?.currentPage ?? 1;
      const size = pagination?.pageSize ?? 50;
      rows = rows.slice((current - 1) * size, current * size);
    }
    return { data: rows as never[], total };
  },

  getOne: async ({ resource, id }) => {
    const row = table(resource).find((r) => String(r.id) === String(id));
    if (!row) throw { message: `${resource}/${id} not found`, statusCode: 404 };
    return { data: row as never };
  },

  getMany: async ({ resource, ids }) => ({
    data: table(resource).filter((r) => ids.map(String).includes(String(r.id))) as never[],
  }),

  create: async () => {
    throw { message: "Read-only profile", statusCode: 405 };
  },
  update: async () => {
    throw { message: "Read-only profile", statusCode: 405 };
  },
  deleteOne: async () => {
    throw { message: "Read-only profile", statusCode: 405 };
  },
};
