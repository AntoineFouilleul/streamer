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
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
    LoginComponent,
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
    SerieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
