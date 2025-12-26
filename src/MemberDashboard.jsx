import React, { useState, useEffect, useCallback } from 'react';
import { User, CheckCircle, XCircle, AlertCircle, UserCheck, TrendingUp, Clock, Calendar, Mail, UserCog, History, Phone } from 'lucide-react';

// Configuration API
const API_URL = 'http://localhost:5002';

// Dashboard membre - VERSION CORRIGÉE
const MemberDashboard = ({ user, setCurrentPage }) => {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCotisations();
  }, []);

  const loadCotisations = async () => {
    try {
      const token = localStorage.getItem('afo_token');
      const response = await fetch(`${API_URL}/cotisations/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        // Trier par mois décroissant (plus récent d'abord)
        const sortedCotisations = data.data.sort((a, b) => 
          new Date(b.mois) - new Date(a.mois)
        );
        setCotisations(sortedCotisations);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Statistiques basées uniquement sur les cotisations générées
  const totalPaye = cotisations.filter(c => c.statut === 'payé').length;
  const totalEnAttente = cotisations.filter(c => c.statut === 'en_attente').length;
  const montantTotal = cotisations
    .filter(c => c.statut === 'payé')
    .reduce((sum, c) => sum + c.montant, 0);

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête avec accueil personnalisé */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-blue-400/50">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bienvenue, {user.prenom} !
              </h2>
              <p className="text-gray-400 text-lg">
                Voici un aperçu de votre espace membre
              </p>
            </div>
          </div>
        </div>

        {/* Cartes statistiques */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCardMember 
            icon={<UserCheck />} 
            title="Statut du compte" 
            value={user.statu} 
            gradient={user.statu === 'actif' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'}
            badge={user.statu === 'actif'}
          />
          <StatCardMember 
            icon={<Calendar />} 
            title="Type de cotisation" 
            value={user.cotisation === 'mensuel' ? 'Mensuelle' : 'Trimestrielle'} 
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCardMember 
            icon={<CheckCircle />} 
            title="Mois payés" 
            value={`${totalPaye}/${cotisations.length}`} 
            gradient="from-green-500 to-teal-500"
          />
          <StatCardMember 
            icon={<Clock />} 
            title="En attente" 
            value={`${totalEnAttente} mois`} 
            gradient="from-orange-500 to-red-500"
            alert={totalEnAttente > 0}
          />
        </div>

        {/* Montant total payé */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                  <span className="text-white text-lg font-bold">XOF</span>
                </div>

                <div>
                  <p className="text-amber-300 text-sm font-semibold uppercase tracking-wide">Total des contributions</p>
                  <p className="text-4xl font-black text-white">{montantTotal.toLocaleString()}</p>
                  <p className="text-amber-200/60 text-sm">Fcfa payés depuis votre adhésion</p>
                </div>
              </div>
              <div className="hidden md:block">
                <TrendingUp className="w-16 h-16 text-amber-400/30" />
              </div>
            </div>
          </div>
        </div>

        {/* Historique des cotisations - UNIQUEMENT LES COTISATIONS GÉNÉRÉES */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Mes cotisations</h3>
                <p className="text-gray-400 text-sm">
                  {cotisations.length > 0 
                    ? `${cotisations.length} cotisation(s) générée(s)`
                    : "Aucune cotisation pour le moment"}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-gray-400">Chargement de vos cotisations...</span>
              </div>
            </div>
          ) : cotisations.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/30 rounded-xl">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700 rounded-full mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Aucune cotisation</h3>
              <p className="text-gray-400">
                Les cotisations apparaîtront ici une fois générées par l'administrateur
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cotisations.map((cotisation) => (
                <CotisationCard key={cotisation._id} cotisation={cotisation} />
              ))}
            </div>
          )}
        </div>

        {/* Informations personnelles */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Informations personnelles</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <InfoCard icon={<User />} label="Nom complet" value={`${user.prenom} ${user.nom}`} color="blue" />
            <InfoCard icon={<Mail />} label="Email" value={user.email} color="purple" />
            <InfoCard icon={<Phone />} label="Téléphone" value={user.num} color="green" />
            <InfoCard icon={<Calendar />} label="Type de membre" value={user.cotisation === 'mensuel' ? 'Cotisation mensuelle' : 'Cotisation trimestrielle'} color="orange" />
          </div>
          
          <button
            onClick={() => setCurrentPage('edit-profile')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center space-x-2"
          >
            <UserCog className="w-5 h-5" />
            <span>Modifier mon profil</span>
          </button>
        </div>

        {/* Call to action pour cotisations en attente */}
        {totalEnAttente > 0 && (
          <div className="mt-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-red-300 font-bold text-lg">Cotisations en attente</p>
                  <p className="text-red-200/80 text-sm">
                    Vous avez {totalEnAttente} cotisation(s) en attente. Contactez l'administrateur pour régulariser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ NOUVEAU Composant carte de cotisation (remplace MonthCard)
const CotisationCard = ({ cotisation }) => {
  // Formater le mois
  const date = new Date(cotisation.mois + '-01');
  const monthName = date.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const isPaid = cotisation.statut === 'payé';

  return (
    <div
      className={`group relative p-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isPaid
          ? 'bg-green-500/10 border-2 border-green-500/30 hover:border-green-500/50'
          : 'bg-red-500/10 border-2 border-red-500/30 hover:border-red-500/50'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-white font-bold text-lg capitalize leading-tight mb-1">
            {monthName}
          </p>
          {isPaid ? (
            <div className="space-y-1">
              <p className="text-green-300 font-semibold text-sm">
                {cotisation.montant.toLocaleString()} Fcfa
              </p>
              {cotisation.datePaiement && (
                <p className="text-gray-400 text-xs flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Payé le {new Date(cotisation.datePaiement).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </p>
              )}
              {cotisation.methodePaiement && (
                <p className="text-gray-500 text-xs">
                  Via {cotisation.methodePaiement}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-red-300 text-sm font-medium">Non payé</p>
              <p className="text-red-400/80 text-xs">
                Montant: {cotisation.montant.toLocaleString()} Fcfa
              </p>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${
          isPaid ? 'bg-green-500/20' : 'bg-red-500/20'
        }`}>
          {isPaid ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400" />
          )}
        </div>
      </div>

      {/* Barre de progression décorative */}
      <div className={`h-1 w-0 group-hover:w-full rounded-full transition-all duration-500 ${
        isPaid 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
          : 'bg-gradient-to-r from-red-500 to-orange-500'
      }`}></div>
    </div>
  );
};

// Les autres composants restent identiques
const StatCardMember = ({ icon, title, value, gradient, badge, alert }) => (
  <div className="group relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>
    
    <div className="relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
          {React.cloneElement(icon, { className: 'w-6 h-6 text-white' })}
        </div>
        {badge && (
          <span className="px-2 py-1 bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-bold rounded-full">
            Actif
          </span>
        )}
        {alert && (
          <span className="animate-pulse">
            <AlertCircle className="w-5 h-5 text-orange-400" />
          </span>
        )}
      </div>
      
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className={`text-2xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent capitalize`}>
        {value}
      </p>
    </div>
  </div>
);

const InfoCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    orange: 'from-orange-500 to-red-500'
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all group">
      <div className="flex items-center space-x-3 mb-2">
        <div className={`w-8 h-8 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {React.cloneElement(icon, { className: 'w-4 h-4 text-white' })}
        </div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
      </div>
      <p className="text-white font-semibold text-lg pl-11">{value}</p>
    </div>
  );
};

export { MemberDashboard, StatCardMember, CotisationCard, InfoCard };


export default MemberDashboard
