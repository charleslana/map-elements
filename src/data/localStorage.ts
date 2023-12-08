export const saveBooleanStorage = (key: string, value: boolean) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getBooleanStorage = (key: string) => {
  const savedState = localStorage.getItem(key);
  return savedState ? JSON.parse(savedState) : false;
};
