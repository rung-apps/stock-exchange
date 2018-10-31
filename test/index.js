const chai = require('chai');
const { all } = require('bluebird');

chai.use(require('chai-json-schema'));
const { expect } = chai;

const data = [
    {
        ticker: 'TOTS3.SA',
        comparator: 'maior',
        pricing: 1
    },
    {
        ticker: 'PBR-A',
        comparator: 'menor',
        pricing: 100
    }
];

const schema = {
    required: ['alerts'],
    properties: {
        alerts: {
            type: 'object',
            minItems: 1,
            uniqueItems: true,
            items: {
                type: 'object',
                required: ['title', 'content', 'comment']
            }
        }
    }
};

test('Success in the searches', app =>
    all(data.map(params =>
        app({ params })
            .then(result => {
                expect(result).to.be.jsonSchema(schema);
            })
    )));

test('The success searches should always return an alert', app =>
    all(data.map(params =>
        app({ params })
            .then(result => {
                expect(result.alerts).to.not.be.empty;
            })
    )));
