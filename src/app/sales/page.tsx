"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Account, Opportunity } from "@/lib/types";

export default function SalesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  useEffect(() => {
    fetch("/api/accounts").then(r => r.json()).then(setAccounts);
    fetch("/api/opportunities").then(r => r.json()).then(setOpportunities);
  }, []);

  const filteredOpps = selectedAccount
    ? opportunities.filter(o => o.accountId === selectedAccount)
    : opportunities;

  const getAccountName = (accountId: string) =>
    accounts.find(a => a.id === accountId)?.name || accountId;

  const stageColors: Record<string, string> = {
    Prospecting: "bg-slate-100 text-slate-700",
    Qualification: "bg-blue-100 text-blue-700",
    Proposal: "bg-amber-100 text-amber-700",
    Negotiation: "bg-purple-100 text-purple-700",
    "Closed Won": "bg-green-100 text-green-700",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Accounts & Opportunities</h1>
        <p className="text-slate-500 mt-1">Select an opportunity to view meeting history and prepare for your next call.</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Account</label>
        <select
          value={selectedAccount}
          onChange={e => setSelectedAccount(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredOpps.map(opp => (
          <Link key={opp.id} href={`/sales/${opp.id}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{opp.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{getAccountName(opp.accountId)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    ${opp.value.toLocaleString()}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[opp.stage] || "bg-slate-100 text-slate-700"}`}>
                    {opp.stage}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
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
