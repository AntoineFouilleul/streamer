import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { TopComponent } from './top/top.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { NewsComponent } from './news/news.component';
import { SeriesComponent } from './series/series.component';
import { FavoritesComponent } from './favorites/favorites.component';

const appRoutes: Routes = [
  { path: '', component: NewsComponent, canActivate: [AuthGuard] },
  { path: 'series', component: SeriesComponent },
  { path: 'series/:serie', component: SeriesComponent },
  { path: 'series/:serie/:season', component: SeriesComponent },
  { path: 'series/:serie/:season/:episode', component: SeriesComponent },
  { path: 'top', component: TopComponent },
  { path: 'news', component: NewsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'login', component: LoginComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const Routing = RouterModule.forRoot(appRoutes);
