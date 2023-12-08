export const getHTMLInputElementById = (id: string): HTMLInputElement | null => {
  return document.getElementById(id) as HTMLInputElement | null;
};
