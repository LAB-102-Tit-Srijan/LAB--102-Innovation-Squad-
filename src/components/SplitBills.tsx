import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt,
  QrCode,
  Smartphone,
  ChevronRight,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Wallet,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../lib/firestoreService';
import { formatCurrency, calculateSettlements, cn } from '../lib/utils';

const COLORS = ['#FF6B35', '#2EC4B6', '#E71D36', '#FF9F1C', '#011627'];

export default function SplitBills() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');

  useEffect(() => {
    if (!user) return;
    return groupService.subscribeToGroups(user.uid, (data) => {
      setGroups(data);
      if (selectedGroup) {
        const updated = data.find(g => g.id === selectedGroup.id);
        if (updated) setSelectedGroup(updated);
      }
    });
  }, [user, selectedGroup?.id]);

  useEffect(() => {
    if (!selectedGroup) return;
    return groupService.subscribeToExpenses(selectedGroup.id, setExpenses);
  }, [selectedGroup]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !user) return;
    await groupService.addExpense(selectedGroup.id, {
      amount: parseFloat(amount),
      description,
      category,
      paidById: user.uid,
      splitType: 'equal'
    });
    setAmount('');
    setDescription('');
    setShowAddExpense(false);
  };

  const handleUpdateBudget = async () => {
    if (!selectedGroup || !newBudget) return;
    await groupService.updateGroup(selectedGroup.id, { 
      totalBudget: parseFloat(newBudget) 
    });
    setShowSettings(false);
  };

  const settlements = selectedGroup ? calculateSettlements(expenses, selectedGroup.members) : [];

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budget = selectedGroup?.totalBudget || 50000;
  const remainingBudget = Math.max(0, budget - totalSpent);
  const budgetUsagePercent = Math.min(100, (totalSpent / budget) * 100);

  const categoryData = Object.entries(
    expenses.reduce((acc: Record<string, number>, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: value as number }));

  if (selectedGroup) {
    return (
      <div className="space-y-6 pb-24">
        <button onClick={() => setSelectedGroup(null)} className="text-stone-500 font-bold flex items-center gap-1 group text-sm uppercase tracking-wider">
          <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Squads
        </button>

        <header className="flex justify-between items-center px-2">
          <div>
            <h1 className="text-3xl font-serif font-bold text-natural-text">{selectedGroup.name}</h1>
            <p className="text-stone-400 font-medium italic">Trip to {selectedGroup.destination}</p>
          </div>
          <button 
            onClick={() => {
              setNewBudget(budget.toString());
              setShowSettings(true);
            }}
            className="bg-stone-100 p-3 rounded-2xl border border-natural-border text-stone-500 hover:text-primary transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </header>

        {/* Trip Wallet Dashboard */}
        <section className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30 backdrop-blur-md">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-serif font-bold tracking-wide">Trip Wallet</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Total Spent</p>
                <p className="text-2xl font-bold font-mono text-white">{formatCurrency(totalSpent)}</p>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Budget Usage</p>
                <div className="text-right">
                  <p className="text-sm font-bold">{Math.round(budgetUsagePercent)}% used</p>
                  <p className="text-[10px] text-stone-500 font-medium">{formatCurrency(remainingBudget)} remaining</p>
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUsagePercent}%` }}
                  className={cn(
                    "h-full rounded-full shadow-lg",
                    budgetUsagePercent > 90 ? "bg-red-500" : budgetUsagePercent > 70 ? "bg-orange-400" : "bg-primary"
                  )}
                />
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {categoryData.length > 0 ? (
                <div className="h-[200px] relative">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Spending by Category</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                    <PieIcon className="w-5 h-5 text-stone-600" />
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[32px] text-stone-500 italic text-sm">
                  <Receipt className="w-8 h-8 mb-2 opacity-20" />
                  No spending data yet
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-2">Stats Breakdown</p>
                {categoryData.slice(0, 3).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-xs font-bold text-stone-300">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <TrendingUp className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5 rotate-12 text-primary" />
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAddExpense(true)}
            className="flex-1 bg-stone-900 text-white p-6 rounded-[32px] flex items-center justify-center gap-3 shadow-xl hover:bg-stone-800 transition-all group ring-4 ring-stone-900/5"
          >
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Log Expense</span>
          </button>
          
          <button className="bg-white text-natural-text border border-natural-border p-6 rounded-[32px] shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <QrCode className="w-6 h-6" />
          </button>
        </div>

        {/* Settlements & Balance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-8 rounded-[40px] border border-natural-border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-natural-text">Smart Settlements</h3>
              <Users className="w-5 h-5 text-stone-300" />
            </div>
            <div className="space-y-4">
              {settlements.length > 0 ? settlements.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 border-b border-stone-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-serif text-sm font-bold text-stone-500 uppercase">
                      {s.from[0]}
                    </div>
                    <div className="text-sm">
                      <span className="font-bold text-natural-text">{s.from}</span>
                      <span className="text-stone-400 mx-1">pays</span>
                      <span className="font-bold text-natural-text">{s.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold font-mono text-primary">{formatCurrency(s.amount)}</span>
                    <button className="bg-stone-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg active:scale-90 transition-transform">UPI</button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-50" />
                  <p className="text-stone-400 text-sm font-medium italic">All balances are settled!</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[40px] border border-natural-border shadow-sm space-y-6">
            <h2 className="text-lg font-serif font-bold text-natural-text">Recent Activity</h2>
            <div className="space-y-3">
              {expenses.slice(-4).reverse().map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-3xl border border-natural-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Receipt className="text-stone-400 w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-natural-text line-clamp-1">{exp.description}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{exp.category}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-natural-text">{formatCurrency(exp.amount)}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-center py-8 text-stone-400 text-sm italic font-medium">Start loggin your expenses!</p>
              )}
            </div>
          </section>
        </div>

        {/* Expense Modal */}
        <AnimatePresence>
          {showAddExpense && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-white w-full max-w-sm rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-natural-text tracking-tight">Log Expense</h2>
                  <button onClick={() => setShowAddExpense(false)} className="bg-stone-100 p-2 rounded-full text-stone-400 font-bold">×</button>
                </div>
                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Category</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                      {['Food', 'Travel', 'Stay', 'Fun', 'Other'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                            category === cat ? "bg-stone-900 border-stone-900 text-white shadow-lg" : "bg-white border-stone-200 text-stone-500"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">How much?</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-stone-300">₹</span>
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-stone-50 border border-natural-border rounded-3xl py-6 pl-12 pr-6 text-2xl font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">What for?</label>
                      <input 
                        type="text" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-stone-50 border border-natural-border rounded-2xl p-4 font-bold text-natural-text focus:ring-4 focus:ring-primary/10 outline-none" 
                        placeholder="Taxi to airport"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-[24px] font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Save Expense
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Settings/Budget Modal */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6"
              >
                <h2 className="text-2xl font-serif font-bold text-natural-text">Group Settings</h2>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Trip Budget (₹)</label>
                  <input 
                    type="number" 
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full bg-stone-50 border border-natural-border rounded-3xl py-4 px-6 text-xl font-bold focus:ring-4 focus:ring-primary/10 outline-none" 
                    placeholder="Enter limit"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleUpdateBudget}
                    className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-stone-100 text-stone-600 py-4 rounded-2xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3 px-2">
        <h1 className="text-4xl font-serif font-bold text-natural-text">Squads</h1>
        <p className="text-stone-400 font-medium italic">Manage travel funds & shared spending.</p>
      </header>

      <div className="grid gap-4">
        {groups.map(group => (
          <motion.div 
            key={group.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedGroup(group)}
            className="bg-white p-6 rounded-[32px] shadow-sm border border-natural-border flex items-center gap-4 cursor-pointer hover:shadow-xl transition-all group"
          >
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center border border-stone-100 group-hover:scale-105 transition-transform">
              <Users className="text-primary w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-serif font-bold text-natural-text">{group.name}</h3>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-widest mt-1">
                {group.destination} • {group.members.length} members
              </p>
            </div>
            <ChevronRight className="text-stone-300 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        ))}

        <button 
          onClick={async () => {
            if (!user) return;
            const name = prompt("Enter Squad Name") || "Trip Squad";
            const dest = prompt("Enter Destination") || "Everywhere";
            await groupService.createGroup(name, dest, user.uid, []);
          }}
          className="bg-stone-50 border-2 border-dashed border-stone-200 p-8 rounded-[40px] flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-primary/20 hover:text-primary transition-all font-bold group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:rotate-90 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          Create New Squad
        </button>
      </div>

      {/* Global Trip Wallet Overview Card */}
      <div className="bg-stone-900 rounded-[44px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl ring-1 ring-white/10 backdrop-blur">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Master Wallet</span>
            </div>
            <TrendingUp className="text-green-500 w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-400 italic">Combined Squad Spending</p>
            <h2 className="text-5xl font-serif font-bold tracking-tight">
              {formatCurrency(groups.reduce((acc, g) => acc + (g.totalBudget || 0), 0))}
            </h2>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-white text-stone-900 py-4 rounded-3xl font-bold text-sm shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5" /> Pay Now
            </button>
          </div>
        </div>
        <CreditCard className="absolute -right-16 -top-16 w-64 h-64 opacity-5 -rotate-12 group-hover:-rotate-6 transition-transform duration-700" />
      </div>
    </div>
  );
}
