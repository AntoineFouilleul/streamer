import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

/* App Root */
import { AppComponent } from './app.component';
import { Routing } from './app.routing';

/* Feature Modules */
import { SharedModule } from './shared/shared.module';
import { AlertComponent } from './shared/directives/alert.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AlertService } from './shared/services/alert.service';
import { AuthenticationService } from './shared/services/authentication.service';
import { SerieService } from './shared/services/serie.service';
import { LoginComponent } from './login/login.component';
import { TopComponent } from './top/top.component';
import { SeriesComponent } from './series/series.component';
import { NewsComponent } from './news/news.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { HistroryService } from './shared/services/history.service';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    LoginComponent,
    SeriesComponent,
    TopComponent,
    NewsComponent,
    FavoritesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    Routing,
    SharedModule
  ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    SerieService,
    HistroryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
