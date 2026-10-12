export default function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map((d) => d[1]));
  if (!data.length) return <p style={{ opacity: 0.6 }}>No data yet.</p>;
  return <div>{data.map(([k, v]) => <div className="bar" key={k}><span>{k}</span><div><i style={{ width: `${(v / max) * 100}%` }} /></div><b>{v}</b></div>)}</div>;
}
