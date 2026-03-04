import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, 
  Briefcase, CheckCircle, Clock, Calendar as CalendarIcon
} from 'lucide-react';

// ✅ Helper to normalize status (handles both 'Paid' and 'paid')
const isPaid = (status: string) => status?.toLowerCase() === 'paid';
const isSent = (status: string) => status?.toLowerCase() === 'sent';
const isOverdue = (status: string) => status?.toLowerCase() === 'overdue';
const isApproved = (status: string) => status?.toLowerCase() === 'approved';

const Dashboard: React.FC = () => {
  const { invoices, expenses, projects, formatAmount, user } = useApp();
  const [timeRange, setTimeRange] = useState<'month' | 'year' | 'custom'>('year');
  const [customRange, setCustomRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // --- Financial Calculations ---
  const financials = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const filterByTime = (item: { date?: string, issueDate?: string, created_at?: string }) => {
      const dateStr = item.date || item.issueDate || item.created_at;
      if (!dateStr) return false;
      const itemDate = new Date(dateStr);
      if (timeRange === 'year') return itemDate.getFullYear() === currentYear;
      if (timeRange === 'month') return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    };

    // ✅ Case-insensitive status checks
    const paidInvoices = invoices.filter(i => isPaid(i.status) && filterByTime(i));
    const pendingInvoices = invoices.filter(i => isSent(i.status) || isOverdue(i.status));
    const approvedExpenses = expenses.filter((e: any) => isApproved(e.status) && filterByTime(e));

    const totalEarnings = paidInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalPending = pendingInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpenses = approvedExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const netProfit = totalEarnings - totalExpenses;

    return { totalEarnings, totalPending, totalExpenses, netProfit };
  }, [invoices, expenses, timeRange, customRange]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const now = new Date();

    if (timeRange === 'year') {
      const currentYear = now.getFullYear();
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthlyData = months.map(name => ({ name, income: 0, expense: 0 }));

      invoices.forEach(inv => {
        if (isPaid(inv.status)) { // ✅ case-insensitive
          const d = new Date(inv.issueDate || inv.created_at || '');
          if (d.getFullYear() === currentYear) monthlyData[d.getMonth()].income += Number(inv.amount);
        }
      });
      expenses.forEach((exp: any) => {
        if (isApproved(exp.status)) { // ✅ case-insensitive
          const d = new Date(exp.date || '');
          if (d.getFullYear() === currentYear) monthlyData[d.getMonth()].expense += Number(exp.amount);
        }
      });
      return monthlyData;

    } else if (timeRange === 'month') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({ name: `${i + 1}`, income: 0, expense: 0 }));

      invoices.forEach(inv => {
        if (isPaid(inv.status)) {
          const d = new Date(inv.issueDate || inv.created_at || '');
          if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) dailyData[d.getDate() - 1].income += Number(inv.amount);
        }
      });
      expenses.forEach((exp: any) => {
        if (isApproved(exp.status)) {
          const d = new Date(exp.date || '');
          if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) dailyData[d.getDate() - 1].expense += Number(exp.amount);
        }
      });
      return dailyData;

    } else {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59, 999);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
        const data: any[] = [];
        let current = new Date(start);
        current.setDate(1);
        while (current <= end) {
          const m = current.getMonth(); const y = current.getFullYear();
          const monthStr = current.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
          let income = 0; let expense = 0;
          invoices.forEach(inv => { if (isPaid(inv.status)) { const d = new Date(inv.issueDate || ''); if (d.getMonth() === m && d.getFullYear() === y) income += Number(inv.amount); } });
          expenses.forEach((exp: any) => { if (isApproved(exp.status)) { const d = new Date(exp.date || ''); if (d.getMonth() === m && d.getFullYear() === y) expense += Number(exp.amount); } });
          data.push({ name: monthStr, income, expense });
          current.setMonth(current.getMonth() + 1);
        }
        return data;
      } else {
        const data: any[] = [];
        let current = new Date(start);
        let i = 0;
        while (current <= end && i < 1000) {
          const dateStr = current.toISOString().split('T')[0];
          const label = current.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          let income = 0; let expense = 0;
          invoices.forEach(inv => { if (isPaid(inv.status) && (inv.issueDate || '').startsWith(dateStr)) income += Number(inv.amount); });
          expenses.forEach((exp: any) => { if (isApproved(exp.status) && new Date(exp.date).toISOString().split('T')[0] === dateStr) expense += Number(exp.amount); });
          data.push({ name: label, income, expense });
          current.setDate(current.getDate() + 1);
          i++;
        }
        return data;
      }
    }
  }, [invoices, expenses, timeRange, customRange]);

  const projectStats = useMemo(() => ({
    active: projects.filter(p => p.status !== 'Archived' && p.status !== 'New Project').length,
    completed: projects.filter(p => p.status === 'Gallery Live' || p.status === 'Archived').length,
    newJobs: projects.filter(p => p.status === 'New Project').length,
  }), [projects]);

  const getRangeLabel = () => {
    if (timeRange === 'month') return 'This Month';
    if (timeRange === 'year') return 'This Year';
    return 'Custom Range';
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start">
            {(['month', 'year', 'custom'] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors capitalize ${timeRange === r ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}>
                {r}
              </button>
            ))}
          </div>
          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <input type="date" value={customRange.start} onChange={e => setCustomRange({ ...customRange, start: e.target.value })} className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 outline-none dark:text-white"/>
              <span className="text-slate-400 font-bold">-</span>
              <input type="date" value={customRange.end} onChange={e => setCustomRange({ ...customRange, end: e.target.value })} className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 outline-none dark:text-white"/>
            </div>
          )}
        </div>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: `Total Earnings (${getRangeLabel()})`, value: financials.totalEarnings, color: 'green', icon: <TrendingUp className="w-3 h-3 mr-1"/>, tag: 'Real-time' },
          { label: 'Pending Income (All Time)', value: financials.totalPending, color: 'amber', icon: <Clock className="w-3 h-3 mr-1"/>, tag: 'Active Invoices' },
          { label: `Total Expenses (${getRangeLabel()})`, value: financials.totalExpenses, color: 'red', icon: <TrendingDown className="w-3 h-3 mr-1"/>, tag: 'Logged' },
          { label: `Net Profit (${getRangeLabel()})`, value: financials.netProfit, color: financials.netProfit >= 0 ? 'green' : 'red', icon: <Activity className="w-3 h-3 mr-1"/>, tag: financials.netProfit >= 0 ? 'Healthy' : 'Unhealthy' },
        ].map(({ label, value, color, icon, tag }) => (
          <div key={label} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-50 dark:bg-${color}-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className="relative">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</div>
              <div className={`text-3xl font-bold mb-2 ${color === 'green' ? 'text-slate-900 dark:text-white' : color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{formatAmount(value)}</div>
              <div className={`flex items-center text-xs font-bold text-${color}-600 bg-${color}-100 dark:bg-${color}-900/30 dark:text-${color}-400 px-2 py-1 rounded-full w-fit`}>
                {icon}{tag}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Revenue & Expenses <span className="text-sm font-normal text-slate-500">({getRangeLabel()})</span></h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/><stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} minTickGap={20}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }}/>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v: number) => formatAmount(v)}/>
                <Legend iconType="circle"/>
                <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income"/>
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Expense"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Project Overview</h3>
          <div className="space-y-6">
            {[
              { label: 'Active Jobs', sub: 'In progress', value: projectStats.active, color: 'brand', icon: <Briefcase className="w-5 h-5"/> },
              { label: 'Completed', sub: 'Delivered', value: projectStats.completed, color: 'green', icon: <CheckCircle className="w-5 h-5"/> },
              { label: 'New Intake', sub: 'This Month', value: projectStats.newJobs, color: 'purple', icon: <Activity className="w-5 h-5"/> },
            ].map(({ label, sub, value, color, icon }) => (
              <div key={label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center">
                  <div className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/50 rounded-full flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>{icon}</div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h4>
            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-3 animate-pulse"></div>
                <span className="text-slate-600 dark:text-slate-400 truncate">System sync active. <span className="font-bold text-slate-800 dark:text-slate-200">Backend</span> connected.</span>
              </div>
              {invoices.slice(0, 2).map(inv => (
                <div key={inv.id} className="flex items-center text-sm">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>
                  <span className="text-slate-600 dark:text-slate-400 truncate">Invoice <span className="font-bold text-slate-800 dark:text-slate-200">#{inv.id}</span> — {inv.clientName} — <span className={isPaid(inv.status) ? 'text-green-600' : 'text-amber-600'}>{inv.status}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
