declare module 'frete' {
    export interface CodigosServicoMapName {
        '04014': 'SEDEX à vista';
        '04065': 'SEDEX à vista pagamento na entrega';
        '04510': 'PAC à vista';
        '04707': 'PAC à vista pagamento na entrega';
        '40215': 'SEDEX 10 (à vista e a faturar)*';
        '40169': 'SEDEX 12 (à vista e a faturar)*';
        '40290': 'SEDEX Hoje Varejo*';
    }

    export type CodigosServico = keyof CodigosServicoMapName;

    export type Formato = 1 | 2 | 3;

    export interface FreteOptions {
        cepOrigem: string;
        sCepOrigem: string;
        cepDestino: string;
        sCepDestino: string;
        maoPropria: 'S' | 'N';
        sCdMaoPropria: 'S' | 'N';
        avisoRecebimento: 'S' | 'N';
        sCdAvisoRecebimento: 'S' | 'N';
        dsSenha: string;
        sDsSenha: string;
        empresa: string;
        nCdEmpresa: string;
        servico: CodigosServico;
        nCdServico: CodigosServico;
        valorDeclarado: number;
        nVlValorDeclarado: number;
        peso: number;
        nVlPeso: number;
        formato: Formato;
        nCdFormato: Formato;
        comprimento: number;
        nVlComprimento: number;
        altura: number;
        nVlAltura: number;
        largura: number;
        nVlLargura: number;
        diametro: number;
        nVlDiametro: number;
        dtCalculo: string;
        sDtCalculo: string;
        dataCalculo: string;
        strDataCalculo: string;
    }

    export type FretePropertiesPrototype = {
        [K in keyof FreteOptions]: (value: FreteOptions[K]) => Frete;
    }

    export type Callback<T = any> = (err: any, response: T, body: any) => void;

    export interface ApiFunction {
        <T = any>(callback: Callback<T>): T;
        <T = any>(cep: string): Promise<T>;
        <T = any>(cep: string, callback: Callback<T>): T;
        <T = any>(cep: string, options: Partial<FreteOptions>, callback: Callback<T>): T;
    }

    export interface Frete extends FretePropertiesPrototype {
        prazo: ApiFunction;
        prazoData: ApiFunction;
        preco: ApiFunction;
        precoData: ApiFunction;
        precoFac: ApiFunction;
        precoPrazo: ApiFunction;
        precoPrazoData: ApiFunction;
        precoPrazoRestricao: ApiFunction;
    }
    
    export interface FreteFunction extends FretePropertiesPrototype {
        (opts?: Partial<FreteOptions>): Frete;
        servicos: {
            sedex: CodigosServico;
            sedexCobrar: CodigosServico;
            pac: CodigosServico;
            pacCobrar: CodigosServico;
            sedex10: CodigosServico;
            sedex12: CodigosServico;
            sedexHoje: CodigosServico;
            names: CodigosServicoMapName;
        };
        codigos: {
            sedex: CodigosServico;
            sedexCobrar: CodigosServico;
            pac: CodigosServico;
            pacCobrar: CodigosServico;
            sedex10: CodigosServico;
            sedex12: CodigosServico;
            sedexHoje: CodigosServico;
            names: CodigosServicoMapName;
        };
        formatos: {
            caixaPacote: Formato;
            roloPrisma: Formato;
            envelope: Formato;
        };
        defaultOptions: Partial<FreteOptions>;
    }

    const frete: FreteFunction;
    export default frete;
}
