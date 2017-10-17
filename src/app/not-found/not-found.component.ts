import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
  <div class="card" style="text-align:center;">
    <h4 class="card-header">404 Page non trouvée</h4>
    <div class="card-block">
      <p>La page demandée n'existe pas.</p>
      <p>Retourner à <a routerLink="/">l'accueil</a>.</p>
    </div>
  </div>
`
})
export class NotFoundComponent {

  constructor() { }

}