export default {
  '/api': {
    target: 'https://ua161d35m4.execute-api.us-west-2.amazonaws.com/',
    secure: false,
    logLevel: 'debug',
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, _res) => {
        console.log('proxy error', err);
      });
      proxy.on('proxyReq', (proxyReq, req, _res) => {
        const headers = proxyReq.getHeaders();
        const rq = { method: req.method, url: req.url, headers: headers };
        console.log(JSON.stringify(rq, undefined, 2));
      });
      proxy.on('proxyRes', (proxyRes, req, _res) => {
        const rs = { method: req.method, url: req.url, rqHeaders: req.headers, status: proxyRes.statusCode, rsHeaders: proxyRes.headers };
        console.log(JSON.stringify(rs, undefined, 2));
      });
    },
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  },
};
