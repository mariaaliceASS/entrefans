/** Avatar quadrado com borda roxa (visual Y2K) */
export default function Avatar({ nome, foto, size = 48 }: { nome: string; foto?: string | null; size?: number }) {
  const s = { width: size, height: size }
  const cls = 'shrink-0 border-2 border-[var(--y2k)] shadow-[3px_3px_0_var(--y2k-escuro)]'
  return foto
    ? <img src={foto} alt={nome} style={s} className={`${cls} object-cover`} />
    : <div style={s} className={`${cls} flex items-center justify-center bg-secondary-container font-mono font-bold text-on-secondary-container`}>{nome[0]?.toUpperCase()}</div>
}
