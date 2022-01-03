Frete
===============

[![frete-sheriff](https://github.com/Deividy/frete/actions/workflows/frete-sheriff.yml/badge.svg)](https://github.com/Deividy/frete/actions/workflows/frete-sheriff.yml)
[![npm](https://img.shields.io/npm/v/npm.svg)](https://github.com/Deividy/frete)
[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/Deividy/frete)

[![NPM](https://nodei.co/npm/frete.png?mini=true)](https://nodei.co/npm/frete)

---

Modulo para consumo da `API` dos correios de calculo remoto de precos e prazos:
- http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx
- https://www.correios.com.br/atendimento/ferramentas/sistemas/arquivos/manual-de-implementacao-do-calculo-remoto-de-precos-e-prazos/view


Implementação  de todos os metodos disponiveis na API, com acessores simples e fáceis. :)

Para ganharmos um pouco de performance, usamos o wsdl salvo no folder [`./correios-data/CalcPrecoPrazo.xml`](./correios-data/CalcPrecoPrazo.xml), ao invés de fazermos o request inicial para isso.

Também mantemos uma lista de *todos* os serviços disponíveis pelos correio em [`./correios-data/listaServicos.json`](./correios-data/listaServicos.json), você pode atualizar essa lista juntamente com as definiçōes de TypeScript rodando o arquivo [`./scripts/dump-services.js`](./scripts/dump-services.js)

Todas as opções do `wsdl` estao disponíveis via os mesmos comandos, e os metodos estão disponíveis nos mesmos nomes mas em `camelCase` e sem o prefixo `Calc`, (e.g. `.precoPrazo()`).

Para maiores detalhes de usage, você pode checar os nossos tests em [`frete.spec.js`](./frete.spec.js)

## Exemplos

### Calculo simples de prazo usando promises:

```javascript
const frete = require('frete');

(async function() {
    const results = await frete()
        .cepOrigem('13467460')
        .servico(frete.servicos.sedex)
        .prazo('13466321');

        console.log(results);
})();


```

### Calculo simples de prazo:

```javascript
const frete = require('frete');

frete()
    .cepOrigem('13467460')
    .servico(frete.servicos.sedex)
    .prazo('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    })

```

### Calculo simples de preco:
```javascript
const frete = require('frete');

frete()
    .cepOrigem('13467460')
    .peso(1)
    .formato(frete.formatos.caixaPacote)
    .comprimento(16)
    .altura(2)
    .largura(11)
    .diametro(1)
    .maoPropria(frete.maoPropria.nao)
    .valorDeclarado(50)
    .avisoRecebimento(frete.avisoRecebimento.sim)
    .servico(frete.servicos.sedex)
    .preco('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    });
```

### Calculo simples de preco e prazo:
```javascript
const frete = require('frete');

frete()
    .cepOrigem('13467460')
    .peso(1)
    .formato(frete.formatos.caixaPacote)
    .comprimento(16)
    .altura(2)
    .largura(11)
    .diametro(1)
    .maoPropria(frete.maoPropria.nao)
    .valorDeclarado(50)
    .avisoRecebimento(frete.avisoRecebimento.sim)
    .servico(frete.servicos.sedex)
    .precoPrazo('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    });
```

### Default options:
```javascript

const frete = require('frete');
frete.cepOrigem('13467460').servico([ frete.servicos.sedex, frete.servicos.pac ]);

frete().prazo('13466321', function (err, results) {
    console.log(err);
    console.log(results);

    frete().prazo('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    });
});

```

### Objeto as config / More usages

```javascript
const frete = require('frete');
frete.cepOrigem('13467460').servico([ frete.servicos.sedex, frete.servicos.pac ]);

frete({
    cepDestino: '13466321',
    peso: 1,
    formato: frete.formatos.caixaPacote,
    comprimento: 16,
    altura: 2,
    largura: 11,
    diametro: 1,
    maoPropria: frete.maoPropria.nao,
    valorDeclarado: 50,
    avisoRecebimento: frete.avisoRecebimento.sim
}).prazo(function(err, result) {
    console.log(err);
    console.log(result);
});

```

### Utilities
```javascript
const frete = require('frete');

console.log(frete.servicos.list);
console.log(frete.servicos.search('sedex'));
console.log(frete.servicos.byCode[81876]);
```

---

## Dependency
- [argument-validator](https://github.com/Deividy/argument-validator)
- [node-soap](https://github.com/vpulim/node-soap)
