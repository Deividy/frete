#!/usr/bin/env node

const frete = require('./frete');
const path = require('path');
const fs = require('fs');

(async() => {
    console.log('Getting services...');

    const services = await frete().listaServicos();
    console.log(`Got a total of: ${services.length}`);

    const filepath = path.resolve(__dirname, 'dumps', 'listaServicos.json');
    await fs.promises.writeFile(filepath, JSON.stringify(services));

    console.log(`Services saved to: ${filepath}`);
})();
