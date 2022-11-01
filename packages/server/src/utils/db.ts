import sqlite, { Statement } from 'sqlite3';

export const db = new sqlite.Database('wg.sql');

export const run = (stmt: Statement, args: any[]) => new Promise((resolve, reject) => {
  stmt.run(args, (r: any, err: any) => {
    if ((r && r.errno) || err) {
      reject(r.errno || err);
    }
    resolve(r);
  });
});

export const finalize = (stmt: Statement) => new Promise((resolve, reject) => {
  stmt.finalize((err: any) => {
    if (err) {
      reject(err);
    }
    resolve(true);
  });
});

export const all = (statement: string) => {
  return new Promise<any[]>((resolve, reject) => {
    db.all(statement, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    })
  });
}


db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS peers (public_key TEXT UNIQUE, sent INTEGER DEFAULT 0 NOT NULL, received INTEGER DEFAULT 0 NOT NULL, iface TEXT, remaining INTEGER DEFAULT 10 NOT NULL)");
});
