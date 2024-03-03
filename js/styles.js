const sheets = ['styles', 'custom', 'darkmode'];
for (let sheet of sheets) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const cssFile = window.location.hostname === 'icehub82.github.io' ? `${sheet}.min.css` : `${sheet}.css`;
    link.href = `css/${cssFile}`;
    if (sheet === 'darkmode') {
        link.disabled = localStorage.getItem('darkmode') === null;
    }
    document.head.appendChild(link);
}