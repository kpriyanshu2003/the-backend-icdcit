export interface IStringToJson {
  name: string;
  date: string;
}
export const stringToJson = (str: string): IStringToJson[] => {
  str = str.replace(/['"]+/g, "");
  let strArr = str.split(" ");
  let obj: IStringToJson[] = [];
  for (let i = 0; i < strArr.length; i += 2)
    obj.push({ name: strArr[i], date: strArr[i + 1] });
  return obj;
};
