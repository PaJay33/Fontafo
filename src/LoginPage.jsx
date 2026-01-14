import React, { useState} from 'react';
import { LogIn, Heart, ShieldAlert, ShieldCheck, Key, ChevronLeft, Send, Eye, CheckCircle, XCircle, Mail, Lock, EyeOff, Info } from 'lucide-react';

// Configuration API
const API_URL = 'https://backafo.onrender.com';

// Page de connexion avec mot de passe oublié
const LoginPage = ({ setCurrentPage, setUser, setToken }) => {
  const [formData, setFormData] = useState({ email: '', mdp: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ États pour mot de passe oublié
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetData, setResetData] = useState({
    resetCode: '',
    nouveauMdp: '',
    confirmMdp: ''
  });
  const [displayedResetCode, setDisplayedResetCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.statu === 'suspendu') {
          setError('Votre compte est suspendu. Contactez l\'administration.');
          setLoading(false);
          return;
        }

        if (data.data.statu === 'bani') {
          setError('Votre compte est banni.');
          setLoading(false);
          return;
        }

        localStorage.setItem('afo_token', data.token);
        localStorage.setItem('afo_user', JSON.stringify(data.data));
        setToken(data.token);
        setUser(data.data);
        setCurrentPage('dashboard');
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Demander un code de réinitialisation
  const handleRequestReset = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!resetEmail) {
      setError('Veuillez entrer votre adresse email');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (data.success) {
        setResetCodeSent(true);
        if (data.resetCode) {
          setDisplayedResetCode(data.resetCode); // Pour le dev
        }
        setSuccess(`✅ ${data.message}`);
      } else {
        setError(data.message || 'Erreur lors de l\'envoi du code');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Réinitialiser le mot de passe avec le code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          resetCode: resetData.resetCode.trim(),
          nouveauMdp: resetData.nouveauMdp
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Mot de passe réinitialisé avec succès !');
        
        // Réinitialiser et fermer après 2 secondes
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetCodeSent(false);
          setResetEmail('');
          setResetData({ resetCode: '', nouveauMdp: '', confirmMdp: '' });
          setDisplayedResetCode('');
          setSuccess('');
        }, 2000);
      } else {
        setError(data.message || 'Code invalide ou expiré');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* En-tête avec logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/logo1.jpeg" 
                alt="AFO Logo" 
                className="relative w-20 h-20 rounded-full border-2 border-blue-400/50"
              />
            </div>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Bienvenue
          </h1>
          <p className="text-gray-400">Connectez-vous à votre espace AFO</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
          {/* Messages */}
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

          {!showForgotPassword ? (
            <>
              {/* Formulaire de connexion */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champ Email */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Adresse email</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="votre@email.com"
                      className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/10 group-focus-within:to-purple-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>

                {/* Champ Mot de passe */}
                <div className="space-y-2">
                  <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>Mot de passe</span>
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.mdp}
                      onChange={(e) => setFormData({ ...formData, mdp: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-focus-within:from-purple-500/10 group-focus-within:to-pink-500/10 pointer-events-none transition-all duration-300"></div>
                  </div>
                </div>

                {/* ✅ Lien Mot de passe oublié */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-semibold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full group overflow-hidden"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 group-disabled:opacity-50"></div>
                  
                  <div className="relative w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 group-disabled:opacity-70">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Connexion...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        <span>Se connecter</span>
                      </>
                    )}
                    
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  </div>
                </button>
              </form>

              {/* Séparateur */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900 text-gray-500 font-medium">Ou</span>
                </div>
              </div>

              {/* Lien vers adhésion */}
              <div className="text-center space-y-4">
                <p className="text-gray-400 text-sm">
                  Vous n'avez pas encore de compte ?
                </p>
                <button
                  onClick={() => setCurrentPage('adhesion')}
                  className="w-full px-6 py-3 bg-slate-800/50 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-500/50 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Faire une demande d'adhésion</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* ✅ Interface Mot de passe oublié */}
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetCodeSent(false);
                    setResetEmail('');
                    setResetData({ resetCode: '', nouveauMdp: '', confirmMdp: '' });
                    setError('');
                    setSuccess('');
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Retour à la connexion</span>
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mot de passe oublié</h3>
                  <p className="text-gray-400 text-sm">
                    {!resetCodeSent 
                      ? "Entrez votre email pour recevoir un code de réinitialisation"
                      : "Entrez le code reçu par email et votre nouveau mot de passe"
                    }
                  </p>
                </div>

                {!resetCodeSent ? (
                  <div className="space-y-6">
                    <ModernInputField
                      label="Adresse email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="votre@email.com"
                      icon={<Mail className="w-4 h-4" />}
                    />

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
                          <span>Recevoir le code</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-6">
                    {displayedResetCode && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-300 font-bold text-sm text-center">
                          🔧 Code de dev: {displayedResetCode}
                        </p>
                      </div>
                    )}

                    <ModernInputField
                      label="Code de sécurité (6 chiffres)"
                      type="text"
                      value={resetData.resetCode}
                      onChange={(e) => setResetData({ ...resetData, resetCode: e.target.value })}
                      required
                      placeholder="000000"
                      maxLength="6"
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
                      label="Confirmer le mot de passe"
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
                        Renvoyer
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>...</span>
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
            </>
          )}
        </div>

        {/* Message d'information */}
        {!showForgotPassword && (
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-semibold">Première connexion ?</p>
              <p className="text-blue-200/80 text-sm mt-1">
                Votre demande d'adhésion doit être approuvée par un administrateur avant de pouvoir vous connecter.
              </p>
            </div>
          </div>
        )}
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



export default LoginPage
