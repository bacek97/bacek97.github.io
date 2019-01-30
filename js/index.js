var t0 = performance.now();
const toUrlEncoded = (obj) => Object.keys(obj).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&')

const fallbackLocale = 'ru'
const redirect = `/${fallbackLocale}/movie`


localStorage.clear()
var peers = []
var gun = Gun({ radisk: false })

var root = gun.get('Root')
root.get('Languages').put(gun.get('root/Languages'))
let languages = root.get('Languages')

languages.get('ru').put(gun.get('root/languages/ru'))
let language = languages.get('ru')
language.get('ru').put('Русский')
language.get('lang404').put('Нет такого языка')
language.get('movies').put('Фильмы')
language.get('shows').put('Сериалы')

languages.get('en').put(gun.get('root/languages/en'))
language = languages.get('en')
language.get('en').put('English')
language.get('lang404').put('Not found language')
language.get('movies').put('Movies')
language.get('shows').put('Shows')


languages.map().once((value, prop) => { console.log('Доступен: ', prop) } )

const movie = () => Promise.resolve({
  template: '#componentMov',
  data() {
    return {
			tmdb: { pong: { movie: {} }  },
    }
  },
  created() {
    this.tmdbGetAll()
  },
  methods: { 
    tmdbGetAll() {
			axios
				.all(
					[ "https://api.tmdb.org/3/configuration?api_key=6054e95746b053ff7e7e4e0e46d8ab3c"
					].map(axios.get)
				)
				.then(
					axios.spread((config) => {
						this.$set(this.tmdb.pong, 'config', config.data)
					})
				)
		},
    tmdbGetMovie(get,newLang) {
      console.log('https://api.themoviedb.org/3/movie/'+get+'?api_key=6054e95746b053ff7e7e4e0e46d8ab3c&language=' + newLang)
			axios
				.all(
					[
						'https://api.themoviedb.org/3/movie/'+get+'?api_key=6054e95746b053ff7e7e4e0e46d8ab3c&language=' + newLang
					].map(axios.get)
				)
				.then(
					axios.spread((movie) => {
						this.$set(this.tmdb.pong, 'movie', movie.data)
					})
				)
		}
  },
  beforeRouteEnter (to, from, next) {
    next(componentx => {
    componentx.tmdbGetMovie(to.params.movie,to.params.language) 
    } )
  },
  beforeRouteUpdate (to, from, next) {
    // обрабатываем изменение параметров маршрута...
    // не забываем вызвать next()
    this.tmdbGetMovie(to.params.movie,to.params.language)
    next()
  }
})

const movies = () => Promise.resolve({
  template: '#componentSerMov',
  data() {
    return {
			tmdb: { pong: { movies: {page: 5} }  },
    }
  },
  created() {
    this.tmdbGetAll()
  },
  methods: { 
    tmdbGetAll() {
			axios
				.all(
					[ "https://api.tmdb.org/3/configuration?api_key=6054e95746b053ff7e7e4e0e46d8ab3c"
					].map(axios.get)
				)
				.then(
					axios.spread((config) => {
						this.$set(this.tmdb.pong, 'config', config.data)
					})
				)
		},
    tmdbGetMovies(get,newLang) {
      console.log('https://api.tmdb.org/3/discover/movie?api_key=6054e95746b053ff7e7e4e0e46d8ab3c&language=' + newLang + get)
			axios
				.all(
					[
						'https://api.tmdb.org/3/discover/movie?api_key=6054e95746b053ff7e7e4e0e46d8ab3c&language=' +
							newLang + get
					].map(axios.get)
				)
				.then(
					axios.spread((movies) => {
						this.$set(this.tmdb.pong, 'movies', movies.data)
					})
				)
		}
  },
  beforeRouteEnter (to, from, next) {
    next(componentx => {
    componentx.tmdbGetMovies('&'+toUrlEncoded(to.query),to.params.language) 
    } )
  },
  beforeRouteUpdate (to, from, next) {
    // обрабатываем изменение параметров маршрута...
    // не забываем вызвать next()
    this.tmdbGetMovies('&'+toUrlEncoded(to.query),to.params.language)
    next()
  }
})

const componentRoot = () => Promise.resolve({
  template: '#componentRoot',
  beforeRouteEnter(to, from, next) {
    next((component) => {
      component.getLang(component.$i18n.fallbackLocale)
      if (~component.languages.available.indexOf(to.params.language)) {  component.getLang(to.params.language) } else { alert(component.$t('lang404')); next(redirect) }
    })
  },
  beforeRouteUpdate(to, from, next) {
    next(~this.languages.available.indexOf(to.params.language)
      ? (this.getLang(to.params.language), true )
      : (alert(this.$t('lang404')), false) )
    
  },
  data() {
    return {
      languages: {available: ['ru','en'], loaded: []},
      tmdb: { pong: { genresMov: [], genresTV: [], 
                     yearMin: new Date((new Date().getUTCFullYear()-1).toString()).toISOString().slice(0,10),
                     yearMax: new Date((new Date().getUTCFullYear()  ).toString()).toISOString().slice(0,10),
                     page: 1,
                    },
             selMov: true},
      
      
      
			info: false,
			tmdb_token: null,
			tmdb_name: '',
			tmdb_pass: '',
			tmdb_session_id: null,

			checked: 'blah',
			blah: 'test',
			indeterminate: true,
			selectedGenres: []
      
    }
  },
  created() {
		// if (localStorage.tmdb_session_id) {
		// 	this.tmdb_session_id = localStorage.tmdb_session_id
		// }
		this.tmdbGetAll()
	},
  computed: {
    genresMov1() { return this.tmdb.pong.genresMov.filter(el => el.status === 1).map(el => el.id).toString() },
    genresMov2() { return this.tmdb.pong.genresMov.filter(el => el.status === 2).map(el => el.id).toString() },
    genresTV1()  { return this.tmdb.pong.genresTV.filter(el => el.status === 1).map(el => el.id).toString()  },
    genresTV2()  { return this.tmdb.pong.genresTV.filter(el => el.status === 2).map(el => el.id).toString()  },
    yearMin() { return new Date(this.tmdb.pong.yearMin).toISOString() },
    yearMax() { return new Date(this.tmdb.pong.yearMax).toISOString() }
  },
  methods: {
    linkGen(pageNum) {
      return {
        name: "serMov", query: { with_genres: this.genresMov1, without_genres: this.genresMov2, "release_date.gte": this.yearMin, "release_date.lte": this.yearMax, page: pageNum}
      }
    },
    getLang(newLang) {
      let loadingText = {genresMov: {}, genresTV: {}}
      if (!~this.languages.loaded.indexOf(newLang)) {
        languages.get(newLang).map().once((value, prop) => {
          this.$set(loadingText, prop, value)
          this.$i18n.setLocaleMessage(newLang, loadingText)
        } )
        
        axios
				.all(
					[ 
						'https://api.tmdb.org/3/genre/movie/list?api_key=6054e95746b053ff7e7e4e0e46d8ab3c&language=' + newLang,
            'https://api.tmdb.org/3/genre/tv/list?api_key=6054e95746b053ff7e7e4e0e46d8ab3c&language=' + newLang
					].map(axios.get)
				)
				.then(
					axios.spread((genresMov, genresTV) => {
            genresMov.data.genres.map(element => this.$set(loadingText.genresMov, element.id.toString(), element.name) )
            genresTV.data.genres.map(element => this.$set(loadingText.genresTV, element.id.toString(), element.name) )
					})
				)
        
        this.languages.loaded.push(newLang)
        console.log(`Loaded languages: ${this.languages.loaded}`)
        console.log('bla',loadingText)
      }
      this.$i18n.locale = newLang
    },
		tmdbGetAll() {
			axios
				.all( [
						'https://api.tmdb.org/3/configuration/languages?api_key=6054e95746b053ff7e7e4e0e46d8ab3c',
						'https://api.tmdb.org/3/configuration/countries?api_key=6054e95746b053ff7e7e4e0e46d8ab3c',
            'https://api.tmdb.org/3/genre/movie/list?api_key=6054e95746b053ff7e7e4e0e46d8ab3c',
            'https://api.tmdb.org/3/genre/tv/list?api_key=6054e95746b053ff7e7e4e0e46d8ab3c'
					].map(axios.get)
				)
				.then(
					axios.spread((languages, countries, genresMov, genresTV) => {
						this.$set(this.tmdb.pong, 'languages', languages.data)
						this.$set(this.tmdb.pong, 'countries', countries.data)
						this.$set(this.tmdb.pong, 'genresMov', genresMov.data.genres)
						this.$set(this.tmdb.pong, 'genresTV', genresTV.data.genres)
						this.obnulit(this.tmdb.pong.countries)
						this.obnulit(this.tmdb.pong.genresMov)
						this.obnulit(this.tmdb.pong.genresTV)
					})
				)
		},
    tmdbQuery() {
      
    },
		obnulit(massiv) {
			//    this.tmdb.genres.forEach(function(el) { vm.$set(el, 'status', 0) })
			massiv.forEach((el) => this.$set(el, 'status', 0))
		}
  }
})


const vm = new Vue({
  router: new VueRouter({
    mode: 'history',
    routes: [
      { path: '/bacek97/*', redirect: '/' }, //HTML5_History - CodePen.io/full
      { path: '/boomerang/*', redirect: '/' }, //HTML5_History - CodePen.io/pen
      { path: '/', redirect }, //HTML5_History - CodePen.io/debug
      { path: '/:language', name: 'language', component: componentRoot, children: [
        { path: 'movie', name: 'serMov', component: movies },
        { path: 'movie/:movie', name: 'mov', component: movie },
        { path: 'show', name: 'serTV', component: movies },
        { path: 'show/:show', name: 'TV', component: movies },
        { path: '*', component: { template: '<div>404</div>' } },
        ] },
    ]
  }),
  i18n: new VueI18n({ fallbackLocale }),
  data() { return {} },
  created() {},
  mounted() {},
  methods: { }
}).$mount('#vm')
var t1 = performance.now();
console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")