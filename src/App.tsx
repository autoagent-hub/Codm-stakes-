import React, { useState, useEffect } from 'react';
import { UserProfile, Match } from './types';
import {
  fetchUser, fetchMatches, fetchMatch, createMatch, joinMatch,
  opponentStakeMatch, creatorStakeMatch,
  cancelMatch, submitMatchResult,
  createUser, signUpUser, signInUser, updateUser, DEFAULT_USERS
} from './services/api';
import { Navbar, NavigationTab } from './components/Navbar';
import { BottomNavbar } from './components/BottomNavbar';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { CoreArena } from './components/CoreArena';
import { LeaderboardPage } from './components/LeaderboardPage';
import { RulesPage } from './components/RulesPage';
import { HistoryPage } from './components/HistoryPage';
import { ProfilePage } from './components/ProfilePage';
import { CreateBetModal } from './components/CreateBetModal';
import { OpponentOnboardingModal } from './components/OpponentOnboardingModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS.user_ghost);
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>(DEFAULT_USERS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Modals & configuration
  const [isCreateBetOpen, setIsCreateBetOpen] = useState(false);
  const [createBetInitialMode, setCreateBetInitialMode] = useState<string | undefined>(undefined);
  const [createBetInitialStake, setCreateBetInitialStake] = useState<number | undefined>(undefined);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingTargetMatch, setOnboardingTargetMatch] = useState<Match | null>(null);

  // Initial Data Fetch & URL Deep Link Check
  useEffect(() => {
    loadInitialSessionAndData();

    // Check URL query parameters for ?join=MATCH_ID
    const urlParams = new URLSearchParams(window.location.search);
    const joinMatchId = urlParams.get('join');
    if (joinMatchId) {
      handleDeepLinkJoin(joinMatchId);
    }
  }, []);

  const loadInitialSessionAndData = async () => {
    try {
      const savedUserId = localStorage.getItem('codm_current_user_id');
      let activeUser = currentUser;
      if (savedUserId) {
        try {
          activeUser = await fetchUser(savedUserId);
          setCurrentUser(activeUser);
          setCurrentTab('arena');
        } catch (e) {
          console.error('Could not load saved user:', e);
        }
      } else {
        const u = await fetchUser(currentUser.id);
        setCurrentUser(u);
      }
      const mList = await fetchMatches();
      setMatches(mList);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async (userToFetchId?: string) => {
    try {
      const uid = userToFetchId || currentUser.id;
      const u = await fetchUser(uid);
      setCurrentUser(u);
      const mList = await fetchMatches();
      setMatches(mList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeepLinkJoin = async (matchId: string) => {
    try {
      const match = await fetchMatch(matchId);
      if (match && match.status === 'PENDING_OPPONENT_STAKE') {
        setOnboardingTargetMatch(match);
        setIsOnboardingModalOpen(true);
      } else if (match) {
        setCurrentTab('arena');
      }
    } catch (err) {
      console.error('Deep link match lookup error:', err);
    }
  };

  const handleOpenCreateBet = (mode?: string, stake?: number) => {
    setCreateBetInitialMode(mode);
    setCreateBetInitialStake(stake);
    setIsCreateBetOpen(true);
  };

  const handleCreateBet = async (data: {
    stakeAmount: number;
    gameMode: string;
    map: string;
    rules: string[];
  }) => {
    await createMatch({
      creatorId: currentUser.id,
      stakeAmount: data.stakeAmount,
      gameMode: data.gameMode,
      map: data.map,
      rules: data.rules,
    });

    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
    setIsCreateBetOpen(false);
    setCreateBetInitialMode(undefined);
    setCreateBetInitialStake(undefined);
    setCurrentTab('arena'); // Navigate immediately into active room view
  };

  const handleJoinMatch = async (matchId: string, opponentId: string) => {
    try {
      await joinMatch(matchId, opponentId);
      const updatedUser = await fetchUser(currentUser.id);
      setCurrentUser(updatedUser);
      setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
      await loadData();
      setCurrentTab('arena');
    } catch (err: any) {
      alert(err.message || 'Failed to join match');
    }
  };

  const handleOpponentStake = async (
    matchId: string,
    paymentMethod: 'bank_transfer' | 'opay_palmpay' | 'card' | 'wallet_balance'
  ) => {
    await opponentStakeMatch(matchId, {
      opponentId: currentUser.id,
      paymentMethod,
    });
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
  };

  const handleCreatorStake = async (
    matchId: string,
    paymentMethod: 'bank_transfer' | 'opay_palmpay' | 'card' | 'wallet_balance'
  ) => {
    await creatorStakeMatch(matchId, {
      creatorId: currentUser.id,
      paymentMethod,
    });
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
  };

  const handleSimulateOpponentStake = async (matchId: string) => {
    const shadowUser = DEFAULT_USERS.user_shadow;
    await opponentStakeMatch(matchId, {
      opponentId: shadowUser.id,
      paymentMethod: 'bank_transfer',
    });
    await loadData();
  };

  const handleCompleteOnboarding = async (userData: {
    codmIgn: string;
    codmUid?: string;
    email: string;
    phone: string;
    initialDeposit?: number;
  }) => {
    // 1. Create new user profile with ₦0 initial deposit
    const newUser = await createUser({
      ...userData,
      initialDeposit: userData.initialDeposit || 0,
    });

    // 2. Set as active user
    setAllUsers((prev) => ({ ...prev, [newUser.id]: newUser }));
    setCurrentUser(newUser);

    await loadData();
    setOnboardingTargetMatch(null);
    setCurrentTab('arena');
  };

  const handleSubmitResult = async (matchId: string, claim: 'VICTORY' | 'DEFEAT' | 'DRAW', screenshotBase64?: string) => {
    await submitMatchResult(matchId, {
      playerId: currentUser.id,
      claim,
      screenshotBase64,
    });
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
  };

  const handleCancelMatch = async (matchId: string) => {
    await cancelMatch(matchId);
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    codmIgn: string;
    codmUid: string;
    initialDeposit: number;
  }) => {
    const user = await signUpUser(data);
    localStorage.setItem('codm_current_user_id', user.id);
    setCurrentUser(user);
    setAllUsers((prev) => ({ ...prev, [user.id]: user }));
    await loadData(user.id);
    setCurrentTab('arena');
  };

  const handleSignIn = async (data: {
    identifier: string;
    password: string;
  }) => {
    const user = await signInUser(data);
    localStorage.setItem('codm_current_user_id', user.id);
    setCurrentUser(user);
    await loadData(user.id);
    setCurrentTab('arena');
  };

  const handleSignOut = () => {
    localStorage.removeItem('codm_current_user_id');
    setCurrentUser(DEFAULT_USERS.user_ghost);
    setCurrentTab('landing');
  };

  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    try {
      const saved = await updateUser(currentUser.id, updatedData);
      setCurrentUser(saved);
      setAllUsers((prev) => ({ ...prev, [currentUser.id]: saved }));
    } catch (err) {
      const updated = { ...currentUser, ...updatedData };
      setCurrentUser(updated);
      setAllUsers((prev) => ({ ...prev, [currentUser.id]: updated }));
    }
  };

  // 1. STANDALONE SEPARATED LANDING PAGE VIEW
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col bg-tactical-grid selection:bg-amber-500 selection:text-black">
        <LandingPage
          matches={matches}
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'signup');
            setCurrentTab('auth');
          }}
        />
      </div>
    );
  }

  // 2. AUTHENTICATION (SIGN UP & SIGN IN) PAGE VIEW
  if (currentTab === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        onBackToLanding={() => setCurrentTab('landing')}
        demoUsers={allUsers}
      />
    );
  }

  // 3. IN-APP PAGES WITH TOP NAVBAR & BOTTOM DOCK
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col bg-tactical-grid selection:bg-amber-500 selection:text-black relative">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openCreateBetModal={() => handleOpenCreateBet()}
        onSignOut={handleSignOut}
      />

      {/* Main Separate Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">
        {/* PAGE 1: ARENA / DASHBOARD */}
        {currentTab === 'arena' && (
          <CoreArena
            currentUser={currentUser}
            matches={matches}
            onCreateBet={handleCreateBet}
            onJoinMatch={handleJoinMatch}
            onOpponentStake={handleOpponentStake}
            onCreatorStake={handleCreatorStake}
            onSimulateOpponentStake={handleSimulateOpponentStake}
            onSubmitResult={handleSubmitResult}
            onCancelMatch={handleCancelMatch}
            onRefresh={loadData}
            onOpenCreateBet={handleOpenCreateBet}
            onOpenNewUserOnboarding={(targetMatch) => {
              setOnboardingTargetMatch(targetMatch || null);
              setIsOnboardingModalOpen(true);
            }}
          />
        )}

        {/* PAGE 2: LEADERBOARD & RANKINGS */}
        {currentTab === 'leaderboard' && (
          <LeaderboardPage
            currentUser={currentUser}
            matches={matches}
            onOpenCreateBet={handleOpenCreateBet}
            onNavigateToArena={() => setCurrentTab('arena')}
          />
        )}

        {/* PAGE 3: RULES & FAIR PLAY HANDBOOK */}
        {currentTab === 'rules' && (
          <RulesPage
            onOpenCreateBet={handleOpenCreateBet}
            onNavigateToArena={() => setCurrentTab('arena')}
          />
        )}

        {/* PAGE 4: MATCH HISTORY & LEDGER */}
        {currentTab === 'history' && (
          <HistoryPage
            currentUser={currentUser}
            matches={matches}
            onNavigateToArena={() => setCurrentTab('arena')}
            onOpenCreateBet={handleOpenCreateBet}
          />
        )}

        {/* PAGE 5: GAMER PROFILE */}
        {currentTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            matches={matches}
            onUpdateUser={handleUpdateUser}
            onNavigateToArena={() => setCurrentTab('arena')}
            onNavigateToHistory={() => setCurrentTab('history')}
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            onNavigateToRules={() => setCurrentTab('rules')}
            onOpenCreateBet={handleOpenCreateBet}
            onSignOut={handleSignOut}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Dock for Mobile & Quick Switching */}
      <BottomNavbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* App Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-white tracking-wider">CODM STAKE</span>
            <span>·</span>
            <span>Call of Duty: Mobile Esports Escrow Wagering in Nigerian Naira (₦)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">Escrow Protected</span>
            <span>·</span>
            <span>Min Wager: ₦1,000</span>
            <span>·</span>
            <span>10% Platform Rake</span>
          </div>
        </div>
      </footer>

      {/* Bet Creation Modal */}
      <CreateBetModal
        currentUser={currentUser}
        isOpen={isCreateBetOpen}
        initialMode={createBetInitialMode}
        initialStake={createBetInitialStake}
        onClose={() => {
          setIsCreateBetOpen(false);
          setCreateBetInitialMode(undefined);
          setCreateBetInitialStake(undefined);
        }}
        onSubmit={handleCreateBet}
      />

      {/* Opponent Onboarding Modal (For new players joining from invite link) */}
      <OpponentOnboardingModal
        match={onboardingTargetMatch}
        isOpen={isOnboardingModalOpen}
        onClose={() => {
          setIsOnboardingModalOpen(false);
          setOnboardingTargetMatch(null);
        }}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    </div>
  );
}
