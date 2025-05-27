export default {
  label: 'Schedule',
  description: 'Trigger workflow on a schedule',
  icon: '⏰',
  color: '#4CAF50',

  defaultData: {
    scheduleType: 'interval',
    interval: {
      value: 1,
      unit: 'hours'
    },
    cron: '0 9 * * *',
    timezone: 'UTC',
    enabled: true
  },

  allowedInputs: [],
  allowedOutputs: ['*'],
  maxInputs: 0,
  maxOutputs: -1,

  version: '1.0.0',
  author: 'System',
  tags: ['trigger', 'schedule', 'cron', 'timer'],
  isAsync: false,
  requiresAuth: false,
  isBeta: false
};
