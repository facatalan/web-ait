import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface QASessionLinkProps {
  programSlug: string;
}

function openICS() {
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
SUMMARY:AI-Thinking Ejecutivos Q&A
DESCRIPTION:Sesion semanal de preguntas y respuestas del programa Fundamentos AI-Thinking para Ejecutivos.\\n\\nLink: https://meet.google.com/bku-dvmi-rwk
LOCATION:https://meet.google.com/bku-dvmi-rwk
URL:https://meet.google.com/bku-dvmi-rwk
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  // Crear data URI y abrir directamente
  const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent);
  window.open(dataUri, '_blank');
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
    <div className="mt-6 p-4 bg-dark-700 border border-accent-blue/30 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-grow">
          <h3 className="text-white font-semibold">Sesion Q&A Semanal</h3>
          <p className="text-gray-400 text-sm mb-1">Jueves 19:00 - 20:00 hrs (Chile)</p>
          <a
            href="https://meet.google.com/bku-dvmi-rwk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.82 16.32c-.292.352-.704.528-1.236.528H7.416c-.532 0-.944-.176-1.236-.528-.292-.352-.438-.82-.438-1.404V9.084c0-.584.146-1.052.438-1.404.292-.352.704-.528 1.236-.528h9.168c.532 0 .944.176 1.236.528.292.352.438.82.438 1.404v5.832c0 .584-.146 1.052-.438 1.404z"/>
            </svg>
            Unirse a Google Meet
          </a>
        </div>
        <button
          onClick={openICS}
          className="flex-shrink-0 px-3 py-2 bg-dark-600 hover:bg-dark-500 border border-white/10
                   rounded-lg text-sm text-gray-300 hover:text-white transition-colors
                   flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Guardar en calendario
        </button>
      </div>
    </div>
  );
}
