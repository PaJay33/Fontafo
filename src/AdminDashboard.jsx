import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, CreditCard, Clock, AlertCircle, UserCheck, UserX, Zap, TrendingUp, Activity, BarChart,  ChevronRight, PlusCircle, Settings } from 'lucide-react';

// Configuration API
const API_URL = 'https://backafo.onrender.com';

// Dashboard admin avec stats amélioré
const AdminDashboard = ({ user, setCurrentPage }) => {
  const [stats, setStats] = useState({ total: 0, actifs: 0, suspendus: 0, demandes: 0 });
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
        const requests = JSON.parse(localStorage.getItem('afo_requests') || '[]');
        
        setStats({
          total: members.length,
          actifs: members.filter(m => m.statu === 'actif').length,
          suspendus: members.filter(m => m.statu === 'suspendu').length,
          demandes: requests.filter(r => r.statut === 'en_attente').length
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête admin */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-blue-400/50">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Administration AFO
              </h2>
              <p className="text-gray-400 text-lg">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              icon={<AlertCircle />} 
              title="Demandes" 
              value={stats.demandes} 
              gradient="from-red-500 to-pink-500"
              description="En attente"
              pulse={stats.demandes > 0}
            />
          </div>
        )}

        {/* Actions rapides */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span>Actions rapides</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              icon={<AlertCircle />}
              title="Gérer les demandes"
              description="Approuver ou refuser les demandes d'adhésion"
              gradient="from-blue-500 to-cyan-500"
              onClick={() => setCurrentPage('requests')}
              badge={stats.demandes}
            />
            <QuickActionCard
              icon={<Users />}
              title="Gérer les membres"
              description="Voir, suspendre ou bannir des membres"
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
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Vue d'ensemble</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Taux d'activité */}
            <div className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">Taux d'activité</p>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}%
              </p>
              <p className="text-gray-500 text-sm">Membres actifs sur le total</p>
              
              {/* Barre de progression */}
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${stats.total > 0 ? Math.round((stats.actifs / stats.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            {/* À traiter */}
            <div className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-orange-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">À traiter</p>
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                {stats.demandes}
              </p>
              <p className="text-gray-500 text-sm">Demandes en attente</p>

              {stats.demandes > 0 && (
                <button
                  onClick={() => setCurrentPage('requests')}
                  className="mt-4 w-full px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30 rounded-lg transition-all text-sm font-semibold"
                >
                  Traiter maintenant
                </button>
              )}
            </div>

            {/* Croissance */}
            <div className="group bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">Nouvelles demandes</p>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                +{stats.demandes}
              </p>
              <p className="text-gray-500 text-sm">Demandes ce mois-ci</p>

              <div className="mt-4 flex items-center space-x-2 text-sm">
                <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-pulse" style={{ width: '70%' }}></div>
                </div>
                <span className="text-blue-400 font-semibold">70%</span>
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
    
    <div className="relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {React.cloneElement(icon, { className: 'w-7 h-7 text-white' })}
        </div>
        {badge && (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold rounded-full">
            Actifs
          </span>
        )}
        {alert && (
          <span className="animate-pulse">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </span>
        )}
      </div>
      
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-2`}>
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
    className="group relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30 hover:border-blue-500/50 transition-all text-left transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
  >
    {/* Effet de brillance */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {React.cloneElement(icon, { className: 'w-6 h-6 text-white' })}
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

// Composant InfoRow amélioré
const InfoRow = ({ label, value }) => (
  <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
    <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
    <p className="text-white font-semibold">{value}</p>
  </div>
);

export { AdminDashboard, AdminStatCard, QuickActionCard, InfoRow };

export default AdminDashboard
