import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateSettlements(expenses: any[], members: string[]) {
  // Simple algorithm to calculate who owes whom
  const balances: Record<string, number> = {};
  members.forEach(m => balances[m] = 0);

  expenses.forEach(exp => {
    balances[exp.paidById] += exp.amount;
    const share = exp.amount / members.length; // Assume equal split for demo simplicity
    members.forEach(m => balances[m] -= share);
  });

  const creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > 0.01)
    .sort((a, b) => b[1] - a[1]);
  const debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < -0.01)
    .sort((a, b) => a[1] - b[1]);

  const transactions = [];
  let i = 0, j = 0;

  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i][1], -debtors[j][1]);
    transactions.push({
      from: debtors[j][0],
      to: creditors[i][0],
      amount
    });
    creditors[i][1] -= amount;
    debtors[j][1] += amount;
    if (creditors[i][1] < 0.01) i++;
    if (debtors[j][1] > -0.01) j++;
  }

  return transactions;
}
