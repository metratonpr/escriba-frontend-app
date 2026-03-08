import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import EventAttendanceDayRoster from "./EventAttendanceDayRoster";
import type { Participant } from "../../types/participant";
import type { EventAttendanceListItem } from "../../types/eventAttendance";
import {
  createEventAttendanceList,
  deleteEventAttendanceList,
  getEventAttendanceLists,
  updateEventAttendanceList,
} from "../../services/eventAttendanceListService";

interface PersistedParticipant {
  participationId: number;
  employeeId: number;
  employeeName: string;
}

interface EventAttendanceByDayProps {
  eventId?: number;
  startDate?: string;
  endDate?: string;
  participants: Participant[];
}

const sortAttendanceList = (items: EventAttendanceListItem[]) =>
  [...items].sort((a, b) => {
    const nameA = (a.employee?.name ?? `colaborador-${a.employee_id}`).toLowerCase();
    const nameB = (b.employee?.name ?? `colaborador-${b.employee_id}`).toLowerCase();
    return nameA.localeCompare(nameB);
  });

const formatDateLabel = (date: string) => dayjs(date).format("DD/MM/YYYY");

const buildPresenceMap = (
  participants: PersistedParticipant[],
  attendance: EventAttendanceListItem[]
) => {
  const map: Record<number, boolean> = {};

  participants.forEach((participant) => {
    map[participant.employeeId] = true;
  });

  attendance.forEach((record) => {
    if (map[record.employee_id] !== undefined) {
      map[record.employee_id] = Boolean(record.present);
    }
  });

  return map;
};

const buildDaySavedStatus = (
  eventDays: string[],
  participants: PersistedParticipant[],
  records: EventAttendanceListItem[]
) => {
  const status = eventDays.reduce<Record<string, boolean>>((acc, day) => {
    acc[day] = false;
    return acc;
  }, {});

  if (participants.length === 0) {
    return status;
  }

  const participantsById = participants.reduce<Record<number, true>>((acc, participant) => {
    acc[participant.employeeId] = true;
    return acc;
  }, {});

  const attendanceByDay = records.reduce<Record<string, Record<number, true>>>((acc, record) => {
    if (!participantsById[record.employee_id]) {
      return acc;
    }

    const day = dayjs(record.attendance_date).format("YYYY-MM-DD");
    if (!acc[day]) {
      acc[day] = {};
    }
    acc[day][record.employee_id] = true;
    return acc;
  }, {});

  eventDays.forEach((day) => {
    const checkedEmployees = attendanceByDay[day] ? Object.keys(attendanceByDay[day]).length : 0;
    status[day] = checkedEmployees === participants.length;
  });

  return status;
};

export default function EventAttendanceByDay({
  eventId,
  startDate,
  endDate,
  participants,
}: EventAttendanceByDayProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [attendanceList, setAttendanceList] = useState<EventAttendanceListItem[]>([]);
  const [savedStatusByDay, setSavedStatusByDay] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [presenceByEmployee, setPresenceByEmployee] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const eventDays = useMemo(() => {
    if (!startDate || !dayjs(startDate).isValid()) {
      return [] as string[];
    }

    const start = dayjs(startDate).startOf("day");
    const parsedEnd = endDate && dayjs(endDate).isValid() ? dayjs(endDate).startOf("day") : start;
    const end = parsedEnd.isBefore(start) ? start : parsedEnd;
    const days: string[] = [];
    let cursor = start;
    let guard = 0;

    while (cursor.isSame(end, "day") || cursor.isBefore(end, "day")) {
      days.push(cursor.format("YYYY-MM-DD"));
      cursor = cursor.add(1, "day");
      guard += 1;
      if (guard > 370) {
        break;
      }
    }

    return days;
  }, [startDate, endDate]);

  const persistedParticipants = useMemo<PersistedParticipant[]>(
    () =>
      participants
        .filter((participant) => participant.id !== undefined && participant.id !== null)
        .map((participant) => ({
          participationId: Number(participant.id),
          employeeId: participant.employee_id,
          employeeName:
            participant.employee?.name?.trim() || `Colaborador #${participant.employee_id}`,
        }))
        .sort((a, b) =>
          a.employeeName.localeCompare(b.employeeName, "pt-BR", { sensitivity: "base" })
        ),
    [participants]
  );

  const participantsByEmployeeId = useMemo(
    () =>
      persistedParticipants.reduce<Record<number, PersistedParticipant>>((acc, participant) => {
        acc[participant.employeeId] = participant;
        return acc;
      }, {}),
    [persistedParticipants]
  );

  const attendanceByEmployeeId = useMemo(
    () =>
      attendanceList.reduce<Record<number, EventAttendanceListItem>>((acc, record) => {
        acc[record.employee_id] = record;
        return acc;
      }, {}),
    [attendanceList]
  );

  useEffect(() => {
    if (eventDays.length === 0) {
      setSelectedDate("");
      return;
    }

    if (!selectedDate || !eventDays.includes(selectedDate)) {
      setSelectedDate(eventDays[0]);
    }
  }, [eventDays, selectedDate]);

  useEffect(() => {
    if (!eventId || !selectedDate) {
      setAttendanceList([]);
      return;
    }

    setAttendanceList([]);
    setLoading(true);
    setMessage(null);

    getEventAttendanceLists({
      eventId,
      attendanceDate: selectedDate,
      perPage: 500,
    })
      .then((response) => {
        setAttendanceList(sortAttendanceList(response.data ?? []));
      })
      .catch(() => {
        setMessage({
          type: "error",
          text: "Nao foi possivel carregar a lista de presenca do dia selecionado.",
        });
      })
      .finally(() => setLoading(false));
  }, [eventId, selectedDate]);

  useEffect(() => {
    setPresenceByEmployee(buildPresenceMap(persistedParticipants, attendanceList));
  }, [persistedParticipants, attendanceList]);

  useEffect(() => {
    if (!eventId || eventDays.length === 0 || persistedParticipants.length === 0) {
      setSavedStatusByDay({});
      return;
    }

    let cancelled = false;

    const loadDaysStatus = async () => {
      try {
        const allRecords: EventAttendanceListItem[] = [];
        let currentPage = 1;
        let lastPage = 1;

        do {
          const response = await getEventAttendanceLists({
            eventId,
            page: currentPage,
            perPage: 500,
          });

          allRecords.push(...(response.data ?? []));
          lastPage = response.last_page || 1;
          currentPage += 1;
        } while (currentPage <= lastPage);

        if (!cancelled) {
          setSavedStatusByDay(
            buildDaySavedStatus(eventDays, persistedParticipants, allRecords)
          );
        }
      } catch {
        if (!cancelled) {
          setSavedStatusByDay({});
        }
      }
    };

    loadDaysStatus();

    return () => {
      cancelled = true;
    };
  }, [eventId, eventDays, persistedParticipants]);

  const handleTogglePresence = (employeeId: number, present: boolean) => {
    setPresenceByEmployee((prev) => ({ ...prev, [employeeId]: present }));
  };

  const handleSaveAttendanceDay = async () => {
    if (!eventId || !selectedDate) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const upsertPromises = persistedParticipants.map((participant) => {
        const existingRecord = attendanceByEmployeeId[participant.employeeId];
        const currentPresence = presenceByEmployee[participant.employeeId] !== false;
        const payload = {
          event_id: eventId,
          employee_id: participant.employeeId,
          event_participation_id: participant.participationId,
          attendance_date: selectedDate,
          present: currentPresence,
        };

        if (existingRecord) {
          return updateEventAttendanceList(existingRecord.id, payload);
        }

        return createEventAttendanceList(payload);
      });

      const staleRecords = attendanceList.filter(
        (record) => !participantsByEmployeeId[record.employee_id]
      );

      const savedRecords = await Promise.all(upsertPromises);

      if (staleRecords.length > 0) {
        await Promise.all(staleRecords.map((record) => deleteEventAttendanceList(record.id)));
      }

      const normalizedRecords = savedRecords.map((record) => {
        const participant = participantsByEmployeeId[record.employee_id];
        return {
          ...record,
          employee:
            record.employee ??
            (participant
              ? {
                  id: participant.employeeId,
                  name: participant.employeeName,
                }
              : undefined),
        };
      });

      setAttendanceList(sortAttendanceList(normalizedRecords));
      setSavedStatusByDay((prev) => ({ ...prev, [selectedDate]: true }));
      setMessage({
        type: "success",
        text: "Lista de presenca salva com sucesso.",
      });
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      setMessage({
        type: "error",
        text: apiMessage || "Nao foi possivel salvar a lista de presenca deste dia.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!eventId) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Salve o evento para liberar a lista de presenca por dia.
      </p>
    );
  }

  if (eventDays.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Informe a data de inicio e termino para organizar a lista de presenca por dia.
      </p>
    );
  }

  if (persistedParticipants.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Cadastre participantes no evento para lancar presenca por dia.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Dias do evento
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              Selecione uma data para lancar presenca.
            </p>
          </div>

          <div className="max-h-[152px] space-y-2 overflow-y-auto p-2">
            {eventDays.map((day) => {
              const isActive = day === selectedDate;
              const isSaved = savedStatusByDay[day] === true;
              const badgeClass = isActive
                ? isSaved
                  ? "bg-white/20 text-white"
                  : "bg-amber-200 text-amber-900"
                : isSaved
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200"
                : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-100";

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`flex h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <span>{formatDateLabel(day)}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
                    {isSaved ? "Salvo" : "Nao salvo"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <EventAttendanceDayRoster
          selectedDateLabel={selectedDate ? formatDateLabel(selectedDate) : "--/--/----"}
          participants={persistedParticipants.map((participant) => ({
            employeeId: participant.employeeId,
            employeeName: participant.employeeName,
          }))}
          presenceByEmployee={presenceByEmployee}
          loading={loading}
          saving={saving}
          onTogglePresence={handleTogglePresence}
          onSave={handleSaveAttendanceDay}
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
