var path = window.location.pathname.split('/');
var base = document.getElementsByTagName('base')[0];
if (window.location.host.includes('localhost')) {
    base.setAttribute('href', '/');
} else if (path.length > 2) {
    base.setAttribute('href', 'https://icehub82.github.io/' + path[1] + '/');
} else if (path[path.length - 1].length != 0) {
    window.location.replace(window.location.origin + window.location.pathname + '/' + window.location.search);
}
