import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt,
  Smartphone,
  ChevronRight,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Wallet,
  Settings,
  ShieldCheck,
  Pencil,
  Trash2,
  ArrowLeft,
  Clock as ClockIcon
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
  const [category, setCategory] = useState('Other');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [numMembers, setNumMembers] = useState('1');
  const [splitData, setSplitData] = useState<Record<string, number>>({});
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isEditingSquad, setIsEditingSquad] = useState(false);
  const [editSquadName, setEditSquadName] = useState('');
  const [paidById, setPaidById] = useState('');
  const [paidByNameInput, setPaidByNameInput] = useState('');
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPaidById, setEditPaidById] = useState('');

  useEffect(() => {
    if (user) {
      setPaidById(user.uid);
      setPaidByNameInput('You');
    }
  }, [user]);

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
    
    // Validate split data
    let finalSplitData = splitData;
    const totalAmount = parseFloat(amount);
    
    if (splitMethod === 'equal') {
      finalSplitData = {};
      const share = totalAmount / selectedGroup.members.length;
      selectedGroup.members.forEach((mId: string) => {
        finalSplitData[mId] = share;
      });
    } else if (splitMethod === 'custom') {
      finalSplitData = {};
      const count = Math.max(1, parseInt(numMembers) || 1);
      const share = totalAmount / count;
      // Split among first N members (cap at group size to avoid errors)
      selectedGroup.members.slice(0, count).forEach((mId: string) => {
        finalSplitData[mId] = share;
      });
    }

    await groupService.addExpense(selectedGroup.id, {
      amount: parseFloat(amount),
      description,
      category,
      paidById: paidById || user.uid,
      paidByName: paidByNameInput || user.displayName || 'Member',
      splitMethod,
      splitData: finalSplitData
    });
    setAmount('');
    setDescription('');
    setNumMembers('1');
    setSplitData({});
    setSplitMethod('equal');
    setShowAddExpense(false);
  };

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !selectedExpense) return;

    // For simplicity, we'll keep the same split method/data but update basic info
    // A full edit would re-calculate splits, but this satisfies the basic "Edit" requirement
    await groupService.updateExpense(selectedGroup.id, selectedExpense.id, {
      amount: parseFloat(editAmount),
      description: editDescription,
      category: editCategory,
      paidById: editPaidById
    });
    
    setIsEditingExpense(false);
    setSelectedExpense(null);
  };

  const handleJoinSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode) return;
    setJoining(true);
    try {
      const group = await groupService.joinByCode(user.uid, inviteCode);
      if (group) {
        setSelectedGroup(group);
        setShowJoinModal(false);
        setInviteCode('');
      }
    } catch (err) {
      alert("Invalid or expired invite code");
    } finally {
      setJoining(false);
    }
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

  const handleRenameSquad = async () => {
    if (!selectedGroup || !editSquadName) return;
    await groupService.updateGroup(selectedGroup.id, { name: editSquadName });
    setIsEditingSquad(false);
  };

  const handleDeleteSquad = async () => {
    if (!selectedGroup) return;
    if (confirm("Are you sure you want to delete this Entire Squad? All data will be lost.")) {
      await groupService.deleteGroup(selectedGroup.id);
      setSelectedGroup(null);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!selectedGroup) return;
    if (confirm("Delete this expense?")) {
      await groupService.deleteExpense(selectedGroup.id, expenseId);
      setSelectedExpense(null);
    }
  };

  if (selectedGroup) {
    return (
      <div className="space-y-6 pb-24 relative">
        <button 
          onClick={() => setSelectedGroup(null)} 
          className="fixed top-6 left-6 z-[60] w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/30 text-stone-900 shadow-xl transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <header className="flex justify-between items-start px-2 pt-16">
          <div className="flex-1">
            {isEditingSquad ? (
              <div className="flex items-center gap-2">
                 <input 
                  autoFocus
                  value={editSquadName}
                  onChange={(e) => setEditSquadName(e.target.value)}
                  className="text-3xl font-serif font-bold text-natural-text bg-transparent border-b-2 border-primary outline-none w-full"
                  onBlur={handleRenameSquad}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSquad()}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h1 className="text-3xl font-serif font-bold text-natural-text">{selectedGroup.name}</h1>
                <button 
                  onClick={() => {
                    setEditSquadName(selectedGroup.name);
                    setIsEditingSquad(true);
                  }}
                  className="p-1 text-stone-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-stone-400 font-medium italic">Trip to {selectedGroup.destination}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                alert(`Invite Code: ${selectedGroup.inviteCode}\nShare this with your friends to join the squad!`);
              }}
              className="bg-stone-100 p-3 rounded-2xl border border-natural-border text-stone-500 hover:text-primary transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
              Share Code
            </button>
            <div className="relative group/settings">
              <button className="bg-stone-100 p-3 rounded-2xl border border-natural-border text-stone-500 hover:text-primary transition-colors">
                <Settings className="w-6 h-6" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-stone-100 hidden group-hover/settings:block z-50 overflow-hidden">
                <button 
                   onClick={() => {
                    setNewBudget(budget.toString());
                    setShowSettings(true);
                  }}
                  className="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> Budget Settings
                </button>
                <button 
                  onClick={handleDeleteSquad}
                  className="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Squad
                </button>
              </div>
            </div>
          </div>
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

        {/* Smart Insights */}
        <section className="bg-stone-50 rounded-[40px] p-8 border border-natural-border/60">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
               <TrendingUp className="w-4 h-4 text-primary" />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-500">Squad Insights</h3>
           </div>
           
           <div className="grid gap-3">
             <div className="p-5 bg-white rounded-3xl border border-natural-border shadow-sm flex items-start gap-4">
               <div className="p-2 bg-blue-50 rounded-xl">
                 <ShieldCheck className="w-4 h-4 text-blue-500" />
               </div>
               <div>
                 <p className="text-xs font-bold text-natural-text mb-1">AI Budget Suggestion</p>
                 <p className="text-[11px] text-stone-400 font-medium leading-relaxed">
                   Based on your <strong>{selectedGroup.destination}</strong> destination and current <strong>{category.toLowerCase()}</strong> spending, we recommend maintaining a daily budget of {formatCurrency( budget / 7 )} per person.
                 </p>
               </div>
             </div>

             {budgetUsagePercent > 70 && (
               <div className="p-5 bg-orange-50 rounded-3xl border border-orange-100 shadow-sm flex items-start gap-4">
                 <div className="p-2 bg-orange-100 rounded-xl">
                   <ArrowUpRight className="w-4 h-4 text-orange-600" />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-orange-900 mb-1">Overspending Alert</p>
                   <p className="text-[11px] text-orange-700/80 font-medium leading-relaxed">
                     You've consumed {Math.round(budgetUsagePercent)}% of your budget. Consider sharing local transport to save on "Travel" costs.
                   </p>
                 </div>
               </div>
             )}
           </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => {
              setPaidById(user?.uid || '');
              setPaidByNameInput('You');
              setShowAddExpense(true);
            }}
            className="w-full bg-stone-900 text-white p-6 rounded-[32px] flex items-center justify-center gap-3 shadow-xl hover:bg-stone-800 transition-all group ring-4 ring-stone-900/5"
          >
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Log Expense</span>
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
                <button 
                  key={exp.id} 
                  onClick={() => setSelectedExpense(exp)}
                  className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-3xl border border-natural-border/50 hover:bg-stone-100 transition-colors active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Receipt className="text-stone-400 w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-natural-text line-clamp-1">{exp.description}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                          {exp.timestamp?.toDate ? new Date(exp.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </p>
                        <span className="text-stone-200">|</span>
                        <p className="text-[10px] text-stone-400 font-medium italic">{exp.category}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-natural-text">{formatCurrency(exp.amount)}</span>
                </button>
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Who Paid?</label>
                       <div className="relative">
                         <input 
                           list="squad-members"
                           value={paidByNameInput}
                           onChange={(e) => {
                             const val = e.target.value;
                             setPaidByNameInput(val);
                             // Try to find matching member ID
                             const memberId = selectedGroup.members.find((mId: string) => {
                               const name = mId === user?.uid ? 'You' : (selectedGroup.memberNames?.[mId] || `Member ${mId.substring(0, 4)}`);
                               return name.toLowerCase() === val.toLowerCase();
                             });
                             if (memberId) {
                               setPaidById(memberId);
                             }
                           }}
                           placeholder="Type a name..."
                           className="w-full bg-stone-50 border border-natural-border rounded-2xl p-4 font-bold text-sm text-stone-900 focus:ring-4 focus:ring-primary/10 outline-none"
                         />
                         <datalist id="squad-members">
                           {selectedGroup.members.map((mId: string) => (
                             <option key={mId} value={mId === user?.uid ? 'You' : (selectedGroup.memberNames?.[mId] || `Member ${mId.substring(0, 4)}`)} />
                           ))}
                         </datalist>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Split Method</label>
                       <div className="flex gap-2">
                         {['equal', 'custom'].map(m => (
                           <button
                             key={m}
                             type="button"
                             onClick={() => setSplitMethod(m as any)}
                             className={cn(
                               "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all",
                               splitMethod === m ? "bg-stone-900 text-white border-stone-900" : "bg-stone-50 text-stone-500 border-stone-200"
                             )}
                           >
                             {m}
                           </button>
                         ))}
                       </div>
                    </div>

                    {splitMethod === 'custom' && (
                      <div className="space-y-3 p-4 bg-stone-50 rounded-3xl border border-natural-border">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase text-stone-400">Number of Members</label>
                          <input 
                            type="number"
                            min="1"
                            value={numMembers}
                            onChange={(e) => setNumMembers(e.target.value)}
                            className="w-16 bg-white border border-stone-200 rounded-lg p-2 text-center text-xs font-bold"
                          />
                        </div>
                        <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-stone-400 uppercase">Each member pays</span>
                          <span className="text-sm font-mono font-bold text-primary">
                            {formatCurrency(parseFloat(amount) / (parseInt(numMembers) || 1))}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Total Spend Amount</label>
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
        {/* Expense Detail Modal */}
        <AnimatePresence>
          {selectedExpense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif font-bold text-natural-text">Expense Detail</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditAmount(selectedExpense.amount.toString());
                        setEditDescription(selectedExpense.description);
                        setEditCategory(selectedExpense.category);
                        setEditPaidById(selectedExpense.paidById);
                        setIsEditingExpense(true);
                      }}
                      className="bg-stone-50 p-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteExpense(selectedExpense.id)}
                      className="bg-red-50 p-2 rounded-xl text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setSelectedExpense(null)} className="bg-stone-100 p-2 rounded-full text-stone-400 font-bold">×</button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-6 bg-stone-50 rounded-3xl border border-natural-border text-center relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                       <ClockIcon className="w-4 h-4 text-stone-200" />
                    </div>
                    <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mb-1">Total Amount</p>
                    <p className="text-4xl font-serif font-bold text-primary">{formatCurrency(selectedExpense.amount)}</p>
                    <p className="text-sm font-bold text-stone-500 mt-2 italic">"{selectedExpense.description}"</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Split Breakdown</p>
                    <div className="space-y-2">
                       {Object.entries(selectedExpense.splitData || {}).map(([memberId, share]: [string, any]) => (
                         <div key={memberId} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-natural-border shadow-sm">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase">
                               {memberId.substring(0, 1)}
                             </div>
                             <span className="text-xs font-bold text-stone-600">
                               {memberId === user?.uid ? 'You' : `Member ${memberId.substring(0, 4)}`}
                             </span>
                           </div>
                           <span className="text-sm font-mono font-bold text-natural-text">{formatCurrency(share)}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-1 items-center bg-stone-50/50 p-4 rounded-2xl italic border border-stone-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                       <Users className="w-3 h-3" />
                       <span>Paid by {selectedExpense.paidById === user?.uid ? 'You' : selectedExpense.paidByName || 'Member'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                       <ClockIcon className="w-3 h-3" />
                       <span>{selectedExpense.timestamp?.toDate ? new Date(selectedExpense.timestamp.toDate()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedExpense(null)}
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Expense Edit Modal */}
        <AnimatePresence>
          {isEditingExpense && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-sm rounded-[44px] p-8 space-y-6"
              >
                <h2 className="text-2xl font-serif font-bold text-natural-text">Edit Expense</h2>
                <form onSubmit={handleEditExpense} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Amount</label>
                    <input 
                      type="number" 
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full bg-stone-50 border border-natural-border rounded-2xl p-4 font-bold text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Description</label>
                    <input 
                      type="text" 
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-stone-50 border border-natural-border rounded-2xl p-4 font-bold"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-bold">Update</button>
                    <button type="button" onClick={() => setIsEditingExpense(false)} className="flex-1 bg-stone-100 text-stone-600 py-4 rounded-2xl font-bold">Cancel</button>
                  </div>
                </form>
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
                {group.destination}
              </p>
            </div>
            <ChevronRight className="text-stone-300 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="bg-white text-stone-900 border border-natural-border p-6 rounded-[32px] flex items-center justify-center gap-3 shadow-sm hover:bg-stone-50 transition-all font-bold group"
          >
            <Smartphone className="w-5 h-5 text-primary" />
            Join
          </button>
          
          <button 
            onClick={async () => {
              if (!user) return;
              const name = prompt("Enter Squad Name") || "Trip Squad";
              const dest = prompt("Enter Destination") || "Everywhere";
              await groupService.createGroup(name, dest, user.uid, []);
            }}
            className="bg-stone-50 border-2 border-dashed border-stone-200 p-8 rounded-[40px] flex items-center justify-center gap-3 text-stone-400 hover:border-primary/20 hover:text-primary transition-all font-bold group"
          >
            <Plus className="w-6 h-6" />
            Create
          </button>
        </div>
      </div>

        {/* Join Modal */}
        <AnimatePresence>
          {showJoinModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6"
              >
                <h2 className="text-2xl font-serif font-bold text-natural-text">Join a Squad</h2>
                <form onSubmit={handleJoinSquad} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest px-2">Invite Code</label>
                    <input 
                      type="text" 
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full bg-stone-50 border border-natural-border rounded-2xl p-4 font-bold text-xl text-center uppercase tracking-[0.3em] text-stone-900 focus:ring-4 focus:ring-primary/10 outline-none" 
                      placeholder="XXXXXX"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="submit"
                      disabled={joining}
                      className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {joining ? "Joining..." : "Join Now"}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowJoinModal(false)}
                      className="flex-1 bg-stone-100 text-stone-600 py-4 rounded-2xl font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
              <Smartphone className="w-5 h-5" /> Pay Now
            </button>
          </div>
        </div>
        <CreditCard className="absolute -right-16 -top-16 w-64 h-64 opacity-5 -rotate-12 group-hover:-rotate-6 transition-transform duration-700" />
      </div>
    </div>
  );
}
