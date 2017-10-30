### Stock exchange



[![Deploy to Rung](https://i.imgur.com/uijt57R.png)](https://app.rung.com.br/integration/stock-exchange/customize)

![rung-cli 1.1.1](https://img.shields.io/badge/rung--cli-1.1.1-blue.svg?style=flat-square)
![stock-exchange 0.1.14](https://img.shields.io/badge/stock--exchange-0.1.14-green.svg?style=flat-square)

Be advised about the stock price of the stock. The update is done once per hour

#### Parameters

|Parameter | Type | Description |
|----------|------|-------------|
| `ticker` | `Char(10)` | Ticker |
| `comparator` | `OneOf([maior, menor])` | Type of comparison to consider |
| `pricing` | `Double` | Price in R$ to compare |

<img align="left" width="256" src="./icon.png" />

##### Dependencies

- `bluebird`: `^3.5.0`
- `moment`: `^2.18.1`
- `ramda`: `^0.23.0`
- `rung-sdk`: `^1.0.7`
- `superagent`: `^3.5.2`
- `superagent-promise`: `^1.1.0`
