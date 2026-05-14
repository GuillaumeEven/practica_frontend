import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import ConstRoutes from './shared/contants/const-routes';
import {UserListComponent} from "./features/user-list/user-list.component";
import { ShellComponent } from './features/shell/shell.component';

export const routes: Routes = [
    { path: '', redirectTo: ConstRoutes.PATH_LOGIN, pathMatch: 'full' },
    { path: ConstRoutes.PATH_LOGIN, component: LoginComponent },
    {
        path: '',
        component: ShellComponent,
        children: [
        { path: ConstRoutes.PATH_USUARIOS, component: UserListComponent },
        // add other authenticated children here
        ]
    }

];


