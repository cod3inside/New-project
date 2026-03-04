import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Download, Plus, AlertCircle, CheckCircle, TrendingDown, DollarSign, Send, Trash2, Eye, Pencil, Printer, X, UserPlus, Save, Settings, Mail, Paperclip, CheckSquare, XSquare, Building2, CreditCard, Search, Calendar, Filter, XCircle, PieChart, Users, Calculator, ArrowRight, Cloud, RefreshCw, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InvoiceStatus, InvoiceItem, Invoice, CompanySettings } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import * as api from '../services/api';

const Finance: React.FC = () => {
  const { invoices, setInvoices, expenses, setExpenses, addExpense, addInvoice, updateInvoice, sendInvoice, contacts, addContact, companySettings, updateCompanySettings, updateExpense, deleteExpense, toggleExpenseStatus, formatAmount, globalCurrency, user, partnerDivision, savePartnerDivisionData } = useApp();
  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'division' | 'configuration'>('invoices');

  const [reportClient, setReportClient] = useState<string>('all');
  const [reportRange, setReportRange] = useState<'month' | 'year' | 'custom'>('year');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const [expenseCategory, setExpenseCategory] = useState<string>('all');
  const [expenseStatus, setExpenseStatus] = useState<string>('all');
  const [expenseRange, setExpenseRange] = useState<'month' | 'year' | 'custom'>('year');
  const [expenseCustomRange, setExpenseCustomRange] = useState({ start: '', end: '' });

  const [calcIncome, setCalcIncome] = useState<string>('');
  const [shabujList, setShabujList] = useState<{id: string, desc: string, amount: string}[]>([{ id: '1', desc: '', amount: '' }]);
  const [mashudList, setMashudList] = useState<{id: string, desc: string, amount: string}[]>([{ id: '1', desc: '', amount: '' }]);
  const [calculationResult, setCalculationResult] = useState<{
    totalRevenue: number, totalShabujExp: number, totalMashudExp: number,
    netProfit: number, splitProfit: number, shabujPayout: number, mashudPayout: number
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (partnerDivision) {
      setCalcIncome(partnerDivision.income || '');
      if (partnerDivision.shabujList?.length > 0) setShabujList(partnerDivision.shabujList);
      if (partnerDivision.mashudList?.length > 0) setMashudList(partnerDivision.mashudList);
    }
  }, [partnerDivision]);

  // ✅ Load invoices & expenses from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [inv, exp] = await Promise.all([api.getInvoices(), api.getExpenses()]);
        if (inv) {
          const mapped = inv.map((i: any) => ({
            id: i.id?.toString(),
            clientId: '',
            clientName: i.client_name,
            amount: Number(i.amount),
            currency: 'USD',
            issueDate: i.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            dueDate: i.due_date || '',
            status: i.status === 'paid' ? InvoiceStatus.PAID : i.status === 'overdue' ? InvoiceStatus.OVERDUE : i.status === 'sent' ? InvoiceStatus.SENT : InvoiceStatus.DRAFT,
            items: [],
            paymentInfo: i.description || ''
          }));
          // update state via context if available, else fallback
          mapped.forEach((inv: Invoice) => {
            const exists = invoices.find(x => x.id === inv.id);
            if (!exists) addInvoice(inv);
          });
        }
        if (exp) {
          const mapped = exp.map((e: any) => ({
            id: e.id?.toString(),
            description: e.title || e.description,
            amount: Number(e.amount),
            category: e.category || 'General',
            date: e.date || new Date().toISOString(),
            status: 'Pending'
          }));
          mapped.forEach((ex: any) => {
            const exists = expenses.find((x: any) => x.id === ex.id);
            if (!exists) addExpense(ex);
          });
        }
      } catch (err) {
        console.error('Failed to load finance data', err);
      }
    };
    loadData();
  }, []);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempSettings, setTempSettings] = useState<CompanySettings>(companySettings);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', company: '', email: '' });
  const [newInvoice, setNewInvoice] = useState({
    clientId: '', clientName: '', currency: 'USD', paymentInfo: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Service', folderName: '', fileType: '', quantity: 1, price: 0 }
  ]);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const hiddenInvoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceForPdf, setInvoiceForPdf] = useState<Invoice | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General' });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
      case InvoiceStatus.SENT: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  // ─── Calculator ───────────────────────────────────
  const addCalcRow = (person: 'Shabuj' | 'Mashud') => {
    const newItem = { id: Math.random().toString(), desc: '', amount: '' };
    person === 'Shabuj' ? setShabujList([...shabujList, newItem]) : setMashudList([...mashudList, newItem]);
  };
  const updateCalcRow = (person: 'Shabuj' | 'Mashud', id: string, field: 'desc' | 'amount', value: string) => {
    if (person === 'Shabuj') setShabujList(shabujList.map(i => i.id === id ? { ...i, [field]: value } : i));
    else setMashudList(mashudList.map(i => i.id === id ? { ...i, [field]: value } : i));
  };
  const removeCalcRow = (person: 'Shabuj' | 'Mashud', id: string) => {
    person === 'Shabuj' ? setShabujList(shabujList.filter(i => i.id !== id)) : setMashudList(mashudList.filter(i => i.id !== id));
  };
  const handleSaveSession = async () => {
    setIsSaving(true);
    await savePartnerDivisionData({ income: calcIncome, shabujList, mashudList, lastUpdated: new Date().toISOString() });
    setIsSaving(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };
  const handleClearSession = async () => {
    if (confirm("Are you sure you want to clear this session?")) {
      setCalcIncome(''); setShabujList([{ id: '1', desc: '', amount: '' }]);
      setMashudList([{ id: '1', desc: '', amount: '' }]); setCalculationResult(null);
      await savePartnerDivisionData({ income: '', shabujList: [], mashudList: [] });
    }
  };
  const handleCalculateDivision = () => {
    const revenue = parseFloat(calcIncome) || 0;
    const shabujExp = shabujList.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const mashudExp = mashudList.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    const netProfit = revenue - shabujExp - mashudExp;
    const splitProfit = netProfit / 2;
    setCalculationResult({ totalRevenue: revenue, totalShabujExp: shabujExp, totalMashudExp: mashudExp, netProfit, splitProfit, shabujPayout: splitProfit + shabujExp, mashudPayout: splitProfit + mashudExp });
    handleSaveSession();
  };

  // ─── Filters ──────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    const now = new Date(); const yr = now.getFullYear(); const mo = now.getMonth();
    return invoices.filter(i => {
      if (reportClient !== 'all' && i.clientId !== reportClient) return false;
      const d = new Date(i.issueDate);
      if (reportRange === 'month') return d.getFullYear() === yr && d.getMonth() === mo;
      if (reportRange === 'year') return d.getFullYear() === yr;
      if (reportRange === 'custom' && customRange.start && customRange.end) return d >= new Date(customRange.start) && d <= new Date(customRange.end);
      return true;
    });
  }, [invoices, reportClient, reportRange, customRange]);

  const filteredExpenses = useMemo(() => {
    const now = new Date(); const yr = now.getFullYear(); const mo = now.getMonth();
    return expenses.filter((e: any) => {
      if (expenseCategory !== 'all' && e.category !== expenseCategory) return false;
      if (expenseStatus !== 'all' && e.status !== expenseStatus) return false;
      const d = new Date(e.date);
      if (expenseRange === 'month') return d.getFullYear() === yr && d.getMonth() === mo;
      if (expenseRange === 'year') return d.getFullYear() === yr;
      if (expenseRange === 'custom' && expenseCustomRange.start && expenseCustomRange.end) return d >= new Date(expenseCustomRange.start) && d <= new Date(expenseCustomRange.end);
      return true;
    });
  }, [expenses, expenseCategory, expenseStatus, expenseRange, expenseCustomRange]);

  const clientStats = useMemo(() => ({
    paid: filteredInvoices.filter(i => i.status === InvoiceStatus.PAID).reduce((s, i) => s + i.amount, 0),
    pending: filteredInvoices.filter(i => i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE).reduce((s, i) => s + i.amount, 0),
    count: filteredInvoices.length
  }), [filteredInvoices]);

  // ─── Invoice Helpers ──────────────────────────────
  const handleAddInvoiceItem = () => setInvoiceItems([...invoiceItems, { id: Math.random().toString(), description: '', folderName: '', fileType: '', quantity: 1, price: 0 }]);
  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => setInvoiceItems(invoiceItems.map(i => i.id === id ? { ...i, [field]: value } : i));
  const handleRemoveItem = (id: string) => { if (invoiceItems.length > 1) setInvoiceItems(invoiceItems.filter(i => i.id !== id)); };
  const calculateTotal = () => invoiceItems.reduce((s, i) => s + i.quantity * i.price, 0);

  const resetForm = () => {
    setNewInvoice({ clientId: '', clientName: '', currency: globalCurrency, paymentInfo: companySettings.paymentInfo || '', issueDate: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] });
    setInvoiceItems([{ id: '1', description: 'Service', folderName: '', fileType: '', quantity: 1, price: 0 }]);
    setIsAddingClient(false); setNewClientData({ name: '', company: '', email: '' });
    setEditMode(false); setEditingId(null);
  };

  const openEditModal = (inv: Invoice) => {
    setEditMode(true); setEditingId(inv.id);
    setNewInvoice({ clientId: inv.clientId, clientName: inv.clientName, currency: inv.currency || globalCurrency, paymentInfo: inv.paymentInfo || '', issueDate: inv.issueDate, dueDate: inv.dueDate });
    setInvoiceItems(inv.items?.length ? inv.items : [{ id: '1', description: 'Service', folderName: '', fileType: '', quantity: 1, price: 0 }]);
    setShowInvoiceModal(true);
  };

  const handleTogglePaidStatus = (invoice: Invoice) => {
    const newStatus = invoice.status === InvoiceStatus.PAID ? InvoiceStatus.SENT : InvoiceStatus.PAID;
    updateInvoice({ ...invoice, status: newStatus });
    api.updateInvoice(Number(invoice.id), { status: newStatus.toLowerCase() }).catch(console.error);
  };

  // ✅ Fixed handleSaveInvoice
  const handleSaveInvoice = async () => {
    try {
      let finalClientId = newInvoice.clientId;
      let finalClientName = newInvoice.clientName;

      if (isAddingClient) {
        if (!newClientData.name) { alert("Please enter a name for the new client."); return; }
        const newContactId = Math.random().toString(36).substr(2, 9);
        addContact({ id: newContactId, name: newClientData.name, company: newClientData.company, email: newClientData.email, phone: '', tags: ['New'], lastContacted: new Date().toISOString() });
        finalClientId = newContactId; finalClientName = newClientData.name;
      } else {
        if (!newInvoice.clientId) { alert("Please select a client or create a new one."); return; }
        finalClientName = contacts.find(c => c.id === newInvoice.clientId)?.name || 'Unknown';
      }

      const totalAmount = calculateTotal();
      let currentStatus = InvoiceStatus.DRAFT;
      if (editMode && editingId) {
        const existing = invoices.find(i => i.id === editingId);
        if (existing) currentStatus = existing.status;
      }

      // ✅ Backend expects snake_case fields
      const backendPayload = {
        client_name: finalClientName,
        amount: totalAmount,
        status: currentStatus.toLowerCase(),
        due_date: newInvoice.dueDate,
        description: invoiceItems.map(i => `${i.description} (${i.quantity} x ${i.price})`).join(', '),
      };

      let savedId: string;
      if (editMode && editingId) {
        await api.updateInvoice(Number(editingId), backendPayload);
        savedId = editingId;
      } else {
        const res = await api.createInvoice(backendPayload);
        savedId = res.id?.toString() || Math.random().toString(36).substr(2, 9);
      }

      // ✅ Full invoice object for local state
      const invoiceData: Invoice = {
        id: savedId, clientId: finalClientId, clientName: finalClientName,
        amount: totalAmount, currency: newInvoice.currency, paymentInfo: newInvoice.paymentInfo,
        issueDate: newInvoice.issueDate, dueDate: newInvoice.dueDate, status: currentStatus, items: invoiceItems
      };

      if (editMode && editingId) updateInvoice(invoiceData);
      else addInvoice(invoiceData);

      setShowInvoiceModal(false);
      resetForm();
      alert('✅ Invoice saved successfully!');
    } catch (error) {
      console.error("Failed to save invoice:", error);
      alert("An error occurred while saving the invoice.");
    }
  };

  // ✅ Fixed handleSaveExpense
  const handleSaveExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;
    const backendPayload = {
      title: newExpense.description,
      amount: Number(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString().split('T')[0],
      description: newExpense.description,
    };
    try {
      if (editingExpenseId) {
        await api.updateExpense(Number(editingExpenseId), backendPayload);
        updateExpense({ id: editingExpenseId, description: newExpense.description, amount: Number(newExpense.amount), category: newExpense.category, date: new Date().toISOString(), status: 'Pending' });
      } else {
        const res = await api.createExpense(backendPayload);
        addExpense({ id: res.id?.toString() || Math.random().toString(36).substr(2, 9), description: newExpense.description, amount: Number(newExpense.amount), category: newExpense.category, date: new Date().toISOString(), status: 'Pending' });
      }
      setShowExpenseModal(false);
      setNewExpense({ description: '', amount: '', category: 'General' });
      setEditingExpenseId(null);
    } catch (err) {
      console.error('Failed to save expense', err);
      alert('Failed to save expense.');
    }
  };

  const handleInitiateSend = (invoice: Invoice) => {
    const client = contacts.find(c => c.id === invoice.clientId);
    setInvoiceForPdf(invoice);
    setEmailData({ to: client?.email || '', subject: `Invoice #${invoice.id} from ${companySettings.name}`, message: `Dear ${invoice.clientName},\n\nPlease find attached invoice #${invoice.id} for ${formatAmount(invoice.amount, invoice.currency)}.\n\nThank you.\n\nBest regards,\n${companySettings.name}` });
    setSendingInvoiceId(invoice.id); setShowEmailModal(true);
  };

  const generateAndDownloadPDF = async (elementId: string, filename: string, invoiceId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return false;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      pdf.save(filename);
      return true;
    } catch (err) { console.error("PDF failed", err); return false; }
  };

  const handleConfirmSendEmail = async () => {
    if (!sendingInvoiceId || !invoiceForPdf) return;
    setIsSendingEmail(true);
    const success = await generateAndDownloadPDF(viewInvoice ? 'invoice-content' : 'hidden-invoice-content', `Invoice_${sendingInvoiceId}.pdf`, sendingInvoiceId);
    if (success) {
      setTimeout(() => {
        window.location.href = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.message)}`;
        sendInvoice(sendingInvoiceId);
        if (viewInvoice?.id === sendingInvoiceId) setViewInvoice(prev => prev ? { ...prev, status: InvoiceStatus.SENT } : null);
        alert(`PDF Downloaded ✅\nEmail Window Opened 📧\n\nPlease attach the PDF to the email.`);
      }, 500);
    } else alert("Failed to generate PDF.");
    setIsSendingEmail(false); setShowEmailModal(false);
  };

  const handleDownloadPDF = async () => {
    if (!viewInvoice) return;
    setIsDownloading(true);
    await generateAndDownloadPDF('invoice-content', `Invoice_${viewInvoice.id}.pdf`, viewInvoice.id);
    setIsDownloading(false);
  };

  const handleSaveSettings = () => { updateCompanySettings(tempSettings); alert("Settings Updated"); };

  const openExpenseModal = (expense?: any) => {
    if (expense) { setEditingExpenseId(expense.id); setNewExpense({ description: expense.description, amount: expense.amount, category: expense.category }); }
    else { setEditingExpenseId(null); setNewExpense({ description: '', amount: '', category: 'General' }); }
    setShowExpenseModal(true);
  };

  const InvoiceTemplate = ({ invoice, id }: { invoice: Invoice, id: string }) => (
    <div id={id} className="p-8 bg-white text-slate-900 w-full max-w-[800px] mx-auto relative min-h-[1100px] flex flex-col">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">INVOICE</h1>
          <div className="text-slate-500">#{invoice.id}</div>
          <div className={`mt-2 inline-block px-3 py-1 rounded text-xs font-bold border ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{invoice.status}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl text-brand-600 mb-1">{companySettings.name}</div>
          <div className="text-sm text-slate-500 whitespace-pre-wrap">{companySettings.address}</div>
          <div className="text-sm text-slate-500 mt-1">{companySettings.email}<br/>{companySettings.phone}<br/>{companySettings.website}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
          <div className="text-slate-800 font-bold text-lg">{invoice.clientName}</div>
        </div>
        <div className="text-right">
          <div className="mb-2"><span className="text-slate-400 text-sm font-medium mr-4">Issue Date:</span><span className="text-slate-800 font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span></div>
          <div><span className="text-slate-400 text-sm font-medium mr-4">Due Date:</span><span className="text-slate-800 font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span></div>
        </div>
      </div>
      <table className="w-full mb-8">
        <thead className="bg-slate-50 border-y border-slate-200">
          <tr>
            <th className="py-3 px-2 text-center text-xs font-bold text-slate-500 uppercase w-12">SL</th>
            <th className="py-3 px-2 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
            <th className="py-3 px-2 text-left text-xs font-bold text-slate-500 uppercase">Folder</th>
            <th className="py-3 px-2 text-center text-xs font-bold text-slate-500 uppercase">Type</th>
            <th className="py-3 px-2 text-center text-xs font-bold text-slate-500 uppercase">Qty</th>
            <th className="py-3 px-2 text-right text-xs font-bold text-slate-500 uppercase">Price</th>
            <th className="py-3 px-2 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(invoice.items || []).map((item, idx) => (
            <tr key={item.id}>
              <td className="py-4 px-2 text-center text-sm text-slate-500">{idx + 1}</td>
              <td className="py-4 px-2 text-sm text-slate-800 font-medium">{item.description}</td>
              <td className="py-4 px-2 text-sm text-slate-600">{item.folderName || '-'}</td>
              <td className="py-4 px-2 text-center text-sm text-slate-600">{item.fileType || '-'}</td>
              <td className="py-4 px-2 text-center text-sm text-slate-600">{item.quantity}</td>
              <td className="py-4 px-2 text-right text-sm text-slate-600">{formatAmount(item.price, invoice.currency)}</td>
              <td className="py-4 px-2 text-right text-sm font-bold text-slate-800">{formatAmount(item.quantity * item.price, invoice.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end border-t border-slate-200 pt-6 mb-auto">
        <div className="w-64">
          <div className="flex justify-between mb-2"><span className="text-slate-500">Subtotal</span><span className="text-slate-800 font-medium">{formatAmount(invoice.amount, invoice.currency)}</span></div>
          <div className="flex justify-between mb-2"><span className="text-slate-500">Tax (0%)</span><span className="text-slate-800 font-medium">{formatAmount(0, invoice.currency)}</span></div>
          <div className="flex justify-between pt-4 border-t border-slate-200"><span className="text-lg font-bold text-slate-800">Total</span><span className="text-lg font-bold text-brand-600">{formatAmount(invoice.amount, invoice.currency)}</span></div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-slate-100">
        <div className="text-sm text-slate-600"><span className="font-bold text-slate-800 mr-2">PayPal:</span>intelligentclippingpath@gmail.com</div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Finance</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage invoices and track expenses</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-600 flex overflow-x-auto max-w-full">
            {(['invoices', 'expenses', 'division'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                {tab === 'division' ? 'Partner Division' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {user?.role === 'admin' && (
              <button onClick={() => setActiveTab('configuration')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'configuration' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}>Configuration</button>
            )}
          </div>
          {activeTab !== 'configuration' && activeTab !== 'division' && (
            <button onClick={() => { resetForm(); activeTab === 'invoices' ? setShowInvoiceModal(true) : openExpenseModal(); }} className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 flex-shrink-0">
              <Plus className="w-4 h-4 mr-2" />{activeTab === 'invoices' ? 'New Invoice' : 'Add Expense'}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Report Filters */}
        {activeTab === 'invoices' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2 text-slate-400" />Earning Reports</h3>
              <div className="flex flex-wrap gap-2">
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none" value={reportClient} onChange={e => setReportClient(e.target.value)}>
                  <option value="all">All Clients</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none" value={reportRange} onChange={e => setReportRange(e.target.value as any)}>
                  <option value="month">This Month</option><option value="year">This Year</option><option value="custom">Custom Date</option>
                </select>
                {reportRange === 'custom' && (
                  <div className="flex gap-2">
                    <input type="date" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs" value={customRange.start} onChange={e => setCustomRange({ ...customRange, start: e.target.value })} />
                    <input type="date" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs" value={customRange.end} onChange={e => setCustomRange({ ...customRange, end: e.target.value })} />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100 dark:bg-green-900/10 dark:border-green-800">
                <p className="text-xs font-bold text-green-600 uppercase">Paid Earnings</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{formatAmount(clientStats.paid)}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-800">
                <p className="text-xs font-bold text-amber-600 uppercase">Pending Payments</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">{formatAmount(clientStats.pending)}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-700/30 dark:border-slate-600">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-1">{clientStats.count}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><Filter className="w-5 h-5 mr-2 text-slate-400" />Expense Reports</h3>
              <div className="flex flex-wrap gap-2">
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none" value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {['Shabuj','Mashud','General','Equipment','Travel','Salaries','Marketing','Software','Utilities'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none" value={expenseStatus} onChange={e => setExpenseStatus(e.target.value)}>
                  <option value="all">All Statuses</option><option value="Approved">Approved</option><option value="Pending">Pending</option>
                </select>
                <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none" value={expenseRange} onChange={e => setExpenseRange(e.target.value as any)}>
                  <option value="month">This Month</option><option value="year">This Year</option><option value="custom">Custom Date</option>
                </select>
                {expenseRange === 'custom' && (
                  <div className="flex gap-2">
                    <input type="date" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs" value={expenseCustomRange.start} onChange={e => setExpenseCustomRange({ ...expenseCustomRange, start: e.target.value })} />
                    <input type="date" className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-xs" value={expenseCustomRange.end} onChange={e => setExpenseCustomRange({ ...expenseCustomRange, end: e.target.value })} />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-800">
                <p className="text-xs font-bold text-red-600 uppercase">Total Expenses</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{formatAmount(filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0))}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-700/30 dark:border-slate-600">
                <p className="text-xs font-bold text-slate-500 uppercase">Expense Count</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-1">{filteredExpenses.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Partner Division */}
        {activeTab === 'division' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center"><Calculator className="w-6 h-6 mr-2 text-brand-600" />Partner Profit Calculator</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveSession} disabled={isSaving} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded transition-all disabled:opacity-50 ${saveStatus === 'saved' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}>
                    {isSaving ? 'Saving...' : saveStatus === 'saved' ? <><Check className="w-3 h-3 mr-1.5"/>Saved!</> : <><Cloud className="w-3 h-3 mr-1.5"/>Save Session</>}
                  </button>
                  <button onClick={handleClearSession} className="flex items-center text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-3 py-1.5 rounded">
                    <Trash2 className="w-3 h-3 mr-1.5"/>Clear
                  </button>
                </div>
              </div>
              <div className="mb-8 max-w-xl mx-auto text-center">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 uppercase mb-2">Total Monthly Income</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6"/>
                  <input type="number" className="w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none" placeholder="0.00" value={calcIncome} onChange={e => setCalcIncome(e.target.value)}/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {[{ person: 'Shabuj' as const, list: shabujList, color: 'purple' }, { person: 'Mashud' as const, list: mashudList, color: 'indigo' }].map(({ person, list, color }) => (
                  <div key={person} className={`bg-${color}-50 dark:bg-${color}-900/10 rounded-xl border border-${color}-100 dark:border-${color}-800/50 p-6 flex flex-col h-full`}>
                    <h4 className={`text-lg font-bold text-${color}-800 dark:text-${color}-300 mb-4 pb-2 border-b border-${color}-200 dark:border-${color}-800`}>{person}'s Expenses</h4>
                    <div className="space-y-3 flex-1 mb-4">
                      {list.map(item => (
                        <div key={item.id} className="flex gap-2">
                          <input placeholder="Description" className={`flex-1 text-sm p-2 rounded border border-${color}-200 dark:border-${color}-800 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white`} value={item.desc} onChange={e => updateCalcRow(person, item.id, 'desc', e.target.value)}/>
                          <input type="number" placeholder="Amount" className={`w-24 text-sm p-2 rounded border border-${color}-200 dark:border-${color}-800 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold`} value={item.amount} onChange={e => updateCalcRow(person, item.id, 'amount', e.target.value)}/>
                          <button onClick={() => removeCalcRow(person, item.id)} className={`p-2 text-${color}-400 hover:text-red-500`}><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addCalcRow(person)} className={`w-full py-2 border-2 border-dashed border-${color}-200 hover:border-${color}-400 text-${color}-600 rounded-lg text-sm font-bold flex items-center justify-center`}>
                      <Plus className="w-4 h-4 mr-2"/>Add Expense Row
                    </button>
                    <div className={`mt-4 pt-4 border-t border-${color}-200 dark:border-${color}-800 flex justify-between items-center`}>
                      <span className={`text-sm font-medium text-${color}-700 dark:text-${color}-300`}>Total Paid:</span>
                      <span className={`text-xl font-bold text-${color}-900 dark:text-${color}-100`}>{formatAmount(list.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0))}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mb-8">
                <button onClick={handleCalculateDivision} className="bg-slate-900 dark:bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center">
                  <Calculator className="w-6 h-6 mr-3"/>Calculate Division
                </button>
              </div>
              {calculationResult && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-8">
                  <h3 className="text-center text-xl font-bold text-slate-800 dark:text-white mb-8 uppercase">Final Payout Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-8">
                    {[{ label: 'Total Revenue', value: calculationResult.totalRevenue, color: 'slate' }, { label: 'Less: Total Expenses', value: -(calculationResult.totalShabujExp + calculationResult.totalMashudExp), color: 'red' }, { label: 'Net Profit', value: calculationResult.netProfit, color: 'green' }].map(({ label, value, color }) => (
                      <div key={label} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className={`text-xs text-${color}-500 uppercase font-bold mb-1`}>{label}</p>
                        <p className={`text-2xl font-bold text-${color}-${color === 'slate' ? '900' : '600'} dark:text-white`}>{formatAmount(Math.abs(value))}</p>
                        {label === 'Net Profit' && <p className="text-[10px] text-slate-400 mt-1">Split 50/50: {formatAmount(calculationResult.splitProfit)} each</p>}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[{ name: 'Shabuj', color: 'purple', payout: calculationResult.shabujPayout, exp: calculationResult.totalShabujExp }, { name: 'Mashud', color: 'indigo', payout: calculationResult.mashudPayout, exp: calculationResult.totalMashudExp }].map(({ name, color, payout, exp }) => (
                      <div key={name} className={`bg-gradient-to-br from-${color}-50 to-white dark:from-${color}-900/20 dark:to-slate-800 p-6 rounded-2xl border border-${color}-200 dark:border-${color}-800 shadow-md`}>
                        <h4 className={`text-lg font-bold text-${color}-900 dark:text-${color}-100 mb-4 flex items-center`}><Users className="w-5 h-5 mr-2"/>{name} Receives</h4>
                        <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex justify-between"><span>Profit Share (50%)</span><span className="font-bold">{formatAmount(calculationResult.splitProfit)}</span></div>
                          <div className={`flex justify-between text-${color}-700 dark:text-${color}-400`}><span>+ Expense Reimbursement</span><span className="font-bold">{formatAmount(exp)}</span></div>
                        </div>
                        <div className={`pt-4 border-t border-${color}-200 dark:border-${color}-700 flex justify-between items-end`}>
                          <span className="text-sm font-bold text-slate-500 uppercase">Total Payout</span>
                          <span className={`text-3xl font-black text-${color}-800 dark:text-${color}-200`}>{formatAmount(payout)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Lists */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'invoices' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-500"/>Invoice List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      {['Invoice ID', 'Client', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase ${h === 'Amount' ? 'text-right' : h === 'Status' || h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredInvoices.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No invoices yet. Create your first invoice!</td></tr>
                    ) : filteredInvoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">{inv.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{inv.clientName}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(inv.issueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">{formatAmount(inv.amount, inv.currency)}</td>
                        <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => setViewInvoice(inv)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500"><Eye className="w-4 h-4"/></button>
                            <button onClick={() => openEditModal(inv)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500"><Pencil className="w-4 h-4"/></button>
                            {inv.status !== InvoiceStatus.PAID
                              ? <button onClick={() => handleTogglePaidStatus(inv)} className="p-1.5 hover:bg-green-100 rounded text-green-600"><CheckCircle className="w-4 h-4"/></button>
                              : <button onClick={() => handleTogglePaidStatus(inv)} className="p-1.5 hover:bg-amber-100 rounded text-amber-600"><XCircle className="w-4 h-4"/></button>
                            }
                            <button onClick={() => handleInitiateSend(inv)} className="p-1.5 hover:bg-blue-100 rounded text-blue-600"><Send className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-red-500"/>Expense Tracker</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      {['Date', 'Description', 'Category', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} className={`px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase ${h === 'Amount' ? 'text-right' : h === 'Status' || h === 'Actions' ? 'text-center' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredExpenses.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No expenses yet.</td></tr>
                    ) : filteredExpenses.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{exp.description}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${exp.category === 'Shabuj' ? 'bg-purple-100 text-purple-800' : exp.category === 'Mashud' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}>{exp.category}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">{formatAmount(exp.amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => toggleExpenseStatus(exp.id)} className={`px-2 py-1 rounded text-xs font-bold uppercase border ${exp.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{exp.status}</button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => openExpenseModal(exp)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500"><Pencil className="w-4 h-4"/></button>
                            <button onClick={() => deleteExpense(exp.id)} className="p-1.5 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Invoice Configuration</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                  <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-700">
                    <Building2 className="w-5 h-5 text-slate-400 mr-3"/>
                    <input className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white" value={tempSettings.name} onChange={e => setTempSettings({ ...tempSettings, name: e.target.value })}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Office Address</label>
                  <textarea rows={3} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none" value={tempSettings.address} onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                    <input className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white" value={tempSettings.email} onChange={e => setTempSettings({ ...tempSettings, email: e.target.value })}/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                    <input className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white" value={tempSettings.phone} onChange={e => setTempSettings({ ...tempSettings, phone: e.target.value })}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Payment Info</label>
                  <div className="flex items-start border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-700">
                    <CreditCard className="w-5 h-5 text-slate-400 mr-3 mt-1"/>
                    <textarea rows={3} className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white" value={tempSettings.paymentInfo || ''} onChange={e => setTempSettings({ ...tempSettings, paymentInfo: e.target.value })} placeholder="Bank Name: Chase..."/>
                  </div>
                </div>
                <button onClick={handleSaveSettings} className="w-full bg-slate-900 dark:bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-brand-700 transition-colors shadow-lg">Save Configuration</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF Container */}
      <div className="fixed top-0 left-0 pointer-events-none opacity-0 overflow-hidden h-0 w-0">
        {invoiceForPdf && <InvoiceTemplate invoice={invoiceForPdf} id="hidden-invoice-content"/>}
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col my-4">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Invoice Preview</h2>
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-900 disabled:opacity-50">
                  {isDownloading ? 'Generating...' : <><Download className="w-3 h-3 mr-1.5"/>Download PDF</>}
                </button>
                <button onClick={() => setViewInvoice(null)} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 ml-2"><X className="w-5 h-5"/></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center">
              <InvoiceTemplate invoice={viewInvoice} id="invoice-content"/>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Editor Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col my-4">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editMode ? 'Edit Invoice' : 'New Invoice'}</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Client</label>
                  {!isAddingClient ? (
                    <div className="flex gap-2">
                      <select className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={newInvoice.clientId} onChange={e => setNewInvoice({ ...newInvoice, clientId: e.target.value, clientName: contacts.find(c => c.id === e.target.value)?.name || '' })}>
                        <option value="">Select Client</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.name} - {c.company}</option>)}
                      </select>
                      <button onClick={() => setIsAddingClient(true)} className="bg-slate-100 dark:bg-slate-700 p-2.5 rounded-lg hover:bg-slate-200"><UserPlus className="w-5 h-5 text-slate-600 dark:text-slate-300"/></button>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-brand-600 uppercase">New Client</span>
                        <button onClick={() => setIsAddingClient(false)} className="text-xs text-slate-400"><X className="w-3 h-3"/></button>
                      </div>
                      <input placeholder="Name" className="w-full border p-2 rounded text-sm" value={newClientData.name} onChange={e => setNewClientData({ ...newClientData, name: e.target.value })}/>
                      <input placeholder="Company" className="w-full border p-2 rounded text-sm" value={newClientData.company} onChange={e => setNewClientData({ ...newClientData, company: e.target.value })}/>
                      <input placeholder="Email" className="w-full border p-2 rounded text-sm" value={newClientData.email} onChange={e => setNewClientData({ ...newClientData, email: e.target.value })}/>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
                    <input type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={newInvoice.issueDate} onChange={e => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}/>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input type="date" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={newInvoice.dueDate} onChange={e => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}/>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Line Items</label>
                  <button onClick={handleAddInvoiceItem} className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded hover:bg-brand-100 font-bold flex items-center"><Plus className="w-3 h-3 mr-1"/>Add Item</button>
                </div>
                <div className="space-y-2">
                  {invoiceItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-start bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="col-span-3"><input placeholder="Description" className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={item.description} onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}/></div>
                      <div className="col-span-2"><input placeholder="Folder" className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={item.folderName} onChange={e => handleUpdateItem(item.id, 'folderName', e.target.value)}/></div>
                      <div className="col-span-2"><input placeholder="Type (JPG/PNG)" className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={item.fileType} onChange={e => handleUpdateItem(item.id, 'fileType', e.target.value)}/></div>
                      <div className="col-span-1"><input type="number" placeholder="Qty" className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={item.quantity} onChange={e => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}/></div>
                      <div className="col-span-2"><input type="number" placeholder="Price" className="w-full p-2 text-sm border rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" value={item.price} onChange={e => handleUpdateItem(item.id, 'price', Number(e.target.value))}/></div>
                      <div className="col-span-1 border-l border-slate-200 dark:border-slate-600 pl-2 text-center text-sm font-bold pt-2 text-slate-700 dark:text-slate-300">{item.quantity * item.price}</div>
                      <div className="col-span-1 flex justify-center pt-2"><button onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4 text-xl font-bold text-slate-800 dark:text-white">Total: {formatAmount(calculateTotal(), newInvoice.currency)}</div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Instructions (Optional)</label>
                <textarea className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm" rows={2} value={newInvoice.paymentInfo} onChange={e => setNewInvoice({ ...newInvoice, paymentInfo: e.target.value })} placeholder="Override default payment instructions..."/>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
              <button onClick={() => setShowInvoiceModal(false)} className="px-6 py-2.5 text-slate-500 font-medium hover:bg-white dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={handleSaveInvoice} className="bg-brand-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-brand-700 shadow-lg flex items-center"><Save className="w-4 h-4 mr-2"/>Save Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center"><Mail className="w-5 h-5 mr-2 text-brand-600"/>Send Invoice</h2>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recipient</label><input className="w-full border p-2 rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white" value={emailData.to} onChange={e => setEmailData({ ...emailData, to: e.target.value })}/></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label><input className="w-full border p-2 rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white" value={emailData.subject} onChange={e => setEmailData({ ...emailData, subject: e.target.value })}/></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message</label><textarea rows={6} className="w-full border p-2 rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white text-sm" value={emailData.message} onChange={e => setEmailData({ ...emailData, message: e.target.value })}/></div>
              <div className="flex items-center text-xs text-slate-500 bg-slate-100 dark:bg-slate-700/50 p-2 rounded"><Paperclip className="w-3 h-3 mr-2"/>PDF Invoice will be attached automatically.</div>
              <button onClick={handleConfirmSendEmail} disabled={isSendingEmail} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 flex justify-center items-center">
                {isSendingEmail ? 'Generating & Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-96">
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</h2>
            <div className="space-y-4">
              <input placeholder="Description" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}/>
              <input type="number" placeholder="Amount" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}/>
              <select className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
                {['General','Shabuj','Mashud','Equipment','Travel','Salaries','Marketing','Software','Utilities'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
                <button onClick={handleSaveExpense} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
