import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, User, CreditCard, Mail, Lock, CheckCircle, XCircle, Info, Phone, Send, UserCircle, FileText } from 'lucide-react';

// Configuration API
const API_URL = 'https://backafo.onrender.com';

// Page de demande d'adhésion améliorée
const AdhesionRequestPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    num: '',
    sexe: 'Male',
    mdp: '',
    confirmMdp: '',
    cotisation: 'mensuel'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculer la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, mdp: password });
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions et règlements pour continuer');
      return;
    }

    if (formData.mdp !== formData.confirmMdp) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.mdp.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      // Envoyer la demande au backend
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          num: formData.num,
          sexe: formData.sexe,
          mdp: formData.mdp,
          cotisation: formData.cotisation,
          statu: 'actif',
          role: 'membre'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        // Gérer les erreurs de validation du backend
        if (data.message) {
          setError(data.message);
        } else if (data.error) {
          // Si l'erreur contient des détails de validation Mongoose
          if (typeof data.error === 'object' && data.error.errors) {
            // Extraire le premier message d'erreur de validation
            const firstError = Object.values(data.error.errors)[0];
            setError(firstError.message || 'Erreur de validation');
          } else if (typeof data.error === 'string') {
            setError(data.error);
          } else {
            setError('Erreur lors de la création du compte');
          }
        } else {
          setError('Erreur lors de la création du compte');
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setError('Erreur de connexion au serveur. Vérifiez que le backend est lancé.');
    } finally {
      setLoading(false);
    }
  };

  // Page de succès
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Arrière-plan animé */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30 text-center shadow-2xl shadow-green-500/10">
            {/* Icône de succès animée */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                <CheckCircle className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>

            <h2 className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Demande envoyée !
            </h2>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Votre demande d'adhésion a été transmise avec succès. 
              Un administrateur l'examinera dans les plus brefs délais. 
              Vous recevrez un email de confirmation.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-blue-300 text-sm font-semibold">Prochaines étapes</p>
                  <ul className="text-blue-200/80 text-sm mt-2 space-y-1">
                    <li>• Vérification de votre demande (24-48h)</li>
                    <li>• Notification par email</li>
                    <li>• Accès à votre espace membre</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentPage('home')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/50"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
              <img 
                src="/logo1.jpeg" 
                alt="AFO Logo" 
                className="relative w-20 h-20 rounded-full border-2 border-blue-400/50"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Rejoignez-nous
          </h1>
          <p className="text-gray-400 text-lg">
            Devenez membre d'All For One et contribuez à changer des vies
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 animate-shake">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">Erreur</p>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-6">
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
                placeholder="votre@email.com"
              />

              <ModernInputField 
                label="Téléphone" 
                type="tel" 
                value={formData.num} 
                onChange={(e) => setFormData({ ...formData, num: e.target.value })} 
                required 
                icon={<Phone className="w-4 h-4" />}
                placeholder="+33612345678"
              />

              <div className="grid md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-green-400" />
                    <span>Type de cotisation</span>
                  </label>
                  <select
                    value={formData.cotisation}
                    onChange={(e) => setFormData({ ...formData, cotisation: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  >
                    <option value="mensuel">Mensuelle (3000 XOF/mois)</option>
                    <option value="trimestriel">Trimestrielle (9000 XOF/3mois)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div className="space-y-6 pt-6 border-t border-slate-700">
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Sécurité</h3>
              </div>

              <div className="space-y-2">
                <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Mot de passe</span>
                </label>
                <input
                  type="password"
                  value={formData.mdp}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Minimum 8 caractères"
                  className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                />
                {/* Indicateur de force du mot de passe */}
                {formData.mdp && (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      Force: {passwordStrength <= 2 ? 'Faible' : passwordStrength <= 3 ? 'Moyenne' : 'Forte'}
                    </p>
                  </div>
                )}
              </div>

              <ModernInputField 
                label="Confirmer le mot de passe" 
                type="password" 
                value={formData.confirmMdp} 
                onChange={(e) => setFormData({ ...formData, confirmMdp: e.target.value })} 
                required 
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            {/* Conditions et règlements */}
            <div className="space-y-4 pt-6 border-t border-slate-700">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Conditions et règlements</h3>
              </div>

              <div className="bg-slate-800/50 border border-blue-800/30 rounded-xl p-6 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="space-y-4 text-gray-300 text-sm">
                  <div>
                    <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span>1. Engagement associatif</span>
                    </h4>
                    <p className="leading-relaxed">
                      En devenant membre d'AFO, vous vous engagez à participer activement aux actions de l'association 
                      et à respecter ses valeurs de sincérité, solidarité, discrétion et foi.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>2. Cotisations</span>
                    </h4>
                    <p className="leading-relaxed">
                      Les cotisations doivent être payées selon le rythme choisi (mensuel ou trimestriel). 
                      Le non-paiement répété peut entraîner la suspension temporaire de l'adhésion.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>3. Confidentialité</span>
                    </h4>
                    <p className="leading-relaxed">
                      Les informations des bénéficiaires et les actions de l'association doivent rester confidentielles 
                      pour protéger la dignité de chacun.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-orange-400" />
                      <span>4. Utilisation des données</span>
                    </h4>
                    <p className="leading-relaxed">
                      Vos données personnelles sont utilisées uniquement dans le cadre des activités de l'association 
                      et ne seront jamais partagées avec des tiers.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-white mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-pink-400" />
                      <span>5. Code de conduite</span>
                    </h4>
                    <p className="leading-relaxed">
                      Tout comportement contraire aux valeurs de l'association ou nuisant à son image 
                      peut entraîner l'exclusion immédiate du membre.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox d'acceptation */}
              <label className="flex items-start space-x-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-6 h-6 border-2 border-blue-500/50 rounded-lg peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 peer-checked:border-transparent transition-all duration-300 flex items-center justify-center">
                    {acceptedTerms && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                    J'accepte les conditions et règlements
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    En cochant cette case, vous acceptez de respecter les règles de l'association AFO.{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Lire les détails
                    </button>
                  </p>
                </div>
              </label>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="relative w-full group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 group-disabled:opacity-50"></div>
              
              <div className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer ma demande</span>
                  </>
                )}
                
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              </div>
            </button>
          </form>

          {/* Note de bas de page */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-semibold">Traitement de votre demande</p>
              <p className="text-blue-200/80 text-sm mt-1">
                Votre demande sera examinée sous 24 à 48 heures. Vous recevrez un email dès qu'un administrateur aura validé votre adhésion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal des conditions (optionnel) */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-blue-500/30">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Conditions et règlements</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {/* Contenu détaillé des conditions */}
              <div className="space-y-6 text-gray-300">
                <p className="leading-relaxed">
                  En soumettant cette demande d'adhésion, vous acceptez de respecter l'ensemble 
                  des règles et conditions de l'association All For One (AFO).
                </p>
                {/* Ajoutez ici le contenu complet de vos conditions */}
              </div>
            </div>
            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-transform"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
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

// Style pour la scrollbar personnalisée
const scrollbarStyle = document.createElement('style');
scrollbarStyle.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, rgb(59, 130, 246), rgb(147, 51, 234));
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, rgb(37, 99, 235), rgb(126, 34, 206));
  }
`;
document.head.appendChild(scrollbarStyle);


export default AdhesionRequestPage
