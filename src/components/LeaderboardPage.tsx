import React, { useState } from 'react';
import { UserProfile, Match } from '../types';
import {
  Trophy, Swords, Medal, ArrowUpRight, Flame, Award,
  Sparkles, Crosshair, Users, Target, ShieldCheck, TrendingUp
} from 'lucide-react';
import { CODM_IMAGES } from '../assets/images';

interface LeaderboardPageProps {
  currentUser: UserProfile;
  matches: Match[];
  onOpenCreateBet: (mode?: string, stake?: number) => void;
  onNavigateToArena: () => void;
}

interface RankedPlayer {
  rank: number;
  ign: string;
  uid: string;
  avatar: string;
  tier: string;
  winnings: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: number;
  clan: string;
}

const LEADERBOARD_PLAYERS: RankedPlayer[] = [
  {
    rank: 1,
    ign: 'GHOST_NG',
    uid: '6829471928371902',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    tier: 'LEGENDARY TIER',
    winnings: 28500,
    wins: 16,
    losses: 3,
    winRate: 84,
    streak: 6,
    clan: '[1V1_PRO]',
  },
  {
    rank: 2,
    ign: 'SniperQueen_KD',
    uid: '6719284729103822',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    tier: 'LEGENDARY TIER',
    winnings: 21600,
    wins: 12,
    losses: 2,
    winRate: 86,
    streak: 4,
    clan: '[LADY_SNIPER]',
  },
  {
    rank: 3,
    ign: 'ShadowSniper',
    uid: '6948201948271034',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    tier: 'MASTER V TIER',
    winnings: 14500,
    wins: 9,
    losses: 5,
    winRate: 64,
    streak: 2,
    clan: '[NIGHT_HAWK]',
  },
  {
    rank: 4,
    ign: 'LagosViper',
    uid: '6738291048291039',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    tier: 'MASTER IV TIER',
    winnings: 11200,
    wins: 7,
    losses: 3,
    winRate: 70,
    streak: 3,
    clan: '[LAGOS_ELITE]',
  },
  {
    rank: 5,
    ign: 'DeltaForce_99',
    uid: '6849201948201847',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
    tier: 'MASTER III TIER',
    winnings: 8900,
    wins: 6,
    losses: 4,
    winRate: 60,
    streak: 1,
    clan: '[DELTA_SQUAD]',
  },
  {
    rank: 6,
    ign: 'AbujaQuickscope',
    uid: '6729482018492019',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    tier: 'PRO V TIER',
    winnings: 6700,
    wins: 5,
    losses: 2,
    winRate: 71,
    streak: 2,
    clan: '[ABUJA_SNIPERS]',
  },
  {
    rank: 7,
    ign: 'PortHarcourtAce',
    uid: '6810294819204910',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    tier: 'PRO IV TIER',
    winnings: 4500,
    wins: 3,
    losses: 1,
    winRate: 75,
    streak: 3,
    clan: '[OIL_CITY_GAMERS]',
  },
];

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  currentUser,
  matches,
  onOpenCreateBet,
  onNavigateToArena,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all_time' | 'weekly' | 'snipers_only'>('all_time');

  // Check if currentUser is rank 1 or in list
  const userRankIndex = LEADERBOARD_PLAYERS.findIndex(
    (p) => p.ign.toLowerCase() === currentUser.codmIgn.toLowerCase()
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* 1. Page Header & Live Ranking Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            <Trophy className="w-4 h-4" />
            <span>Official Nigeria Esports Rankings</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-heading text-white mt-1 uppercase tracking-wide">
            CODM GLADIATOR LEADERBOARD
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Real-time verified standings ranked by total 1v1 duel & squad escrow winnings
          </p>
        </div>

        <button
          onClick={() => onOpenCreateBet('1v1 Sniper Only', 1000)}
          className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Swords className="w-4 h-4 stroke-[2.5]" />
          <span>Challenge Top Gladiators</span>
        </button>
      </div>

      {/* 2. Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {LEADERBOARD_PLAYERS.slice(0, 3).map((player, idx) => {
          const isFirst = idx === 0;
          const isSecond = idx === 1;
          const isThird = idx === 2;

          return (
            <div
              key={player.ign}
              className={`relative overflow-hidden rounded-3xl p-6 border transition-all flex flex-col justify-between text-center space-y-4 shadow-2xl ${
                isFirst
                  ? 'bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 border-amber-400 ring-2 ring-amber-400/40 order-1 md:order-2 md:-mt-3'
                  : isSecond
                  ? 'bg-gradient-to-b from-slate-400/10 via-neutral-900 to-neutral-950 border-slate-400/40 order-2 md:order-1'
                  : 'bg-gradient-to-b from-amber-700/10 via-neutral-900 to-neutral-950 border-amber-700/40 order-3 md:order-3'
              }`}
            >
              {/* Top Rank Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-black border ${
                  isFirst
                    ? 'bg-amber-400 text-neutral-950 border-amber-400'
                    : isSecond
                    ? 'bg-slate-300 text-neutral-950 border-slate-300'
                    : 'bg-amber-700 text-white border-amber-600'
                }`}>
                  RANK #{player.rank}
                </span>

                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                  {player.clan}
                </span>
              </div>

              {/* Avatar with Glow */}
              <div className="relative mx-auto">
                <img
                  src={player.avatar}
                  alt={player.ign}
                  className={`w-20 h-20 rounded-2xl object-cover bg-neutral-800 border-2 shadow-2xl mx-auto ${
                    isFirst ? 'border-amber-400' : isSecond ? 'border-slate-300' : 'border-amber-600'
                  }`}
                  referrerPolicy="no-referrer"
                />
                {isFirst && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-neutral-950 text-xs px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow">
                    👑 CHAMPION
                  </span>
                )}
              </div>

              {/* Contender Details */}
              <div className="space-y-1">
                <div className="text-lg sm:text-xl font-heading font-black text-white uppercase tracking-wide truncate">
                  {player.ign}
                </div>
                <div className="text-xs text-amber-400 font-mono font-bold">
                  {player.tier}
                </div>
              </div>

              {/* Money Stats */}
              <div className="p-3 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                <div className="text-[10px] text-neutral-400 uppercase font-mono">Verified Payouts</div>
                <div className="text-2xl font-black text-amber-400 font-mono-nums">
                  ₦{player.winnings.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-300 font-mono-nums flex items-center justify-center gap-2">
                  <span className="text-emerald-400">{player.wins}W</span>
                  <span>/</span>
                  <span className="text-rose-400">{player.losses}L</span>
                  <span>·</span>
                  <span className="text-neutral-200">{player.winRate}% Win Rate</span>
                </div>
              </div>

              <button
                onClick={() => onOpenCreateBet('1v1 Sniper Only', 1000)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span>Challenge #{player.rank}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. Filter Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveFilter('all_time')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'all_time'
              ? 'bg-amber-400 text-neutral-950 font-black shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          All-Time Earnings
        </button>

        <button
          onClick={() => setActiveFilter('weekly')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'weekly'
              ? 'bg-amber-400 text-neutral-950 font-black shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          Weekly Top Killers
        </button>

        <button
          onClick={() => setActiveFilter('snipers_only')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === 'snipers_only'
              ? 'bg-amber-400 text-neutral-950 font-black shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          1v1 Snipers Only
        </button>
      </div>

      {/* 4. Complete Ranked Table */}
      <div className="rounded-3xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/90 border-b border-neutral-800 text-neutral-400 uppercase font-mono-nums">
              <tr>
                <th className="py-4 px-5">Rank</th>
                <th className="py-4 px-5">Gladiator</th>
                <th className="py-4 px-5">Rank Tier</th>
                <th className="py-4 px-5">Combat Record</th>
                <th className="py-4 px-5">Win Rate</th>
                <th className="py-4 px-5">Win Streak</th>
                <th className="py-4 px-5 text-right">Escrow Winnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
              {LEADERBOARD_PLAYERS.map((player) => {
                const isMe = player.ign.toLowerCase() === currentUser.codmIgn.toLowerCase();

                return (
                  <tr
                    key={player.ign}
                    className={`hover:bg-neutral-800/50 transition-colors ${
                      isMe ? 'bg-amber-500/10 font-semibold' : ''
                    }`}
                  >
                    <td className="py-4 px-5 font-mono-nums font-black text-sm text-white">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${
                        player.rank === 1
                          ? 'bg-amber-400 text-neutral-950 font-black'
                          : player.rank === 2
                          ? 'bg-slate-300 text-neutral-950 font-black'
                          : player.rank === 3
                          ? 'bg-amber-700 text-white font-black'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        #{player.rank}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatar}
                          alt={player.ign}
                          className="w-10 h-10 rounded-xl object-cover bg-neutral-800 border border-neutral-700"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-heading font-black text-white text-sm flex items-center gap-1.5 uppercase">
                            <span>{player.ign}</span>
                            {isMe && (
                              <span className="text-[10px] bg-amber-400 text-neutral-950 px-1.5 py-0.5 rounded font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono-nums">
                            UID: {player.uid} · <span className="text-amber-400/80">{player.clan}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-[11px] font-bold text-amber-300">
                      {player.tier}
                    </td>

                    <td className="py-4 px-5 font-mono-nums">
                      <span className="text-emerald-400 font-bold">{player.wins}W</span>
                      <span className="text-neutral-500 mx-1">/</span>
                      <span className="text-rose-400 font-bold">{player.losses}L</span>
                    </td>

                    <td className="py-4 px-5 font-mono-nums font-bold text-neutral-200">
                      {player.winRate}%
                    </td>

                    <td className="py-4 px-5 font-mono-nums">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
                        <Flame className="w-3 h-3" />
                        <span>{player.streak} Streak</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right font-mono-nums font-black text-amber-400 text-base">
                      ₦{player.winnings.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
