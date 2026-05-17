import type { ReactNode } from 'react';
import styles from './Table.module.css';

interface Column<T> {
  header: string;
  accessor: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
}

export function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)}>
              {columns.map((col, i) => (
                <td key={i}>{col.accessor(item)}</td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className={styles.emptyState}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
