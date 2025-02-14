'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import demoEvents from '@/demo/calendar-events.json';
import { format, isAfter, startOfDay, eachHourOfInterval, addHours, isSameMonth } from 'date-fns';
import { Sun, Moon, Calendar as CalIcon, Briefcase, Heart, User } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: string;
  color: string;
}

export function CalendarWidget() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = React.useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);

  // Get next 7 hours schedule
  const getSchedule = () => {
    const now = new Date();
    const end = addHours(now, 7);
    return eachHourOfInterval({ start: now, end });
  };

  const schedule = getSchedule();

  // Function to get events for a specific date
  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return demoEvents.events.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Function to get upcoming events - increased to 8 events
  const getUpcomingEvents = () => {
    const today = startOfDay(new Date());
    return demoEvents.events
      .filter(event => isAfter(new Date(event.startTime), today))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 8);  // Increased from 4 to 8
  };

  // Get events count for current month
  const getCurrentMonthEventCount = () => {
    const now = new Date();
    return demoEvents.events.filter(event => 
      isSameMonth(new Date(event.startTime), now)
    ).length;
  };

  React.useEffect(() => {
    setSelectedDayEvents(getEventsForDate(date));
    setUpcomingEvents(getUpcomingEvents());
  }, [date]);

  const eventDates = demoEvents.events.map((event) => new Date(event.startTime));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work':
        return 'bg-blue-500';
      case 'health':
        return 'bg-green-500';
      case 'personal':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to format time with AM/PM only on period changes
  const formatScheduleTime = (date: Date, index: number) => {
    const hour = format(date, 'h');
    const period = format(date, 'a');
    const prevPeriod = index > 0 ? format(schedule[index - 1], 'a') : null;
    
    return period !== prevPeriod ? `${hour}${period}` : hour;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'health':
        return <Heart className="w-4 h-4 text-green-500" />;
      case 'personal':
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <CalIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatEventTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startFormat = format(startDate, 'h:mm').replace(':00', '');
    const endFormat = format(endDate, 'h:mm').replace(':00', '');
    const period = format(endDate, 'a').toLowerCase();
    
    if (format(startDate, 'h:mm') === format(endDate, 'h:mm')) {
      return `${startFormat}${period}`;
    }
    
    return `${startFormat}-${endFormat}${period}`;
  };

  const getMonthColor = (date: Date) => {
    const month = date.getMonth();
    const seasons = {
      winter: 'text-blue-500',
      spring: 'text-green-500',
      summer: 'text-yellow-500',
      fall: 'text-orange-500'
    };
    
    if (month <= 1 || month === 11) return seasons.winter;
    if (month <= 4) return seasons.spring;
    if (month <= 7) return seasons.summer;
    return seasons.fall;
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-[1fr,300px] gap-6">
        {/* Main Calendar */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full"
          modifiers={{
            hasEvents: eventDates,
          }}
          modifiersStyles={{
            hasEvents: {
              fontWeight: 'bold',
              textDecoration: 'underline',
            },
          }}
        />

        {/* Right Side Content */}
        <div className="space-y-2">
          {schedule.map((hour, index) => (
            <div
              key={hour.toISOString()}
              className="flex items-center text-sm"
            >
              <span className="w-8 text-muted-foreground">
                {formatScheduleTime(hour, index)}
              </span>
              <div className="flex-1 h-6 rounded-md bg-muted/30"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="my-6 py-3 border-y">
        <div className="grid grid-cols-4 gap-4 text-sm text-center">
          <div className="flex items-center justify-center gap-2">
            <Sun className="w-4 h-4" />
            <span>Sunrise 6:45 AM</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Moon className="w-4 h-4" />
            <span>First Quarter</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sun className="w-4 h-4" />
            <span>11:23 hrs of light</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CalIcon className="w-4 h-4" />
            <span>{getCurrentMonthEventCount()} events this month</span>
          </div>
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div>
        <h3 className="text-sm font-medium mb-3">Upcoming Events</h3>
        <div>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div
                key={event.id}
                className={`flex items-center gap-3 py-2 ${
                  index !== upcomingEvents.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-baseline gap-1 min-w-[4.5rem]">
                  <span className={`text-sm font-medium ${getMonthColor(new Date(event.startTime))}`}>
                    {format(new Date(event.startTime), 'MMM')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(event.startTime), 'd')}
                  </span>
                </div>
                <span className="font-medium flex-1">{event.title}</span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatEventTime(event.startTime, event.endTime)}
                </span>
                {getCategoryIcon(event.category)}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming events
            </p>
          )}
        </div>
      </div>
    </Card>
  );
} 