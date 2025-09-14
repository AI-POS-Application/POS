'use client';

import type { Table } from '@/lib/types';
import TableCard from './TableCard';

interface TableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
}

export default function TableGrid({ tables, onTableSelect }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
      {tables.map((table) => (
        <TableCard key={table.id} table={table} onClick={() => onTableSelect(table)} />
      ))}
    </div>
  );
}
