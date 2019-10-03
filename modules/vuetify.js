const createVuetify= () => { return new Vuetify({
    icons: {
      // The default iconfont of `mdi` requires a build process
      // Here we opt to use Google's Material Icon font library
      iconfont: 'mdi'
    },
    theme: {
      options: {
        customProperties: true,
        cspNonce: 'dQw4w9WgXcQ'
      },
      dark: true,
      // themes: {
      //   light: {
      //     primary: '#1976D2',
      //     secondary: '#424242',
      //     accent: '#82B1FF',
      //     error: '#FF5252',
      //     info: '#2196F3',
      //     success: '#4CAF50',
      //     warning: '#FFC107'
      //   },
      //   dark: {
      //     primary: "#004D40",
      //     error: "#B71C1C",
      //     info: "#0D47A1",
      //     accent: "#004D40",
      //     secondary: "#424242",
      //     success: "#1B5E20",
      //     warning: "#EF6C00"
      //   }
      // }
    }
  })
  }
export {createVuetify}