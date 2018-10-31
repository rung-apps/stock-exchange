export default function ({ input, lib, params }, done) {
    lib.request.get(`https://app.rung.com.br/yahoo-finance-autocomplete/searchassist;searchTerm=${input}`)
        .then(({ body }) => body.items.map(item => item.symbol))
        .catch(() => [])
        .then(done);
}
