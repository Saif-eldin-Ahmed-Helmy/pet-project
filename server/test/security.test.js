const assert = require('node:assert/strict');
const { once } = require('node:events');
const { test } = require('node:test');
const express = require('express');

test('image upload rejects an anonymous request before touching Cloudinary', async () => {
    const app = express();
    app.use((req, _res, next) => { req.isAuthenticated = () => false; next(); });
    app.use('/api/images', require('../routes/Images'));
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/api/images/upload`, {
            method: 'POST',
        });
        assert.equal(response.status, 401);
    } finally {
        server.close();
    }
});
