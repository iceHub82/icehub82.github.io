var custom = document.createElement('link');
var darkmode = document.createElement('link');
var styles = document.createElement('link');
custom.rel = 'stylesheet';
darkmode.rel = 'stylesheet';
styles.rel = 'stylesheet';
if (window.location.hostname === 'icehub82.github.io') {
    styles.href = 'css/styles.min.css';
    custom.href = 'css/custom.min.css';
    darkmode.href = 'css/darkmode.min.css';
}
else {
    styles.href = 'css/styles.css';
    custom.href = 'css/custom.css';
    darkmode.href = 'css/darkmode.css';
}
darkmode.disabled = localStorage.getItem('darkmode') === null ? true : false;
document.head.appendChild(styles);
document.head.appendChild(custom);
document.head.appendChild(darkmode);
