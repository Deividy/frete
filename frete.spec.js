'use strict';

const assert = require('assert');
const frete = require('./frete');

describe("Frete", function () {
    it('Test validation errors', function (done) {
        var f = frete()

        f.preco(function (err) {
            let msg = err.message;

            msg.should.match(/Validation error:/);

            msg.should.match(/Required option: nVlPeso has invalid value: undefined/)
            msg.should.match(/Required option: nCdFormato has invalid value: undefined/)
            msg.should.match(/Required option: nVlComprimento has invalid value: undefined/)
            msg.should.match(/Required option: nVlAltura has invalid value: undefined/)
            msg.should.match(/Required option: nVlLargura has invalid value: undefined/)
            msg.should.match(/Required option: nVlDiametro has invalid value: undefined/)
            msg.should.match(/Required option: nVlValorDeclarado has invalid value: undefined/)
            msg.should.match(/Required option: nCdServico has invalid value:/)
            msg.should.match(/Required option: sCepOrigem has invalid value:/)
            msg.should.match(/Required option: sCepDestino has invalid value: undefined/)

            done();
        })
    });

    it('Set default options', function () {
        let defaultOptions = frete.defaultOptions;
        let expected = {
            sCepOrigem: '',
            sCdMaoPropria: 'N',
            sCdAvisoRecebimento: 'N',

            sDsSenha: '',
            nCdEmpresa: '',

            nCdServico: ''
        };

        assert.deepEqual(defaultOptions, expected);

        frete.cepOrigem('13467460').servico([
            frete.codigos.sedex,
            frete.codigos.sedex10,
            frete.codigos.pac
        ]);

        assert.notDeepEqual(defaultOptions, expected);

        expected.sCepOrigem = '13467460';
        expected.nCdServico = [ 40010, 40215, 41106 ];

        assert.deepEqual(defaultOptions, expected);
    });

    it('Request .prazo() ok', function (done) {
        let f = frete();

        f.prazo('13466321', function (err, results) {
            if (err) return done(err);

            let services = f.options.nCdServico;
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
            done()
        });
    });

    it('Requests .prazo() validation errors', function (done) {
        let f = frete().servico('');

        f.prazo('13466321', function (err) {
            assert.equal(/Validation error/.test(err.message), true)
            assert.equal(/Required option: nCdServico has invalid value/.test(err.message), true)
            assert.equal(/Expected a valid: string/.test(err.message), true)

            f.servico(frete.codigos.sedex);
            f.cepOrigem('');

            f.prazo('13466321', function (err) {
                assert.equal(/Required option: sCepOrigem has invalid value/.test(err.message), true)
                done()
            });
        });
    });

    it('Requests .prazo() correios error', function (done) {
        let f = frete();

        f.prazo('555555', function (err) {
            assert(/CEP de destino inexistente, consulte o Busca CEP./.test(err.message), true);
            assert(/Serviço indisponível para o trecho informado/.test(err.message), true);
            done();
        });
    });

    it('Request .preco()', function (done) {
        let f = frete();

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

            let services = f.options.nCdServico;
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
        let f = frete();

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

            let services = f.options.nCdServico;
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
        frete.cepOrigem('13467460').servico([ frete.codigos.sedex, frete.codigos.pac ]);

        var f = frete({
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
            let services = f.options.nCdServico;
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
});
