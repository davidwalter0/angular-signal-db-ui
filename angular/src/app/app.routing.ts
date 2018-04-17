import { MessagesComponent } from "./messages/messages.component";
import { CreateMessageComponent } from "./create/create.component";

export const AvailableRoutes: any = [
  { path: "", component: MessagesComponent },
  { path: "create", component: CreateMessageComponent },
];
