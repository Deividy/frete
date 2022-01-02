'use strict';

const path = require('path');

const soap = require('soap');
const V = require('argument-validator');
const util = require('util');

// on file system to improve perf.
const SOAP_WSDL = path.resolve(__dirname, 'correios-data/CalcPrecoPrazo.xml');
const servicesArray = require('./correios-data/listaServicos.json');

function extend (target /* , objs... */) {
    V.objectOrEmpty(target, 'target');

    for (let i = 1; i < arguments.length; ++i) {
        let obj = arguments[i];

        V.objectOrEmpty(obj, 'object in argument position: ' + i);
        for (let key in obj) {
            target[key] = obj[key];
        }
    }

    return target;
}

function frete (opts) {
    opts = opts || {};
    V.objectOrEmpty(opts, 'options');

    return new Frete(extend({}, defaultOptions, opts));
}

frete.formatos = {
    caixaPacote: 1,
    roloPrisma: 2,
    envelope: 3
};

// just some of the most used services, if you are using a service too much
// consider adding it here
frete.servicos = {
    sedex: '04014',
    sedexCobrar: '04065',
    pac: '04510',
    pacCobrar: '04707',
    sedex10: '40215',
    sedex12: '40169',
    sedexHoje: '40290',
};

frete.codigos = frete.servicos;

frete.servicos.list = servicesArray;
frete.servicos.byCode = servicesArray.reduce((acc, curr) => {
    acc[curr.codigo] = curr;
    return acc;
}, {});

frete.servicos.names = servicesArray.reduce((acc, curr) => {
    acc[curr.codigo] = curr.descricao;
    return acc;
}, {});

frete.servicos.search = (text) => {
    V.string(text, 'text');

    return frete.servicos.list.filter((s) =>
        s.descricao.toLowerCase().includes(text.toLowerCase()));
};

frete.maoPropria = {
    sim: 'S',
    nao: 'N'
};

frete.avisoRecebimento = {
    sim: 'S',
    nao: 'N'
};

const defaultOptions = {
    sCepOrigem: '',
    sCdMaoPropria: frete.maoPropria.nao,
    sCdAvisoRecebimento: frete.avisoRecebimento.nao,

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

for (const propertyName of allOptions) {
    const setterName = getSetterName(propertyName);
    const proto = Frete.prototype;

    frete[propertyName] = frete[setterName] = function (value) {
        defaultOptions[propertyName] = value;
        return this;
    };

    proto[propertyName] = proto[setterName] = function (value) {
        this.options[propertyName] = value;
        return this;
    };
}

frete.defaultOptions = defaultOptions;

function Frete (opts) {
    V.object(opts, 'opts');

    this.options = opts;
    for (const key in this.options) {
        const value = this.options[key];

        if (!V.isFunction(this[key])) {
            continue;
        }

        if (V.isString(value) || V.isNumber(value) || V.isArray(value)) {
            this[key](value);
        }
    }
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
    },

    listaServicos: {
        correiosMethodName: 'ListaServicos'
    },

    listaServicosStar: {
        correiosMethodName: 'ListaServicosSTAR'
    },

    verificaModal: {
        correiosMethodName: 'VerificaModal',
        required: []
    }
};

for (const methodName in apiMethods) {
    const api = apiMethods[methodName];
    defineFreteApiMethod(methodName, api.correiosMethodName);
}

function defineFreteApiMethod (methodName, correiosMethodName) {
    V.string(methodName, 'methodName');
    V.string(correiosMethodName, 'correiosMethodName');

    Frete.prototype[methodName] = function (cep, optsOrCallback, callback) {
        var opts = optsOrCallback;

        if (V.isFunction(cep) && arguments.length === 1) {
            callback = cep;
            opts = {};
        }

        if (V.isFunction(optsOrCallback) && !callback) {
            callback = optsOrCallback;
            opts = {};
        }

        if (!optsOrCallback && !callback) {
            const fn = this[methodName].bind(this, cep, optsOrCallback || {});
            return util.promisify(fn)();
        }

        V.objectOrEmpty(opts, 'options');
        opts = extend({}, this.options, opts);

        if (opts.cep || opts.cepDestino || opts.sCepDestino) {
            cep = opts.cep || opts.cepDestino || opts.sCepDestino;
        }

        V.function(callback, 'callback');

        if (V.isString(cep)) {
            opts.sCepDestino = cep;
        }

        if (V.isArray(opts.nCdServico)) {
            opts.nCdServico = opts.nCdServico.join(',');
        }
        // special case, can be a number
        if (V.isNumber(opts.nCdServico)) {
            opts.nCdServico = String(opts.nCdServico);
        }

        const errors = getValidationErrors(methodName, opts);
        if (errors.length > 0) {
            const err = new Error("Validation error:\n" + errors.join("\n"));
            return callback(err);
        }

        doRequest(correiosMethodName, opts, callback);
    };
}

function execute (methodName, opts, callback) {
    V.string(methodName, 'methodName');
    V.object(opts, 'opts');

    soap.createClient(SOAP_WSDL, function (err, client) {
        if (err) return callback(err);

        client[methodName](opts, callback);
    });
}

function decorateServices (services) {
    for (const service of services) {
        for (const key in service) {
            const value = service[key];

            delete service[key];

            const keyCamelCase = key[0].toLowerCase() + '' + key.substring(1);
            service[keyCamelCase] = value;
        }
        service.name = frete.servicos.names[String(service.codigo).padStart(5, '0')];
    }

    return services;
}

function getErrorsFromServices (services) {
    const errors = [];

    for (const service of services) {
        if (service.MsgErro && !errors.includes(service.MsgErro)) {
            errors.push(`${service.MsgErro} ${service.Erro || ''}`.trim());
        }
    }

    return errors;
}

const resultParsers = {
    ListaServicos(body) { return body.ServicosCalculo.cServicosCalculo; },
    ListaServicosSTAR(body) { return body.ServicosCalculo.cServicosCalculo; },
    VerificaModal(body) { return body.ServicosModal.cModal; }
};

function doRequest(methodName, opts, callback) {
    V.string(methodName, 'methodName');
    V.object(opts, 'opts');
    V.function(callback, 'callback');

    const resultNode = methodName + "Result";
    execute(methodName, opts, function (err, res, body) {
        if (err) return callback(err, res, body);

        if (res[resultNode] && res[resultNode].Servicos) {
            var services = res[resultNode].Servicos.cServico;

            if (!services || !V.isArray(services)) {
                return callback("Unknown response. cServico not found.", res, body);
            }

            const errors = getErrorsFromServices(services);
            if (errors.length > 0) {
                const err = new Error(methodName + ":\n" + errors.join("\n"));
                return callback(err, res, body);
            }

            return callback(null, decorateServices(services));
        }

        if (res[resultNode] && resultParsers[methodName]) {
            try {
                const parser = resultParsers[methodName];

                return callback(null, parser(res[resultNode]));
            } catch (ex) {
                return callback("Unknown response", res, body);
            }
        }

        return callback("Unknown response", res, body);
    });
}

function getValidationErrors (methodName, options) {
    V.string(methodName, 'methodName');
    V.object(options, 'options');

    const api = apiMethods[methodName];
    if (!api) {
        throw new Error("Invalid method name: " + methodName);
    }

    const requiredFields = api.required ?
        api.required.concat(['nCdServico', 'sCepOrigem', 'sCepDestino']) : [];

    const errors = [];
    for (const fieldName of requiredFields) {
        // special case for cdServico since its a string but starts with n
        // and accepts more numbers with ,
        const isString = fieldName == 'nCdServico' || fieldName[0] === 's';
        const isNumber = fieldName != 'nCdServico' && fieldName[0] === 'n';

        const value = options[fieldName];
        if ((isString && !V.isString(value)) || (isNumber && !V.isNumber(value))) {
            let msg = `Required option: ${fieldName} has invalid value: ${value}`;
            msg += `\nExpected a valid: ${(isString ? 'string' : 'number')}`;

            errors.push(msg);
        }
    }

    if (V.isArray(options.nCdServico) && options.nCdServico.length > 1) {
        errors.push('Máximo de 1 código de serviço por consulta.');
    }

    return errors;
}

function getSetterName (propertyName) {
    V.string(propertyName, 'property name');

    // special case for DataCalculo
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
        const firstLetter = prettyNameMethod[0].toLowerCase();
        prettyNameMethod = firstLetter + prettyNameMethod.substring(1);
    }

    return prettyNameMethod;
}

module.exports = frete;
