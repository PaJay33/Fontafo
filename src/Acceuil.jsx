import React, { useState, useEffect } from 'react';
import { Users, Heart, Shield, BookOpen, Menu, X, User, LogOut, CreditCard, Home,
    LogIn, LayoutDashboard, PlusCircle, ChevronDown, GraduationCap, Pencil, Backpack, School,
    Calculator, TrendingUp  } from 'lucide-react';



import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminMembersPage from './AdminMembersPage';
import AdminCotisationsPage from './AdminCotisationsPage';
import GenererCotisationsPage from './GenererCotisationsPage';
import EditProfilePage from './EditProfilePage';
import Footer from './Footer';




// Configuration API
const API_URL = 'http://localhost:5002';

// Composant principal
const Acceuil = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('afo_token');
    const storedUser = localStorage.getItem('afo_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('afo_token');
    localStorage.removeItem('afo_user');
    setToken(null);
    setUser(null);
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        user={user}
        logout={logout}
      />
      
      <main>
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} user={user} />}
        {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} setUser={setUser} setToken={setToken} />}
        {currentPage === 'dashboard' && user && <DashboardPage user={user} token={token} setCurrentPage={setCurrentPage} />}
        {currentPage === 'members' && user?.role === 'Admin' && <AdminMembersPage token={token} />}
        {currentPage === 'cotisations' && user?.role === 'Admin' && <AdminCotisationsPage token={token} />}
        {currentPage === 'generer-cotisations' && user?.role === 'Admin' && <GenererCotisationsPage token={token} setCurrentPage={setCurrentPage} />}
        {currentPage === 'edit-profile' && user && (<EditProfilePage user={user} token={token} setUser={setUser} setCurrentPage={setCurrentPage} />)}
      </main>

      <Footer />
    </div>
  );
};

// Navigation améliorée
const Navigation = ({ currentPage, setCurrentPage, isMenuOpen, setIsMenuOpen, user, logout }) => {

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-blue-800/30 sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo avec effet amélioré */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="relative">
              {/* Effet de halo derrière le logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              
              {/* Logo circulaire avec image */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/50 group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110">
                <img 
                  src="/logo1.jpeg" 
                  alt="AFO Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Texte du logo */}
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all duration-300">
                All For One
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Éduquer • Aider • Transformer
              </span>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink 
              onClick={() => setCurrentPage('home')} 
              active={currentPage === 'home'}
              icon={<Home className="w-4 h-4" />}
            >
              Accueil
            </NavLink>

            {!user ? (
              <>
                <NavLink 
                  onClick={() => setCurrentPage('login')}
                  icon={<LogIn className="w-4 h-4" />}
                >
                  Connexion
                </NavLink>
                
                {/* Bouton CTA principal 
                <button
                  onClick={() => setCurrentPage('adhesion')}
                  className="ml-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full font-bold shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Nous rejoindre</span>
                </button>*/}
              </>
            ) : (
              <>
                {/* Menu membre simple */}
                {user.role !== 'Admin' && (
                  <>
                    <NavLink 
                      onClick={() => setCurrentPage('dashboard')} 
                      active={currentPage === 'dashboard'}
                      icon={<User className="w-4 h-4" />}
                    >
                      Mon Espace
                    </NavLink>
                    
                    <NavLink 
                      onClick={() => setCurrentPage('mes-cotisations')} 
                      active={currentPage === 'mes-cotisations'}
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      Mes Cotisations
                    </NavLink>
                  </>
                )}

                {/* Menu Admin */}
                {user.role === 'Admin' && (
                  <>
                    <NavLink
                      onClick={() => setCurrentPage('dashboard')}
                      active={currentPage === 'dashboard'}
                      icon={<LayoutDashboard className="w-4 h-4" />}
                    >
                      Tableau de bord
                    </NavLink>

                    <NavLink
                      onClick={() => setCurrentPage('members')}
                      active={currentPage === 'members'}
                      icon={<Users className="w-4 h-4" />}
                    >
                      Membres
                    </NavLink>

                    <NavLink
                      onClick={() => setCurrentPage('cotisations')}
                      active={currentPage === 'cotisations'}
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      Cotisations
                    </NavLink>

                    <NavLink
                      onClick={() => setCurrentPage('generer-cotisations')}
                      active={currentPage === 'generer-cotisations'}
                      icon={<PlusCircle className="w-4 h-4" />}
                    >
                      Générer
                    </NavLink>
                  </>
                )}

                {/* Profil utilisateur */}
                <div className="ml-6 flex items-center space-x-4">
                  {/* Badge utilisateur */}
                  <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/50 border border-blue-500/30 rounded-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-semibold leading-tight">
                        {user.prenom} {user.nom}
                      </span>
                      <span className="text-blue-400 text-xs font-medium">
                        {user.role === 'Admin' ? 'Administrateur' : 'Membre'}
                      </span>
                    </div>
                  </div>

                  {/* Bouton déconnexion */}
                  <button 
                    onClick={logout} 
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-blue-800/30 bg-slate-900/98 backdrop-blur-lg">
          <div className="px-4 py-6 space-y-3">
            <MobileNavLink 
              onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} 
              active={currentPage === 'home'}
              icon={<Home className="w-5 h-5" />}
            >
              Accueil
            </MobileNavLink>

            {!user ? (
              <>
                <MobileNavLink 
                  onClick={() => { setCurrentPage('login'); setIsMenuOpen(false); }}
                  icon={<LogIn className="w-5 h-5" />}
                >
                  Connexion
                </MobileNavLink>

                
              </>
            ) : (
              <>
                {/* Carte profil mobile */}
                <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.prenom} {user.nom}</p>
                      <p className="text-blue-400 text-sm">
                        {user.role === 'Admin' ? 'Administrateur' : 'Membre'}
                      </p>
                    </div>
                  </div>
                </div>

                {user.role !== 'Admin' ? (
                  <>
                    <MobileNavLink 
                      onClick={() => { setCurrentPage('dashboard'); setIsMenuOpen(false); }} 
                      active={currentPage === 'dashboard'}
                      icon={<User className="w-5 h-5" />}
                    >
                      Mon Espace
                    </MobileNavLink>
                    
                    <MobileNavLink 
                      onClick={() => { setCurrentPage('mes-cotisations'); setIsMenuOpen(false); }} 
                      active={currentPage === 'mes-cotisations'}
                      icon={<CreditCard className="w-5 h-5" />}
                    >
                      Mes Cotisations
                    </MobileNavLink>
                  </>
                ) : (
                  <>
                    <MobileNavLink
                      onClick={() => { setCurrentPage('dashboard'); setIsMenuOpen(false); }}
                      active={currentPage === 'dashboard'}
                      icon={<LayoutDashboard className="w-5 h-5" />}
                    >
                      Tableau de bord
                    </MobileNavLink>

                    <MobileNavLink
                      onClick={() => { setCurrentPage('members'); setIsMenuOpen(false); }}
                      active={currentPage === 'members'}
                      icon={<Users className="w-5 h-5" />}
                    >
                      Membres
                    </MobileNavLink>

                    <MobileNavLink
                      onClick={() => { setCurrentPage('cotisations'); setIsMenuOpen(false); }}
                      active={currentPage === 'cotisations'}
                      icon={<CreditCard className="w-5 h-5" />}
                    >
                      Cotisations
                    </MobileNavLink>

                    <MobileNavLink
                      onClick={() => { setCurrentPage('generer-cotisations'); setIsMenuOpen(false); }}
                      active={currentPage === 'generer-cotisations'}
                      icon={<PlusCircle className="w-5 h-5" />}
                    >
                      Générer cotisations
                    </MobileNavLink>
                  </>
                )}

                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl font-semibold transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Composant NavLink Desktop amélioré
const NavLink = ({ children, onClick, active, icon }) => (
  <button
    onClick={onClick}
    className={`
      relative px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2
      ${active 
        ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
        : 'text-gray-300 hover:text-white hover:bg-slate-800/50'
      }
    `}
  >
    {icon}
    <span>{children}</span>
    {active && (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
    )}
  </button>
);

// Composant NavLink Mobile
const MobileNavLink = ({ children, onClick, active, icon, badge }) => (
  <button
    onClick={onClick}
    className={`
      relative w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300
      ${active 
        ? 'text-white bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50' 
        : 'text-gray-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
      }
    `}
  >
    {icon}
    <span className="flex-1 text-left">{children}</span>
    {badge > 0 && (
      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export { Navigation, NavLink, MobileNavLink };

// Page d'accueil
// Page d'accueil AFO - Version Éducation & Solidarité
const HomePage = ({ setCurrentPage, user }) => {
  return (
    <div className="relative">
      {/* Hero Section avec effets visuels avancés */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Arrière-plan animé avec formes géométriques */}
        <div className="absolute inset-0">
          {/* Cercles flottants colorés */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-full blur-3xl animate-spin-slow"></div>
          
          {/* Icônes éducatives flottantes */}
          <BookOpen className="absolute top-20 right-20 w-12 h-12 text-blue-500/20 animate-float" />
          <GraduationCap className="absolute bottom-32 left-32 w-16 h-16 text-purple-500/20 animate-float-delayed" />
          <Pencil className="absolute top-40 left-20 w-10 h-10 text-orange-500/20 animate-float-slow" />
          <School className="absolute bottom-40 right-40 w-14 h-14 text-green-500/20 animate-float" />
          
          {/* Grille en arrière-plan */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Logo AFO avec animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative group">
              {/* Bordure animée qui tourne */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
              
              {/* Logo */}
              <img
                src="/logo1.jpeg"
                alt="AFO Logo"
                className="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-3 object-cover transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-6"
              />
              
              {/* Points décoratifs autour avec icônes éducatives */}
              <div className="absolute -top-2 left-1/2 w-8 h-8 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 w-8 h-8 bg-purple-500 rounded-full animate-pulse delay-300 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-1/2 -left-2 w-8 h-8 bg-pink-500 rounded-full animate-pulse delay-500 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-1/2 -right-2 w-8 h-8 bg-orange-500 rounded-full animate-pulse delay-700 flex items-center justify-center">
                <Backpack className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Titre principal avec effet néon */}
          <h1 className="text-6xl md:text-8xl font-black mb-4 relative">
            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent blur-lg opacity-50"></span>
            <span className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              All For One
            </span>
          </h1>

          {/* Slogan avec effet lumineux */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-xl opacity-30"></div>
            <p className="relative text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Main dans la main, c'est All For One
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Une association qui transforme des vies à travers l'éducation. Nous offrons des fournitures scolaires, 
            des cartables et le soutien nécessaire aux enfants défavorisés pour qu'ils puissent poursuivre leurs rêves.
            <span className="block mt-4 text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text font-semibold flex items-center justify-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>L'éducation est la clé de l'avenir</span>
            </span>
          </p>

          {/* Badges d'impact avec icônes éducatives */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <ImpactBadge icon={<Backpack />} text="Cartables distribués" color="blue" />
            <ImpactBadge icon={<BookOpen />} text="Livres offerts" color="purple" />
            <ImpactBadge icon={<Pencil />} text="Fournitures données" color="orange" />
            <ImpactBadge icon={<GraduationCap />} text="Éducation accessible" color="green" />
          </div>

          {/* Bouton CTA futuriste */}
          {!user && (
            <div className="relative inline-block group">
              {/* Effet de halo autour du bouton */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              
              
            </div>
          )}

          {/* Statistiques visuelles */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <StatCard number="20+" label="Membres" color="from-blue-500 to-cyan-500" icon={<Users />} />
            <StatCard number="18+" label="Enfants aidés" color="from-purple-500 to-pink-500" icon={<Heart />} />
            <StatCard number="2+" label="Années d'impact" color="from-orange-500 to-red-500" icon={<TrendingUp />} />
          </div>
        </div>

        {/* Flèche scroll down animée */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-purple-400" />
        </div>
      </section>

      {/* Section Notre Impact - NOUVELLE */}
      <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <School className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Notre Impact Éducatif
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Chaque année, nous distribuons des fournitures scolaires complètes pour donner une chance égale à tous les enfants
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <EducationImpactCard
              icon={<Backpack />}
              number="...+"
              label="Cartables"
              description="Cartables neufs distribués chaque rentrée"
              gradient="from-blue-500 to-cyan-500"
            />
            <EducationImpactCard
              icon={<BookOpen />}
              number="...+"
              label="Cahiers"
              description="Cahiers et livres offerts aux élèves"
              gradient="from-purple-500 to-pink-500"
            />
            <EducationImpactCard
              icon={<Pencil />}
              number="...+"
              label="Stylos & Crayons"
              description="Fournitures de base pour écrire et dessiner"
              gradient="from-orange-500 to-red-500"
            />
            <EducationImpactCard
              icon={<Calculator />}
              number="...+"
              label="Kits complets"
              description="Kits scolaires avec règles, gommes, calculatrices..."
              gradient="from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Section Valeurs - StyleCards 3D */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Fond avec dégradé diagonal */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Nos Valeurs
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValueCard3D
              icon={<Heart />}
              title="Sincérité"
              description="Agir avec authenticité et transparence dans toutes nos actions"
              gradient="from-orange-500 via-red-500 to-pink-500"
              glowColor="orange"
            />
            <ValueCard3D
              icon={<Users />}
              title="Solidarité"
              description="S'entraider pour construire un avenir meilleur ensemble"
              gradient="from-blue-500 via-cyan-500 to-teal-500"
              glowColor="blue"
            />
            <ValueCard3D
              icon={<Shield />}
              title="Discrétion"
              description="Respecter la dignité et la vie privée de chacun"
              gradient="from-purple-500 via-violet-500 to-indigo-500"
              glowColor="purple"
            />
            <ValueCard3D
              icon={<BookOpen />}
              title="Foi"
              description="Œuvrer avec conviction pour un monde meilleur"
              gradient="from-green-500 via-emerald-500 to-teal-500"
              glowColor="green"
            />
          </div>
        </div>
      </section>

      {/* Section Citations - Style Moderne */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 space-y-10">
          <div className="text-center mb-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-amber-400" />
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Notre Inspiration
            </h2>
          </div>

          <ModernQuoteCard
            text="Ce que vous dépensez en aumône, Allah le sait bien."
            source="Sourate Al-Baqara, 2:273"
            accentColor="blue"
          />
          <ModernQuoteCard
            text="Celui qui soulage un croyant d'une difficulté de ce monde, Allah le soulagera d'une difficulté du Jour du Jugement."
            source="Hadith rapporté par Muslim"
            accentColor="purple"
          />
        </div>
      </section>

      {/* Section CTA Final */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <GraduationCap className="w-20 h-20 mx-auto mb-6 text-purple-400" />
            <h3 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Prêt à faire la différence ?
            </h3>
            <p className="text-gray-300 text-lg mb-8">
              Rejoignez notre communauté et participez à offrir un avenir meilleur aux enfants défavorisés. 
              Ensemble, nous pouvons changer des vies grâce à l'éducation.
            </p>
            
          </div>
        </div>
      </section>
    </div>
  );
};

// Nouveau composant: Badge d'impact
const ImpactBadge = ({ icon, text, color }) => {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    green: 'bg-green-500/10 border-green-500/30 text-green-300'
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${colors[color]} backdrop-blur-sm`}>
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
};

// Nouveau composant: Carte d'impact éducatif
const EducationImpactCard = ({ icon, number, label, description, gradient }) => (
  <div className="group relative">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`}></div>
    
    <div className="relative bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:-translate-y-2">
      {/* Icône */}
      <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
        {React.cloneElement(icon, { className: 'w-8 h-8 text-white' })}
      </div>
      
      {/* Nombre */}
      <p className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent mb-2`}>
        {number}
      </p>
      
      {/* Label */}
      <p className="text-white font-bold text-lg mb-2">{label}</p>
      
      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      
      {/* Barre de progression décorative */}
      <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-all duration-500"></div>
    </div>
  </div>
);

// Composant Statistique mis à jour avec icône
const StatCard = ({ number, label, color, icon }) => (
  <div className="relative group">
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
    <div className="relative bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
      <div className="flex items-center justify-center mb-2">
        {React.cloneElement(icon, { className: 'w-6 h-6 text-gray-400 mr-2' })}
        <p className={`text-4xl font-black bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
          {number}
        </p>
      </div>
      <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

// Composants ValueCard3D et ModernQuoteCard restent identiques
const ValueCard3D = ({ icon, title, description, gradient, glowColor }) => {
  const glowColors = {
    orange: 'shadow-orange-500/50 hover:shadow-orange-500/80',
    blue: 'shadow-blue-500/50 hover:shadow-blue-500/80',
    purple: 'shadow-purple-500/50 hover:shadow-purple-500/80',
    green: 'shadow-green-500/50 hover:shadow-green-500/80'
  };

  return (
    <div className="group perspective">
      <div className={`relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 transform transition-all duration-500 hover:-translate-y-2 hover:rotate-y-3 ${glowColors[glowColor]} shadow-xl`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        
        <div className="relative mb-6">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
          <div className={`relative w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            {React.cloneElement(icon, { className: 'w-8 h-8 text-white' })}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>

        <div className={`mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}></div>
      </div>
    </div>
  );
};

const ModernQuoteCard = ({ text, source, accentColor }) => {
  const colors = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
  };

  return (
    <div className={`relative group bg-gradient-to-br ${colors[accentColor]} backdrop-blur-xl p-10 rounded-3xl border transition-all duration-500 hover:scale-[1.02]`}>
      <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/50 transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
        <span className="text-4xl text-white">"</span>
      </div>

      <div className="relative">
        <p className="text-white text-xl md:text-2xl italic leading-relaxed mb-6 pl-8">
          {text}
        </p>
        
        <div className="flex items-center space-x-3 pl-8">
          <div className="h-px flex-grow bg-gradient-to-r from-amber-500/50 to-transparent"></div>
          <p className="text-amber-400 font-bold text-sm uppercase tracking-wider">
            {source}
          </p>
        </div>
      </div>
    </div>
  );
};

// Animations CSS mises à jour
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-delayed {
    animation: float-delayed 7s ease-in-out infinite 1s;
  }
  .animate-float-slow {
    animation: float-slow 8s ease-in-out infinite 2s;
  }
  .perspective {
    perspective: 1000px;
  }
  .delay-300 {
    animation-delay: 300ms;
  }
  .delay-500 {
    animation-delay: 500ms;
  }
  .delay-700 {
    animation-delay: 700ms;
  }
  .delay-1000 {
    animation-delay: 1000ms;
  }
`;
document.head.appendChild(style);

export default Acceuil;
