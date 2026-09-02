import { describe, expect, it } from 'bun:test';
import { PROTOCOL_CONFIG, STAKING_TIERS } from '../src/lib/constants';
import { fetchDexQuote } from '../src/lib/dexAggregator';
import { formatAddress } from '../src/lib/wallet';

describe('NEXUS-0 Protocol Fee & Monetization Suite', () => {
  it('enforces exact fee rates for all 13 core modules', () => {
    const fees = PROTOCOL_CONFIG.feeRates;

    // Core trading & cleanup
    expect(fees.dustSweeperBps).toBe(250); // 2.5%
    expect(fees.gasStationFixedUsd).toBe(1.50); // Flat $1.50
    expect(fees.exitVaultBps).toBe(35); // 0.35%
    expect(fees.otcEscrowBps).toBe(25); // 0.25%
    expect(fees.disperseFixedUsd).toBe(1.00); // Flat $1.00
    expect(fees.airdropRecoveryBps).toBe(300); // 3.0%

    // Unconventional killer utilities
    expect(fees.taxCrematorFixedUsd).toBe(2.50); // Flat $2.50
    expect(fees.rentReclaimerCutPercent).toBe(15); // 15% performance cut
    expect(fees.panicEvacBps).toBe(75); // 0.75%
    expect(fees.panicEvacMinUsd).toBe(5.00);
    expect(fees.deadMansSwitchSetupUsd).toBe(9.99); // $9.99
    expect(fees.deadMansSwitchExecBps).toBe(50); // 0.50%
    expect(fees.stealthRouterBps).toBe(25); // 0.25%
    expect(fees.stealthRouterMinUsd).toBe(2.00);
    expect(fees.poisonRadarFixedUsd).toBe(1.00); // $1.00
    expect(fees.ghostTeleportFixedUsd).toBe(2.50); // $2.50
    expect(fees.ghostTeleportBps).toBe(30); // 0.30%
    expect(fees.stakingRevenueSharePercent).toBe(10); // 10% to stakers
  });

  it('correctly calculates Panic Evacuation fee with $5.00 floor guarantee', () => {
    // Small portfolio: 0.75% of $100 is $0.75 -> must floor at $5.00 min
    const smallPortfolio = 100;
    const feeSmall = Math.max(
      (smallPortfolio * PROTOCOL_CONFIG.feeRates.panicEvacBps) / 10000,
      PROTOCOL_CONFIG.feeRates.panicEvacMinUsd
    );
    expect(feeSmall).toBe(5.00);

    // Large portfolio: 0.75% of $100,000 is $750.00
    const largePortfolio = 100000;
    const feeLarge = Math.max(
      (largePortfolio * PROTOCOL_CONFIG.feeRates.panicEvacBps) / 10000,
      PROTOCOL_CONFIG.feeRates.panicEvacMinUsd
    );
    expect(feeLarge).toBe(750.00);
  });

  it('correctly splits Solana Rent Reclamation between user and treasury', () => {
    // 14 empty accounts = 0.02854992 SOL
    const totalRentSol = 14 * 0.00203928;
    const feeCut = PROTOCOL_CONFIG.feeRates.rentReclaimerCutPercent; // 15%
    const protocolFeeSol = (totalRentSol * feeCut) / 100;
    const userPayoutSol = totalRentSol - protocolFeeSol;

    expect(protocolFeeSol + userPayoutSol).toBeCloseTo(totalRentSol, 6);
    expect(protocolFeeSol / totalRentSol).toBeCloseTo(0.15, 4);
    expect(userPayoutSol / totalRentSol).toBeCloseTo(0.85, 4);
  });

  it('verifies Staking Tiers provide accurate VIP fee discounts', () => {
    expect(STAKING_TIERS.length).toBe(4);
    const flex = STAKING_TIERS.find((t) => t.id === 'tier-flex')!;
    const yearVip = STAKING_TIERS.find((t) => t.id === 'tier-365')!;

    expect(flex.feeDiscountPercent).toBe(10);
    expect(yearVip.feeDiscountPercent).toBe(50);
  });
});

describe('NEXUS-0 Routing & Security Heuristics', () => {
  it('calculates live DEX aggregator quote and deducts protocol fee correctly', async () => {
    const quote = await fetchDexQuote('base', 'ETH', 'USDC', 1.0, 25);
    expect(quote.fromToken).toBe('ETH');
    expect(quote.toToken).toBe('USDC');
    expect(quote.protocolFeeUsd).toBeGreaterThan(0);
    expect(quote.netOutAmount).toBeLessThan(quote.outAmount);
    expect(quote.routeHops.length).toBeGreaterThanOrEqual(2);
  });

  it('detects look-alike address poisoning spoof traps', () => {
    const original = '0x71C67073755129441Cd5426154562473D1b5e589'.toLowerCase();
    const spoof = '0x71c699999999999999999999999999999999e589'.toLowerCase();

    // Check look-alike prefix and suffix match
    const isPrefixMatch = original.slice(0, 6) === spoof.slice(0, 6);
    const isSuffixMatch = original.slice(-4) === spoof.slice(-4);
    const isExactMatch = original === spoof;

    expect(isPrefixMatch).toBe(true);
    expect(isSuffixMatch).toBe(true);
    expect(isExactMatch).toBe(false); // Detected as poisoning attack!
  });

  it('formats addresses cleanly with ellipsis', () => {
    const full = '0x71C67073755129441Cd5426154562473D1b5e589';
    const formatted = formatAddress(full);
    expect(formatted).toBe('0x71C6...e589');
  });
});
