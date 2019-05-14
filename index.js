const http = require('http')
const fs = require('fs')
const httpPort = process.env.PORT || 5000

http.createServer((req, res) => {
  fs.readFile('index.html', 'utf-8', (err, content) => {
    if (err) {
      console.log('Невозможно открыть файл "index.html".')
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    })

    res.end(content)
  })
}).listen(httpPort, () => {
  console.log('Сервер запущен на: http://localhost:%s', httpPort)
})
