import React from 'react'

// Footer version minimaliste
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-900 border-t border-blue-800/30 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-50"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/50 group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110">
                <img 
                  src="/logo1.jpeg" 
                  alt="AFO Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            AFO - All For One
          </span>
        </div>

        {/* Slogan */}
        <p className="text-gray-400 text-center mb-6">
          Ensemble pour l'éducation des enfants défavorisés
        </p>

        {/* Séparateur */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} AFO. Tous droits réservés.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Main dans la main, c'est All For One ✨
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer
