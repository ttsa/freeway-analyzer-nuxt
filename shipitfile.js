module.exports = function (shipit) {
  require('shipit-deploy')(shipit)
  const name = 'freeway-analyzer'
  const deployTo = '/app/' + name
  shipit.initConfig({
    // branch: 'supplier-login',
    default: {
      workspace: '/tmp/github-monitor',
      deployTo,
      repositoryUrl: 'https://github.com/ttsa/freeway-analyzer-nuxt'
    },
    production: {
      servers: 'zack@YEE'
    }
  })

  shipit.task('updateAssets', async () => {
    await shipit.local(`npm run build`)
    // console.log(shipit.config.deployTo)
    await shipit.copyToRemote(
      './dist',
      deployTo + '/current'
    )
    await shipit.copyToRemote(
      './.nuxt',
      deployTo + '/current'
    )
  })

  shipit.on('deployed', async function () {
    // var shared_path = `${shipit.config.deployTo}/shared`
    try {
      await shipit.remote(`cd ${shipit.currentPath} && nvm use && npm install --production`)
      await shipit.local(`npm run build`)
      await shipit.copyToRemote(
        './dist',
        deployTo + '/current'
      )
      await shipit.copyToRemote(
        './.nuxt',
        deployTo + '/current'
      )
    } catch (error) {
      console.log(error)
    }

    shipit.start('restartApp')
  })

  shipit.task('restartApp', async () => {
    const currentPath = `${deployTo}/current`
    try {
      await shipit.remote(`cd ${currentPath} && nvm use && pm2 restart ecosystem.config.js`)
      // await shipit.remote(`pm2 start ${current_path}/srv/index.js --name ${name}`)
    } catch (error) {
      // await shipit.remote(`pm2 restart ${name}`)
    }
  })
}
