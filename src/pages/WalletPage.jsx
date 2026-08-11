import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Send, History, DollarSign } from 'lucide-react';

export default function WalletPage() {
  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState([]);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchWallet = async () => {
    try {
      const res = await API.get('wallets/');
      setBalance(res.data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await API.get('wallets/transactions/');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await API.post('wallets/transfer/', { receiver_email: receiverEmail, amount });
      setMessage(res.data.message);
      setReceiverEmail('');
      setAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed.');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-80">Wallet Balance</span>
            <DollarSign className="w-6 h-6 opacity-80" />
          </div>
          <h2 className="text-3xl font-extrabold mt-3">${balance}</h2>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <Send className="w-5 h-5 mr-2 text-indigo-500" /> Transfer Funds
          </h3>
          {message && <div className="mb-3 p-3 text-sm text-green-700 bg-green-50 dark:bg-green-950/50 rounded-lg">{message}</div>}
          {error && <div className="mb-3 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg">{error}</div>}
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receiver Email</label>
              <input
                type="email"
                required
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-lg outline-none text-sm"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition">
              Send Money
            </button>
          </form>
        </div>
      </div>

      <div className="md:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900 dark:text-white">
          <History className="w-5 h-5 mr-2 text-indigo-500" /> Transaction History
        </h3>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions found.</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{tx.sender_email} → {tx.receiver_email}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">${tx.amount}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}