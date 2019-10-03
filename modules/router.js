import {componentDownload} from "./componentDownload.js"

    const fallbackLocale = "ru";
    const userLocale = (window.navigator ? (window.navigator.language ||
                        window.navigator.systemLanguage ||
                        window.navigator.userLanguage) : "ru")
                        .substr(0, 2).toLowerCase();
    const redirect = `/${userLocale}/url`;
    
    const componentUrl = () => Promise.resolve( componentDownload("componentUrl") )
const createRouter = () => { return new VueRouter({
        // mode: "history", // commented if simple.html
        routes: [
          // { path: '/foo', component: { template: '#component1', components: { 'component-x': componentX } } },
          { path: "/", redirect }, //HTML5_History - CodePen.io/debug
          {
            path: "/:language",
            component: componentUrl,
            children: [
              { path: "", redirect },
              { path: "url", name: "url", component: componentUrl },
              // { path: 'tv/:show', name: 'TV', component: movies },
              { path: "*", component: { template: "<div>404</div>" } }
            ],
            beforeEnter: (to, from, next) => {
              next();
            }
          }
        ],
        scrollBehavior (to, from, savedPosition) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({ x: 0, y: 0 })
            }, 500)
          })
        }
      }) }

export {createRouter}