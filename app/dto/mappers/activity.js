const mapActivityDaoToActivityDto = (activity) => ({
  id: activity.id,
  label: activity.label,
  activity_type_id: activity.activity_type_id,
  activity_source_id: activity.activity_source_id,
  display_order: activity.display_order,
  created_at: activity.created_at,
  updated_at: activity.updated_at,
  activity_event_id: activity.activity_event_id,
  activity_type: {
    id: activity.activity_type.id,
    name: activity.activity_type.name
  },
  activity_source: {
    id: activity.activity_source.id,
    name: activity.activity_source.name
  },
  activity_event: {
    id: activity.activity_event.id,
    target_primary_key: activity.activity_event.target_primary_key
  }
})

module.exports = {
  mapActivityDaoToActivityDto
}
