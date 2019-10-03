
import {componentDownload} from "./componentDownload.js"
import {createI18n} from './i18n.js'
import {createStore} from './store.js'
import {createRouter} from './router.js'
import {createVuetify} from './vuetify.js'

const fallbackLocale = "ru";
const userLocale = (window.navigator ? (window.navigator.language ||
                    window.navigator.systemLanguage ||
                    window.navigator.userLanguage) : "ru")
                    .substr(0, 2).toLowerCase();
const redirect = `/${userLocale}/url`;
Vue.mixin({
  data: () => ({

  }),
  computed: {
    ...Vuex.mapState(["data", "downloaded"]),
    ...Vuex.mapGetters([])
  },
  methods: {
    ...Vuex.mapActions([
      "loadData"
    ]),
    ...Vuex.mapMutations(["write2state", "stQueryParse"]),
  }
})


const componentAppBar = () => Promise.resolve( componentDownload("componentAppBar") )
const componentDrawer = () => Promise.resolve( componentDownload("componentDrawer") )
const componentFooter = () => Promise.resolve( componentDownload("componentFooter") )
const componentZContent = () => Promise.resolve( componentDownload("componentZContent") )

const createApp = () => { 

  const i18n = createI18n()
  const store = createStore()
  const router = createRouter()
  const vuetify = createVuetify()
  
  const createVm = (context) => {
    new Vue({
      i18n, store, router, vuetify,
      components: { componentAppBar, componentDrawer, componentZContent, componentFooter },  // 'component-x': componentX   // <component-x></component-x>
      mounted() {
        console.warn((performance.now() - t0) + 'MountedVM')
      },
      created() {
        console.warn((performance.now() - t0) + 'createdVM')
        
        document.title = `${this.$store.state.data.title}`

        this.$router.beforeResolve((to, from, next) => {
          console.warn((performance.now() - t0) + 'beforeResolve')
          // const lang1 = to.params.language
          this.loadLanguageAsync(to.params.language, fallbackLocale)
            .then(() => next())
            .catch((err) => {
              if (err.message === '404') {
                console.warn(`${this.$t("lang404")} : ${lang1}`),
                  next(redirect)
              }
            })
        });

        this.$router.onReady(() => {
          this.$mount('#vm');
        })
        // this.$router.push(redirect) // исправить
      },
      methods: {
        async loadLanguageAsync(...langs) {

          const setI18nLanguage = (lang4) => {
            console.log(`Применяется локаль ${lang4}`)
            i18n.locale = lang4
            // axios.defaults.headers.common['Accept-Language'] = lang
            document.querySelector('html').setAttribute('lang', lang4)
            return lang4
          }

          const resolveLangObj = async (lang3) => {
            
            // const messages = {
            //   en: {
            //     lang404: 'not found lang',
            //     loadedLangs: 'Loaded langs',
            //     settings: 'Settings'
            //   },
            //   ru: {
            //     lang404: 'нет такого языка',
            //     loadedLangs: 'загружены языки',
            //     settings: 'Настройки',
            //     title: 'Google Keep'
            //   }
            // }
            // console.error(messages[lang3])
            return await fetch(`modules/langs/${lang3}.json`).then(res => res.json());
          };

          langs.forEach(async (lang2, indexLangs) => {
            if (!(this.$i18n.locale === lang2)) {
              console.log(`${lang2} локаль не текущая`)
              if (this.data.availableLanguages.includes(lang2)) {
                console.log(`${lang2} локаль доступная`)
                if (!this.$i18n.messages[lang2]) {
                  console.log(`${lang2} локаль еще не загруженая`)
                  this.$i18n.setLocaleMessage(lang2, await resolveLangObj(lang2));
                  if (indexLangs === 0) { setI18nLanguage(lang2) }
                  else console.log(`${lang2} не первая в списке локаль`)

                  console.log(`${this.$t("loadedLangs")}: ${Object.keys(this.$i18n.messages)}`);
                }
                else console.log(`${lang2} локаль уже загружена`)
              }
              else {
                console.log(`${lang2} локаль пока несуществует!!`)
                // throw new Error('404')
                return 404
              }
            }
            else console.log(`${lang2} локаль уже используется`)
          })

        }
      },
      data: () => ({
      }),
      render: Vue.compile(`
        <v-app id="inspire">
          <component-app-bar></component-app-bar>
          <component-drawer></component-drawer>
          <v-content>
            <router-view></router-view>
          </v-content>
          <component-z-content></component-z-content>
          <component-footer></component-footer>
        </v-app>
      `).render
      // template: '#templateVM' // ComponentsRouter (beforeRouteUpdate)
    })
  }

  const vm = createVm()
  return { i18n, store, router, vuetify, vm }
}


export {createApp}