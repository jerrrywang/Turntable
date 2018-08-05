const app = require('express')();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/test', (req, res) => {
    res.send("Yup, this test is working!")
});


app.listen(1337)
