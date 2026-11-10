export const money = (n: number) => {
  const [entero, decimal] = Math.abs(n).toFixed(2).split('.');
  return `${n < 0 ? '-' : ''}$${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimal}`;
};

export const parseMonto = (texto: string) => Number(texto.replace(',', '.'));