export function Hud({items}:{items:Record<string,string|number>}){return <dl className="hud">{Object.entries(items).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>;}
