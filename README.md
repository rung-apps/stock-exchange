### Bolsa de valores



[![Deploy to Rung](https://i.imgur.com/uijt57R.png)](https://app.rung.com.br/integrations/stock-exchange/customize)

![rung-cli 0.2.7](https://img.shields.io/badge/rung--cli-0.2.7-blue.svg?style=flat-square)
![stock-exchange 0.1.0](https://img.shields.io/badge/stock--exchange-0.1.0-green.svg?style=flat-square)

Seja avisado sobre o preço de ações da bolsa. A atualização é feita uma vez por hora

#### Parameters

|Parameter | Type | Description |
|----------|------|-------------|
| `ticker` | `Char(10)` | Ticker |
| `comparator` | `OneOf([maior, menor])` | Tipo de comparação a considerar |
| `pricing` | `Money` | Preço em R$ para comparar |

<img align="left" width="256" src="./icon.png" />

##### Dependencies

- `bluebird`: `^3.5.0`
- `ramda`: `^0.23.0`
- `rung-sdk`: `^1.0.7`
- `superagent`: `^3.5.2`
- `superagent-promise`: `^1.1.0`
