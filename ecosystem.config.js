module.exports = {
  apps: [{
    name: 'freeway-analyzer',
    script: 'server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}
