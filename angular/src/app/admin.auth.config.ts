export class User {
  Email: string;
  Name: string;
  Groups: string[];
}

var groups: string[] = ["admin", "administrator", "user", "devops"];

export class Administration {
  Users: Array<User> = [
    { Email: "AdminId1@example.com", Name: "AdminId1", Groups: groups },
    { Email: "AdminId2@example.com", Name: "AdminId2", Groups: groups },
    { Email: "admin@example.com", Name: "admin", Groups: groups },
    { Email: "administrator@example.com", Name: "administrator", Groups: groups },
    { Email: "AdminId3", Name: "Administrator5", Groups: groups },
  ];

  Admins: Map<string, User>;

  constructor() {
    let map = new Map(); // new Map<string, User>();
    for (let user of this.Users) {
      let e = user.Email;
      map.set(user.Email, user);
    }
    this.Admins = map;
  }
}
