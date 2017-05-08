const { create } = require('rung-sdk');
const { Char, Money, OneOf } = require('rung-sdk/dist/types');
const Bluebird = require('bluebird');
const agent = require('superagent');
const promisifyAgent = require('superagent-promise');
const moment = require('moment');
const {
    __,
    complement,
    concat,
    dropWhile,
    equals,
    gt,
    head,
    identity,
    ifElse,
    join,
    lt,
    lte,
    pipe,
    propSatisfies
} = require('ramda');

moment.locale('pt_BR');

const request = promisifyAgent(agent, Bluebird);

const toJSON = pipe(
    dropWhile(complement(equals('['))),
    join(''),
    JSON.parse,
    head
);

const renderDate = dateString => moment.utc(dateString).format('LLL');

function renderAlert({ id, t, e, l_cur, lt_dts, cp_fix }, didIncrease) {
    const date = renderDate(lt_dts);
    const greenArrow = 'http://www.jfv-vorderpfalz.de/inc/images/won.gif';
    const redArrow = 'http://www.jfv-vorderpfalz.de/inc/images/lost.gif';
    const arrow = didIncrease ? '▲' : '▼';

    return { [id]: {
        title: `${e}:${t} no valor de ${l_cur} (${arrow} ${cp_fix}%) em ${date}`,
        comment:
            `#### ${e}:${t} por ${l_cur}
            <img src="${didIncrease ? greenArrow : redArrow}" style="width: 16px !important" /> ${cp_fix}%

            Extraído em ${date}`
    } };
}

function main(context, done) {
    const { ticker, comparator, pricing } = context.params;
    const compare = comparator === 'maior' ? gt : lt;

    return request.get('http://finance.google.com/finance/info')
        .query({ q: ticker })
        .then(({ text }) => {
            const json = toJSON(text);
            const isMatch = propSatisfies(pipe(parseFloat, compare(__, pricing)), 'l');

            if (isMatch(json)) {
                done(renderAlert(json, json.cp_fix[0] !== '-'));
            } else {
                done({});
            }
        })
        .catch(() => done({}));
}

const params = {
    ticker: {
        type: Char(10),
        description: 'Ticker',
    },
    comparator: {
        type: OneOf(['maior', 'menor']),
        description: 'Tipo de comparação a considerar',
        default: 'menor'
    },
    pricing: {
        type: Money,
        description: 'Preço em R$ para comparar',
        default: 20
    }
};

const app = create(main, { params, primaryKey: true });

module.exports = app;
