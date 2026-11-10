const pad = (n: number) => String(n).padStart(2, '0');

export const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const hoy = () => fmtDate(new Date());

export const diasAtras = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmtDate(d);
};

export const inicialDia = (fecha: string) =>
  ['D', 'L', 'M', 'M', 'J', 'V', 'S'][new Date(`${fecha}T00:00:00`).getDay()];

export const saludoDelDia = () => {
  const hora = new Date().getHours();
  if (hora < 12) return '¡Buenos días!';
  if (hora < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
};

export const fechaLarga = (d = new Date()) => {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const meses = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
};
