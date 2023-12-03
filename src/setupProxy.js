const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3333", // Set the target URL of your API
      changeOrigin: true,
    })
  );
};
