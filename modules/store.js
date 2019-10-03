const createStore = () => { return new Vuex.Store({
    state: () => ({
      route: {},
      downloaded: {
        items: [
          { icon: 'contacts', text: 'Contacts' },
          { icon: 'history', text: 'Frequently contacted' },
          { icon: 'content_copy', text: 'Duplicates' },
          {
            icon: 'keyboard_arrow_up',
            'icon-alt': 'keyboard_arrow_down',
            text: 'Labels',
            model: true,
            children: [
              { icon: 'add', text: 'Create label' },
            ],
          },
          {
            icon: 'keyboard_arrow_up',
            'icon-alt': 'keyboard_arrow_down',
            text: 'More',
            model: false,
            children: [
              { text: 'Import' },
              { text: 'Export' },
              { text: 'Print' },
              { text: 'Undo changes' },
              { text: 'Other contacts' },
            ],
          },
          { icon: 'settings', text: 'Settings' },
          { icon: 'chat_bubble', text: 'Send feedback' },
          { icon: 'help', text: 'Help' },
          { icon: 'phonelink', text: 'App downloads' },
          { icon: 'keyboard', text: 'Go to the old version' },
        ],
      },
      data: {
        title: 'Матрица (2010) - Фильм',
        availableLanguages: ["ru", "en"],
        
        nonStrict: {
          cards: {
            flat: false,
            // media: true,
            loading: false,
            actions: true,
            outlined: false,
            elevation: undefined,
            raised: false,
            width: 344,
            height: undefined,
          },
          vueGrid: {
            cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs:4 },
            colNum: 12,
            rowHeight:55,
            isDraggable:true,
            isResizable:true,
            isMirrored:false,
            margin:[10, 10],
            verticalCompact:false,
            useCssTransforms:true,
            isResponsive:true,
            layout: [
              {"x":0,"y":0,"w":1,"h":1,"i":"0"},
              {"x":2,"y":0,"w":2,"h":4,"i":"1"},
              {"x":4,"y":0,"w":2,"h":5,"i":"2"},
              {"x":6,"y":0,"w":2,"h":3,"i":"3"},
              {"x":8,"y":0,"w":2,"h":3,"i":"4"},
              {"x":10,"y":0,"w":2,"h":3,"i":"5"}
              // {"x":0,"y":5,"w":2,"h":5,"i":"6"},
              // {"x":2,"y":5,"w":2,"h":5,"i":"7"},
              // {"x":4,"y":5,"w":2,"h":5,"i":"8"},
              // {"x":6,"y":4,"w":2,"h":4,"i":"9"},
              // {"x":8,"y":4,"w":2,"h":4,"i":"10"},
              // {"x":10,"y":4,"w":2,"h":4,"i":"11"},
              // {"x":0,"y":10,"w":2,"h":5,"i":"12"},
              // {"x":2,"y":10,"w":2,"h":5,"i":"13"},
              // {"x":4,"y":8,"w":2,"h":4,"i":"14"},
              // {"x":6,"y":8,"w":2,"h":4,"i":"15"},
              // {"x":8,"y":10,"w":2,"h":5,"i":"16"},
              // {"x":10,"y":4,"w":2,"h":2,"i":"17"},
              // {"x":0,"y":9,"w":2,"h":3,"i":"18"},
              // {"x":2,"y":6,"w":2,"h":2,"i":"19"}
          ],
          },
          myArray: [
            {id:1,name:'one'},
            {id:2,name:'two'}
          ],
          dialog: false,
          primaryDrawer: {
            types: ['Default (no property)', 'Permanent', 'Temporary'],
            type: 'default (no property)',
            model: null,
            clipped: true,
            floating: false,
            mini: false,
          },
          footer: {
            inset: false,
          },
        }
      }
    }),
    getters: {
    },
    mutations: {
      stQueryParse(state, payload) {
        Vue.set(state, "route", payload);
      },
      
      write2state(state, { to, data }) {
        Vue.set(state, to, data);
      },
      
      startLoading(state, p) {
        if (state.downloaded.loading[p] === undefined) {
          Vue.set(state.downloaded.loading, p, 0);
        }
        Vue.set(
          state.downloaded.loading,
          p,
          state.downloaded.loading[p] + 1
        );
      },
      finishLoading(state, payload) {
        Vue.set(
          state.downloaded.loading,
          payload,
          state.downloaded.loading[payload] - 1
        );
      },
      updateData(state, { to, data }) {
        Vue.set(state.downloaded, to, data);
      },
      
    },
    actions: {
      
      async loadData({ commit }, payload) {
        commit("startLoading", payload.i || 0);
        try {
          (await Promise.all(payload.urls.map(axios.get))).forEach(
            ({ data }, index) => {
              commit(payload.mut || "updateData", {
                to: payload.to[index],
                data,
                payload
              });
            }
          );
        } catch (error) {
          console.error(error);
        } finally {
          commit("finishLoading", payload.i || 0);
        }
      },


    }
  }) }
  export {createStore}