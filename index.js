import { create } from 'rung-sdk';
import { Char, Double, OneOf } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import moment from 'moment';
import {
    __,
    complement,
    dropWhile,
    equals,
    gt,
    head,
    indexOf,
    join,
    lt,
    merge,
    pipe,
    propSatisfies,
    take
} from 'ramda';

const request = promisifyAgent(agent, Bluebird);

const toJSON = pipe(
    dropWhile(complement(equals('['))),
    join(''),
    JSON.parse,
    head
);

const formatPrice = num => num.toFixed(2).replace('.', ',');

const styles = {
    ticker: {
        fontWeight: 'bold',
        margin: '4px 0px'
    },
    list: {
        listStyle: 'none',
        padding: '0px'
    },
    noMargin: {
        margin: '0px'
    },
    li: {
        float: 'left',
        width: '68px'
    },
    currency: {
        fontSize: '13px',
        marginTop: '5px'
    },
    price: {
        fontSize: '19px',
        fontWeight: 'bold'
    }
};

const renderDate = dateString => moment.utc(dateString).format('DD/MM/YYYY HH:mm');

function renderAlert({ id, t, e, l_cur, lt_dts, cp_fix }, didIncrease) {
    const date = renderDate(lt_dts);
    const greenArrow = 'https://i.imgur.com/8kAPLVD.png';
    const redArrow = 'https://i.imgur.com/Occsxtu.png';
    const arrow = didIncrease ? '?' : '?';
    const color = didIncrease ? '#4CAF50' : '#FF5722';

    return { [id]: {
        title: `${e}: ${t} ${_('in the amount of')} ${l_cur} (${arrow} ${cp_fix}%) ${_('in')} ${date}`,
        content: render(t, date, l_cur, arrow, cp_fix, color),
        comment: cp_fix === '0.00'
            ? undefined
            : `#### ${e}: ${t} por ${l_cur}
            <img src="${didIncrease ? greenArrow : redArrow}" style="width: 16px !important" /> ${cp_fix}%

            ${_('Extracted in')} ${date}`
    } };
}

function render(ticker, date, value, arrow, difference, color) {
    const price = parseFloat(value.replace(/^\D+/g, ''));
    const currency = value.replace(/[0-9.]/g, '');
    const howMuchDiffer = Math.abs(price / 100 * difference);
    return (
        <div>
            <p style={ styles.ticker }>{ ticker }</p>
            <p style={ styles.noMargin }>{ date }</p>
            <ul style={ styles.list }>
                <li style={ styles.li }>
                    <p style={ merge(styles.noMargin, styles.currency) }>
                        { currency }
                    </p>
                    <p style={ merge(styles.noMargin, styles.price) }>
                        { formatPrice(price) }
                    </p>
                </li>
                <li style={ merge(styles.li, { fontSize: '17px', color }) }>
                    { arrow } { howMuchDiffer.toFixed(2) } ({ Math.abs(difference) }%)
                </li>
            </ul>
        </div>
    );
}

function main(context, done) {
    moment.locale(context.locale);
    const { ticker, comparator, pricing } = context.params;
    const compare = comparator === 'maior' ? gt : lt;
    const code = take(indexOf(' -', ticker), ticker);

    return request.get('https://finance.google.com/finance/info')
        .query({ q: code })
        .then(({ text }) => {
            const json = toJSON(text);
            const isMatch = propSatisfies(pipe(parseFloat, compare(__, pricing)), 'l');

            if (isMatch(json)) {
                done({ alerts: renderAlert(json, json.cp_fix[0] !== '-') });
            } else {
                done({ alerts: {} });
            }
        })
        .catch(() => done({ alerts: {} }));
}

const params = {
    ticker: {
        type: Char(10),
        description: _('Ticker'),
        required: true
    },
    comparator: {
        type: OneOf(['maior', 'menor']),
        description: _('Type of comparison to consider'),
        default: 'menor'
    },
    pricing: {
        type: Double,
        description: _('Price in R$ to compare'),
        default: 20
    }
};

export default create(main, {
    params,
    primaryKey: true,
    title: _('Stock exchange'),
    description: _('Be advised about the stock price of the stock. The update is done once per hour'),
    preview: render('TOTS3', '06/06/2017 17:09', 'R$29.07', '?', 0.02, '#4CAF50')
});
