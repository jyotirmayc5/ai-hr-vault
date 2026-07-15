type Column<T> = {
  header: string;
  accessor: keyof T;
};

type DataTableProps<T> = {
  title: string;
  columns: readonly Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  actionLabel?: string;
};

export default function DataTable<T extends Record<string, string | number>>({
  title,
  columns,
  data,
  searchPlaceholder = "Search...",
  actionLabel,
}: DataTableProps<T>) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">
            Manage and review employee {title.toLowerCase()} records.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-md border px-3 py-2 text-sm"
            placeholder={searchPlaceholder}
          />

          {actionLabel && (
            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium">No records found</p>
          <p className="mt-1 text-sm text-gray-500">
            Add a new record to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.accessor)}
                    className="px-4 py-3 font-medium text-gray-600"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-t">
                  {columns.map((column) => (
                    <td key={String(column.accessor)} className="px-4 py-3">
                      {row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}