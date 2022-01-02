#!/usr/bin/env node

const frete = require('../frete');
const path = require('path');
const fs = require('fs');

(async() => {
    console.log('Getting services...');

    // well, listaServicos returns duplicated services, lets remove them
    const services = (await frete().listaServicos()).reduce((acc, curr) => {
        if (acc.some((c) => c.codigo === curr.codigo)) { return acc; }

        return acc.concat(curr);
    }, []);

    console.log(`Got a total of: ${services.length}`);

    const filepath = path.resolve(
        __dirname, '../correios-data', 'listaServicos.json'
    );
    await fs.promises.writeFile(filepath, JSON.stringify(services));

    console.log(`Services saved to: ${filepath}`);

    // *super-duper-hacky* {
    const freteTypeScriptDefinitionsStr = (await fs.promises.readFile(
        path.resolve(__dirname, '../frete.d.ts')
    )).toString();

    const tsDefinitionParts = freteTypeScriptDefinitionsStr
        .split(' CodigosServicoMapName {');

    const beforeDefinition = `${tsDefinitionParts[0]} CodigosServicoMapName {`;
    const afterDefinition = tsDefinitionParts[1]
        .split('}\n')
        .slice(1)
        .join('}\n');

    const servicesContentDef = services
        .map((s) => `       '${s.codigo}': '${s.descricao}';`)
        .join('\n');

    const freteTsDefinition = `${beforeDefinition}\n` +
        `${servicesContentDef}\n    }\n` +
        afterDefinition;

    await fs.promises.writeFile(
        path.resolve(__dirname, '../frete.d.ts'),
        freteTsDefinition);

    console.log('Mapped services to ./frete.d.ts.');
    // }
})();
