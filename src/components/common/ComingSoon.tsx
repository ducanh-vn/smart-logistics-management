import { PageHeader } from "./PageHeader";

export function ComingSoon({ title, batch }: { title: string; batch: number }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        Màn hình này sẽ được hoàn thiện ở đợt {batch}.
      </div>
    </>
  );
}
