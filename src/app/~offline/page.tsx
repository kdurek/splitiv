import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function Page() {
  return (
    <div className="m-24 grid gap-4 text-center">
      <h1 className="text-3xl">Cholerka</h1>
      <p>:(</p>
      <h2>Wygląda na to, że nie masz połączenia z internetem</h2>
    </div>
  );
}
