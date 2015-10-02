'use strict';

const path = require('path');

const soap = require('soap');
const V = require('argument-validator');

// on file system to improve perf.
const SOAP_WSDL = path.resolve(__dirname, 'wsdl/CalcPrecoPrazo.xml');

function extend (target /*, objs... */) {
    V.objectOrEmpty(target, 'target');

    for (let i = 1; i < arguments.length; ++i) {
        let obj = arguments[i];

        V.objectOrEmpty(obj, 'object in argument position: ' + i);
        for (let key in obj) {
            target[key] = obj[key];
        }
    }

    return target;
};

const defaultOptions = {
    sCepOrigem: '',
    sCdMaoPropria: 'N',
    sCdAvisoRecebimento: 'N',

    sDsSenha: '',
    nCdEmpresa: '',

    nCdServico: ''
};

const allOptions = [
    'sCepOrigem',
    'sCepDestino',
    'sCdMaoPropria',
    'sCdAvisoRecebimento',
    'sDsSenha',
    'nCdEmpresa',
    'nCdServico',
    'nVlValorDeclarado',
    'nVlPeso',
    'nCdFormato',
    'nVlComprimento',
    'nVlAltura',
    'nVlLargura',
    'nVlDiametro',
    'nVlValorDeclarado',
    'sDtCalculo',
    'strDataCalculo'
];

function frete (opts) {
    opts = opts || {};
    V.objectOrEmpty(opts, 'options');

    return new Frete(extend({}, defaultOptions, opts));
};

frete.codigos = {
    sedex: 40010,
    sedexCobrar: 40045,
    sedex10: 40215,
    sedexHoje: 40290,
    pac: 41106
};

frete.codigos.names = {
    40010: 'Sedex',
    40045: 'Sedex a cobrar',
    40215: 'Sedex 10',
    40290: 'Sedex hoje',
    41106: 'PAC'
};

allOptions.forEach(function (opt) {
    var setters = buildSetters(defaultOptions, opt);

    for (let setterName in setters) {
        frete[setterName] = setters[setterName];
    }
});

frete.defaultOptions = defaultOptions;

function Frete (opts) {
    V.object(opts, 'opts');

    const self = this;

    self.options = opts;
    allOptions.forEach(function (opt) {
        var setters = buildSetters(self.options, opt);

        for (let setterName in setters) {
            self[setterName] = setters[setterName];
        }
    });
}

const apiMethods = {
    prazo: {
        correiosMethodName: 'CalcPrazo',
        required: [ ]
    },

    prazoData: {
        correiosMethodName: 'CalcPrazoData',
        required: [ 'sDtCalculo' ]
    },

    preco: {
        correiosMethodName: 'CalcPreco',
        required: [
            'nVlPeso',
            'nCdFormato',
            'nVlComprimento',
            'nVlAltura',
            'nVlLargura',
            'nVlDiametro',
            'sCdMaoPropria',
            'nVlValorDeclarado',
            'sCdAvisoRecebimento'
        ]
    },

    precoData: {
        correiosMethodName: 'CalcPrecoData',
        required: [
            'nVlPeso',
            'nCdFormato',
            'nVlComprimento',
            'nVlAltura',
            'nVlLargura',
            'nVlDiametro',
            'sCdMaoPropria',
            'nVlValorDeclarado',
            'sCdAvisoRecebimento',
            'sDtCalculo'
        ]
    },

    precoFac: {
        correiosMethodName: 'CalcPrecoFAC',
        required: [
            'nVlPeso',
            'strDataCalculo'
        ]
    },

    precoPrazo: {
        correiosMethodName: 'CalcPrecoPrazo',
        required: [
            'nVlPeso',
            'nCdFormato',
            'nVlComprimento',
            'nVlAltura',
            'nVlLargura',
            'nVlDiametro',
            'sCdMaoPropria',
            'nVlValorDeclarado',
            'sCdAvisoRecebimento'
        ]
    },

    precoPrazoData: {
        correiosMethodName: 'CalcPrecoPrazoData',
        required: [
            'nVlPeso',
            'nCdFormato',
            'nVlComprimento',
            'nVlAltura',
            'nVlLargura',
            'nVlDiametro',
            'sCdMaoPropria',
            'nVlValorDeclarado',
            'sCdAvisoRecebimento',
            'sDtCalculo'
        ]
    },

    precoPrazoRestricao: {
        correiosMethodName: 'CalcPrecoPrazoRestricao',
        required: [
            'nVlPeso',
            'nCdFormato',
            'nVlComprimento',
            'nVlAltura',
            'nVlLargura',
            'nVlDiametro',
            'sCdMaoPropria',
            'nVlValorDeclarado',
            'sCdAvisoRecebimento',
            'sDtCalculo'
        ]
    }
};

for (let methodName in apiMethods) {
    let api = apiMethods[methodName];
    defineFreteApiMethod(methodName, api.correiosMethodName);
}

function defineFreteApiMethod (methodName, correiosMethodName) {
    V.string(methodName, 'methodName');
    V.string(correiosMethodName, 'correiosMethodName');

    let correiosResultNode = correiosMethodName + "Result";

    Frete.prototype[methodName] = function (cep, optsOrCallback, callback) {
        var opts = optsOrCallback;
        if (V.isFunction(optsOrCallback) && !callback) {
            callback = optsOrCallback;
            opts = {};
        }

        V.string(cep, 'cep');
        V.objectOrEmpty(opts, 'options');
        V.function(callback, 'callback');

        opts = extend({}, this.options, opts);
        opts.sCepDestino = cep;

        // special case, can be an array
        if (V.isArray(opts.nCdServico)) {
            opts.nCdServico = opts.nCdServico.join(',');
        }
        // special case, can be a number
        if (V.isNumber(opts.nCdServico)) {
            opts.nCdServico = String(opts.nCdServico);
        }

        let errors = tryGetValidationErrors(methodName, opts);
        if (errors.length > 0) {
            let err = new Error("Validation error:\n " + errors.join("\n"));
            return callback(err);
        }

        soap.createClient(SOAP_WSDL, function (err, client) {
            if (err) return callback(err);

            client[correiosMethodName](opts, function (err, res, body) {
                if (err) return callback(err, res, body);

                if (res[correiosResultNode] && res[correiosResultNode].Servicos) {
                    var services = res[correiosResultNode].Servicos.cServico;

                    let errors = [];

                    services.forEach(function(service) {
                        for (let key in service) {
                            let value = service[key];

                            delete service[key];

                            let keyCamelCase = key[0].toLowerCase() + '' + key.substring(1);
                            service[keyCamelCase] = value;
                        }

                        if (service.msgErro && errors.indexOf(service.msgErro) === -1) {
                            errors.push(service.msgErro);
                        }
                        service.name = frete.codigos.names[service.codigo];
                    });

                    if (errors.length > 0) {
                        return callback(errors, res, body);
                    }

                    callback(null, services);
                    return;
                }

                callback("Unknown response", res, body);
            });
        });
    };
}

function tryGetValidationErrors (methodName, options) {
    V.string(methodName, 'methodName');
    V.object(options, 'options');

    let api = apiMethods[methodName];
    if (!api) {
        throw new Error("Invalid method name: " + methodName);
    }

    let requiredFields = api.required.concat(['nCdServico', 'sCepOrigem', 'sCepDestino']);

    let errors = [];
    requiredFields.forEach(function(fieldName) {
        // special case for cdServico since its a string but starts with n
        // and accepts more numbers with ,
        let isString = fieldName == 'nCdServico' || fieldName[0] === 's';
        let isNumber = fieldName != 'nCdServico' && fieldName[0] === 'n';

        let value = options[fieldName];
        if ((isString && !V.isString(value)) || (isNumber && !V.isNumber(value))) {
            let msg = "Required option: " + fieldName + " has invalid value: " + value;
            msg += "\nExpected a valid: " + (isString ? 'string' : 'number');
            errors.push(msg);
        }
    });

    return errors;
}

function buildSetters (optionsObject, propertyName) {
    V.object(optionsObject, 'options object');
    V.string(propertyName, 'property name');

    let isService = false;
    let isString = false;
    let isNumber = false;

    // Servico is an special property, since it can have multiple codes,
    // in that case, we accept an array, string or number
    if (propertyName === 'nCdServico') {
        isService = true;
    } else {
        isString = propertyName[0] === 's';
        isNumber = propertyName[0] === 'n';
    }

    // special case for DataCalculo
    // PO!! Parece que o pessoal dos correios tem nenhum pattern! f*ck :(
    let prettyNameMethod;
    if (propertyName === 'strDataCalculo') {
        prettyNameMethod = 'dataCalculo';
    } else {
        // first, remove the s/n of initial
        prettyNameMethod = propertyName.substring(1);

        // after that remove the prefix Cd (code) and Vl(value) of argument
        prettyNameMethod = prettyNameMethod.replace('Cd', '');
        prettyNameMethod = prettyNameMethod.replace('Vl', '');

        // now we need to set the first letter to lowerCase(), just to be cool
        let firstLetter = prettyNameMethod[0].toLowerCase();
        prettyNameMethod = firstLetter + prettyNameMethod.substring(1);
    }

    var setters = {};
    setters[propertyName] = setters[prettyNameMethod] = function (value) {
        if (isString) {
            V.string(value, 'value');
        } else if (isNumber) {
            V.number(value, 'value');
        }

        // MUST: validate service
        optionsObject[propertyName] = value;
        return this;
    };

    return setters;
}

module.exports = frete;
