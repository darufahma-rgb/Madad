// Inline SVG icons (lucide-style, hand-picked subset)
const Icon = ({ name, className = "w-5 h-5", strokeWidth = 1.6, ...rest }) => {
  const paths = {
    sparkles: <><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z"/><path d="M19 14l.9 2.1.2.8.9.2L23 18l-2.1.9-.8.2-.2.9L19 22l-.9-2.1-.2-.8-.9-.2L15 18l2.1-.9.8-.2.2-.9z"/></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M4 5v14"/><path d="M8 7h7M8 11h7"/></>,
    bookOpen: <><path d="M2 5h7a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h7z"/></>,
    brain: <><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V4a3 3 0 0 0-3 0z"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 18l9 5 9-5"/></>,
    messageSquare: <><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4z"/></>,
    waves: <><path d="M2 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
    check: <path d="M5 12l4.5 4.5L19 7"/>,
    chevronRight: <path d="M9 5l7 7-7 7"/>,
    chevronLeft: <path d="M15 5l-7 7 7 7"/>,
    chevronDown: <path d="M5 9l7 7 7-7"/>,
    chevronUp: <path d="M5 15l7-7 7 7"/>,
    arrowRight: <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
    x: <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    star: <path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17.3 6.5 20l1-6.1L3 9.5l6.3-.9z"/>,
    shield: <><path d="M12 3l8 3v6c0 4.5-3.5 8.5-8 9-4.5-.5-8-4.5-8-9V6z"/></>,
    alert: <><path d="M12 3l10 18H2z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="8" r="0.6" fill="currentColor"/></>,
    leaf: <><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l8-8"/></>,
    feather: <><path d="M20 4c-6 0-13 6-13 12v3h3c6 0 12-7 12-13z"/><path d="M4 20l8-8"/></>,
    quote: <><path d="M6 7h4v4c0 3-2 5-4 5"/><path d="M14 7h4v4c0 3-2 5-4 5"/></>,
    moon: <path d="M21 13a9 9 0 1 1-10-10c0 5 5 10 10 10z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M4.6 19.4l1.4-1.4M18 6l1.4-1.4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="6" r="2.5"/><path d="M22 18c0-3-2-5-5-5"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></>,
    flask: <><path d="M9 3h6"/><path d="M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/></>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18 3 3 0 0 0 0-6c1 0 4-1 4-3a3 3 0 0 0-3-3"/><circle cx="7" cy="10" r="1" fill="currentColor"/><circle cx="11" cy="6" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/></>,
    scale: <><path d="M12 3v18"/><path d="M6 21h12"/><path d="M3 9l3-6 3 6"/><path d="M15 9l3-6 3 6"/><path d="M3 9a3 3 0 0 0 6 0"/><path d="M15 9a3 3 0 0 0 6 0"/></>,
    cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></>,
    network: <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 7.5l3 8M16.5 7.5l-3 8M8 6h8"/></>,
    bookmark: <path d="M6 3h12v18l-6-4-6 4z"/>,
    pen: <><path d="M3 21l4-1 11-11-3-3L4 17z"/><path d="M14 6l3 3"/></>,
    download: <><path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/></>,
    upload: <><path d="M12 21V9"/><path d="M7 13l5-5 5 5"/><path d="M5 21h14"/></>,
    clipboard: <><rect x="6" y="4" width="12" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15-7l3 3"/><path d="M21 4v5h-5"/><path d="M21 12a9 9 0 0 1-15 7l-3-3"/><path d="M3 20v-5h5"/></>,
    lightbulb: <><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"/></>,
    play: <path d="M7 4v16l13-8z"/>,
    pause: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>,
    headphones: <><path d="M4 13v5a2 2 0 0 0 2 2h2v-7H4z"/><path d="M20 13v5a2 2 0 0 1-2 2h-2v-7h4z"/><path d="M4 13a8 8 0 0 1 16 0"/></>,
    type: <><path d="M4 7V5h16v2"/><path d="M9 5v14"/><path d="M15 5v14"/><path d="M7 19h4M13 19h4"/></>,
    archive: <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></>,
    crown: <><path d="M3 7l4 4 5-6 5 6 4-4v11H3z"/></>,
    heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>,
    spark: <><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M5.5 18.5l4-4M14.5 9.5l4-4"/></>,
    home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    mosque: <><path d="M3 21V11c0-3 4-4 9-4s9 1 9 4v10"/><path d="M9 21v-6a3 3 0 0 1 6 0v6"/><path d="M12 7V3l-2 2M12 3l2 2"/></>,
  };
  const d = paths[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={{color:"white",...(rest.style||{})}} {...rest}>
      {d}
    </svg>
  );
};

window.Icon = Icon;
