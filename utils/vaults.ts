import { releaseStateOf } from './dateUtils'

/**
 * A vault moves through three states. `upcoming` exists so assets can be uploaded and compiled
 * before the vault is announced - they stay out of the library and off /vaults, but their own
 * asset pages still render.
 *
 * Vault docs written before the status field have none. They were only ever kept while locked
 * (releasing one used to delete the doc), so "no status" means locked.
 */
export type VaultStatus = 'upcoming' | 'locked' | 'unlocked'

export const vaultStatus = (vault): VaultStatus => vault?.status || 'locked'

export const isLockedVault = (vault) => vaultStatus(vault) === 'locked'
export const isUnlockedVault = (vault) => vaultStatus(vault) === 'unlocked'
export const isUpcomingVault = (vault) => vaultStatus(vault) === 'upcoming'

/** The `/vaults` map narrowed to one status, preserving its (target-ascending) order. */
export const vaultsByStatus = (vaults, status: VaultStatus) =>
  Object.fromEntries(Object.entries(vaults || {}).filter(([, vault]) => vaultStatus(vault) === status))

/** Total assets across the given vaults. */
export const countVaultAssets = (vaults): number =>
  Object.values(vaults || {}).reduce<number>((total, vault: any) => total + (vault.assets?.length || 0), 0)

/**
 * Which vault an asset belongs to, or null. Membership is a first-class field now; the legacy
 * "vault: <id>" category string is only a fallback for assets published before the migration.
 */
export const vaultOf = (asset): string | null => {
  if (asset?.vault) return asset.vault
  for (const cat of asset?.categories || []) {
    if (typeof cat === 'string' && cat.startsWith('vault: ')) return cat.split(': ')[1]
  }
  return null
}

/**
 * Whether an asset is still behind its vault's paywall.
 *
 * Keyed off the sentinel publish date rather than off `vault` alone, because a released asset
 * keeps its vault id - that is what lets us credit the vault that produced it. The API gates on
 * the same date (`date_published > now`), so this matches what actually serves.
 */
export const isVaultLocked = (asset): boolean =>
  Boolean(vaultOf(asset)) && releaseStateOf(asset?.date_published) === 'unreleased'

/** A released asset that came out of a vault - the community unlocked it. */
export const isFormerlyVaulted = (asset): boolean =>
  Boolean(vaultOf(asset)) && releaseStateOf(asset?.date_published) === 'published'
