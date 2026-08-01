'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeToPolls } from '@/lib/firestore-service';
import { Poll } from '@/types/focus';
import { BarChart2, Eye, Lock, RefreshCw, Users, CheckCircle } from 'lucide-react';

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPolls((list) => {
      // Show all active polls to community voters
      setPolls(list.filter((p) => p.status === 'ACTIVE'));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-8 py-4 text-slate-900">
      
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-2 border-black p-8 rounded-[2.5rem] shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-[#003C5E] mb-1">
            <BarChart2 className="w-6 h-6" />
            <h1 className="text-2xl font-black tracking-tight uppercase">
              Community Voting Gallery
            </h1>
          </div>
          <p className="text-xs text-slate-600 font-mono mt-1 font-semibold">
            Vote anonymously on contributor submissions, proposals, and community evaluations.
          </p>
        </div>
      </div>

      {/* Polls List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#003C5E] animate-spin" />
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">
              Loading active community polls...
            </p>
          </div>
        </div>
      ) : polls.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] p-12 text-center">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-black text-slate-800 uppercase">No Active Polls Open Right Now</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Check back later — the community admin will publish new voting polls shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white border-2 border-black rounded-[2.5rem] p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>OPEN FOR VOTING</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#007F6E]" />
                    <span>Anonymous Poll</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900 leading-tight">
                    {poll.title}
                  </h3>
                  {poll.description && (
                    <p className="text-xs text-slate-600 font-sans mt-1 line-clamp-2">
                      {poll.description}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                  <span>Questions in Poll</span>
                  <span className="font-bold">{poll.questions.length} Question{poll.questions.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/polls/${poll.id}`}
                  className="w-full py-3 bg-[#003C5E] hover:bg-[#00253b] text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Cast Anonymous Vote</span>
                  <CheckCircle className="w-4 h-4 text-[#FFB703]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
