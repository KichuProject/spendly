import { create } from 'zustand';

const useChatStore = create((set) => ({
  conversationId: null,
  messages: [],
  loading: false,
  pendingTransactions: [],
  confirmationCardVisible: false,

  setConversationId: (id) => set({ conversationId: id }),
  
  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),
  
  setLoading: (isLoading) => set({ loading: isLoading }),
  
  setPendingTransactions: (transactions) => 
    set({ pendingTransactions: transactions }),
  
  setConfirmationCardVisible: (isVisible) => 
    set({ confirmationCardVisible: isVisible }),
  
  updatePendingTransaction: (index, updatedTransaction) =>
    set((state) => {
      const newTransactions = [...state.pendingTransactions];
      newTransactions[index] = updatedTransaction;
      return { pendingTransactions: newTransactions };
    }),

  resetChat: () => 
    set({
      conversationId: null,
      messages: [],
      loading: false,
      pendingTransactions: [],
      confirmationCardVisible: false,
    }),
}));

export default useChatStore;
