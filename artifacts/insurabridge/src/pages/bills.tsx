import { useListBills } from "@workspace/api-client-react"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function Bills() {
  const { data: bills, isLoading } = useListBills()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Financials & Bills</h1>
        <p className="text-slate-500 mt-1">Review hospital bills, deductibles, and approval statuses.</p>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Bill Number</th>
                <th className="px-6 py-4 font-medium">Hospital & Patient</th>
                <th className="px-6 py-4 font-medium text-right">Total Amount</th>
                <th className="px-6 py-4 font-medium text-right">Approved</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading bills...</td></tr>
              ) : bills?.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{bill.billNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{bill.hospitalName}</p>
                    <p className="text-xs text-slate-500">{bill.patientName}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(bill.totalAmount)}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                    {bill.approvedAmount ? formatCurrency(bill.approvedAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(bill.createdAt)}</td>
                  <td className="px-6 py-4"><StatusBadge status={bill.status} /></td>
                </tr>
              ))}
              {(!bills || bills.length === 0) && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 bg-slate-50/30">No bills found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
