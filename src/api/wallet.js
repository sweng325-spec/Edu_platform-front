import API from './axios';

export const walletApi = {
  getWallet: () => API.get('wallets/'),
  listTransactions: () => API.get('wallets/transactions/'),
  transfer: (transfer) => API.post('wallets/transfer/', transfer),
};
