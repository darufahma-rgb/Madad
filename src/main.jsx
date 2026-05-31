import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Foundation (urutan ini penting — jangan diubah)
import './icons.jsx';
import './ui.jsx';
import './data.jsx';
import './supabase.jsx';
import './auth.jsx';
import './layout.jsx';

// Data layers
import './maddah-data.jsx';
import './mahad-data.jsx';
import './muqaranah-data.jsx';
import './intentions-data.jsx';
import './adaptive-prompt.jsx';

// Shared components
import './markdown-render.jsx';
import './quick-note.jsx';
import './dashboard-companions.jsx';

// Pages
import './pages/landing.jsx';
import './pages/maddah-publik.jsx';
import './pages/maddah-hub.jsx';
import './pages/maddah-detail.jsx';
import './pages/mahad-maddah.jsx';
import './pages/mahad-detail.jsx';
import './pages/sample-nahwu.jsx';
import './pages/onboarding.jsx';
import './pages/welcome.jsx';
import './pages/dashboard.jsx';
import './pages/tool-guide.jsx';
import './pages/paths.jsx';
import './pages/ethics.jsx';
import './pages/admin.jsx';
import './pages/muqaranah.jsx';
import './pages/muqaranah-detail.jsx';
import './pages/muqaranah-form.jsx';
import './pages/kurasah.jsx';
import './pages/kurasah-editor.jsx';
import './pages/prompt-library.jsx';
import './pages/siap-imtihan.jsx';
import './pages/s2-maddah.jsx';

// App shell — terakhir
import App from './app.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
