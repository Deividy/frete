Frete
===============

[![Build Status](https://travis-ci.org/Deividy/frete.png?branch=master)](https://travis-ci.org/Deividy/frete)
[![npm](https://img.shields.io/npm/v/npm.svg)](https://github.com/Deividy/frete)
[![npm](https://img.shields.io/npm/l/express.svg)](https://github.com/Deividy/frete)

[![NPM](https://nodei.co/npm/frete.png?mini=true)](https://nodei.co/npm/frete)

---

Modulo para consumo da `API` dos correios de calculo remoto de precos e prazos:
- http://www.correios.com.br/para-voce/correios-de-a-a-z/pdf/calculador-remoto-de-precos-e-prazos/manual-de-implementacao-do-calculo-remoto-de-precos-e-prazos
- http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx


Implementação  de todos os metodos disponiveis na API, com acessores simples e fáceis. :)

Para ganharmos um pouco de performance, usamos o wsdl salvo no folder `/wsdl`, ao inves de fazermos o request inicial para isso.


Todas as opcoes do `wsdl` estao disponíveis via os mesmos comandos, e os metodos estao disponíveis nos mesmos nomes mas em `camelCase` e sem o prefixo `Calc`, (e.g. `.precoPrazo()`).

## Exemplos

### Calculo simples de prazo:

```javascript
var frete = require('frete');

frete()
    .cepOrigem('13467460')
    .servico(frete.codigos.sedex)
    .prazo('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    })

```

### Calculo simples de preco:
```javascript
var frete = require('frete');

frete()
    .cepOrigem('13467460')
    .peso(1)
    .formato(1)
    .comprimento(16)
    .altura(2)
    .largura(11)
    .diametro(1)
    .maoPropria('N')
    .valorDeclarado(50)
    .avisoRecebimento('S')
    .servico(frete.codigos.sedex)
    .preco('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    });
```

### Calculo simples de preco e prazo:
```javascript
var frete = require('frete');

frete()
    .cepOrigem('13467460')
    .peso(1)
    .formato(1)
    .comprimento(16)
    .altura(2)
    .largura(11)
    .diametro(1)
    .maoPropria('N')
    .valorDeclarado(50)
    .avisoRecebimento('S')
    .servico(frete.codigos.sedex)
    .precoPrazo('13466321', function (err, results) {
        console.log(err);
        console.log(results);
    });
```

### Default options:
```javascript

var frete = require('frete');
frete.cepOrigem('13467460').servico([ frete.codigos.sedex, frete.codigos.pac ]);

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
var frete = require('frete');
frete.cepOrigem('13467460').servico([ frete.codigos.sedex, frete.codigos.pac ]);

frete({
    cepDestino: '13466321',
    peso: 1,
    formato: 1,
    comprimento: 16,
    altura: 2,
    largura: 11,
    diametro: 1,
    maoPropria: 'N',
    valorDeclarado: 50,
    avisoRecebimento: 'S'
}).preco(function(err, result) {
    console.log(err);
    console.log(result);
});


```

---

## Dependency
- [argument-validator](https://github.com/Deividy/argument-validator)
- [node-soap](https://github.com/vpulim/node-soap)
