import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MATERIAL_COMPATIBILITY_MODE } from '@angular/material';

/* Interceptor */
import { TokenInterceptor } from './interceptors/token.interceptor';

/* Components */
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/* Angular Material */
import {
  MatSelectModule,
  MatPaginatorModule,
  MatExpansionModule,
  MatTableModule,
  MatListModule,
  MatCardModule,
  MatDialogModule,
  MatButtonModule,
  MatInputModule,
  MatIconModule,
  MatSnackBarModule
} from '@angular/material';

/* Videogular 2 */
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
// import { SingleMediaPlayer } from './single-media-player';

/* Service */
import { SessionManagerService } from './manager/session.manager';
import { CookieManagerService } from './manager/cookie.manager';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSelectModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  exports: [
    // Shared Modules
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    // Shared Components
    HeaderComponent,
    FooterComponent,
    MatTableModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSelectModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule
  ],
  declarations: [
    HeaderComponent,
    FooterComponent,
  ],
  providers: [
    SessionManagerService,
    CookieManagerService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
  ],
  entryComponents: []
})
export class SharedModule { }