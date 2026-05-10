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
  if (!expenses.length || !members.length) return [];

  // Calculate net balance for each member
  const balances: Record<string, number> = {};
  members.forEach(m => (balances[m] = 0));

  expenses.forEach((exp) => {
    const paidBy = exp.paidById;
    const amount = exp.amount;
    const splitMethod = exp.splitMethod || "equal";
    const splitData = exp.splitData || {};

    balances[paidBy] += amount;

    if (splitMethod === "equal") {
      const perPerson = amount / members.length;
      members.forEach((m) => (balances[m] -= perPerson));
    } else if (splitMethod === "custom") {
      members.forEach((m) => {
        balances[m] -= splitData[m] || 0;
      });
    }
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
      amount,
    });
    creditors[i][1] -= amount;
    debtors[j][1] += amount;
    if (creditors[i][1] < 0.01) i++;
    if (debtors[j][1] > -0.01) j++;
  }

  return transactions;
}
