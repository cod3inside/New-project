import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, 
  Briefcase, CheckCircle, Clock, Calendar as CalendarIcon
} from 'lucide-react';

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

    const filterByTime = (item: { date: string } | { issueDate: string }) => {
        const dateStr = 'date' in item ? item.date : item.issueDate;
        if (!dateStr) return false;
        
        const itemDate = new Date(dateStr);
        
        if (timeRange === 'year') {
            return itemDate.getFullYear() === currentYear;
        } else if (timeRange === 'month') {
            return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        } else {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
        }
    };
    
    const paidInvoices = invoices.filter(i => i.status === 'Paid' && filterByTime(i));
    const pendingInvoices = invoices.filter(i => i.status === 'Sent' || i.status === 'Overdue');
    const approvedExpenses = expenses.filter(e => e.status === 'Approved' && filterByTime(e));

    const totalEarnings = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
    const totalPending = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalEarnings - totalExpenses;

    return { totalEarnings, totalPending, totalExpenses, netProfit };
  }, [invoices, expenses, timeRange, customRange]);

  // --- Chart Data Preparation ---
  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'year') {
        const currentYear = now.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const monthlyData = months.map(monthName => ({
            name: monthName,
            income: 0,
            expense: 0,
        }));

        invoices.forEach(invoice => {
            if (invoice.status === 'Paid') {
                const invoiceDate = new Date(invoice.issueDate);
                if (invoiceDate.getFullYear() === currentYear) {
                    const monthIndex = invoiceDate.getMonth();
                    if (monthlyData[monthIndex]) {
                        monthlyData[monthIndex].income += invoice.amount;
                    }
                }
            }
        });

        expenses.forEach(expense => {
            if (expense.status === 'Approved') {
                const expenseDate = new Date(expense.date);
                if (expenseDate.getFullYear() === currentYear) {
                    const monthIndex = expenseDate.getMonth();
                    if (monthlyData[monthIndex]) {
                        monthlyData[monthIndex].expense += expense.amount;
                    }
                }
            }
        });
        
        return monthlyData;
    } else if (timeRange === 'month') {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            name: `${i + 1}`,
            income: 0,
            expense: 0,
        }));

        invoices.forEach(invoice => {
            if (invoice.status === 'Paid') {
                const invoiceDate = new Date(invoice.issueDate);
                if (invoiceDate.getFullYear() === currentYear && invoiceDate.getMonth() === currentMonth) {
                    const dayIndex = invoiceDate.getDate() - 1;
                    if (dailyData[dayIndex]) {
                        dailyData[dayIndex].income += invoice.amount;
                    }
                }
            }
        });

        expenses.forEach(expense => {
            if (expense.status === 'Approved') {
                const expenseDate = new Date(expense.date);
                if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
                    const dayIndex = expenseDate.getDate() - 1;
                    if (dailyData[dayIndex]) {
                        dailyData[dayIndex].expense += expense.amount;
                    }
                }
            }
        });

        return dailyData;
    } else {
        // Custom Range
        const start = new Date(customRange.start);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        // If range is large (> 90 days), group by month
        if (diffDays > 90) {
             const data = [];
             let current = new Date(start);
             current.setDate(1); // Start at beginning of month for iteration grouping

             while (current <= end) {
                  const monthStr = current.toLocaleDateString(undefined, {month:'short', year: '2-digit'});
                  const m = current.getMonth();
                  const y = current.getFullYear();
                  
                  let income = 0;
                  let expense = 0;

                  invoices.forEach(inv => {
                      if (inv.status === 'Paid') {
                          const d = new Date(inv.issueDate);
                          if (d.getMonth() === m && d.getFullYear() === y) income += inv.amount;
                      }
                  });
                  expenses.forEach(exp => {
                      if (exp.status === 'Approved') {
                          const d = new Date(exp.date);
                          if (d.getMonth() === m && d.getFullYear() === y) expense += exp.amount;
                      }
                  });

                  data.push({ name: monthStr, income, expense });
                  current.setMonth(current.getMonth() + 1);
             }
             return data;
        } else {
            // Group by Day
            const data = [];
            let current = new Date(start);
            let iterations = 0;

            while (current <= end && iterations < 1000) {
                const dateStr = current.toISOString().split('T')[0];
                const label = current.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                
                let income = 0;
                let expense = 0;

                invoices.forEach(inv => {
                    if (inv.status === 'Paid' && inv.issueDate === dateStr) income += inv.amount;
                });
                
                expenses.forEach(exp => {
                    if (exp.status === 'Approved') {
                         const expDate = new Date(exp.date).toISOString().split('T')[0];
                         if (expDate === dateStr) expense += exp.amount;
                    }
                });

                data.push({ name: label, income, expense });
                current.setDate(current.getDate() + 1);
                iterations++;
            }
            return data;
        }
    }
  }, [invoices, expenses, timeRange, customRange]);

  const projectStats = useMemo(() => {
    const active = projects.filter(p => p.status !== 'Archived' && p.status !== 'New Project').length;
    const completed = projects.filter(p => p.status === 'Gallery Live' || p.status === 'Archived').length;
    const newJobs = projects.filter(p => p.status === 'New Project').length;
    return { active, completed, newJobs };
  }, [projects]);

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
              <button 
                onClick={() => setTimeRange('month')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === 'month' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setTimeRange('year')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === 'year' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
              >
                Year
              </button>
              <button 
                onClick={() => setTimeRange('custom')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${timeRange === 'custom' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'}`}
              >
                Custom
              </button>
            </div>

            {timeRange === 'custom' && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-right-4">
                  <div className="relative">
                    <input 
                      type="date" 
                      value={customRange.start}
                      onChange={e => setCustomRange({...customRange, start: e.target.value})}
                      className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
                  <span className="text-slate-400 font-bold">-</span>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={customRange.end}
                      onChange={e => setCustomRange({...customRange, end: e.target.value})}
                      className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-brand-500 dark:text-white"
                    />
                  </div>
              </div>
            )}
        </div>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Earnings ({getRangeLabel()})</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{formatAmount(financials.totalEarnings)}</div>
            <div className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full w-fit">
              <TrendingUp className="w-3 h-3 mr-1" /> Real-time
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pending Income (All Time)</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{formatAmount(financials.totalPending)}</div>
            <div className="flex items-center text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full w-fit">
              <Clock className="w-3 h-3 mr-1" /> Active Invoices
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Expenses ({getRangeLabel()})</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{formatAmount(financials.totalExpenses)}</div>
            <div className="flex items-center text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full w-fit">
              <TrendingDown className="w-3 h-3 mr-1" /> Logged
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 ${financials.netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}></div>
          <div className="relative">
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Net Profit ({getRangeLabel()})</div>
            <div className={`text-3xl font-bold mb-2 ${financials.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatAmount(financials.netProfit)}
            </div>
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full w-fit ${financials.netProfit >= 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
              {financials.netProfit >= 0 ? (
                <>
                  <Activity className="w-3 h-3 mr-1" /> Healthy
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1" /> Unhealthy
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Revenue & Expenses <span className="text-sm font-normal text-slate-500">({getRangeLabel()})</span></h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => formatAmount(value)}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="income" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Stats */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Project Overview</h3>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                 <div className="flex items-center">
                    <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400">
                       <Briefcase className="w-5 h-5"/>
                    </div>
                    <div className="ml-3">
                       <p className="text-sm font-bold text-slate-800 dark:text-white">Active Jobs</p>
                       <p className="text-xs text-slate-500">In progress</p>
                    </div>
                 </div>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">{projectStats.active}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                 <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                       <CheckCircle className="w-5 h-5"/>
                    </div>
                    <div className="ml-3">
                       <p className="text-sm font-bold text-slate-800 dark:text-white">Completed</p>
                       <p className="text-xs text-slate-500">Delivered</p>
                    </div>
                 </div>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">{projectStats.completed}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                 <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                       <Activity className="w-5 h-5"/>
                    </div>
                    <div className="ml-3">
                       <p className="text-sm font-bold text-slate-800 dark:text-white">New Intake</p>
                       <p className="text-xs text-slate-500">This Month</p>
                    </div>
                 </div>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">{projectStats.newJobs}</span>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h4>
              <div className="space-y-4">
                 <div className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 mr-3 animate-pulse"></div>
                    <span className="text-slate-600 dark:text-slate-400 truncate">System sync active. <span className="font-bold text-slate-800 dark:text-slate-200">Backend</span> connected.</span>
                 </div>
                 <div className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>
                    <span className="text-slate-600 dark:text-slate-400 truncate">New user 'Emily Carter' registered.</span>
                 </div>
                 <div className="flex items-center text-sm">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mr-3"></div>
                    <span className="text-slate-600 dark:text-slate-400 truncate">Invoice INV-202302 marked as paid.</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;