import { State } from '@/app/lib/actions';

const FIELD_LABELS: Record<string, string> = {
  customerId: 'Customer',
  amount: 'Amount',
  status: 'Invoice status',
};

export function ValidationSummary({ state }: { state: State }) {
  if (!state.message) return null;

  const errorEntries = state.errors
    ? (Object.entries(state.errors) as [string, string[] | undefined][]).filter(
        ([, msgs]) => msgs && msgs.length > 0,
      )
    : [];

  return (
    <div
      className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800"
      role="alert"
    >
      <p className="font-medium">{state.message}</p>
      {errorEntries.length > 0 && (
        <>
          <p className="mt-2 font-medium text-red-900">Check these fields:</p>
          <ul className="mt-1 list-inside list-disc text-red-800">
            {errorEntries.map(([key]) => (
              <li key={key}>{FIELD_LABELS[key] ?? key}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
