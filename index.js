const express = require('express');
const cors = require('cors');
const res = require('express/lib/response');

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hurryyyyyyyyyyyyyyyyyyyyy')
})
app.listen(port, () => {
    console.log('server running')
})

