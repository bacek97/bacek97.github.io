

const componentDownload = (componentName) =>
  // Promise на всякий случай
    new Promise((resolve, reject) => {
      var link = document.createElement("link")
      link.href = `components/${componentName}.vue.html`
      link.rel = "import"
      link.onload = () => {
        link.import.querySelectorAll("style[type=text\\/less]").forEach((style) => {
            less.render(style.innerHTML).then(
                ({ css }) => {
                    document.getElementById('styLessCompiled').innerHTML += css
                    // e.remove()
                },
                (err) => { console.error(err) }
            )
        })
        resolve(componentsDownloaded[componentName])
      }
      document.body.appendChild(link)
    })

    // const componentsDownload = (...componentNames) => componentNames.map(componentDownload())

  export { componentDownload };