const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const fantacalcio = [
    {
        name: 'Squadre',
        address: 'https://www.fantacalcio.it/serie-a/squadre/'
    }
]

const squadre = []
let i = 1;

app.set('json spaces', 2);

const giocatori = []

fantacalcio.forEach(link => {
    axios.get(link.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            $('.team a', html).each(function () {
                const url = $(this).attr('href')
                const title = url.split(/[//]+/).pop();
                if (url.startsWith("/") && !url.includes("funtip")) {
                    squadre.push({
                        id: i++,
                        name: title,
                        url: 'https://www.fantacalcio.it' + url
                    })
                }
            })
            let j = 1;
            squadre.forEach(squadra => {
                axios.get(squadra.url)
                    .then(response => {
                        const html = response.data
                        const $ = cheerio.load(html)
                        $('[itemprop="athlete"]', html).each(function () {
                            const imageUrl = $(this).find('.player-image').attr('src')
                            const name = $(this).find('.player-name span').text()
                            giocatori.push({
                                id: j++,
                                name: name,
                                imageUrl: imageUrl,
                                squadra: squadra.name
                            })
                        })
                    })
            })

        })
})

app.get('/', (req, res) => {
    res.json('Welcome to Fantacalcio Scraper API')
})

app.get('/fantacalcio', (req, res) => {
    res.json(squadre)
});

app.get('/fantacalcio/giocatori', (req, res) => {
    res.json(giocatori)
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
