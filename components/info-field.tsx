interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
}

export default function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
