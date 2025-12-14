import { v4 as uuidv4 } from 'uuid';

export const parseData = (data) => {
  let rv = {};

  for (let a in data) {
    let first = data[a];
    rv[a] = rv[a] || {};
    rv[a]['map'] = `${a}`;
    rv[a]['isFolder'] = true;
    rv[a]['open'] = false;
    rv[a]['uid'] = uuidv4();
    rv[a]['files'] = [];
    for (let b in first) {
      let second = first[b];
      rv[a][b] = rv[a][b] || {};
      rv[a][b]['map'] = `${a}.${b}`;
      rv[a][b]['isFolder'] = true;
      rv[a][b]['open'] = false;
      rv[a][b]['uid'] = uuidv4();
      let files = [];
      for (let c in second) {
        let third = second[c];
        for (let d in third) {
          let file = third[d];
          file['uid'] = uuidv4();
          files.push(file);
        }
      }
      rv[a][b]['files'] = files;
    }
  }

  return rv;
};
