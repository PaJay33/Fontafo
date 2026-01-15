import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Users, DollarSign, Activity, ChevronRight, PlusCircle, BarChart, CheckCircle, XCircle, Clock } from 'lucide-react';
import { API_URL } from './api';

// Dashboard Finance - Accès uniquement aux cotisations
const FinanceDashboard = ({ user, setCurrentPage }) => {
  const [stats, setStats] = useState({
    total: 0,
    payees: 0,
    nonPayees: 0,
    montantTotal: 0,
    montantCollecte: 0,
    montantRestant: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('afo_token');
      const response = await fetch(`${API_URL}/cotisations/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        const cotisations = data.data;
        const payees = cotisations.filter(c => c.statut === 'payé');
        const nonPayees = cotisations.filter(c => c.statut === 'en_attente' || c.statut === 'en_retard');

        const montantTotal = cotisations.reduce((sum, c) => sum + c.montant, 0);
        const montantCollecte = payees.reduce((sum, c) => sum + c.montant, 0);
        const montantRestant = montantTotal - montantCollecte;

        setStats({
          total: cotisations.length,
          payees: payees.length,
          nonPayees: nonPayees.length,
          montantTotal,
          montantCollecte,
          montantRestant
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tauxCollecte = stats.montantTotal > 0
    ? Math.round((stats.montantCollecte / stats.montantTotal) * 100)
    : 0;

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-green-400/50">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Espace Finance
              </h2>
              <p className="text-gray-400 text-lg">
                Bienvenue, {user.prenom} - Gestion des cotisations
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
              <span className="text-gray-400">Chargement des statistiques...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Statistiques financières */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <FinanceStatCard
                icon={<DollarSign />}
                title="Montant total"
                value={`${stats.montantTotal.toLocaleString()} FCFA`}
                gradient="from-blue-500 to-cyan-500"
                description="Total à collecter"
              />
              <FinanceStatCard
                icon={<CheckCircle />}
                title="Montant collecté"
                value={`${stats.montantCollecte.toLocaleString()} FCFA`}
                gradient="from-green-500 to-emerald-500"
                description="Cotisations payées"
                badge={true}
              />
              <FinanceStatCard
                icon={<XCircle />}
                title="Montant restant"
                value={`${stats.montantRestant.toLocaleString()} FCFA`}
                gradient="from-red-500 to-pink-500"
                description="À collecter"
                alert={stats.montantRestant > 0}
              />
            </div>

            {/* Statistiques des cotisations */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<CreditCard />}
                title="Total cotisations"
                value={stats.total}
                gradient="from-purple-500 to-pink-500"
              />
              <StatCard
                icon={<CheckCircle />}
                title="Payées"
                value={stats.payees}
                gradient="from-green-500 to-emerald-500"
              />
              <StatCard
                icon={<Clock />}
                title="Non payées"
                value={stats.nonPayees}
                gradient="from-amber-500 to-orange-500"
              />
              <StatCard
                icon={<TrendingUp />}
                title="Taux de collecte"
                value={`${tauxCollecte}%`}
                gradient="from-blue-500 to-cyan-500"
              />
            </div>
          </>
        )}

        {/* Actions rapides */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Activity className="w-6 h-6 text-green-400" />
            <span>Actions rapides</span>
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              icon={<CreditCard />}
              title="Gérer les cotisations"
              description="Voir et marquer les paiements"
              gradient="from-green-500 to-emerald-500"
              onClick={() => setCurrentPage('cotisations')}
            />
            <QuickActionCard
              icon={<PlusCircle />}
              title="Générer cotisations"
              description="Créer les cotisations du mois"
              gradient="from-blue-500 to-cyan-500"
              onClick={() => setCurrentPage('generer-cotisations')}
            />
            <QuickActionCard
              icon={<BarChart />}
              title="Rapports"
              description="Voir les statistiques détaillées"
              gradient="from-purple-500 to-pink-500"
              onClick={() => alert('Fonctionnalité bientôt disponible')}
              comingSoon={true}
            />
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-green-800/30 shadow-2xl shadow-green-500/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Performance de collecte</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Taux de collecte */}
            <div className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">Taux de collecte global</p>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {tauxCollecte}%
              </p>
              <p className="text-gray-500 text-sm">Des cotisations sont payées</p>

              {/* Barre de progression */}
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${tauxCollecte}%` }}
                ></div>
              </div>
            </div>

            {/* Cotisations en attente */}
            <div className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">Cotisations en attente</p>
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
                {stats.nonPayees}
              </p>
              <p className="text-gray-500 text-sm">Paiements à collecter</p>

              {stats.nonPayees > 0 && (
                <button
                  onClick={() => setCurrentPage('cotisations')}
                  className="mt-4 w-full px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-lg transition-all text-sm font-semibold"
                >
                  Traiter les paiements
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant carte statistique finance
const FinanceStatCard = ({ icon, title, value, gradient, description, badge, alert }) => (
  <div className="group relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>

    <div className="relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {React.cloneElement(icon, { className: 'w-7 h-7 text-white' })}
        </div>
        {badge && (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold rounded-full">
            Collecté
          </span>
        )}
        {alert && (
          <span className="animate-pulse">
            <Clock className="w-5 h-5 text-amber-400" />
          </span>
        )}
      </div>

      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className={`text-2xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-2`}>
        {value}
      </p>
      <p className="text-gray-500 text-xs">{description}</p>

      {/* Barre décorative */}
      <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}></div>
    </div>
  </div>
);

// Composant carte statistique simple
const StatCard = ({ icon, title, value, gradient }) => (
  <div className="group relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>

    <div className="relative bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
          {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
        </div>
      </div>
      <p className="text-gray-400 text-xs font-medium mb-1">{title}</p>
      <p className={`text-3xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  </div>
);

// Composant carte d'action rapide
const QuickActionCard = ({ icon, title, description, gradient, onClick, comingSoon }) => (
  <button
    onClick={onClick}
    disabled={comingSoon}
    className="group relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-green-800/30 hover:border-green-500/50 transition-all text-left transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
  >
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {React.cloneElement(icon, { className: 'w-6 h-6 text-white' })}
        </div>
        {comingSoon && (
          <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
            Bientôt
          </span>
        )}
      </div>

      <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>

      {/* Flèche indicatrice */}
      <div className="mt-4 flex items-center space-x-2 text-gray-500 group-hover:text-gray-300 transition-colors">
        <span className="text-xs font-semibold">Accéder</span>
        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Barre décorative */}
      <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}></div>
    </div>
  </button>
);

export default FinanceDashboard;
