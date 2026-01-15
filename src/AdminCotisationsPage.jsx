import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Users, Download, X, User, CreditCard, CheckCircle, Search, BarChart,  ChevronRight, DollarSign, Clock, Calendar, Mail, FileText} from 'lucide-react';
import { generateMonthlyReport, generateGlobalReport } from './pdfExport';
import { API_URL } from './api';

const AdminCotisationsPage = ({ token }) => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [allCotisations, setAllCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('global');

  // Charger toutes les cotisations
  const loadAllCotisations = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/cotisations/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAllCotisations(data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, [token]);

  const loadMembers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMembers(data.data.filter(m => m.role !== 'Admin'));
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMembers();
    loadAllCotisations();
  }, [loadMembers, loadAllCotisations]);

  const loadMemberCotisations = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/cotisations/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCotisations(data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMarquerPaye = async (cotisationId) => {
    try {
      const response = await fetch(`${API_URL}/cotisations/${cotisationId}/payer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ methodePaiement: 'espèces' })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Cotisation marquée comme payée');
        
        if (viewMode === 'member' && selectedMember) {
          loadMemberCotisations(selectedMember._id);
        }
        loadAllCotisations();
      }
    } catch (error) {
      alert('❌ Erreur lors du marquage');
    }
  };

  const filteredMembers = members.filter(member =>
    searchTerm === '' ||
    member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsGlobal = {
    totalCotisations: allCotisations.length,
    totalPaye: allCotisations.filter(c => c.statut === 'payé').length,
    totalEnAttente: allCotisations.filter(c => c.statut === 'en_attente').length,
    montantTotal: allCotisations
      .filter(c => c.statut === 'payé')
      .reduce((sum, c) => sum + c.montant, 0),
    montantAttendu: allCotisations
      .filter(c => c.statut === 'en_attente')
      .reduce((sum, c) => sum + c.montant, 0)
  };

  const getStatsByMonth = () => {
    const statsByMonth = {};
    
    allCotisations.forEach(cotisation => {
      const mois = cotisation.mois;
      if (!statsByMonth[mois]) {
        statsByMonth[mois] = {
          mois: mois,
          total: 0,
          payes: 0,
          enAttente: 0,
          montantPaye: 0,
          montantAttendu: 0
        };
      }
      
      statsByMonth[mois].total++;
      
      if (cotisation.statut === 'payé') {
        statsByMonth[mois].payes++;
        statsByMonth[mois].montantPaye += cotisation.montant;
      } else {
        statsByMonth[mois].enAttente++;
        statsByMonth[mois].montantAttendu += cotisation.montant;
      }
    });
    
    return Object.values(statsByMonth).sort((a, b) => 
      new Date(b.mois) - new Date(a.mois)
    );
  };

  const monthlyStats = getStatsByMonth();

  const totalPaye = cotisations.filter(c => c.statut === 'payé').length;
  const totalEnAttente = cotisations.filter(c => c.statut === 'en_attente').length;
  const montantTotal = cotisations.filter(c => c.statut === 'payé').reduce((sum, c) => sum + c.montant, 0);

  return (
    <div className="min-h-screen py-8 md:py-16 px-3 md:px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-4xl font-black text-white">Gestion Cotisations</h2>
                <p className="text-xs md:text-base text-gray-400">Vue d'ensemble et suivi</p>
              </div>
            </div>

            {/* Toggle entre vue globale et vue membre */}
            <div className="flex space-x-1 md:space-x-2 bg-slate-800 rounded-lg md:rounded-xl p-1">
              <button
                onClick={() => {
                  setViewMode('global');
                  setSelectedMember(null);
                }}
                className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all flex items-center space-x-1 md:space-x-2 ${
                  viewMode === 'global'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart className="w-4 h-4" />
                <span>Vue globale</span>
              </button>
              <button
                onClick={() => setViewMode('member')}
                className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all flex items-center space-x-1 md:space-x-2 ${
                  viewMode === 'member'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Par membre</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-400">Chargement...</span>
            </div>
          </div>
        ) : (
          <>
            {/* VUE GLOBALE */}
            {viewMode === 'global' ? (
              <>
                {/* Statistiques globales */}
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-blue-400 text-sm font-semibold">Total cotisations</p>
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="text-3xl font-black text-white">{statsGlobal.totalCotisations}</p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-green-400 text-sm font-semibold">Payées</p>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-3xl font-black text-white">{statsGlobal.totalPaye}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {statsGlobal.totalCotisations > 0 
                        ? Math.round((statsGlobal.totalPaye / statsGlobal.totalCotisations) * 100)
                        : 0}% du total
                    </p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-red-400 text-sm font-semibold">En attente</p>
                      <Clock className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-3xl font-black text-white">{statsGlobal.totalEnAttente}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {statsGlobal.totalCotisations > 0 
                        ? Math.round((statsGlobal.totalEnAttente / statsGlobal.totalCotisations) * 100)
                        : 0}% du total
                    </p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-amber-400 text-sm font-semibold">Montant payé</p>
                      <DollarSign className="w-6 h-6 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{statsGlobal.montantTotal.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Fcfa</p>
                  </div>

                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-orange-400 text-sm font-semibold">Montant attendu</p>
                      <TrendingUp className="w-6 h-6 text-orange-400" />
                    </div>
                    <p className="text-2xl font-black text-white">{statsGlobal.montantAttendu.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Fcfa</p>
                  </div>
                </div>

                {/* Statistiques par mois */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Statistiques par mois</h3>
                        <p className="text-gray-400 text-sm">{monthlyStats.length} mois enregistré(s)</p>
                      </div>
                    </div>
                    
                    {/* ✅ Bouton export global */}
                    {monthlyStats.length > 0 && (
                      <button
                        onClick={() => generateGlobalReport(monthlyStats, allCotisations, members, statsGlobal)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center space-x-2 shadow-lg shadow-green-500/50"
                      >
                        <Download className="w-5 h-5" />
                        <span>Rapport Global PDF</span>
                      </button>
                    )}
                  </div>

                  {monthlyStats.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Aucune cotisation générée</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {monthlyStats.map((stat) => (
                        <div key={stat.mois} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white capitalize">
                                {new Date(stat.mois + '-01').toLocaleDateString('fr-FR', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </h4>
                              <p className="text-gray-400 text-sm">{stat.total} cotisation(s) générée(s)</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-white">
                                {stat.montantPaye.toLocaleString()} <span className="text-sm text-gray-500">Fcfa</span>
                              </p>
                              <p className="text-gray-400 text-sm">
                                {stat.payes}/{stat.total} payées
                              </p>
                            </div>
                          </div>

                          {/* Barre de progression */}
                          <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${(stat.payes / stat.total) * 100}%` }}
                            ></div>
                          </div>

                          {/* Détails */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                              <p className="text-green-400 text-xs font-semibold mb-1">Payées</p>
                              <p className="text-green-100 font-bold text-lg">{stat.payes}</p>
                              <p className="text-green-300 text-xs">{stat.montantPaye.toLocaleString()} Fcfa</p>
                            </div>
                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                              <p className="text-red-400 text-xs font-semibold mb-1">En attente</p>
                              <p className="text-red-100 font-bold text-lg">{stat.enAttente}</p>
                              <p className="text-red-300 text-xs">{stat.montantAttendu.toLocaleString()} Fcfa</p>
                            </div>
                            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                              <p className="text-blue-400 text-xs font-semibold mb-1">Taux</p>
                              <p className="text-blue-100 font-bold text-lg">
                                {Math.round((stat.payes / stat.total) * 100)}%
                              </p>
                              <p className="text-blue-300 text-xs">de réussite</p>
                            </div>
                          </div>

                          {/* ✅ Bouton d'export mensuel */}
                          <div className="pt-4 border-t border-slate-700">
                            <button
                              onClick={() => generateMonthlyReport(stat, allCotisations, members)}
                              className="w-full px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all flex items-center justify-center space-x-2 font-semibold text-sm"
                            >
                              <Download className="w-4 h-4" />
                              <span>Télécharger le rapport PDF de ce mois</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* VUE PAR MEMBRE */
              <>
                {/* Sélection des membres */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Sélectionner un membre</h3>
                    <span className="text-gray-400">{filteredMembers.length} membre(s)</span>
                  </div>

                  {/* Barre de recherche */}
                  <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, prénom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>

                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Aucun membre trouvé</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMembers.map((member) => (
                        <button
                          key={member._id}
                          onClick={() => {
                            setSelectedMember(member);
                            loadMemberCotisations(member._id);
                          }}
                          className={`group bg-slate-800/50 p-5 rounded-xl border transition-all text-left transform hover:-translate-y-1 ${
                            selectedMember?._id === member._id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-700 hover:border-blue-500/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold">{member.prenom} {member.nom}</p>
                              <p className="text-gray-500 text-xs">{member.sexe === 'Male' ? 'Homme' : 'Femme'}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-400 text-sm flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{member.email}</span>
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                member.cotisation === 'mensuel'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {member.cotisation === 'mensuel' ? 'Mensuelle' : 'Trimestrielle'}
                              </span>
                              <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-all ${
                                selectedMember?._id === member._id ? 'transform rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Détails des cotisations du membre sélectionné */}
                {selectedMember && (
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-green-800/30 shadow-2xl shadow-green-500/10">
                    {/* En-tête avec infos membre */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-slate-700">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {selectedMember.prenom} {selectedMember.nom}
                          </h3>
                          <p className="text-gray-400">{selectedMember.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedMember(null)}
                        className="text-gray-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-all"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Statistiques du membre */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-400 text-sm">Payées</p>
                            <p className="text-2xl font-black text-white">{totalPaye}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-red-400 text-sm">En attente</p>
                            <p className="text-2xl font-black text-white">{totalEnAttente}</p>
                          </div>
                          <Clock className="w-8 h-8 text-red-400" />
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-400 text-sm">Total payé</p>
                            <p className="text-2xl font-black text-white">{montantTotal.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Fcfa</p>
                          </div>
                          <DollarSign className="w-8 h-8 text-amber-400" />
                        </div>
                      </div>
                    </div>

                    {/* Tableau des cotisations */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left text-gray-400 py-3 px-4 font-semibold">Mois</th>
                            <th className="text-left text-gray-400 py-3 px-4 font-semibold">Montant</th>
                            <th className="text-left text-gray-400 py-3 px-4 font-semibold">Statut</th>
                            <th className="text-left text-gray-400 py-3 px-4 font-semibold">Date paiement</th>
                            <th className="text-left text-gray-400 py-3 px-4 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cotisations.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="text-center py-12">
                                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400">Aucune cotisation enregistrée</p>
                              </td>
                            </tr>
                          ) : (
                            cotisations.map((cotisation) => (
                              <tr key={cotisation._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <span className="text-white font-medium capitalize">
                                      {new Date(cotisation.mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-gray-300 font-semibold">{cotisation.montant.toLocaleString()}</span>
                                  <span className="text-gray-500 text-sm ml-1">Fcfa</span>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${
                                    cotisation.statut === 'payé'
                                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                      : 'bg-red-500/20 text-red-300 border-red-500/30'
                                  }`}>
                                    {cotisation.statut === 'payé' ? (
                                      <CheckCircle className="w-3 h-3" />
                                    ) : (
                                      <Clock className="w-3 h-3" />
                                    )}
                                    <span className="capitalize">{cotisation.statut}</span>
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  {cotisation.datePaiement ? (
                                    <span className="text-gray-300 text-sm">
                                      {new Date(cotisation.datePaiement).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                      })}</span>
                                  ) : (
                                    <span className="text-gray-500 italic text-sm">Non payée</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  {cotisation.statut !== 'payé' && (
                                    <button
                                      onClick={() => handleMarquerPaye(cotisation._id)}
                                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold text-sm flex items-center space-x-1"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Marquer payé</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCotisationsPage
