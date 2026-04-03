import { useEffect, useState } from 'react';
import { Loader2, ReceiptText, SearchX } from 'lucide-react';
import { paymentTransactionService } from '@/services/paymentTransactionService';

// ─── helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  SUCCESS:   'bg-emerald-100 text-emerald-700',
  FAILED:    'bg-red-100 text-red-700',
  CANCELLED: 'bg-yellow-100 text-yellow-700',
  INITIATED: 'bg-blue-100 text-blue-700',
};

const fmt = (date) =>
  date ? new Date(date).toLocaleString() : '—';

const fmtAmount = (amount, currency) =>
  `${currency} ${Number(amount).toFixed(2)}`;

// ─── component ───────────────────────────────────────────────────────────────

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    paymentTransactionService
      .getAllTransactions()
      .then(setTransactions)
      .catch((err) => setError(err?.message || 'Failed to load transactions'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      String(t.orderId).includes(q) ||
      (t.merchantReference ?? '').toLowerCase().includes(q) ||
      (t.transactionId ?? '').toLowerCase().includes(q) ||
      t.paymentStatus.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F0EC] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#F7E4E2] p-2.5 text-[#8B1A1A]">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1717]">Payment Transactions</h1>
            <p className="text-sm text-[#7D746F]">Audit all sandbox payment records</p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by order ID, reference, txn ID or status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-full border border-[#DED6D2] bg-white px-4 py-2 text-sm text-[#1A1717] shadow-sm outline-none focus:border-[#8E1616] focus:ring-2 focus:ring-[#8E1616]/20"
        />
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-[#D84040]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#D7CFCC] bg-white p-8 text-center">
          <SearchX className="h-9 w-9 text-[#B8ADAA]" />
          <p className="text-[#7D746F]">
            {search ? 'No transactions match your search.' : 'No payment transactions found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#DED6D2] bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[#EDE6E2] bg-[#FAF6F3] text-xs font-semibold uppercase tracking-wider text-[#7D746F]">
              <tr>
                {['Order ID', 'Reference', 'Transaction ID', 'Amount', 'Status', 'Payment Date', 'Created At'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE6]">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-[#FBF8F6]">
                  {/* order_id */}
                  <td className="px-4 py-3 font-mono font-semibold text-[#2D2521]">#{t.orderId}</td>

                  {/* merchant reference */}
                  <td className="px-4 py-3 font-mono text-[#4A3B34]">{t.merchantReference || '—'}</td>

                  {/* transaction_id */}
                  <td className="px-4 py-3 font-mono text-[#4A3B34]">
                    {t.transactionId || <span className="italic text-[#B8ADAA]">Pending</span>}
                  </td>

                  {/* amount */}
                  <td className="px-4 py-3 font-semibold text-[#2D2521]">
                    {fmtAmount(t.amount, t.currency)}
                  </td>

                  {/* payment_status */}
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[t.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {t.paymentStatus}
                    </span>
                  </td>

                  {/* payment_date */}
                  <td className="whitespace-nowrap px-4 py-3 text-[#6A5B53]">{fmt(t.paymentDate)}</td>

                  {/* created_at */}
                  <td className="whitespace-nowrap px-4 py-3 text-[#6A5B53]">{fmt(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="border-t border-[#EDE6E2] px-4 py-2.5 text-xs text-[#9E928C]">
            Showing {filtered.length} of {transactions.length} record{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
