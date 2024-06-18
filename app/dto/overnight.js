const purgeSoftDeletedDto = (softDeletedResponse) => {
  return {
    count: {
      success: {
        dogs: softDeletedResponse.count.success.dogs,
        owners: softDeletedResponse.count.success.owners,
        total: softDeletedResponse.count.success.total
      },
      failed: {
        dogs: softDeletedResponse.count.failed.dogs,
        owners: softDeletedResponse.count.failed.owners,
        total: softDeletedResponse.count.failed.total
      }
    },
    deleted: {
      ...softDeletedResponse.deleted
    }
  }
}

module.exports = {
  purgeSoftDeletedDto
}
