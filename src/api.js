// Configuration centralisée de l'API
const getApiUrl = () => {
  // Si une variable d'environnement est définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Sinon, détecter automatiquement selon l'environnement
  const hostname = window.location.hostname;

  // En production (Vercel)
  if (hostname === 'fontafo.vercel.app') {
    return 'https://backafo.onrender.com';
  }

  // En développement local
  return 'http://localhost:5002';
};

export const API_URL = getApiUrl();
