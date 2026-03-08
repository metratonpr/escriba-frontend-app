interface AttendanceRosterParticipant {
  employeeId: number;
  employeeName: string;
}

interface EventAttendanceDayRosterProps {
  selectedDateLabel: string;
  participants: AttendanceRosterParticipant[];
  presenceByEmployee: Record<number, boolean>;
  loading: boolean;
  saving: boolean;
  onTogglePresence: (employeeId: number, present: boolean) => void;
  onSave: () => void;
}

export default function EventAttendanceDayRoster({
  selectedDateLabel,
  participants,
  presenceByEmployee,
  loading,
  saving,
  onTogglePresence,
  onSave,
}: EventAttendanceDayRosterProps) {
  const presentCount = participants.reduce(
    (acc, participant) => acc + (presenceByEmployee[participant.employeeId] !== false ? 1 : 0),
    0
  );
  const absentCount = participants.length - presentCount;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Lancamento de presenca - {selectedDateLabel}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
            <span className="rounded bg-green-100 px-2 py-0.5 font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-200">
              Presentes: {presentCount}
            </span>
            <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
              Ausentes: {absentCount}
            </span>
            <span>Total: {participants.length}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving || loading || participants.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Salvando..." : "Salvar lista do dia"}
        </button>
      </div>

      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
          Carregando lista de presenca...
        </div>
      ) : participants.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-300">
          Nenhum participante disponivel para esta data.
        </div>
      ) : (
        <ul className="max-h-[460px] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
          {participants.map((participant) => {
            const checked = presenceByEmployee[participant.employeeId] !== false;

            return (
              <li
                key={participant.employeeId}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {participant.employeeName}
                  </p>
                  <p
                    className={`text-xs ${
                      checked ? "text-green-600 dark:text-green-300" : "text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    {checked ? "Presente" : "Ausente"}
                  </p>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                  Presente
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={checked}
                    onChange={(event) => onTogglePresence(participant.employeeId, event.target.checked)}
                    disabled={saving || loading}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
