import { MessagesComponent } from "./messages/messages.component";
import { CreateMessageComponent } from "./create/create.component";
import { HomeComponent } from './home/home.component';
import { DebugComponent } from './debug/debug.component';
import { AuthGuard } from './auth.guard';
import { AdminAuthGuard } from './admin.auth.guard';
import { PublicComponent } from './public/public.component';
import { LoggedinComponent } from './loggedin/loggedin.component';

export const AvailableRoutes: any = [
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard, AdminAuthGuard] },
  { path: "create", component: CreateMessageComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent },
  { path: 'debug', component: DebugComponent },
  { path: 'public', component: PublicComponent },
  { path: 'loggedin', component: LoggedinComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
