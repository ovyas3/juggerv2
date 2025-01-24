import { Truck, Train } from "lucide-react";
import "./styles.css";

const Table = ({
  children,
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) => (
  <table className={`table ${className}`} {...props}>
    {children}
  </table>
);

const TableBody = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

const TableCell = ({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`table-cell ${className}`} {...props}>
    {children}
  </td>
);

const TableHead = ({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`table-head ${className}`} {...props}>
    {children}
  </th>
);

const TableHeader = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);

const TableRow = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

interface ResultsTableProps {
  results: {
    roadCostPerMT: number;
    railCostPerMT: number;
    totalRoadCost: number;
    totalRailCost: number;
    transitDays: number;
  };
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h3 className="results-title">Freight Cost Estimation Results</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="row-header">
            <TableHead className="head">Transport Type</TableHead>
            <TableHead className="head">Cost per MT (₹/MT)</TableHead>
            <TableHead className="head">Total Cost (₹)</TableHead>
            <TableHead className="head">Transit Days</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="row hover-row">
            <TableCell className="cell">
              <Truck size={20} className="icon-road" />
              <span>Road</span>
            </TableCell>
            <TableCell>{formatCurrency(results.roadCostPerMT)}/MT</TableCell>
            <TableCell>{formatCurrency(results.totalRoadCost)}</TableCell>
            <TableCell>{results.transitDays}</TableCell>
          </TableRow>
          <TableRow className="row hover-row">
            <TableCell className="cell">
              <Train size={20} className="icon-rail" />
              <span>Rail</span>
            </TableCell>
            <TableCell>{formatCurrency(results.railCostPerMT)}/MT</TableCell>
            <TableCell>{formatCurrency(results.totalRailCost)}</TableCell>
            <TableCell>{results.transitDays}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
