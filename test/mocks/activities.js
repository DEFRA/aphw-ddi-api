const activities = [
  {
    id: 1,
    label: 'act 1',
    display_order: 1,
    activity_type_id: 1,
    activity_source_id: 1,
    activity_event_id: 1,
    activity_type: {
      id: 1,
      name: 'sent'
    },
    activity_source: {
      id: 1,
      name: 'dog'
    },
    activity_event: {
      id: 1,
      target_primary_key: 'dog'
    }
  },
  {
    id: 2,
    label: 'act 2',
    display_order: 2,
    activity_type_id: 1,
    activity_source_id: 1,
    activity_event_id: 1,
    activity_type: {
      id: 1,
      name: 'sent'
    },
    activity_source: {
      id: 1,
      name: 'dog'
    },
    activity_event: {
      id: 1,
      target_primary_key: 'dog'
    }
  },
  {
    id: 3,
    label: 'act 3',
    display_order: 3,
    activity_type_id: 1,
    activity_source_id: 1,
    activity_event_id: 1,
    activity_type: {
      id: 1,
      name: 'sent'
    },
    activity_source: {
      id: 1,
      name: 'dog'
    },
    activity_event: {
      id: 1,
      target_primary_key: 'dog'
    }
  }
]

module.exports = {
  activities
}
