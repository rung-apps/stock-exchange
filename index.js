import { create } from 'rung-sdk';
import {
    AutoComplete,
    Double,
    OneOf
} from 'rung-cli/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import moment from 'moment';
import {
    __,
    gt,
    isNil,
    last,
    lt,
    merge,
    pathOr,
    pipe,
    reject
} from 'ramda';

const request = promisifyAgent(agent, Bluebird);

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

function renderAlert(code, value, difference, percentage, didIncrease) {
    const date = moment().format('DD/MM/YYYY HH:mm');
    const greenArrow = 'https://i.imgur.com/8kAPLVD.png';
    const redArrow = 'https://i.imgur.com/Occsxtu.png';
    const arrow = didIncrease ? '▲' : '▼';
    const color = didIncrease ? '#4CAF50' : '#FF5722';

    return { [code]: {
        title: `${code} ${_('in the amount of')} ${value} (${arrow} ${percentage}%) ${_('in')} ${date}`,
        content: render(code, value, difference, percentage, date, arrow, color),
        comment: percentage === 0
            ? undefined
            : `#### ${code} ${_('per')} ${value}
            <img src="${didIncrease ? greenArrow : redArrow}" style="width: 16px !important" /> ${percentage}%`
    } };
}

function render(ticker, value, difference, percentage, date, arrow, color) {
    const formatPrice = str => str.toString().replace('.', ',');
    return (
        <div>
            <p style={ styles.ticker }>{ ticker }</p>
            <p style={ styles.noMargin }>{ date }</p>
            <ul style={ styles.list }>
                <li style={ styles.li }>
                    <p style={ merge(styles.noMargin, styles.currency) }>
                        R$
                    </p>
                    <p style={ merge(styles.noMargin, styles.price) }>
                        { value }
                    </p>
                </li>
                <li style={ merge(styles.li, { fontSize: '17px', color }) }>
                { arrow } { formatPrice(difference) } ({ formatPrice(percentage) }%)
                </li>
            </ul>
        </div>
    );
}

function main(context, done) {
    moment.locale(context.locale);
    const { ticker, comparator, pricing } = context.params;
    const compare = comparator === 'maior' ? gt : lt;
    return request.get(`https://query1.finance.yahoo.com/v7/finance/spark?symbols=${ticker}&range=1d&interval=5m&indicators=close&includeTimestamps=false&includePrePost=false&corsDomain=finance.yahoo.com&.tsrc=finance`)
        .then(({ body }) => {
            const isMatch = pipe(parseFloat, compare(__, pricing));
            const oldValue = pathOr([], ['spark', 'result', 0, 'response', 0, 'meta', 'previousClose'], body);
            const values = pathOr([], ['spark', 'result', 0, 'response', 0, 'indicators', 'quote', '0', 'close'], body);
            const filteredValues = reject(isNil, values);

            const newValue = last(filteredValues).toFixed(2);
            const difference = (newValue - oldValue).toFixed(2);
            const didIncrease = difference >= 0;
            const percentage = (100 - (100 * oldValue / newValue)).toFixed(2);

            if (isMatch(newValue)) {
                done({ alerts: renderAlert(ticker, newValue, difference, percentage, didIncrease) });
            } else {
                done({ alerts: {} });
            }
        })
        .catch(() => done({ alerts: {} }));
}

const params = {
    ticker: {
        type: AutoComplete,
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
    description: _('Identify the best opportunities on the stock exchange!'),
    preview: render('TOTS3.SA', 'R$29.07', 1.20, 2.05, '06/06/2017 17:09', '▲', '#4CAF50')
});
