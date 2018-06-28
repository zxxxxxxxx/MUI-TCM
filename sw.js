'use strict';

importScripts('sw-toolbox.js');

toolbox.precache(["index.html","css/mui.min.css","css/icons-extra.css","css/app.css"]);

toolbox.router.get('/images/*', toolbox.cacheFirst);

toolbox.router.get('/*', toolbox.networkFirst, {
  networkTimeoutSeconds: 5
});
