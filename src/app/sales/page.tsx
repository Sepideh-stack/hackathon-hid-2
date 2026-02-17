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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-[color:var(--foreground)] tracking-tight">Accounts & Opportunities</h1>
        <p className="text-lg text-slate-600 dark:text-[color:var(--muted-foreground)] mt-2 max-w-3xl">
          Select an opportunity to view meeting history and prepare for your next call.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-2xl p-6 shadow-sm animate-fade-in-up [animation-delay:140ms]">
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Filter by Account</label>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100 dark:hover:bg-[color:var(--muted)]"
            >
              <option value="">All Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-[color:var(--muted-foreground)] mb-1.5 uppercase tracking-wider">Filter by Product</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full border border-slate-200 dark:border-[color:var(--border)] rounded-lg px-3 py-2 text-sm bg-slate-50 dark:bg-[color:var(--card)] text-slate-900 dark:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-slate-100 dark:hover:bg-[color:var(--muted)]"
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOpps2.map(opp => (
          <Link key={opp.id} href={`/sales/${opp.id}`}>
            <div className="group bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-[color:var(--primary)] hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-pointer animate-fade-in-up">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] group-hover:text-indigo-600 dark:group-hover:text-[color:var(--primary)] transition-colors">{opp.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-[color:var(--muted-foreground)] mt-1">{getAccountName(opp.accountId)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-[color:var(--foreground)] bg-slate-50 dark:bg-[color:var(--muted)] px-3 py-1 rounded-full border border-slate-100 dark:border-transparent">
                    ${opp.value.toLocaleString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[opp.stage] || "bg-slate-100 text-slate-700 dark:bg-[color:var(--muted)] dark:text-[color:var(--foreground)]"}`}>
                    {opp.stage}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 dark:text-[color:var(--muted-foreground)]">
                <span className="flex items-center gap-1.5">
                  <div className="p-1.5 bg-slate-50 dark:bg-[color:var(--muted)] rounded-md group-hover:bg-indigo-50 dark:group-hover:bg-[color:var(--primary-soft)] transition-colors">
                    <svg className="w-4 h-4 text-slate-500 dark:text-[color:var(--muted-foreground)] group-hover:text-indigo-500 dark:group-hover:text-[color:var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                  </div>
                  <span className="font-medium text-slate-600 dark:text-[color:var(--muted-foreground)]">{opp.product}</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
