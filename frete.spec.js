'use strict';

const assert = require('assert');
const frete = require('./frete');

describe("Frete", function () {
    it('Test validation errors', function (done) {
        const f = frete();

        f.preco(function (err) {
            const msg = err.message;

            assert((/Validation error:/).test(msg));

            assert((/Required option: nVlPeso has invalid value: undefined/).test(msg));
            assert((/Required option: nCdFormato has invalid value: undefined/).test(msg));
            assert((/Required option: nVlComprimento has invalid value: undefined/).test(msg));
            assert((/Required option: nVlAltura has invalid value: undefined/).test(msg));
            assert((/Required option: nVlLargura has invalid value: undefined/).test(msg));
            assert((/Required option: nVlDiametro has invalid value: undefined/).test(msg));
            assert((/Required option: nVlValorDeclarado has invalid value: undefined/).test(msg));
            assert((/Required option: nCdServico has invalid value:/).test(msg));
            assert((/Required option: sCepOrigem has invalid value:/).test(msg));
            assert((/Required option: sCepDestino has invalid value: undefined/).test(msg));

            done();
        });
    });

    it('Set default options', function () {
        const defaultOptions = frete.defaultOptions;
        const expected = {
            sCepOrigem: '',
            sCdMaoPropria: 'N',
            sCdAvisoRecebimento: 'N',

            sDsSenha: '',
            nCdEmpresa: '',

            nCdServico: ''
        };

        assert.deepEqual(defaultOptions, expected);

        frete.cepOrigem('13467460').servico([
            frete.servicos.sedex
        ]);

        assert.notDeepEqual(defaultOptions, expected);

        expected.sCepOrigem = '13467460';
        expected.nCdServico = [ '04014' ];

        assert.deepEqual(defaultOptions, expected);
    });

    it('Request .prazo() ok', function (done) {
        const f = frete().servico([ frete.servicos.sedex ]).cepOrigem('13467460');

        f.prazo('13466321', function (err, results) {
            if (err) return done(err);

            const services = f.options.nCdServico;
            let hasAllServices = true;

            services.forEach(function (service) {
                let hasService = false;
                for (let i = 0; i < results.length; ++i) {
                    if (results[i].codigo == service) {
                        hasService = true;
                        break;
                    }
                }

                if (!hasService) {
                    hasAllServices = false;
                }
            });

            assert.equal(hasAllServices, true);
            done();
        });
    });

    it('Requests .prazo() validation errors', function (done) {
        const f = frete().servico('');

        f.prazo('13466321', function (err) {
            assert.equal((/Validation error/).test(err.message), true);
            assert.equal((/Required option: nCdServico has invalid value/).test(err.message), true);
            assert.equal((/Expected a valid: string/).test(err.message), true);

            f.servico(frete.codigos.sedex);
            f.cepOrigem('');

            f.prazo('13466321', function (err) {
                assert.equal(
                    (/Required option: sCepOrigem has invalid value/).test(err.message),
                    true);

                done();
            });
        });
    });

    it('Requests .prazo() correios error', function (done) {
        const f = frete().servico([ frete.servicos.sedex ]).cepOrigem('13467460');

        f.prazo('555555', function (err) {
            assert((/CEP de destino inexistente, consulte o Busca CEP./).test(err.message));
            done();
        });
    });

    it('Request .preco()', function (done) {
        const f = frete().servico([ frete.servicos.sedex ]).cepOrigem('13467460');

        f
            .peso(1)
            .formato(1)
            .comprimento(16)
            .altura(2)
            .largura(11)
            .diametro(1)
            .maoPropria('N')
            .valorDeclarado(50)
            .avisoRecebimento('S');

        f.preco('13466321', function (err, results) {
            if (err) return done(err);

            const services = f.options.nCdServico;
            let hasAllServices = true;

            services.forEach(function (service) {
                let hasService = false;
                for (let i = 0; i < results.length; ++i) {
                    if (results[i].codigo == service) {
                        hasService = true;
                        break;
                    }
                }

                if (!hasService) {
                    hasAllServices = false;
                }
            });

            assert.equal(hasAllServices, true);

            done();
        });
    });

    it('Request .precoPrazo()', function (done) {
        const f = frete().servico([ frete.servicos.sedex ]).cepOrigem('13467460');

        f
            .peso(1)
            .formato(1)
            .comprimento(16)
            .altura(2)
            .largura(11)
            .diametro(1)
            .maoPropria('N')
            .valorDeclarado(50)
            .avisoRecebimento('S');

        f.precoPrazo('13466321', function (err, results) {
            if (err) return done(err);

            const services = f.options.nCdServico;
            let hasAllServices = true;

            services.forEach(function (service) {
                let hasService = false;
                for (let i = 0; i < results.length; ++i) {
                    if (results[i].codigo == service) {
                        hasService = true;
                        break;
                    }
                }

                if (!hasService) {
                    hasAllServices = false;
                }
            });

            assert.equal(hasAllServices, true);

            done();
        });
    });

    it('Request .preco() config object', function (done) {
        frete.cepOrigem('13467460').servico([ frete.codigos.pac ]);

        const f = frete({
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
        });

        f.preco(function(err, results) {
            if (err) { return done(err); }

            const services = f.options.nCdServico;
            let hasAllServices = true;

            services.forEach(function (service) {
                let hasService = false;
                for (let i = 0; i < results.length; ++i) {
                    if (results[i].codigo == service) {
                        hasService = true;
                        break;
                    }
                }

                if (!hasService) {
                    hasAllServices = false;
                }
            });

            assert.equal(hasAllServices, true);

            done();
        });
    });

    it('[promises] support .preco()', async() => {
        frete.cepOrigem('13467460').servico([ frete.codigos.pac ]);

        const f = frete({
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
        });

        const results = await f.preco({});

        const services = f.options.nCdServico;
        let hasAllServices = true;

        services.forEach(function (service) {
            let hasService = false;
            for (let i = 0; i < results.length; ++i) {
                if (results[i].codigo == service) {
                    hasService = true;
                    break;
                }
            }

            if (!hasService) {
                hasAllServices = false;
            }
        });

        assert.equal(hasAllServices, true);
    });

    it('[promises] Request .prazo() ok', async() => {
        const f = frete().servico([ frete.servicos.sedex ]).cepOrigem('13467460');

        const results = await f.prazo('13466321');

        const services = f.options.nCdServico;
        let hasAllServices = true;

        services.forEach(function (service) {
            let hasService = false;
            for (let i = 0; i < results.length; ++i) {
                if (results[i].codigo == service) {
                    hasService = true;
                    break;
                }
            }

            if (!hasService) {
                hasAllServices = false;
            }
        });

        assert.equal(hasAllServices, true);
    });

    it('[promises] requests .prazo() validation errors', async() => {
        let f = frete().servico('');

        try {
            const results = await f.prazo('13466321');
            assert(!results);
        } catch(err) {
            assert.equal((/Validation error/).test(err.message), true);
            assert.equal((/Required option: nCdServico has invalid value/).test(err.message), true);
            assert.equal((/Expected a valid: string/).test(err.message), true);

            f.servico(frete.codigos.sedex);
            f.cepOrigem('');
        }

        try {
            const results = await f.prazo('13466321');
            assert(!results);
        } catch (err) {
            assert.equal((/Required option: sCepOrigem has invalid value/).test(err.message), true);
        }
    });

    it('[promises] request .precoPrazo()', async() => {
        const f = frete().servico([ frete.servicos.sedex ]).cepOrigem('13467460');

        f
            .peso(1)
            .formato(1)
            .comprimento(16)
            .altura(2)
            .largura(11)
            .diametro(1)
            .maoPropria('N')
            .valorDeclarado(50)
            .avisoRecebimento('S');

        const results = await f.precoPrazo('13466321');
        const services = f.options.nCdServico;
        let hasAllServices = true;

        services.forEach(function (service) {
            let hasService = false;
            for (let i = 0; i < results.length; ++i) {
                if (results[i].codigo == service) {
                    hasService = true;
                    break;
                }
            }

            if (!hasService) {
                hasAllServices = false;
            }
        });

        assert.equal(hasAllServices, true);
    });

    it('[promises] request .preco() config object', async() => {
        frete.cepOrigem('13467460').servico([ frete.codigos.pac ]);

        const f = frete({
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
        });

        const results = await f.preco();

        const services = f.options.nCdServico;
        let hasAllServices = true;

        services.forEach(function (service) {
            let hasService = false;
            for (let i = 0; i < results.length; ++i) {
                if (results[i].codigo == service) {
                    hasService = true;
                    break;
                }
            }

            if (!hasService) {
                hasAllServices = false;
            }
        });

        assert.equal(hasAllServices, true);
    });

    it('listaServicos', async () => {
        const results = await frete().listaServicos();

        assert(results);
        assert(results.length > 10);

        const basicServices = [
            '04014',
            '04065',
            '04510',
            '04707',
            '40215',
            '40169',
            '40290'
        ];

        for (const service of basicServices) {
            assert(results.some((r) => r.codigo == service));
        }
    });

    it('listaServicosStar', async () => {
        const results = await frete().listaServicosStar();

        // just some sanity check
        assert(results);
        assert(results.length > 10);
    });

    it('verificaModal', async () => {
        const results = await frete({
            cepOrigem: '13467460',
            cepDestino: '13466321',
        }).servico([ frete.servicos.sedex ]).verificaModal();

        assert(results);
        assert(results.length, 1);
        assert(results[0].codigo, '04014');
    });

    it('searches a service by text', () => {
        assert(frete.servicos.search('sedex').length > 90);
        assert(frete.servicos.search('carta registrada').length > 10);

        // accepts any case
        assert(frete.servicos.search('CARTA registrAdA A VISTA').length === 1);
    });

    it('sanity check services', () => {
        assert.strictEqual(frete.servicos.list.length, 338);

        assert(frete.servicos.search('SEDEX a vista')[0].codigo === '04014');
        assert(frete.servicos.search('SEDEX a vista pgto na entrega')[0].codigo === '04065');
        assert(frete.servicos.search('PAC a vista')[0].codigo === '04510');
        assert(frete.servicos.search('PAC a vista pagto na entrega')[0].codigo === '04707');
        assert(frete.servicos.search('SEDEX 10 A FATURAR')[0].codigo === '40215');
        assert(frete.servicos.search('SEDEX 12 A FATURAR')[0].codigo === '40169');
        assert(frete.servicos.search('SEDEX HOJE A FATURAR')[0].codigo === '40290');
    });

    it('Request .prazo with a string service', async () => {
        const f = frete().servico('82414').cepOrigem('13467460');
        const results = await f.prazo('13466321');

        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].codigo, 82414);
        assert.strictEqual(results[0].name, 'FAC MONITORADO LOCAL');
        assert.strictEqual(results[0].name, frete.servicos.byCode[82414].descricao);
    });
});
