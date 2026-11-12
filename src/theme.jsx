/* Tema tampilan: gelap (bawaan) atau terang. Disimpan per perangkat di localStorage 'talqeeh_theme'.
   Kelas html.light dipasang lebih awal oleh skrip di index.html supaya tidak berkedip; warnanya di src/theme-light.css. */
import React, { useState, useEffect } from 'react';

const THEME_KEY = 'talqeeh_theme';
const readTheme = () => { try { return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'; } catch { return 'dark'; } };

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('light', theme === 'light');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f4ef' : '#0c0c0c');
};

const setTheme = (theme) => {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent('talqeeh:theme', { detail: theme }));
};

const useTheme = () => {
  const [theme, set] = useState(readTheme);
  useEffect(() => {
    const f = (e) => set(e.detail);
    window.addEventListener('talqeeh:theme', f);
    return () => window.removeEventListener('talqeeh:theme', f);
  }, []);
  return [theme, setTheme];
};

/* Tombol ganti tema. compact = ikon saja (sidebar terlipat). */
const ThemeToggle = ({ compact = false, className = '' }) => {
  const [theme, change] = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';
  const label = theme === 'light' ? 'Tema gelap' : 'Tema terang';
  return (
    <button onClick={() => change(next)} title={label} aria-label={`Ganti ke ${label.toLowerCase()}`}
      className={compact
        ? `w-8 h-8 rounded-lg flex items-center justify-center text-ink-soft hover:text-ink hover:bg-white/5 ${className}`
        : `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-white/5 ${className}`}>
      <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-4 h-4 flex-shrink-0" style={{ stroke: 'currentColor' }}/>
      {!compact && <span>{label}</span>}
    </button>
  );
};

Object.assign(window, { useTheme, setTheme, ThemeToggle });
