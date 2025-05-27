import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '/imports/ui/components/ui';
import { Button } from '/imports/ui/components/ui';
import { Input } from '/imports/ui/components/ui';
import { Label } from '/imports/ui/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/imports/ui/components/ui';
import { RadioGroup, RadioGroupItem } from '/imports/ui/components/ui';
import { Switch } from '/imports/ui/components/ui';
import { Info } from 'lucide-react';

const ScheduleEditor = ({ node, onSave, onCancel, isOpen }) => {
  const [data, setData] = useState(node.data || {});

  const handleSave = () => {
    onSave({ ...node, data });
  };

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateInterval = (field, value) => {
    setData(prev => ({
      ...prev,
      interval: { ...prev.interval, [field]: value }
    }));
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Schedule Trigger</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Schedule</Label>
            <Switch
              id="enabled"
              checked={data.enabled}
              onCheckedChange={(checked) => updateData('enabled', checked)}
            />
          </div>

          <div>
            <Label>Schedule Type</Label>
            <RadioGroup value={data.scheduleType} onValueChange={(v) => updateData('scheduleType', v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interval" id="interval" />
                <label htmlFor="interval">Simple Interval</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cron" id="cron" />
                <label htmlFor="cron">Cron Expression</label>
              </div>
            </RadioGroup>
          </div>

          {data.scheduleType === 'interval' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intervalValue">Run every</Label>
                  <Input
                    id="intervalValue"
                    type="number"
                    min="1"
                    value={data.interval?.value || 1}
                    onChange={(e) => updateInterval('value', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="intervalUnit">Unit</Label>
                  <Select value={data.interval?.unit || 'hours'} onValueChange={(v) => updateInterval('unit', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {data.scheduleType === 'cron' && (
            <div>
              <Label htmlFor="cron">Cron Expression</Label>
              <Input
                id="cron"
                value={data.cron}
                onChange={(e) => updateData('cron', e.target.value)}
                placeholder="0 9 * * * (runs daily at 9 AM)"
              />
              <div className="flex items-start mt-2 text-sm text-muted-foreground">
                <Info size={14} className="mr-1 mt-0.5" />
                <span>
                  Format: minute hour day month weekday<br/>
                  Examples: "0 9 * * *" (daily at 9 AM), "*/15 * * * *" (every 15 minutes)
                </span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={data.timezone} onValueChange={(v) => updateData('timezone', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(tz => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleEditor;
