import React, { useState, useEffect } from 'react';
import { Users, Shield, CreditCard, UserCheck, UserX, Zap, AlertCircle, TrendingUp, Activity, BarChart, ChevronRight, PlusCircle, Settings } from 'lucide-react';
import { API_URL } from './api';

// Dashboard admin avec stats amélioré
const AdminDashboard = ({ user, setCurrentPage }) => {
  const [stats, setStats] = useState({ total: 0, actifs: 0, suspendus: 0, bannis: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('afo_token');
      const response = await fetch(`${API_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        const members = data.data;

        setStats({
          total: members.length,
          actifs: members.filter(m => m.statu === 'actif').length,
          suspendus: members.filter(m => m.statu === 'suspendu').length,
          bannis: members.filter(m => m.statu === 'bani').length
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-16 px-3 md:px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête admin */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-blue-400/50">
                <Shield className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Administration AFO
              </h2>
              <p className="text-gray-400 text-xs md:text-lg">
                Bienvenue, {user.prenom}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-400">Chargement des statistiques...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
            <AdminStatCard
              icon={<Users />}
              title="Total membres"
              value={stats.total}
              gradient="from-blue-500 to-cyan-500"
              description="Membres enregistrés"
            />
            <AdminStatCard
              icon={<UserCheck />}
              title="Membres actifs"
              value={stats.actifs}
              gradient="from-green-500 to-emerald-500"
              description="Comptes actifs"
              badge={true}
            />
            <AdminStatCard
              icon={<UserX />}
              title="Suspendus"
              value={stats.suspendus}
              gradient="from-amber-500 to-orange-500"
              description="Comptes suspendus"
              alert={stats.suspendus > 0}
            />
            <AdminStatCard
              icon={<UserX />}
              title="Bannis"
              value={stats.bannis}
              gradient="from-red-500 to-pink-500"
              description="Comptes bannis"
              alert={stats.bannis > 0}
            />
          </div>
        )}

        {/* Actions rapides */}
        <div className="mb-4 md:mb-8">
          <h3 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-6 flex items-center space-x-2">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            <span>Actions rapides</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            <QuickActionCard
              icon={<Users />}
              title="Gérer les membres"
              description="Ajouter, modifier ou supprimer des membres"
              gradient="from-purple-500 to-pink-500"
              onClick={() => setCurrentPage('members')}
            />
            <QuickActionCard
              icon={<CreditCard />}
              title="Cotisations"
              description="Gérer les paiements des membres"
              gradient="from-green-500 to-emerald-500"
              onClick={() => setCurrentPage('cotisations')}
            />
            <QuickActionCard
              icon={<PlusCircle />}
              title="Générer cotisations"
              description="Créer les cotisations du mois"
              gradient="from-orange-500 to-red-500"
              onClick={() => setCurrentPage('generer-cotisations')}
            />
            <QuickActionCard
              icon={<BarChart />}
              title="Statistiques"
              description="Voir les rapports détaillés"
              gradient="from-indigo-500 to-purple-500"
              onClick={() => alert('Fonctionnalité bientôt disponible')}
              comingSoon={true}
            />
            <QuickActionCard
              icon={<Settings />}
              title="Paramètres"
              description="Configurer l'association"
              gradient="from-slate-500 to-slate-600"
              onClick={() => alert('Fonctionnalité bientôt disponible')}
              comingSoon={true}
            />
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h3 className="text-lg md:text-2xl font-bold text-white">Vue d'ensemble</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Taux d'activité */}
            <div className="group bg-slate-800/50 rounded-xl p-4 md:p-6 border border-slate-700 hover:border-green-500/50 transition-all">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-gray-400 text-xs md:text-sm font-medium">Taux d'activité</p>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
              </div>
              <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}%
              </p>
              <p className="text-gray-500 text-xs md:text-sm">Membres actifs sur le total</p>

              {/* Barre de progression */}
              <div className="mt-3 md:mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Membres suspendus */}
            <div className="group bg-slate-800/50 rounded-xl p-4 md:p-6 border border-slate-700 hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-gray-400 text-xs md:text-sm font-medium">Membres suspendus</p>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserX className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                </div>
              </div>
              <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
                {stats.suspendus}
              </p>
              <p className="text-gray-500 text-xs md:text-sm">Comptes temporairement suspendus</p>

              {stats.suspendus > 0 && (
                <button
                  onClick={() => setCurrentPage('members')}
                  className="mt-3 md:mt-4 w-full px-3 md:px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-lg transition-all text-xs md:text-sm font-semibold"
                >
                  Gérer les suspensions
                </button>
              )}
            </div>

            {/* Membres bannis */}
            <div className="group bg-slate-800/50 rounded-xl p-4 md:p-6 border border-slate-700 hover:border-red-500/50 transition-all">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <p className="text-gray-400 text-xs md:text-sm font-medium">Membres bannis</p>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserX className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                </div>
              </div>
              <p className="text-2xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {stats.bannis}
              </p>
              <p className="text-gray-500 text-xs md:text-sm">Comptes bannis définitivement</p>

              <div className="mt-4 flex items-center space-x-2 text-sm">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-pink-500" style={{ width: `${stats.total > 0 ? Math.round((stats.bannis / stats.total) * 100) : 0}%` }}></div>
                </div>
                <span className="text-red-400 font-semibold">{stats.total > 0 ? Math.round((stats.bannis / stats.total) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant carte statistique admin
const AdminStatCard = ({ icon, title, value, gradient, description, badge, alert, pulse }) => (
  <div className="group relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300 ${pulse ? 'animate-pulse' : ''}`}></div>

    <div className="relative bg-slate-900/80 backdrop-blur-sm p-3 md:p-6 rounded-xl md:rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-2 md:mb-4">
        <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br ${gradient} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {React.cloneElement(icon, { className: 'w-5 h-5 md:w-7 md:h-7 text-white' })}
        </div>
        {badge && (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold rounded-full">
            Actifs
          </span>
        )}
        {alert && (
          <span className="animate-pulse">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
          </span>
        )}
      </div>

      <p className="text-gray-400 text-xs md:text-sm font-medium mb-1">{title}</p>
      <p className={`text-xl md:text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-1 md:mb-2`}>
        {value}
      </p>
      <p className="text-gray-500 text-xs">{description}</p>

      {/* Barre décorative */}
      <div className={`mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}></div>
    </div>
  </div>
);

// Composant carte d'action rapide
const QuickActionCard = ({ icon, title, description, gradient, onClick, badge, comingSoon }) => (
  <button
    onClick={onClick}
    disabled={comingSoon}
    className="group relative bg-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-xl md:rounded-2xl border border-blue-800/30 hover:border-blue-500/50 transition-all text-left transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
  >
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl md:rounded-2xl pointer-events-none"></div>

    <div className="relative">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${gradient} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {React.cloneElement(icon, { className: 'w-5 h-5 md:w-6 md:h-6 text-white' })}
        </div>
        {badge > 0 && (
          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            {badge}
          </span>
        )}
        {comingSoon && (
          <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
            Bientôt
          </span>
        )}
      </div>

      <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
        {title}
      </h3>
      <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
        {description}
      </p>

      {/* Flèche indicatrice */}
      <div className="mt-3 md:mt-4 flex items-center space-x-2 text-gray-500 group-hover:text-gray-300 transition-colors">
        <span className="text-xs font-semibold">Accéder</span>
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Barre décorative */}
      <div className={`mt-3 md:mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}></div>
    </div>
  </button>
);

// Composant InfoRow amélioré
const InfoRow = ({ label, value }) => (
  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
    <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
    <p className="text-white font-semibold">{value}</p>
  </div>
);

export { AdminDashboard, AdminStatCard, QuickActionCard, InfoRow };

export default AdminDashboard
