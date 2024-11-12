---
description: Comprehensive Harmonizer for Arbitrage Kinetics and Revenue Accumulation
---

# CHAKRA (Protocol Arbitrage)

The **Comprehensive Harmonizer for Arbitrage Kinetics and Revenue Accumulation (CHAKRA)** serves two key functions: maintaining the price stability of HONO relative to its backed value and generating revenue for the protocol. It accomplishes this through two types of arbitrage trades — above peg and below peg arbitrage:

* **Above Backing Arbitrage:** This process involves minting HONO with wstETH at its backing price and selling it at an inflated rate until the price aligns with the backed value. The premium gained from this sale is then captured as revenue for the protocol.
* **Below Backing Arbitrage:** In this case, HONO is burned and wstETH is redeemed from the collateral reserve. The protocol then repurchases HONO until the price reaches its backed value, with any premium collected again contributing to revenue.

#### Advantages of CHAKRA

One of the key benefits of CHAKRA is that all arbitrage trades are executed within a single transaction and only occur if a profit can be made. This ensures that the protocol remains profitable at all times and that HONO is always fully backed by its underlying asset.

A significant advantage is that the protocol does not compete for miner extractable value (MEV). Since MangaFi is the sole entity permitted to mint and redeem HONO, the protocol ensures that arbitrage trades are always executed profitably before any third party can intervene.

Additionally, the single-block mint/redemption arbitrage allows the protocol to outperform market participants attempting to exploit price premiums or discounts, ensuring that it consistently captures value for the ecosystem.
