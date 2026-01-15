import React, { useState } from 'react';
import {Shield,User, CheckCircle, XCircle, AlertCircle, ChevronRight, Mail, Lock, Info, Phone, Send, UserCircle, ShieldAlert, ShieldCheck, Key, Save, ChevronLeft, UserCog} from 'lucide-react';
import { API_URL } from './api';

// EditProfilePage avec gestion sécurisée du mot de passe
const EditProfilePage = ({ user, token, setUser, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    nom: user.nom || '',
    prenom: user.prenom || '',
    email: user.email || '',
    num: user.num || '',
    sexe: user.sexe || 'Male'
  });

  const [passwordMode, setPasswordMode] = useState(null); // null, 'change', 'reset'
  const [passwordData, setPasswordData] = useState({
    ancienMdp: '',
    nouveauMdp: '',
    confirmMdp: ''
  });
  const [resetData, setResetData] = useState({
    resetCode: '',
    nouveauMdp: '',
    confirmMdp: ''
  });
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [displayedResetCode, setDisplayedResetCode] = useState(''); // Pour affichage dev

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mettre à jour le profil (sans mot de passe)
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('afo_user', JSON.stringify(updatedUser));
        setSuccess('✅ Profil mis à jour avec succès !');

        setTimeout(() => {
          setCurrentPage('dashboard');
        }, 2000);
      } else {
        // Gérer les erreurs de validation du backend
        if (data.message) {
          setError(data.message);
        } else if (data.error) {
          // Si l'erreur contient des détails de validation Mongoose
          if (typeof data.error === 'object' && data.error.errors) {
            // Extraire tous les messages d'erreur de validation
            const errorMessages = Object.values(data.error.errors)
              .map(err => err.message)
              .join(', ');
            setError(errorMessages || 'Erreur de validation');
          } else if (typeof data.error === 'string') {
            setError(data.error);
          } else {
            setError('Erreur lors de la mise à jour');
          }
        } else {
          setError('Erreur lors de la mise à jour');
        }
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Changer le mot de passe (avec ancien mot de passe)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.nouveauMdp !== passwordData.confirmMdp) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.nouveauMdp.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/${user._id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ancienMdp: passwordData.ancienMdp,
          nouveauMdp: passwordData.nouveauMdp
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Mot de passe modifié avec succès !');
        setPasswordData({ ancienMdp: '', nouveauMdp: '', confirmMdp: '' });
        setPasswordMode(null);
      } else {
        // Gérer les erreurs de validation du backend
        if (data.message) {
          setError(data.message);
        } else if (data.error) {
          if (typeof data.error === 'object' && data.error.errors) {
            const errorMessages = Object.values(data.error.errors)
              .map(err => err.message)
              .join(', ');
            setError(errorMessages || 'Erreur de validation');
          } else if (typeof data.error === 'string') {
            setError(data.error);
          } else {
            setError('Erreur lors du changement de mot de passe');
          }
        } else {
          setError('Erreur lors du changement de mot de passe');
        }
      }
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // Demander un code de réinitialisation
  // Dans EditProfilePage - Fonction handleRequestReset corrigée

const handleRequestReset = async () => {
  setError('');
  setSuccess('');
  setLoading(true);

  console.log('📤 Envoi de la demande de réinitialisation...');
  console.log('📧 Email:', user.email);

  try {
    const response = await fetch(`${API_URL}/users/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: user.email })
    });

    console.log('📥 Réponse reçue:', response.status);

    const data = await response.json();
    console.log('📦 Données reçues:', data);

    if (data.success) {
      setResetCodeSent(true);
      
      // Stocker le code pour l'affichage (dev uniquement)
      if (data.resetCode) {
        setDisplayedResetCode(data.resetCode);
        console.log('✅ Code de réinitialisation:', data.resetCode);
      }
      
      setSuccess(`✅ ${data.message}`);
    } else {
      setError(data.message || 'Erreur lors de l\'envoi du code');
      console.error('❌ Erreur:', data.message);
    }
  } catch (err) {
    console.error('❌ Erreur de connexion:', err);
    setError('Erreur de connexion au serveur. Vérifiez que le backend est lancé.');
  } finally {
    setLoading(false);
  }
};

  // Réinitialiser le mot de passe avec le code
  // Dans EditProfilePage - Fonction handleResetPassword améliorée

const handleResetPassword = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  // Validations
  if (!resetData.resetCode || resetData.resetCode.length !== 6) {
    setError('Le code doit contenir exactement 6 chiffres');
    return;
  }

  if (resetData.nouveauMdp !== resetData.confirmMdp) {
    setError('Les mots de passe ne correspondent pas');
    return;
  }

  if (resetData.nouveauMdp.length < 8) {
    setError('Le mot de passe doit contenir au moins 8 caractères');
    return;
  }

  setLoading(true);

  console.log('========================================');
  console.log('📤 Envoi de la réinitialisation');
  console.log('📧 Email:', user.email);
  console.log('🔑 Code saisi:', resetData.resetCode);
  console.log('========================================');

  try {
    const response = await fetch(`${API_URL}/users/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        resetCode: resetData.resetCode.trim(), // Enlever les espaces
        nouveauMdp: resetData.nouveauMdp
      })
    });

    const data = await response.json();
    console.log('📥 Réponse:', data);

    if (data.success) {
      setSuccess('✅ Mot de passe réinitialisé avec succès !');
      setResetData({ resetCode: '', nouveauMdp: '', confirmMdp: '' });
      setResetCodeSent(false);
      setDisplayedResetCode('');
      setPasswordMode(null);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 2000);
    } else {
      setError(data.message || 'Code invalide ou expiré');
      console.error('❌ Erreur:', data.message);
    }
  } catch (err) {
    console.error('❌ Erreur de connexion:', err);
    setError('Erreur de connexion au serveur');
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

      <div className="max-w-3xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Retour au tableau de bord</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <UserCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white">Modifier mon profil</h2>
              <p className="text-gray-400">Mettre à jour vos informations personnelles</p>
            </div>
          </div>
        </div>

        {/* Messages globaux */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 animate-shake">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Erreur</p>
              <p className="text-red-300/80 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-semibold text-sm">Succès</p>
              <p className="text-green-300/80 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Formulaire de profil */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10 mb-6">
          <form onSubmit={handleSubmitProfile} className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Informations personnelles</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ModernInputField
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                icon={<User className="w-4 h-4" />}
              />
              <ModernInputField
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                icon={<User className="w-4 h-4" />}
              />
            </div>

            <ModernInputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              icon={<Mail className="w-4 h-4" />}
            />

            <ModernInputField
              label="Téléphone"
              type="tel"
              value={formData.num}
              onChange={(e) => setFormData({ ...formData, num: e.target.value })}
              required
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="space-y-2">
              <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                <UserCircle className="w-4 h-4 text-purple-400" />
                <span>Sexe</span>
              </label>
              <select
                value={formData.sexe}
                onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              >
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentPage('dashboard')}
                className="flex-1 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Section Mot de passe */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-purple-800/30 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center space-x-2 mb-6">
            <Lock className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Sécurité du compte</h3>
          </div>

          {!passwordMode ? (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                Choisissez comment vous souhaitez modifier votre mot de passe
              </p>
              
              <button
                onClick={() => setPasswordMode('change')}
                className="w-full p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl hover:border-blue-500 transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Key className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Changer mon mot de passe</p>
                      <p className="text-gray-400 text-sm">Je connais mon mot de passe actuel</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setPasswordMode('reset')}
                className="w-full p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl hover:border-amber-500 transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Mot de passe oublié</p>
                      <p className="text-gray-400 text-sm">Réinitialiser avec un code de sécurité</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </div>
              </button>
            </div>
          ) : passwordMode === 'change' ? (
            <div className="space-y-6">
              <button
                onClick={() => setPasswordMode(null)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start space-x-2">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-200/90 text-sm">
                      Pour changer votre mot de passe, vous devez d'abord saisir votre mot de passe actuel.
                    </p>
                  </div>
                </div>

                <ModernInputField
                  label="Mot de passe actuel"
                  type="password"
                  value={passwordData.ancienMdp}
                  onChange={(e) => setPasswordData({ ...passwordData, ancienMdp: e.target.value })}
                  required
                  icon={<Lock className="w-4 h-4" />}
                />

                <ModernInputField
                  label="Nouveau mot de passe"
                  type="password"
                  value={passwordData.nouveauMdp}
                  onChange={(e) => setPasswordData({ ...passwordData, nouveauMdp: e.target.value })}
                  required
                  placeholder="Minimum 8 caractères"
                  icon={<Key className="w-4 h-4" />}
                />

                <ModernInputField
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  value={passwordData.confirmMdp}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmMdp: e.target.value })}
                  required
                  icon={<Key className="w-4 h-4" />}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Changement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Changer le mot de passe</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setPasswordMode(null);
                  setResetCodeSent(false);
                  setResetData({ resetCode: '', nouveauMdp: '', confirmMdp: '' });
                }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>

              {!resetCodeSent ? (
                <div className="space-y-6">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 font-semibold text-sm mb-1">Réinitialisation sécurisée</p>
                        <p className="text-amber-200/90 text-sm">
                          Un code de sécurité à 6 chiffres sera envoyé à votre adresse email <strong>{user.email}</strong>. 
                          Ce code expire après 10 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRequestReset}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Recevoir le code de sécurité</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-300 font-semibold text-sm mb-1">Code envoyé !</p>
                        <p className="text-green-200/90 text-sm">
                          Vérifiez votre email <strong>{user.email}</strong> pour récupérer le code à 6 chiffres.
                        </p>
                        {/* UNIQUEMENT POUR LE DÉVELOPPEMENT */}
                        {displayedResetCode && (
                          <p className="text-yellow-300 font-bold text-sm mt-2 bg-yellow-500/20 p-2 rounded">
                            🔧 Code de dev: {displayedResetCode}
                          </p>
                        )}
                      </div>
                    </div>
</div>

                  <ModernInputField
                    label="Code de sécurité (6 chiffres)"
                    type="text"
                    value={resetData.resetCode}
                    onChange={(e) => setResetData({ ...resetData, resetCode: e.target.value })}
                    required
                    placeholder="000000"
                    maxLength={6}
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />

                  <ModernInputField
                    label="Nouveau mot de passe"
                    type="password"
                    value={resetData.nouveauMdp}
                    onChange={(e) => setResetData({ ...resetData, nouveauMdp: e.target.value })}
                    required
                    placeholder="Minimum 8 caractères"
                    icon={<Key className="w-4 h-4" />}
                  />

                  <ModernInputField
                    label="Confirmer le nouveau mot de passe"
                    type="password"
                    value={resetData.confirmMdp}
                    onChange={(e) => setResetData({ ...resetData, confirmMdp: e.target.value })}
                    required
                    icon={<Key className="w-4 h-4" />}
                  />

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setResetCodeSent(false);
                        setResetData({ resetCode: '', nouveauMdp: '', confirmMdp: '' });
                      }}
                      className="flex-1 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Renvoyer le code
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Réinitialisation...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Réinitialiser</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Informations de compte */}
        <div className="mt-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-2">Informations de compte</p>
              <div className="space-y-1 text-sm text-gray-400">
                <p>• Rôle: <span className="text-blue-400 font-semibold">{user.role}</span></p>
                <p>• Statut: <span className={`font-semibold ${user.statu === 'actif' ? 'text-green-400' : 'text-red-400'}`}>{user.statu}</span></p>
                <p>• Type de cotisation: <span className="text-purple-400 font-semibold capitalize">{user.cotisation}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Conseils de sécurité */}
        <div className="mt-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-2">Conseils de sécurité</p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400">•</span>
                  <span>Utilisez un mot de passe unique d'au moins 8 caractères</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400">•</span>
                  <span>Mélangez lettres majuscules, minuscules, chiffres et symboles</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400">•</span>
                  <span>Ne partagez jamais votre mot de passe avec qui que ce soit</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400">•</span>
                  <span>Changez votre mot de passe régulièrement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant InputField moderne
const ModernInputField = ({ label, type = 'text', value, onChange, required = false, placeholder = '', icon }) => (
  <div className="space-y-2">
    <label className="block text-white font-semibold text-sm flex items-center space-x-2">
      {icon && <span className="text-blue-400">{icon}</span>}
      <span>{label}</span>
    </label>
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 pointer-events-none transition-all duration-300"></div>
    </div>
  </div>
);

export default EditProfilePage
