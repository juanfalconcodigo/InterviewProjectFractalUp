import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('@pages/home/home.component').then((c) => c.HomeComponent)
    },
    {
        path: 'view-1',
        loadComponent: () => import('@pages/view-one/view-one.component').then((c) => c.ViewOneComponent)
    },
    {
        path: 'view-2',
        loadComponent: () => import('@pages/view-two/view-two.component').then((c) => c.ViewTwoComponent)
    },
    {
        path: '',
        pathMatch: "full",
        redirectTo: 'home'
    },
    {
        path: '**',
        pathMatch: "full",
        redirectTo: 'home'
    }
];
