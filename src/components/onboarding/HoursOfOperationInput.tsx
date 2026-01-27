import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const HOURS = [
  '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM',
  '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
  '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
];

interface DayHours {
  open: boolean;
  openTime: string;
  closeTime: string;
}

interface HoursData {
  [key: string]: DayHours;
}

interface HoursOfOperationInputProps {
  value?: string;
  onChange: (value: string) => void;
}

function parseHoursString(hoursString: string): HoursData {
  const defaultHours: HoursData = {};
  DAYS.forEach(day => {
    defaultHours[day.key] = { open: true, openTime: '8:00 AM', closeTime: '5:00 PM' };
  });
  
  if (!hoursString) return defaultHours;
  
  try {
    const parsed = JSON.parse(hoursString);
    return { ...defaultHours, ...parsed };
  } catch {
    return defaultHours;
  }
}

function serializeHours(hours: HoursData): string {
  return JSON.stringify(hours);
}

export function HoursOfOperationInput({ value, onChange }: HoursOfOperationInputProps) {
  const [hours, setHours] = useState<HoursData>(() => parseHoursString(value || ''));

  useEffect(() => {
    onChange(serializeHours(hours));
  }, [hours, onChange]);

  const updateDay = (dayKey: string, updates: Partial<DayHours>) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], ...updates },
    }));
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-base">
        <Clock className="h-4 w-4" />
        Hours of Operation
      </Label>
      
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_80px_1fr_1fr] gap-2 bg-muted/50 px-3 py-2 text-sm font-medium text-muted-foreground">
          <span>Day</span>
          <span className="text-center">Open</span>
          <span>Opens</span>
          <span>Closes</span>
        </div>
        
        {/* Days */}
        {DAYS.map((day) => (
          <div 
            key={day.key}
            className="grid grid-cols-[1fr_80px_1fr_1fr] gap-2 items-center px-3 py-2 border-t border-border"
          >
            <span className="text-sm font-medium">{day.label}</span>
            
            <div className="flex justify-center">
              <Switch
                checked={hours[day.key]?.open ?? true}
                onCheckedChange={(checked) => updateDay(day.key, { open: checked })}
              />
            </div>
            
            <Select
              value={hours[day.key]?.openTime || '8:00 AM'}
              onValueChange={(val) => updateDay(day.key, { openTime: val })}
              disabled={!hours[day.key]?.open}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={`open-${hour}`} value={hour} className="text-xs">
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={hours[day.key]?.closeTime || '5:00 PM'}
              onValueChange={(val) => updateDay(day.key, { closeTime: val })}
              disabled={!hours[day.key]?.open}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={`close-${hour}`} value={hour} className="text-xs">
                    {hour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
