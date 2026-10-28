export default function InvoiceLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1">{children}</div>
    </div>
  );
}
