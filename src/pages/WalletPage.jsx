import { useEffect, useState } from 'react';
import { ArrowUpRight, CircleDollarSign, History, Leaf, Mail, Send, Sprout } from 'lucide-react';
import { walletApi } from '../api/wallet';

export default function WalletPage() {
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState([]);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const fetchWallet = async () => {
    try {
      const res = await walletApi.getWallet();
      setBalance(res.data.balance);
    } catch (error) {
      setFeedback({ type: 'error', text: error.userMessage || 'Your wallet could not be loaded.' });
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await walletApi.listTransactions();
      setTransactions(res.data);
    } catch (error) {
      setFeedback({ type: 'error', text: error.userMessage || 'Transaction history could not be loaded.' });
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const handleTransfer = async (event) => {
    event.preventDefault();
    setFeedback({ type: '', text: '' });
    try {
      const res = await walletApi.transfer({ receiver_email: receiverEmail, amount });
      setFeedback({ type: 'success', text: res.data.message || 'Your transfer was completed.' });
      setReceiverEmail('');
      setAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      setFeedback({ type: 'error', text: error.userMessage || 'Transfer failed.' });
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#123f30] px-6 py-8 text-white shadow-[0_18px_45px_-24px_rgba(17,74,54,0.8)] sm:px-10">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[26px] border-[#b8dc8d]/20" />
        <div className="absolute bottom-0 right-32 h-20 w-20 rounded-t-full bg-[#b8dc8d]/10" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#d9edc7]"><Leaf className="h-3.5 w-3.5" /> AgriCredits</span><h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Your learning wallet</h1><p className="mt-2 text-white/75">Keep your course funds and transfers in one place.</p></div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#d9edc7]">Available balance</p><p className="mt-1 text-3xl font-semibold">${balance}</p></div>
        </div>
      </section>

      {feedback.text && <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'}`}>{feedback.text}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <aside className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1b6345] to-[#123f30] p-6 text-white shadow-[0_12px_28px_rgba(17,74,54,0.2)]"><div className="flex items-start justify-between"><span className="rounded-2xl bg-white/15 p-3"><CircleDollarSign className="h-6 w-6" /></span><Sprout className="h-7 w-7 text-[#c4e29a]" /></div><p className="mt-8 text-sm font-medium text-white/70">Ready for your next course</p><p className="mt-1 text-3xl font-semibold">${balance}</p><div className="mt-6 h-px bg-white/15" /><p className="mt-4 text-xs leading-5 text-white/60">Use AgriCredits to invest in your learning journey.</p></section>

          <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900"><div className="mb-6 flex items-start gap-3"><span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><Send className="h-5 w-5" /></span><div><h2 className="text-xl font-semibold text-slate-900 dark:text-white">Send credits</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Transfer funds securely to another learner.</p></div></div><form onSubmit={handleTransfer} className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Recipient email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="email" required value={receiverEmail} onChange={(event) => setReceiverEmail(event.target.value)} placeholder="learner@daltex.edu" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" /></span></label><label className="block"><span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-700">$</span><input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" /></span></label><button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16623f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#104d32]">Send AgriCredits <ArrowUpRight className="h-4 w-4" /></button></form></section>
        </aside>

        <section className="rounded-[28px] border border-[#dbe7dc] bg-white p-6 shadow-[0_10px_30px_rgba(27,67,50,0.05)] dark:border-slate-800 dark:bg-slate-900 lg:col-span-3"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700">Activity</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Transaction history</h2></div><span className="rounded-2xl bg-[#e6f2e8] p-3 text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><History className="h-5 w-5" /></span></div>{transactions.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800/50"><History className="h-8 w-8 text-emerald-700" /><p className="mt-3 font-semibold text-slate-900 dark:text-white">No transactions yet</p><p className="mt-1 px-6 text-sm text-slate-500">Your incoming and outgoing transfers will appear here.</p></div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{transactions.map((transaction) => <article key={transaction.id} className="flex items-center gap-3 py-4 first:pt-0"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e6f2e8] text-[#16623f] dark:bg-emerald-950 dark:text-emerald-300"><ArrowUpRight className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{transaction.sender_email} → {transaction.receiver_email}</p><p className="mt-1 text-xs text-slate-500">{new Date(transaction.timestamp).toLocaleString()}</p></div><span className="text-sm font-semibold text-[#16623f] dark:text-emerald-300">${transaction.amount}</span></article>)}</div>}</section>
      </div>
    </div>
  );
}
