import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface QASessionLinkProps {
  programSlug: string;
}

// Configuración del evento
const EVENT_CONFIG = {
  title: 'AI-Thinking Ejecutivos Q&A',
  description: 'Sesión semanal de preguntas y respuestas del programa Fundamentos AI-Thinking para Ejecutivos.',
  location: 'https://meet.google.com/bku-dvmi-rwk',
  // Jueves 19:00-20:00 Chile (UTC-3 en verano, UTC-4 en invierno)
  // Usamos UTC para consistencia: 19:00 Chile = 22:00 UTC (en verano) o 23:00 UTC (en invierno)
  startDate: '20260219', // Primer jueves del programa
  startTime: '220000', // 22:00 UTC = 19:00 Chile (horario de verano)
  endTime: '230000',   // 23:00 UTC = 20:00 Chile
  recurrence: 'RRULE:FREQ=WEEKLY;BYDAY=TH',
};

function getGoogleCalendarUrl() {
  const { title, description, location, startDate, startTime, endTime, recurrence } = EVENT_CONFIG;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}T${startTime}Z/${startDate}T${endTime}Z`,
    details: `${description}\n\nLink: ${location}`,
    location: location,
    recur: recurrence,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getOutlookUrl() {
  const { title, description, location, startDate, startTime, endTime } = EVENT_CONFIG;
  // Outlook usa formato ISO 8601
  const startISO = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}T${startTime.slice(0, 2)}:${startTime.slice(2, 4)}:00Z`;
  const endISO = `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}T${endTime.slice(0, 2)}:${endTime.slice(2, 4)}:00Z`;

  const params = new URLSearchParams({
    subject: title,
    body: `${description}<br><br>Link: <a href="${location}">${location}</a>`,
    startdt: startISO,
    enddt: endISO,
    location: location,
    path: '/calendar/action/compose',
    rru: 'addevent',
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function downloadICS() {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AIThinking//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:America/Santiago
X-LIC-LOCATION:America/Santiago
BEGIN:STANDARD
TZOFFSETFROM:-0300
TZOFFSETTO:-0400
TZNAME:-04
DTSTART:19700405T000000
RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU
END:STANDARD
BEGIN:DAYLIGHT
TZOFFSETFROM:-0400
TZOFFSETTO:-0300
TZNAME:-03
DTSTART:19700906T000000
RRULE:FREQ=YEARLY;BYMONTH=9;BYDAY=1SU
END:DAYLIGHT
END:VTIMEZONE
BEGIN:VEVENT
DTSTART;TZID=America/Santiago:20260219T190000
DTEND;TZID=America/Santiago:20260219T200000
RRULE:FREQ=WEEKLY;BYDAY=TH
SUMMARY:${EVENT_CONFIG.title}
DESCRIPTION:${EVENT_CONFIG.description}\\n\\nLink: ${EVENT_CONFIG.location}
LOCATION:${EVENT_CONFIG.location}
URL:${EVENT_CONFIG.location}
STATUS:CONFIRMED
UID:fait-qa-session@ai-thinking.io
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ai-thinking-qa-session.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function CalendarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-dark-600 hover:bg-dark-500 border border-white/10
                   rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendario
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-dark-600 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 22h-15A2.5 2.5 0 012 19.5v-15A2.5 2.5 0 014.5 2H9v2H4.5a.5.5 0 00-.5.5v15a.5.5 0 00.5.5h15a.5.5 0 00.5-.5V15h2v4.5a2.5 2.5 0 01-2.5 2.5z"/>
              <path d="M18.42 4.12l1.46 1.46L12 13.46 10.54 12l7.88-7.88zM16 2h6v6h-2V4h-4V2z"/>
            </svg>
            Google Calendar
          </a>
          <a
            href={getOutlookUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark-500 hover:text-white transition-colors border-t border-white/5"
          >
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Outlook
          </a>
          <button
            onClick={() => {
              downloadICS();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-dark-500 hover:text-white transition-colors border-t border-white/5 text-left"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar .ics
          </button>
        </div>
      )}
    </div>
  );
}

export function QASessionLink({ programSlug }: QASessionLinkProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        const { data } = await supabase.rpc('has_program_access', {
          p_user_id: user.id,
          p_program_slug: programSlug,
        });

        setHasAccess(data === true);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [programSlug]);

  if (loading || !hasAccess) {
    return null;
  }

  // Solo mostrar para fait-ejecutivos
  if (programSlug !== 'fait-ejecutivos') {
    return null;
  }

  return (
    <div className="group relative p-5 bg-dark-700 rounded-xl border border-accent-blue/30
                    hover:border-accent-blue/60 hover:bg-dark-600 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-transparent opacity-0
                      group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"></div>
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-blue/20 flex items-center justify-center
                          group-hover:bg-accent-blue/30 transition-colors">
            <svg className="w-6 h-6 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-white font-semibold text-lg group-hover:text-accent-blue transition-colors">
              Sesión Q&A Semanal
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Jueves 19:00 - 20:00 hrs (Chile)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
          <a
            href="https://meet.google.com/bku-dvmi-rwk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/20 hover:bg-accent-blue/30
                       text-accent-blue text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.82 16.32c-.292.352-.704.528-1.236.528H7.416c-.532 0-.944-.176-1.236-.528-.292-.352-.438-.82-.438-1.404V9.084c0-.584.146-1.052.438-1.404.292-.352.704-.528 1.236-.528h9.168c.532 0 .944.176 1.236.528.292.352.438.82.438 1.404v5.832c0 .584-.146 1.052-.438 1.404z"/>
            </svg>
            Unirse
          </a>
          <CalendarDropdown />
          <a
            href={`/programas/${programSlug}/comunidad/grabaciones`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-dark-600 hover:bg-dark-500 border border-white/10
                       text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
            </svg>
            Grabaciones
          </a>
        </div>
      </div>
    </div>
  );
}
