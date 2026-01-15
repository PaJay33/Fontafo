import React, { useState, useEffect } from 'react';
import { History, User, CreditCard, Filter, Search, TrendingUp, Activity, AlertCircle, CheckCircle, XCircle, UserPlus, UserMinus, UserCheck, Ban, DollarSign } from 'lucide-react';
import { API_URL } from './api';

const HistoriquePage = ({ token }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAction, filterType, startDate, endDate, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20
      });

      if (filterAction) queryParams.append('action', filterAction);
      if (filterType) queryParams.append('targetType', filterType);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`${API_URL}/logs/all?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setLogs(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await fetch(`${API_URL}/logs/stats?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const filteredLogs = logs.filter(log =>
    searchTerm === '' ||
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.targetName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionIcon = (action) => {
    switch (action) {
      case 'MEMBRE_AJOUTE': return <UserPlus className="w-5 h-5 text-green-400" />;
      case 'MEMBRE_SUPPRIME': return <UserMinus className="w-5 h-5 text-red-400" />;
      case 'MEMBRE_MODIFIE': return <UserCheck className="w-5 h-5 text-blue-400" />;
      case 'MEMBRE_SUSPENDU': return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'MEMBRE_REACTIVE': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'MEMBRE_BANNI': return <Ban className="w-5 h-5 text-red-400" />;
      case 'COTISATION_GENEREE': return <DollarSign className="w-5 h-5 text-blue-400" />;
      case 'COTISATION_MARQUEE_PAYEE': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'COTISATIONS_GENEREES_MASSE': return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'TOUTES_COTISATIONS_SUPPRIMEES': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActionColor = (action) => {
    if (action.includes('SUPPRIME') || action.includes('BANNI')) return 'border-red-500/30 bg-red-500/10';
    if (action.includes('AJOUTE') || action.includes('REACTIVE') || action.includes('PAYEE')) return 'border-green-500/30 bg-green-500/10';
    if (action.includes('SUSPENDU')) return 'border-amber-500/30 bg-amber-500/10';
    if (action.includes('GENEREE')) return 'border-purple-500/30 bg-purple-500/10';
    return 'border-blue-500/30 bg-blue-500/10';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatActionLabel = (action) => {
    const labels = {
      'MEMBRE_AJOUTE': 'Membre ajouté',
      'MEMBRE_SUPPRIME': 'Membre supprimé',
      'MEMBRE_MODIFIE': 'Membre modifié',
      'MEMBRE_SUSPENDU': 'Membre suspendu',
      'MEMBRE_REACTIVE': 'Membre réactivé',
      'MEMBRE_BANNI': 'Membre banni',
      'COTISATION_GENEREE': 'Cotisation générée',
      'COTISATION_MARQUEE_PAYEE': 'Cotisation payée',
      'COTISATION_MODIFIEE': 'Cotisation modifiée',
      'COTISATIONS_GENEREES_MASSE': 'Cotisations en masse',
      'TOUTES_COTISATIONS_SUPPRIMEES': 'Toutes cotisations supprimées'
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <History className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-4xl font-black text-white">Historique des actions</h1>
              <p className="text-xs md:text-base text-gray-400">Traçabilité complète des opérations</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total actions</span>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {stats.actionStats.reduce((acc, curr) => acc + curr.count, 0)}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Actions membres</span>
                <User className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {stats.targetStats.find(s => s._id === 'USER')?.count || 0}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Actions cotisations</span>
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {stats.targetStats.find(s => s._id === 'COTISATION')?.count || 0}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Montant total</span>
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {stats.financialStats.totalMontant?.toLocaleString() || 0} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Filtres</h3>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Type d'action</label>
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="">Toutes les actions</option>
                <option value="MEMBRE_AJOUTE">Membre ajouté</option>
                <option value="MEMBRE_SUPPRIME">Membre supprimé</option>
                <option value="MEMBRE_MODIFIE">Membre modifié</option>
                <option value="COTISATION_MARQUEE_PAYEE">Cotisation payée</option>
                <option value="COTISATIONS_GENEREES_MASSE">Génération en masse</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Type de cible</label>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="">Tous les types</option>
                <option value="USER">Membres</option>
                <option value="COTISATION">Cotisations</option>
                <option value="SYSTEM">Système</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Date début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Date fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-sm mb-2">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par utilisateur, action, cible..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Liste des logs */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                <span className="text-gray-400">Chargement de l'historique...</span>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Aucune action trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-2 p-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log._id}
                    className={`rounded-xl p-4 border ${getActionColor(log.action)} hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="px-3 py-1 bg-slate-900/50 text-white text-xs font-semibold rounded-lg">
                              {formatActionLabel(log.action)}
                            </span>
                            <span className="text-gray-400 text-sm">{formatDate(log.createdAt)}</span>
                          </div>
                          <p className="text-white font-medium mb-1">{log.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{log.userName} ({log.userRole})</span>
                            </span>
                            {log.targetName && (
                              <span className="flex items-center space-x-1">
                                <span>→</span>
                                <span>{log.targetName}</span>
                              </span>
                            )}
                            {log.montant && (
                              <span className="flex items-center space-x-1 text-green-400 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                <span>{log.montant.toLocaleString()} FCFA</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            <span className="text-gray-400">
              Page {currentPage} sur {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriquePage;
