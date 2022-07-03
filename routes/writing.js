const router = require('express').Router()
const {authUser} = require('../functions/authorize')
const axios = require('axios');
const cheerio = require("cheerio");
const {Story} = require('../functions/models')

router.get('/', authUser(), (req, res, next) => {
    const message = req.session.message
    req.session.message = null
    res.render('writing/main', {
        message: message
    })
})

router.get('/addstory', authUser(), (req, res) => {
    res.render('writing/addStory')
})

router.post('/addstory', authUser(), async (req, res) => {
    const url = req.body.link // axios url string.
    // This is axios grabbing the page data from the "api" routes and adding the response to a variable.
    const data = await axios.get(url).then(response => {
        return response.data
    }).catch(error => {
        return error
    });

    const html = cheerio.load(data)
    const title = html('.css-i3xjnj-Title').text()
    const image = html(".css-cg8l2w-HeroUnsplashImage")

    const story = html('.css-1mu5bpv-TextContent-PostPage').html()
    const content = cheerio.load(story)('p')
    let storyData = ''
    let storyPreview = ''
    content.each(function(index) {
        const thisP = cheerio.load(this).text()
        index < 3 ? storyPreview = `${storyPreview}<p>${thisP}</p>` : null
        storyData = `${storyData}<p>${thisP}</p>`
    })

    const newStory = new Story({
        title: title,
        image: image.attr('src'),
        content: storyData,
        preview: storyPreview,
        url: url,
        published: req.body.publish == 'on' ? true : false
    })
    
    const exists = await req.findItem('writing', 'stories', {name: newStory.name})
    
    // await req.addItems('writing', 'stories', [newStory])

    res.render('writing/storyPreview',{
        data: newStory,
        exists: exists
    })
    
    
})

router.post('/confirmstory', authUser(), async (req, res) => {
    const data = new Story(req.body)
    data.addId(req.body._id)
    req.body._id ? await req.updateItem('writing', 'stories', {title: data.title}, data) : await req.addItems('writing', 'stories', [data])
    req.session.message = `Story ${req.body._id ? 'updated' : 'added'}!`
    res.redirect('/writing')
})

module.exports = router