import asset_types from 'constants/asset_types.json'
import asset_type_names from 'constants/asset_type_names.json'

export function assetTypeName(id, plural = true) {
  if (id === 'all') {
    return 'All Assets'
  } else {
    if (Number.isInteger(id)) {
      return asset_type_names[id] + (plural ? 's' : '')
    } else {
      return asset_type_names[asset_types[id]] + (plural ? 's' : '')
    }
  }
}
