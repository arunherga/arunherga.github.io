type SceneProps = { frame: number };
const ease = (frame: number, start: number, duration = 20) => {
  const t = Math.max(0, Math.min(1, (frame - start) / duration));
  return 1 - (1 - t) ** 3;
};

export function SearchScene({ frame }: SceneProps) {
  const command = "kgrep consume --allowed-keys-csv ids.csv";
  const rows = ["order-1001", "order-1042", "order-1002", "order-1090", "order-1005"];
  return <g>
    <rect x="42" y="248" width="560" height="246" rx="10" fill="#0c1610" stroke="#638453" />
    <path d="M42 286H602" stroke="#354b32" />
    {[0, 1, 2].map(i => <circle key={i} cx={64 + i * 19} cy="267" r="4" fill={i === 2 ? "#c3ed78" : "#4c6550"} />)}
    <text x="132" y="273" fontSize="17" fill="#a8baa0">orders / SAMPLE RECORDS</text>
    <text x="62" y="316" fontSize="20" fill="#c3ed78">$ {command.slice(0, Math.floor(frame * .8))}<tspan opacity={frame % 30 < 20 ? 1 : 0}>▌</tspan></text>
    {rows.map((id, i) => {
      const matched = i % 2 === 0;
      const y = 350 + i * 29;
      const exporting = ease(frame, 147 + i * 7, 25);
      return <g key={id} opacity={ease(frame, 50 + i * 17, 14)}>
        <rect x="57" y={y - 19} width="528" height="26" rx="3" fill={matched ? "#c3ed781b" : "transparent"} />
        <text x="65" y={y} fontSize="18" fill={matched ? "#e3f9c8" : "#778b76"}>{matched ? "✓" : "·"} {id}<tspan x="282" fill={matched ? "#b8d998" : "#778b76"}>status: received</tspan><tspan x="517" fill="#c3ed78">{matched ? "match" : ""}</tspan></text>
        {matched && exporting > 0 && exporting < 1 && <rect x={589 + exporting * 70} y={y - 13} width="13" height="6" rx="2" fill="#c3ed78" />}
      </g>;
    })}
    <g opacity={ease(frame, 133, 25)} transform={`translate(${(1 - ease(frame, 133, 25)) * 25} 0)`}>
      <path d="M658 272H867L909 314V487H658Z" fill="#24372a" stroke="#c3ed78" /><path d="M867 272V314H909" fill="none" stroke="#c3ed78" />
      <text x="677" y="339" fontSize="23" fill="#eff8e5">matches.csv</text>
      {["order-1001", "order-1002", "order-1005"].map((id, i) => <g key={id} opacity={ease(frame, 152 + i * 14, 15)}><path d={`M678 ${367 + i * 32}h14m-7-7v14`} stroke="#c3ed78" /><text x="703" y={374 + i * 32} fill="#c6dcb8" fontSize="19">{id}</text></g>)}
      <text x="677" y="468" fontSize="17" fill="#a7c88e">3 matching records</text>
    </g>
  </g>;
}

export function TerraformScene({ frame }: SceneProps) {
  const phase = frame < 70 ? 0 : frame < 170 ? 1 : 2;
  const resources = [
    { name: "environment", x: 660, y: 280, start: 72 },
    { name: "Kafka cluster", x: 660, y: 353, start: 91 },
    { name: "topic", x: 446, y: 437, start: 111 },
    { name: "ACL", x: 660, y: 437, start: 125 },
    { name: "connector", x: 874, y: 437, start: 139 },
  ];
  return <g>
    <rect x="42" y="248" width="278" height="248" rx="9" fill="#211c31" stroke="#695489" /><text x="64" y="279" fontSize="19" fill="#e6dcfa">TERRAFORM CLI</text>
    <path d="M79 319V453" stroke="#5b4b75" strokeWidth="2" />
    {["plan", "apply", "destroy"].map((name, i) => <g key={name}><circle cx="79" cy={327 + i * 63} r="14" fill={phase === i ? "#c3acff" : "#30263f"} stroke="#a48bcf" /><text x="79" y={333 + i * 63} textAnchor="middle" fontSize="17" fill={phase === i ? "#20172e" : "#cbb8e6"}>{i + 1}</text><text x="108" y={334 + i * 63} fontSize="24" fill={phase === i ? "#f4ecff" : "#9d8ab7"}>$ {name}</text></g>)}
    <rect x="354" y="235" width="575" height="270" rx="12" fill="none" stroke="#665380" strokeDasharray="5 6" /><rect x="385" y="223" width="225" height="27" fill="#1c182c" /><text x="395" y="242" fontSize="18" fill="#c3acff">LOCAL MOCK PROVIDER</text>
    <path d="M660 300V333M660 373V397H446V417M660 397H874V417M660 397V417" fill="none" stroke="#9d83c7" strokeWidth="2" opacity={phase === 2 ? 1 - ease(frame, 198, 36) : .7} />
    {resources.map((resource, i) => {
      const created = ease(frame, resource.start, 20);
      const removed = ease(frame, 175 + (4 - i) * 10, 18);
      return <g key={resource.name} opacity={phase === 0 ? .6 : phase === 1 ? .3 + .7 * created : 1 - .82 * removed} transform={`translate(0 ${phase === 1 ? (1 - created) * -12 : 0})`}>
        <rect x={resource.x - (i < 2 ? 106 : 49)} y={resource.y - 20} width={i < 2 ? 212 : 98} height="40" rx="5" fill={created && phase !== 0 ? "#392b50" : "#211c31"} stroke="#c3acff" strokeDasharray={phase === 0 ? "5 5" : undefined} />
        <text x={resource.x} y={resource.y + 6} textAnchor="middle" fontSize={i < 2 ? 20 : 15} fill="#eee4ff">{resource.name}</text>
      </g>;
    })}
    <text x="641" y="484" textAnchor="middle" fill="#c3acff" fontSize="18">{["Preview the dependency graph", "Create resources in dependency order", "Return the sandbox to a clean state"][phase]}</text>
  </g>;
}

export function LatencyScene({ frame }: SceneProps) {
  return <g>
    <rect x="42" y="247" width="572" height="248" rx="9" fill="#182636" stroke="#536982" /><text x="62" y="275" fill="#a8c6de" fontSize="17">PARTITION TIMINGS / SIMULATED SAMPLE</text>
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${162 + i * 90} 301V463`} stroke="#344b63" strokeDasharray="3 6" />)}
    {[12, 24, 18].map((ms, i) => {
      const start = 163 + i * 20;
      const extent = ms * 11 * ease(frame, 28 + i * 28, 46);
      const y = 323 + i * 61;
      return <g key={ms}>
        <text x="65" y={y + 6} fontSize="21" fill="#c8dbea">P{i}</text><path d={`M${start} ${y}h${extent}`} stroke={i === 1 ? "#f8cd80" : "#79cbe0"} strokeWidth="8" strokeLinecap="round" />
        <circle cx={start} cy={y} r="6" fill="#162333" stroke="#9fbbd0" strokeWidth="2" /><circle cx={start + extent} cy={y} r="7" fill={i === 1 ? "#f8cd80" : "#79cbe0"} />
        <text x={start + extent + 18} y={y + 7} fontSize="22" fill="#e6edf1" opacity={ease(frame, 85 + i * 25, 16)}>{ms} ms</text>
      </g>;
    })}
    <path d={`M${162 + 395 * ease(frame, 20, 145)} 298V465`} stroke="#f8cd80" opacity={frame < 180 ? .55 : 0} />
    <text x="162" y="482" fill="#9db7cc" fontSize="16">○ T1</text><text x="528" y="482" fill="#9db7cc" fontSize="16">● T2</text>
    <rect x="641" y="247" width="277" height="248" rx="9" fill="#223044" stroke="#536982" /><text x="662" y="280" fill="#a8c6de" fontSize="18">TOPIC DISTRIBUTION</text>
    {[25, 57, 86, 62, 33, 14].map((height, i) => <rect key={i} x={666 + i * 38} y={394 - height * ease(frame, 115 + i * 9, 30)} width="25" height={height * ease(frame, 115 + i * 9, 30)} rx="3" fill={i === 2 ? "#f8cd80" : "#5e91b5"} />)}
    <path d="M660 397H901" stroke="#7087a0" /><text x="666" y="431" fontSize="25" fill="#f8cd80">Δt = T2 − T1</text><text x="666" y="473" fontSize="17" fill="#c6d9e8">Export → Kafka / CSV</text>
  </g>;
}

export function RecyclingScene({ frame }: SceneProps) {
  const report = ease(frame, 122, 30);
  return <g>
    {["News RSS", "Trade feeds", "Government"].map((name, i) => {
      const reveal = ease(frame, i * 17, 20);
      return <g key={name} opacity={reveal} transform={`translate(${(1 - reveal) * -35} 0)`}><rect x={48 + i * 9} y={249 + i * 70} width="234" height="56" rx="6" fill="#244145" stroke="#5b9c99" /><circle cx={73 + i * 9} cy={277 + i * 70} r="8" fill="none" stroke="#7ce0cb" /><text x={94 + i * 9} y={284 + i * 70} fontSize="21" fill="#e0f6ef">{name}</text></g>;
    })}
    <g opacity={ease(frame, 54, 15) * (1 - ease(frame, 94, 22))} transform={`translate(0 ${ease(frame, 94, 22) * 25})`}><rect x="83" y="423" width="202" height="48" rx="5" fill="#20383a" stroke="#698280" strokeDasharray="4 5" /><text x="107" y="453" fontSize="17" fill="#96b1ae">duplicate removed</text></g>
    <path d="M302 284C344 284 338 345 375 345M304 349H375M304 417C344 417 338 345 375 345M505 345H591" fill="none" stroke="#70b8ae" strokeWidth="2" strokeDasharray="5 6" />
    <g opacity={ease(frame, 65, 25)}><circle cx="440" cy="345" r="65" fill="#23433f" stroke="#7ce0cb" strokeWidth="2" /><path d="M411 318h58l-21 26v25l-16-8v-17z" fill="none" stroke="#7ce0cb" strokeWidth="2" /><text x="440" y="388" fontSize="17" fill="#d0f0e5" textAnchor="middle">rank</text><text x="440" y="447" fontSize="17" fill="#9bccbd" textAnchor="middle">local relevance</text><text x="440" y="475" fontSize="17" fill="#9bccbd" textAnchor="middle">+ clear reasons</text></g>
    <g opacity={report} transform={`translate(${(1 - report) * 32} 0)`}>
      <rect x="592" y="243" width="326" height="260" rx="5" fill="#e8f1e1" /><path d="M614 285H896" stroke="#477466" strokeWidth="2" /><text x="614" y="272" fill="#23493d" fontSize="18" fontWeight="700">THE DAILY BRIEF</text><text x="614" y="311" fill="#567268" fontSize="15">Udupi · Mangaluru · Karnataka</text>
      {["Opportunities", "Regulation & EPR", "Coastal Karnataka"].map((name, i) => <g key={name} opacity={ease(frame, 148 + i * 21, 18)}><circle cx="622" cy={344 + i * 51} r="4" fill="#377f67" /><text x="638" y={350 + i * 51} fontSize="19" fill="#244b3f">{name}</text><path d={`M638 ${363 + i * 51}h${i === 0 ? 190 : 150}`} stroke="#a2b8a7" strokeWidth="4" strokeLinecap="round" /></g>)}
      <text x="614" y="486" fill="#567268" fontSize="15">Markdown briefing / GitHub Actions</text>
    </g>
  </g>;
}
