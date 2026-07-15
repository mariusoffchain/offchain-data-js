/**
 * Off-Chain Media — Interim chart descriptions (50–70 words each).
 * Rendered under the chart on /charts/<slug> CMS pages, pending fuller
 * editorial texts in the CMS ("What This Measures" field is the source
 * of truth; keep the two in sync via scripts/fill-descriptions.mjs).
 */
export const DESCRIPTIONS = {
  'btc-price':
    "This chart tracks the daily BTC/USD reference rate compiled by Coin Metrics from major spot exchanges. Price is Bitcoin's most watched signal: it reflects global demand for a fixed-supply asset and sets the economics of mining, fees, and adoption. Use the period selector to compare short-term swings with multi-year trends — daily closes smooth out intraday volatility.",
  'market-cap':
    "Market capitalization multiplies the circulating BTC supply by the current price, giving a dollar measure of the network's total market value. It is the quickest way to compare Bitcoin with other assets, from gold to tech stocks. Because supply grows on a fixed, predictable schedule, long-term changes in market cap are driven almost entirely by price.",
  'volume':
    "This chart aggregates 24-hour spot trading volume across the exchanges tracked by CoinGecko. Volume measures how much bitcoin actually changes hands and how deep the market is. Spikes usually accompany sharp price moves or macro news, while quiet periods signal consolidation. Persistent volume growth is a healthier adoption signal than price action alone.",
  'dominance':
    "Circulating supply counts every bitcoin mined since the genesis block in 2009, out of the 21 million that will ever exist. New coins enter circulation with each block, and the issuance rate halves roughly every four years. The curve flattens with every halving — a fixed, predictable monetary schedule that no other major asset offers.",
  'hashrate':
    "Network hashrate estimates the total computational power securing Bitcoin, measured in exahashes per second. More hashrate means a more expensive network to attack, making it a direct proxy for security. It also reflects miner confidence: operators only deploy hardware they expect to be profitable. Short-term swings are statistical noise; the long-term trend is what matters.",
  'difficulty':
    "Mining difficulty measures how hard it is to find a valid block. The protocol adjusts it every 2,016 blocks — about two weeks — so blocks keep arriving roughly every ten minutes regardless of how much hashrate joins or leaves. Rising difficulty tracks hashrate growth; rare downward adjustments usually follow miner capitulation or major disruptions.",
  'block-fees':
    "This chart shows the average transaction fees collected per block, in BTC. Fees are the market price of scarce block space: they surge when demand spikes — bull runs, inscription waves — and fall back in quiet periods. As block subsidies halve over time, fees are set to become the dominant source of miner revenue and long-term security budget.",
  'hashprice':
    "Hashprice measures a miner's expected daily revenue per terahash per second of computing power, in dollars. It condenses price, difficulty, and fees into a single profitability metric. Falling hashprice squeezes margins and pushes inefficient operators offline; rising hashprice invites new capacity online. It is the industry's benchmark for the health of the mining economy.",
  'block-rewards':
    "Block rewards combine the fixed subsidy of newly issued bitcoin with the transaction fees included in each block — the total income miners earn per block. The subsidy halves roughly every four years, so the fee share of the reward grows over time: a slow transition that will ultimately fund Bitcoin's security entirely through fees.",
  'mining-pools':
    "This ranking shows the share of blocks mined by each pool over the last twelve months. Pool distribution is a key decentralization indicator: a pool nearing half the network's blocks raises censorship and reorg concerns. Pools coordinate hashrate owned by many independent miners, however, who can and do switch pools when incentives shift.",
  'active-addresses':
    "Active addresses count the unique Bitcoin addresses involved in transactions each day — a rough proxy for network usage: more active addresses generally mean more people or services transacting on-chain. The metric has limits, since one entity can control many addresses and batching compresses activity, but its long-term trend tracks real adoption.",
  'lth-supply':
    "Miner revenue totals the BTC earned by miners each day, combining new-issuance subsidies and transaction fees. It represents Bitcoin's security budget: the money paid to keep the network honest. Revenue rises with fees during congestion and drops sharply at each halving, forcing efficiency gains across the industry. Its composition shows how the fee transition is progressing.",
  'exchange-balance':
    "This chart estimates the total bitcoin held on exchange addresses tracked by Coin Metrics. Falling balances suggest coins moving to self-custody or long-term holding; rising balances can signal intent to sell. It is an imperfect but widely watched gauge of market-wide custody behavior and liquid supply — sustained outflows have marked every recent cycle.",
  'nvt':
    "Daily transactions count confirmed on-chain Bitcoin transactions. The metric gauges demand for block space, though it undercounts economic activity: a single transaction can batch hundreds of payments, and Lightning moves value off-chain entirely. Sustained changes still reveal shifting usage patterns, from payment adoption to inscription waves competing for the same limited space.",
  'lightning-nodes':
    "This chart counts public nodes on the Lightning Network, Bitcoin's second layer for instant, low-fee payments. Node count gauges the network's reach and decentralization, though it only captures publicly announced nodes — private ones are invisible to crawlers. Steady growth signals a maturing routing infrastructure operated by individuals, businesses, and dedicated routing operators.",
  'lightning-channels':
    "Lightning channels are payment connections between two nodes, each funded with bitcoin locked on-chain. This chart tracks the total number of public channels. More channels mean more possible payment routes and better liquidity. When channel count consolidates while capacity keeps growing, it suggests fewer but larger, better-managed channels — a sign of professionalization.",
  'lightning-capacity':
    "Lightning capacity measures the total bitcoin locked in public payment channels — the network's headline liquidity metric: more capacity means larger payments can route successfully. Public capacity understates the true figure, since private channels are excluded. Denominated in BTC rather than dollars, it isolates genuine network growth from price swings. Watch the trend, not the level.",
  'lightning-avg-channel':
    "Average channel size divides total public capacity by the number of channels. Rising averages indicate professionalization — routing nodes deploying serious liquidity rather than hobbyist experiments. Falling averages can mean broader grassroots adoption through many small channels. Combined with node and channel counts, this metric sketches how the network's structure is evolving.",
  'lightning-countries':
    "This ranking maps public Lightning nodes to countries using IP geolocation, showing where routing infrastructure is physically concentrated. Heavy concentration in a few jurisdictions matters for censorship resistance and regulatory exposure. Nodes running behind Tor cannot be located, so a large share of the network remains geographically unknown — a feature, not a bug.",
  'lightning-isp':
    "This ranking shows which internet providers host the most public Lightning nodes. Concentration among a few cloud giants is a centralization pressure point: an outage or policy change at a single provider could disrupt significant routing capacity. Nodes running on residential connections or behind Tor counterbalance that dependency and keep the network resilient.",
  'mempool-size':
    "The mempool is the waiting room for unconfirmed transactions; this chart tracks its size in megabytes. A growing mempool signals congestion — demand for block space exceeding supply, pushing fees upward. An empty mempool means transactions confirm in the next block at minimal cost. It is the network's real-time load indicator.",
  'fee-rates':
    "This chart shows current fee rates in satoshis per virtual byte, broken down by confirmation priority. It answers a practical question: what should you pay to confirm within the next block, within an hour, or eventually? Fee rates move with mempool congestion and are the clearest real-time signal of demand for block space.",
  'tx-per-second':
    "Transactions per second measures on-chain throughput. Bitcoin's base layer processes only a handful of transactions per second by design — a deliberate trade-off favoring decentralization and verifiability over raw speed. Higher payment volumes move to layers built on top, like Lightning. Sustained changes in TPS reflect shifts in how block space is being used.",
  'block-weight':
    "Block weight measures how full Bitcoin blocks are, in million weight units, against the four-million cap introduced with SegWit. Consistently full blocks mean persistent demand for block space and a working fee market; lighter blocks signal slack demand. The metric shows whether Bitcoin's scarce settlement capacity is actually being consumed.",
};
