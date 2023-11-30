const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    
});

router.post('/', (req, res) => {

});

router.put('/', (req, res) => {
        req.json().then((data) => {
            console.log(data);
        });
});

module.exports = router;