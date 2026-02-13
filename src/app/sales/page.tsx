"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Account, Opportunity, Product } from "@/lib/types";

export default function SalesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  useEffect(() => {
    fetch("/api/accounts").then(r => r.json()).then(setAccounts);
    fetch("/api/opportunities").then(r => r.json()).then(setOpportunities);
    fetch("/api/products").then(r => r.json()).then(setProducts);
  }, []);

  const filteredOpps = selectedAccount
    ? opportunities.filter(o => o.accountId === selectedAccount)
    : opportunities;

  const filteredOpps2 = selectedProductId
    ? filteredOpps.filter(o => o.productId === selectedProductId)
    : filteredOpps;

  const getAccountName = (accountId: string) =>
    accounts.find(a => a.id === accountId)?.name || accountId;

  const stageColors: Record<string, string> = {
    Discovery: "bg-slate-100 text-slate-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--foreground)]",
    Evaluation: "bg-blue-100 text-blue-700 dark:bg-[color:var(--primary-soft)] dark:text-[color:var(--foreground)]",
    Prospecting: "bg-slate-100 text-slate-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--foreground)]",
    Qualification: "bg-blue-100 text-blue-700 dark:bg-[color:var(--primary-soft)] dark:text-[color:var(--foreground)]",
    Proposal: "bg-amber-100 text-amber-700 dark:bg-[color:var(--warning-soft)] dark:text-[color:var(--foreground)]",
    Negotiation: "bg-purple-100 text-purple-700 dark:bg-[color:var(--accent-soft)] dark:text-[color:var(--foreground)]",
    "Closed Won": "bg-green-100 text-green-700 dark:bg-[color:var(--success-soft)] dark:text-[color:var(--foreground)]",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[color:var(--foreground)] animate-fade-in-up">Accounts & Opportunities</h1>
        <p className="text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1 animate-fade-in-up [animation-delay:80ms]">Select an opportunity to view meeting history and prepare for your next call.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--muted-foreground)] mb-2">Filter by Account</label>
        <select
          value={selectedAccount}
          onChange={e => setSelectedAccount(e.target.value)}
          className="border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-[color:var(--muted-foreground)] mb-2">Filter by Product</label>
        <select
          value={selectedProductId}
          onChange={e => setSelectedProductId(e.target.value)}
          className="border border-slate-300 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredOpps2.map(opp => (
          <Link key={opp.id} href={`/sales/${opp.id}`}>
            <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 hover:border-blue-300 dark:hover:border-[color:var(--primary)] hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer animate-fade-in-up">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)]">{opp.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1">{getAccountName(opp.accountId)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)]">
                    ${opp.value.toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[opp.stage] || "bg-slate-100 text-slate-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--foreground)]"}`}>
                    {opp.stage}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 dark:text-[color:var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  {opp.product}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
